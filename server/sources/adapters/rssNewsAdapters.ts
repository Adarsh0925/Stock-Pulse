import { UnifiedNewsItem, SourceProvenance } from '../types';
import { isHeadlineRelevant, calculateVaderScore, isWithinTimeFilter } from '../../services/newsNlp';
import { fetchWithTimeout } from '../../services/fetchHelper';

export async function fetchMultiSourceNews(ticker: string, companyName: string, timeFilter: string = '7d'): Promise<{
  articles: UnifiedNewsItem[];
  provenance: SourceProvenance[];
}> {
  const timestampStr = new Date().toISOString().replace('T', ' ').slice(0, 19) + ' UTC';
  const cleanName = companyName || ticker.replace('.NS', '');
  const articles: UnifiedNewsItem[] = [];
  const provenance: SourceProvenance[] = [];
  const seenHeadlines = new Set<string>();

  // 1. Google News RSS Feed
  try {
    const searchTerms = encodeURIComponent(`${cleanName} stock news`);
    const gNewsUrl = `https://news.google.com/rss/search?q=${searchTerms}&hl=en-IN&gl=IN&ceid=IN:en`;
    const res = await fetchWithTimeout(gNewsUrl, {
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' }
    }, 3500);

    if (res.ok) {
      const xml = await res.text();
      const itemRegex = /<item>[\s\S]*?<title>(.*?)<\/title>[\s\S]*?<link>(.*?)<\/link>[\s\S]*?<pubDate>(.*?)<\/pubDate>[\s\S]*?<\/item>/gi;
      let match;
      let count = 0;

      while ((match = itemRegex.exec(xml)) !== null && count < 10) {
        const rawTitle = match[1].replace(/<!\[CDATA\[(.*?)\]\]>/g, '$1').trim();
        const rawLink = match[2].trim();
        const pubDateStr = match[3].trim();

        // 1. Relevance check
        if (!isHeadlineRelevant(rawTitle, ticker, cleanName)) continue;

        // 2. Strict publication timestamp check against active timeframe
        if (!isWithinTimeFilter(pubDateStr, timeFilter)) continue;

        const normalized = rawTitle.toLowerCase().replace(/[^a-z0-9]/g, '');
        if (!seenHeadlines.has(normalized)) {
          seenHeadlines.add(normalized);
          const vScore = calculateVaderScore(rawTitle);
          let sent: 'POSITIVE' | 'NEUTRAL' | 'NEGATIVE' = 'NEUTRAL';
          if (vScore >= 0.15) sent = 'POSITIVE';
          else if (vScore <= -0.15) sent = 'NEGATIVE';

          articles.push({
            title: rawTitle,
            publisher: rawTitle.split(' - ').pop() || 'Google News',
            link: rawLink,
            published_date: pubDateStr.split(' ').slice(0, 4).join(' '),
            retrieval_timestamp: timestampStr,
            sentiment: sent,
            vader_score: Number(vScore.toFixed(2)),
            source_adapter: 'Google News RSS'
          });
          count++;
        }
      }

      provenance.push({
        name: 'Google News RSS',
        value: `${count} headlines retrieved`,
        timestamp: timestampStr,
        exchange: 'Global News Feed',
        delay_status: 'REALTIME',
        status: 'valid'
      });
    } else {
      throw new Error(`HTTP ${res.status}`);
    }
  } catch (err: any) {
    provenance.push({
      name: 'Google News RSS',
      value: null,
      timestamp: timestampStr,
      exchange: 'Global News Feed',
      delay_status: 'UNKNOWN',
      status: 'failed',
      error: err?.message
    });
  }

  // 2. Economic Times / Moneycontrol Financial Feed Adapter
  try {
    const finUrl = `https://news.google.com/rss/search?q=${encodeURIComponent(`${cleanName} Moneycontrol Economic Times`)}&hl=en-IN&gl=IN&ceid=IN:en`;
    const res = await fetchWithTimeout(finUrl, {
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' }
    }, 3500);

    if (res.ok) {
      const xml = await res.text();
      const itemRegex = /<item>[\s\S]*?<title>(.*?)<\/title>[\s\S]*?<link>(.*?)<\/link>[\s\S]*?<pubDate>(.*?)<\/pubDate>[\s\S]*?<\/item>/gi;
      let match;
      let count = 0;

      while ((match = itemRegex.exec(xml)) !== null && count < 5) {
        const rawTitle = match[1].replace(/<!\[CDATA\[(.*?)\]\]>/g, '$1').trim();
        const rawLink = match[2].trim();
        const pubDateStr = match[3].trim();

        // 1. Relevance check
        if (!isHeadlineRelevant(rawTitle, ticker, cleanName)) continue;

        // 2. Strict publication timestamp check against active timeframe
        if (!isWithinTimeFilter(pubDateStr, timeFilter)) continue;

        const normalized = rawTitle.toLowerCase().replace(/[^a-z0-9]/g, '');
        if (!seenHeadlines.has(normalized)) {
          seenHeadlines.add(normalized);
          const vScore = calculateVaderScore(rawTitle);
          let sent: 'POSITIVE' | 'NEUTRAL' | 'NEGATIVE' = 'NEUTRAL';
          if (vScore >= 0.15) sent = 'POSITIVE';
          else if (vScore <= -0.15) sent = 'NEGATIVE';

          articles.push({
            title: rawTitle,
            publisher: rawTitle.split(' - ').pop() || 'Financial Press (ET / Moneycontrol)',
            link: rawLink,
            published_date: pubDateStr.split(' ').slice(0, 4).join(' '),
            retrieval_timestamp: timestampStr,
            sentiment: sent,
            vader_score: Number(vScore.toFixed(2)),
            source_adapter: 'Financial Press Feed (ET / Moneycontrol)'
          });
          count++;
        }
      }

      provenance.push({
        name: 'Financial Press Feed (ET / Moneycontrol)',
        value: `${count} headlines retrieved`,
        timestamp: timestampStr,
        exchange: 'Financial Press',
        delay_status: 'REALTIME',
        status: 'valid'
      });
    }
  } catch (e: any) {
    provenance.push({
      name: 'Financial Press Feed',
      value: null,
      timestamp: timestampStr,
      exchange: 'Financial Press',
      delay_status: 'UNKNOWN',
      status: 'failed',
      error: e?.message
    });
  }

  return { articles, provenance };
}
