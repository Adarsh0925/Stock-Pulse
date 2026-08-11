import React from 'react';
import { Newspaper, ExternalLink, ShieldCheck, Tag, ThumbsUp, ThumbsDown, Minus, Filter, Sparkles } from 'lucide-react';
import { NewsData, NLPData } from '../types';
import { CustomHeadlineAnalyzer } from './CustomHeadlineAnalyzer';

interface NewsNLPSectionProps {
  news: NewsData | null;
  nlp: NLPData | null;
  selectedTimeFilter: string;
  onSelectTimeFilter: (filter: string) => void;
  companyName: string;
}

export const NewsNLPSection: React.FC<NewsNLPSectionProps> = ({
  news,
  nlp,
  selectedTimeFilter,
  onSelectTimeFilter,
  companyName
}) => {
  const timeFilters = ['24h', '3d', '7d', '30d'];

  const hasNews = Boolean(news && news.status === 'SUCCESS' && news?.articles?.length);
  const hasNLP = Boolean(nlp && nlp.status === 'SUCCESS' && nlp?.total_headlines_analyzed);

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
      {/* Section Header & Time Filters */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2 text-cyan-400 text-xs font-bold uppercase tracking-wider mb-1">
            <Newspaper className="w-4 h-4" />
            Verified Online Headlines & Financial NLP
          </div>
          <h3 className="text-xl font-extrabold text-slate-100">Company News & Sentiment NLP</h3>
        </div>

        {/* Time Filters */}
        <div className="flex items-center gap-2 bg-slate-950 p-1.5 rounded-xl border border-slate-800 text-xs font-mono font-bold">
          <Filter className="w-3.5 h-3.5 text-slate-500 ml-1" />
          <span className="text-slate-400 text-[11px] mr-1 hidden sm:inline">Filter:</span>
          {timeFilters.map((tf) => (
            <button
              key={tf}
              onClick={() => onSelectTimeFilter(tf)}
              className={`px-2.5 py-1 rounded-lg transition-colors cursor-pointer ${
                selectedTimeFilter === tf
                  ? 'bg-cyan-500 text-slate-950 font-bold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {tf}
            </button>
          ))}
        </div>
      </div>

      {/* Sentiment NLP Overview Box */}
      {hasNLP ? (
        <div className="bg-slate-950/80 p-5 rounded-2xl border border-slate-800 space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800/80 pb-4">
            <div className="space-y-1">
              <div className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-cyan-400" />
                VADER Financial NLP Aggregation ({nlp.total_headlines_analyzed} Verified Headlines)
              </div>
              <div className="flex items-center gap-3">
                <span className="text-2xl font-black text-slate-100 font-mono">
                  Score: {nlp.overall_score > 0 ? '+' : ''}{nlp.overall_score}
                </span>
                <span className={`px-3 py-1 rounded-lg font-mono font-bold text-xs border ${
                  nlp.overall_sentiment === 'BULLISH'
                    ? 'bg-emerald-950 text-emerald-300 border-emerald-800'
                    : nlp.overall_sentiment === 'BEARISH'
                    ? 'bg-rose-950 text-rose-300 border-rose-800'
                    : 'bg-slate-800 text-slate-300 border-slate-700'
                }`}>
                  OVERALL SENTIMENT: {nlp.overall_sentiment}
                </span>
              </div>
            </div>

            {/* Sentiment Ratios Bar */}
            <div className="flex items-center gap-4 bg-slate-900 p-3 rounded-xl border border-slate-800 text-xs font-mono">
              <div className="flex items-center gap-1.5 text-emerald-400">
                <ThumbsUp className="w-3.5 h-3.5" />
                <span>Positive: {nlp.positive_percentage}%</span>
              </div>
              <div className="flex items-center gap-1.5 text-slate-400">
                <Minus className="w-3.5 h-3.5" />
                <span>Neutral: {nlp.neutral_percentage}%</span>
              </div>
              <div className="flex items-center gap-1.5 text-rose-400">
                <ThumbsDown className="w-3.5 h-3.5" />
                <span>Negative: {nlp.negative_percentage}%</span>
              </div>
            </div>
          </div>

          {/* Sentiment Visual Meter */}
          <div className="w-full h-3 bg-slate-900 rounded-full overflow-hidden flex border border-slate-800">
            <div
              style={{ width: `${nlp.positive_percentage}%` }}
              className="bg-emerald-500 h-full transition-all"
              title={`Positive: ${nlp.positive_percentage}%`}
            ></div>
            <div
              style={{ width: `${nlp.neutral_percentage}%` }}
              className="bg-slate-600 h-full transition-all"
              title={`Neutral: ${nlp.neutral_percentage}%`}
            ></div>
            <div
              style={{ width: `${nlp.negative_percentage}%` }}
              className="bg-rose-500 h-full transition-all"
              title={`Negative: ${nlp.negative_percentage}%`}
            ></div>
          </div>
        </div>
      ) : null}

      {/* Instant Custom Headline Sentiment Analyzer Widget */}
      <CustomHeadlineAnalyzer defaultTicker={companyName} />

      {/* Verified Articles List */}
      {hasNews ? (
        <div className="space-y-3">
          <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            Verified Articles ({news.articles.length} retrieved for filter '{selectedTimeFilter}')
          </div>

          <div className="space-y-3">
            {news.articles.map((art, idx) => {
              const nlpArt = nlp?.headline_analyses?.find((h) => h.headline === art.headline);
              const sentiment = nlpArt?.sentiment || 'NEUTRAL';
              const sentimentScore = nlpArt?.sentiment_score ?? 0;

              return (
                <div
                  key={idx}
                  className="bg-slate-950/60 p-4 rounded-xl border border-slate-800 hover:border-slate-700 transition-all space-y-2 group"
                >
                  <div className="flex flex-col md:flex-row md:items-start justify-between gap-3">
                    <a
                      href={art.url}
                      target="_blank"
                      rel="noreferrer"
                      className="text-sm font-bold text-slate-200 group-hover:text-cyan-400 transition-colors flex items-center gap-1.5"
                    >
                      <span>{art.headline}</span>
                      <ExternalLink className="w-3.5 h-3.5 text-cyan-400 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </a>

                    <div className="flex items-center gap-2 shrink-0">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold border ${
                        sentiment === 'POSITIVE'
                          ? 'bg-emerald-950/80 text-emerald-300 border-emerald-800'
                          : sentiment === 'NEGATIVE'
                          ? 'bg-rose-950/80 text-rose-300 border-rose-800'
                          : 'bg-slate-800 text-slate-300 border-slate-700'
                      }`}>
                        {sentiment} ({sentimentScore > 0 ? '+' : ''}{sentimentScore.toFixed(2)})
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-2 text-xs font-mono text-slate-400 pt-1 border-t border-slate-800/60">
                    <div className="flex items-center gap-3">
                      <span className="font-semibold text-slate-300">{art.publisher}</span>
                      <span>•</span>
                      <span>{art.published_at}</span>
                      <span>•</span>
                      <span className="flex items-center gap-1 text-slate-400">
                        <Tag className="w-3 h-3 text-slate-500" />
                        {art.category}
                      </span>
                    </div>

                    {nlpArt && nlpArt.keywords.length > 0 && (
                      <div className="flex items-center gap-1 text-[10px] text-slate-400">
                        <span className="text-slate-400">Keywords:</span>
                        {nlpArt.keywords.map((kw, kIdx) => (
                          <span key={kIdx} className="bg-slate-800 px-1.5 py-0.5 rounded text-slate-300">
                            {kw}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="bg-slate-950 p-6 rounded-xl border border-slate-800 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-amber-950/60 border border-amber-800/60 text-amber-300 font-mono text-sm rounded-lg mb-2">
            NO VERIFIED NEWS FOUND
          </div>
          <p className="text-slate-400 text-sm">
            {news?.error_reason || `No verified articles were returned for ${companyName} in the last ${selectedTimeFilter}.`}
          </p>
        </div>
      )}

      {/* Footer Provenance */}
      <div className="flex items-center justify-between text-xs text-slate-400 font-mono pt-2 border-t border-slate-800/60">
        <span className="flex items-center gap-1.5 text-slate-400">
          <ShieldCheck className="w-4 h-4 text-cyan-400" />
          Headlines are retrieved from original RSS news feeds with direct source URLs.
        </span>
        <span>Source: {news?.data_source || 'Google News'}</span>
      </div>
    </div>
  );
};
