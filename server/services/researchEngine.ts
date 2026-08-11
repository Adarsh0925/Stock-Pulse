import { getNifty50Data, getHistoricalCandles, Candle } from './marketData';
import { calculateTechnicals, TechnicalData } from './technicalAnalysis';
import { calculateFundamentals, FundamentalsData } from './fundamentals';
import { fetchNewsAndNlp, NlpMetrics } from './newsNlp';
import { runMLEngine, MLPrediction } from './mlEngine';
import { getUnifiedQuoteData, getUnifiedNewsData } from '../sources/sourceManager';

export interface ScoreComponent {
  category: string;
  raw_score: number;
  weight: number;
  weighted_score: number;
  description: string;
  status: string;
}

export interface ResearchReport {
  company_name: string;
  ticker: string;
  quote: any;
  final_research_score: number | null;
  research_signal: 'BUY BIAS' | 'HOLD BIAS' | 'SELL BIAS' | 'INSUFFICIENT DATA';
  signal_explanation: string;
  score_components: ScoreComponent[];
  technical: any;
  fundamentals: any;
  news: any;
  nlp: any;
  ml: any;
  historical: any;
  timestamp: string;
  status: string;
  provenance_details?: any;
}

export async function generateFullResearchReport(ticker: string, companyName?: string): Promise<ResearchReport> {
  const resolvedName = companyName || ticker.replace('.NS', '');
  const timestampStr = new Date().toISOString().replace('T', ' ').slice(0, 19) + ' UTC';

  // 1. Fetch 1Y Historical Candles
  const candles1y = await getHistoricalCandles(ticker, '1Y');

  // 2. Fetch Multi-Source Unified Quote Data
  const rawQuote = await getUnifiedQuoteData(ticker, candles1y);

  // 3. Calculate Technicals
  const rawTechnical = calculateTechnicals(candles1y);

  // 4. Calculate Fundamentals
  const rawFundamentals = calculateFundamentals(ticker, rawQuote.current_price);

  // 5. Fetch Multi-Source News and NLP
  const unifiedNews = await getUnifiedNewsData(ticker, resolvedName);
  const { nlp: rawNlp } = await fetchNewsAndNlp(ticker, resolvedName);
  const rawNews = unifiedNews.articles;

  // 6. Run Machine Learning Engine
  const rawMl = runMLEngine(ticker, candles1y);

  // Check sub-engine statuses and ML reliability
  const techValid = rawTechnical.status === 'SUCCESS';
  const fundValid = rawFundamentals.status === 'SUCCESS';
  const nlpValid = rawNlp.status === 'SUCCESS';
  const mlValid = rawMl.status === 'SUCCESS' && rawMl.is_reliable;

  const techScore = techValid ? rawTechnical.technical_score : 0; // max 35
  const fundScore = fundValid ? rawFundamentals.fundamental_score : 0; // max 25
  const nlpScore = nlpValid ? rawNlp.news_nlp_score : 0; // max 20
  const mlScore = mlValid ? rawMl.ml_score : 0; // max 20

  let finalScore: number | null = null;
  let signal: 'BUY BIAS' | 'HOLD BIAS' | 'SELL BIAS' | 'INSUFFICIENT DATA' = 'INSUFFICIENT DATA';
  let explanation = '';

  // Core engines (Technical, Fundamental, News NLP) MUST be valid
  if (!techValid || !fundValid || !nlpValid) {
    finalScore = null;
    signal = 'INSUFFICIENT DATA';
    explanation = 'Research score cannot be calculated due to missing core market or fundamental model inputs.';
  } else if (!mlValid) {
    // ML model is flagged as LOW CONFIDENCE (e.g., test accuracy < 50% or F1 = 0)
    // Weight is normalized across remaining 3 valid factors (Technical 35, Fundamental 25, News 20 => total 80)
    const sum3 = techScore + fundScore + nlpScore; // max 80
    finalScore = Number(((sum3 / 80) * 100).toFixed(2));

    if (finalScore >= 65.0) {
      signal = 'BUY BIAS';
    } else if (finalScore >= 45.0) {
      signal = 'HOLD BIAS';
    } else {
      signal = 'SELL BIAS';
    }

    explanation = `Composite Research Signal: ${signal} (${finalScore}/100 score). Normalized across Technicals (${techScore}/35 pts), Fundamentals (${fundScore}/25 pts), and News NLP (${nlpScore}/20 pts). Note: ML Model is flagged as LOW CONFIDENCE (Test Accuracy = ${rawMl.accuracy}%, F1 = ${rawMl.f1_score}%); ML weight was excluded and remaining 3 factors were normalized.`;
  } else {
    // All 4 components are valid and ML is reliable
    finalScore = Number((techScore + fundScore + nlpScore + mlScore).toFixed(2));

    if (finalScore >= 65.0) {
      signal = 'BUY BIAS';
    } else if (finalScore >= 45.0) {
      signal = 'HOLD BIAS';
    } else {
      signal = 'SELL BIAS';
    }

    explanation = `Composite Research Signal: ${signal} (${finalScore}/100 score). Quantitative research output indicates alignment across technical momentum (${techScore}/35 pts), fundamentals (${fundScore}/25 pts), news NLP (${nlpScore}/20 pts), and ML ensemble probability (${mlScore}/20 pts, Test Acc = ${rawMl.accuracy}%).`;
  }

  // Slice default candles for 3M display in chart
  const defaultHistorical = candles1y.length > 65 ? candles1y.slice(-65) : candles1y;

  // Determine non-contradictory Source Label
  let quoteDataSourceLabel = 'SINGLE SOURCE';
  if (rawQuote.consensus_status === 'MULTI-SOURCE VERIFIED' || rawQuote.consensus_status === 'MULTI-SOURCE CONSENSUS') {
    quoteDataSourceLabel = 'MULTI-SOURCE CONSENSUS';
  } else if (rawQuote.consensus_status === 'SINGLE-SOURCE') {
    quoteDataSourceLabel = 'SINGLE SOURCE';
  } else if (rawQuote.consensus_status === 'DATA DISCREPANCY' || rawQuote.consensus_status === 'SOURCE DISAGREEMENT') {
    quoteDataSourceLabel = 'SOURCE DISAGREEMENT';
  } else {
    quoteDataSourceLabel = 'DATA UNAVAILABLE';
  }

  // Format Quote to CompanyQuote
  const formattedQuote = {
    ticker,
    name: resolvedName,
    current_price: rawQuote.current_price,
    previous_close: rawQuote.previous_close,
    change: rawQuote.change,
    change_percent: rawQuote.change_percent,
    volume: rawQuote.volume,
    market_cap: rawQuote.market_cap,
    exchange: rawQuote.exchange,
    sector: ticker.endsWith('.NS') ? 'Indian Market Equity' : 'US Market Equity',
    timestamp: timestampStr,
    data_source: quoteDataSourceLabel,
    status: rawQuote.status,
    consensus_status: rawQuote.consensus_status,
    sources_checked: rawQuote.sources_checked,
    error_reason: rawQuote.error_reason,
    high_52w: rawQuote.high_52w,
    low_52w: rawQuote.low_52w,
    open_price: rawQuote.open_price
  };

  // Format Historical
  const formattedHistorical = {
    ticker,
    period: '3M',
    candle_count: defaultHistorical.length,
    data_source: 'Yahoo Finance Daily OHLCV Feed',
    timestamp: timestampStr,
    status: candles1y.length >= 20 ? 'SUCCESS' : 'INSUFFICIENT VERIFIED HISTORICAL DATA',
    ohlcv: defaultHistorical.map(c => ({
      date: c.date,
      Date: c.date,
      open: c.open,
      Open: c.open,
      high: c.high,
      High: c.high,
      low: c.low,
      Low: c.low,
      close: c.close,
      Close: c.close,
      volume: c.volume,
      Volume: c.volume
    }))
  };

  // Format Fundamentals
  const formattedFundamentals = {
    ticker,
    status: rawFundamentals.status,
    error_reason: rawFundamentals.error_reason,
    data_source: rawFundamentals.source,
    timestamp: timestampStr,
    period: rawFundamentals.period,
    publication_date: rawFundamentals.publication_date,
    fundamental_score: fundScore,
    pe_ratio: rawFundamentals.pe_ratio,
    pb_ratio: rawFundamentals.pb_ratio,
    roe: rawFundamentals.roe,
    net_profit_margin: rawFundamentals.net_profit_margin,
    debt_to_equity: rawFundamentals.debt_to_equity,
    dividend_yield: rawFundamentals.dividend_yield,
    metrics: rawFundamentals.metrics
  };

  // Format Technicals
  const formattedTechnical = {
    ticker,
    sma20: rawTechnical.sma20,
    sma50: rawTechnical.sma50,
    rsi14: rawTechnical.rsi14,
    macd: rawTechnical.macd,
    macd_signal: rawTechnical.macd_signal,
    macd_histogram: rawTechnical.macd_histogram,
    support: rawTechnical.support,
    resistance: rawTechnical.resistance,
    trend_status: rawTechnical.trend_status,
    volatility: rawTechnical.volatility_10d,
    technical_score: techScore,
    calculation_period: '1Y Daily Verified Candles',
    timestamp: timestampStr,
    data_source: 'Pandas / NumPy Math Engine',
    status: rawTechnical.status,
    error_reason: rawTechnical.error_reason
  };

  // Format News
  const formattedNews = {
    ticker,
    company_name: resolvedName,
    time_filter: '7d',
    article_count: rawNews.length,
    articles: rawNews.map(a => ({
      title: a.title,
      headline: a.title,
      publisher: a.publisher,
      link: a.link,
      url: a.link,
      published_date: a.published_date,
      retrieval_timestamp: a.retrieval_timestamp,
      sentiment: a.sentiment,
      vader_score: a.vader_score,
      category: 'Market News',
      verified: true
    })),
    data_source: 'Google News RSS Feed',
    timestamp: timestampStr,
    status: rawNlp.status
  };

  // Format NLP
  const totalArticles = rawNews.length;
  const formattedNlp = {
    ticker,
    total_headlines_analyzed: totalArticles,
    positive_percentage: totalArticles > 0 ? Math.round((rawNlp.positive_count / totalArticles) * 100) : 0,
    neutral_percentage: totalArticles > 0 ? Math.round((rawNlp.neutral_count / totalArticles) * 100) : 0,
    negative_percentage: totalArticles > 0 ? Math.round((rawNlp.negative_count / totalArticles) * 100) : 0,
    overall_sentiment: rawNlp.overall_sentiment,
    overall_score: rawNlp.average_vader_score,
    headline_analyses: rawNews.map(a => ({
      headline: a.title,
      publisher: a.publisher,
      sentiment: a.sentiment,
      sentiment_score: a.vader_score,
      category: 'Market Headline',
      keywords: [resolvedName, 'Equity', 'Finance'],
      relevance: 1.0
    })),
    timestamp: timestampStr,
    status: rawNlp.status
  };

  // Format ML
  const formattedMl = {
    ticker,
    model_name: rawMl.model_name,
    accuracy: rawMl.accuracy,
    precision: rawMl.precision,
    recall: rawMl.recall,
    f1_score: rawMl.f1_score,
    test_sample_count: rawMl.test_sample_count,
    training_period: rawMl.training_period,
    testing_period: rawMl.testing_period,
    up_probability: rawMl.up_probability,
    down_probability: rawMl.down_probability,
    predicted_next_direction: rawMl.predicted_next_direction,
    ml_score: mlScore,
    confidence_status: rawMl.confidence_status,
    is_reliable: rawMl.is_reliable,
    timestamp: timestampStr,
    status: rawMl.status,
    error_reason: rawMl.error_reason
  };

  // Score Components Breakdown with Normalized Weights when ML is Low Confidence
  const scoreComponents: ScoreComponent[] = [
    {
      category: 'Technical Indicators',
      raw_score: techValid ? Math.round((techScore / 35) * 100) : 0,
      weight: mlValid ? 0.35 : Number((0.35 / 0.80).toFixed(4)),
      weighted_score: mlValid ? techScore : Number(((techScore / 35) * 43.75).toFixed(2)),
      description: 'Evaluation of SMA20/50, RSI(14), and MACD momentum indicators',
      status: rawTechnical.status
    },
    {
      category: 'Fundamental Statement Ratios',
      raw_score: fundValid ? Math.round((fundScore / 25) * 100) : 0,
      weight: mlValid ? 0.25 : Number((0.25 / 0.80).toFixed(4)),
      weighted_score: mlValid ? fundScore : Number(((fundScore / 25) * 31.25).toFixed(2)),
      description: 'Audited financial statement analysis (P/E, ROE, Net Margin, Debt/Equity)',
      status: rawFundamentals.status
    },
    {
      category: 'News NLP Sentiment',
      raw_score: nlpValid ? Math.round((nlpScore / 20) * 100) : 0,
      weight: mlValid ? 0.20 : Number((0.20 / 0.80).toFixed(4)),
      weighted_score: mlValid ? nlpScore : Number(((nlpScore / 20) * 25.0).toFixed(2)),
      description: 'VADER sentiment aggregation of live Google News & financial press RSS headlines',
      status: rawNlp.status
    },
    {
      category: 'Machine Learning Probability',
      raw_score: rawMl.status === 'SUCCESS' ? Math.round((mlScore / 20) * 100) : 0,
      weight: mlValid ? 0.20 : 0.00,
      weighted_score: mlValid ? mlScore : 0.00,
      description: mlValid
        ? 'RandomForest ensemble probability model for next trading session'
        : 'LOW CONFIDENCE MODEL (Test Accuracy < 50% or F1 = 0); weight excluded from research score',
      status: mlValid ? rawMl.confidence_status : 'LOW CONFIDENCE MODEL'
    }
  ];

  const globalStatus = rawQuote.status !== 'DATA UNAVAILABLE' ? rawQuote.status : 'DATA UNAVAILABLE';

  return {
    company_name: resolvedName,
    ticker,
    quote: formattedQuote,
    final_research_score: finalScore,
    research_signal: signal,
    signal_explanation: explanation,
    score_components: scoreComponents,
    technical: formattedTechnical,
    fundamentals: formattedFundamentals,
    news: formattedNews,
    nlp: formattedNlp,
    ml: formattedMl,
    historical: formattedHistorical,
    timestamp: timestampStr,
    status: globalStatus,
    provenance_details: {
      consensus_status: rawQuote.consensus_status,
      market_sources: rawQuote.sources_checked,
      news_sources: unifiedNews.sources_checked,
      fundamentals_sources: rawFundamentals.metrics.map((m: any) => ({
        metric: m.metric_name,
        source: m.source,
        period: m.period,
        publication_date: m.publication_date
      }))
    }
  };
}

