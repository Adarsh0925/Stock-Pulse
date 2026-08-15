import React, { useState } from 'react';
import { Newspaper, ExternalLink, ShieldCheck, Tag, ThumbsUp, ThumbsDown, Minus, Filter, Sparkles, ChevronDown, ChevronUp } from 'lucide-react';
import { NewsData, NLPData } from '../types';
import { InfoTooltip } from './InfoTooltip';

interface NewsNLPSectionProps {
  news: NewsData | null;
  nlp: NLPData | null;
  selectedTimeFilter: string;
  onSelectTimeFilter: (filter: string) => void;
  companyName: string;
  isSimpleView?: boolean;
}

export const NewsNLPSection: React.FC<NewsNLPSectionProps> = ({
  news,
  nlp,
  selectedTimeFilter,
  onSelectTimeFilter,
  companyName,
  isSimpleView = true
}) => {
  const [showTechnicalDetails, setShowTechnicalDetails] = useState(false);
  const timeFilters = ['24h', '3d', '7d', '30d'];

  const hasNews = Boolean(news && news.status === 'SUCCESS' && news?.articles?.length);
  const hasNLP = Boolean(nlp && nlp.status === 'SUCCESS' && nlp?.total_headlines_analyzed);

  const moodLabel = nlp?.overall_sentiment === 'BULLISH' ? 'Positive' : nlp?.overall_sentiment === 'BEARISH' ? 'Negative' : 'Neutral';

  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm space-y-6">
      {/* Section Header & Time Filters */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-200 pb-4">
        <div>
          <div className="flex items-center gap-2 text-teal-700 text-xs font-bold uppercase tracking-wider mb-1">
            <Newspaper className="w-4 h-4" />
            <span>News Mood</span>
            <InfoTooltip text="Analyzes recent news headlines to understand the current market mood around this stock." />
          </div>
          <h3 className="text-xl font-bold text-gray-900">
            News Mood & Headlines
          </h3>
        </div>

        {/* Time Filters */}
        <div className="flex items-center gap-2 bg-gray-100 p-1.5 rounded-xl border border-gray-200 text-xs font-mono font-bold">
          <Filter className="w-3.5 h-3.5 text-slate-400 ml-1" />
          <span className="text-slate-500 text-[11px] mr-1 hidden sm:inline">Timeframe:</span>
          {timeFilters.map((tf) => (
            <button
              key={tf}
              onClick={() => onSelectTimeFilter(tf)}
              className={`px-2.5 py-1 rounded-lg transition-colors cursor-pointer ${
                selectedTimeFilter === tf
                  ? 'bg-teal-700 text-white font-bold shadow-sm'
                  : 'text-slate-600 hover:text-gray-900'
              }`}
            >
              {tf}
            </button>
          ))}
        </div>
      </div>

      {/* Mood Overview Box */}
      {hasNLP ? (
        <div className="bg-gray-50 p-5 rounded-2xl border border-gray-200 space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-200 pb-4">
            <div className="space-y-1">
              <div className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-teal-700" />
                <span>Overall News Mood ({nlp.total_headlines_analyzed} Headlines Analyzed)</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-2xl font-black text-gray-900 font-mono">
                  Mood Score: {nlp.overall_score > 0 ? '+' : ''}{nlp.overall_score}
                </span>
                <span className={`px-3 py-1 rounded-lg font-mono font-bold text-xs border ${
                  nlp.overall_sentiment === 'BULLISH'
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                    : nlp.overall_sentiment === 'BEARISH'
                    ? 'bg-red-50 text-red-700 border-red-200'
                    : 'bg-gray-100 text-slate-700 border-gray-200'
                }`}>
                  MOOD: {(moodLabel || 'Neutral').toUpperCase()}
                </span>
              </div>
            </div>

            {/* Sentiment Ratios Bar */}
            <div className="flex items-center gap-4 bg-white p-3 rounded-xl border border-gray-200 text-xs font-mono shadow-sm">
              <div className="flex items-center gap-1.5 text-emerald-700">
                <ThumbsUp className="w-3.5 h-3.5" />
                <span>Positive: {nlp.positive_percentage}%</span>
              </div>
              <div className="flex items-center gap-1.5 text-slate-500">
                <Minus className="w-3.5 h-3.5" />
                <span>Neutral: {nlp.neutral_percentage}%</span>
              </div>
              <div className="flex items-center gap-1.5 text-red-700">
                <ThumbsDown className="w-3.5 h-3.5" />
                <span>Negative: {nlp.negative_percentage}%</span>
              </div>
            </div>
          </div>

          {/* Sentiment Visual Meter */}
          <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden flex border border-gray-200">
            <div
              style={{ width: `${nlp.positive_percentage}%` }}
              className="bg-emerald-600 h-full transition-all"
              title={`Positive: ${nlp.positive_percentage}%`}
            ></div>
            <div
              style={{ width: `${nlp.neutral_percentage}%` }}
              className="bg-slate-400 h-full transition-all"
              title={`Neutral: ${nlp.neutral_percentage}%`}
            ></div>
            <div
              style={{ width: `${nlp.negative_percentage}%` }}
              className="bg-red-600 h-full transition-all"
              title={`Negative: ${nlp.negative_percentage}%`}
            ></div>
          </div>
        </div>
      ) : null}

      {/* Verified Articles List */}
      {hasNews ? (
        <div className="space-y-3">
          <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">
            Recent Verified Headlines ({news.articles.length})
          </div>

          <div className="space-y-3">
            {news.articles.map((art, idx) => {
              const nlpArt = nlp?.headline_analyses?.find((h) => h.headline === art.headline);
              const sentiment = nlpArt?.sentiment || 'NEUTRAL';
              const sentimentScore = nlpArt?.sentiment_score ?? 0;

              return (
                <div
                  key={idx}
                  className="bg-gray-50 p-4 rounded-xl border border-gray-200 hover:border-gray-300 transition-all space-y-2 group"
                >
                  <div className="flex flex-col md:flex-row md:items-start justify-between gap-3">
                    <a
                      href={art.url}
                      target="_blank"
                      rel="noreferrer"
                      className="text-sm font-bold text-gray-900 group-hover:text-teal-700 transition-colors flex items-center gap-1.5"
                    >
                      <span>{art.headline}</span>
                      <ExternalLink className="w-3.5 h-3.5 text-teal-700 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </a>

                    <div className="flex items-center gap-2 shrink-0">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold border ${
                        sentiment === 'POSITIVE'
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : sentiment === 'NEGATIVE'
                          ? 'bg-red-50 text-red-700 border-red-200'
                          : 'bg-gray-100 text-slate-700 border-gray-200'
                      }`}>
                        {sentiment}
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-2 text-xs font-mono text-slate-500 pt-1 border-t border-gray-200">
                    <div className="flex items-center gap-3">
                      <span className="font-semibold text-gray-800">{art.publisher}</span>
                      <span>•</span>
                      <span>{art.published_at}</span>
                      <span>•</span>
                      <span className="text-slate-500">
                        {art.category}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="bg-gray-50 p-6 rounded-xl border border-gray-200 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-amber-50 border border-amber-200 text-amber-800 font-mono text-sm rounded-lg mb-2">
            NO RECENT NEWS FOUND
          </div>
          <p className="text-slate-600 text-sm">
            {news?.error_reason || `No verified articles were returned for ${companyName} in the last ${selectedTimeFilter}.`}
          </p>
        </div>
      )}

      {/* Collapsible Technical Details Trigger */}
      <div className="border-t border-gray-200 pt-3">
        <button
          onClick={() => setShowTechnicalDetails(!showTechnicalDetails)}
          className="w-full flex items-center justify-between p-3 bg-gray-50 hover:bg-gray-100 rounded-xl border border-gray-200 text-xs font-mono text-slate-700 transition-all cursor-pointer"
        >
          <span className="flex items-center gap-2 font-bold text-teal-700">
            <span>{showTechnicalDetails ? 'Technical Details ▲' : 'Technical Details ▼'}</span>
            <span className="text-slate-500 font-normal text-[11px]">(NLP Tokenization, Headline Keywords & Sentiment Lexicon)</span>
          </span>
          {showTechnicalDetails ? <ChevronUp className="w-4 h-4 text-teal-700" /> : <ChevronDown className="w-4 h-4 text-slate-500" />}
        </button>

        {showTechnicalDetails && (
          <div className="mt-3 p-4 bg-gray-50 rounded-xl border border-gray-200 space-y-3 text-xs font-mono text-slate-700 animate-fadeIn">
            <div className="space-y-1">
              <div className="text-slate-500 font-bold uppercase text-[11px]">NLP & Sentiment Lexicon Details:</div>
              <p className="text-slate-600 font-sans text-xs">
                Valence-aware dictionary scores words across financial contexts. Individual compound scores range from -1.0 to +1.0.
              </p>
            </div>

            {nlp?.headline_analyses && (
              <div className="space-y-2 pt-2 border-t border-gray-200">
                <div className="text-slate-500 font-bold uppercase text-[10px]">Extracted Keywords per Article:</div>
                <div className="space-y-1 text-[11px]">
                  {nlp.headline_analyses.map((h, i) => (
                    <div key={i} className="flex flex-wrap items-center gap-1.5">
                      <span className="text-gray-900 font-medium truncate max-w-xs">{h.headline.slice(0, 45)}...</span>
                      <span className="text-slate-400">Score: {h.sentiment_score > 0 ? '+' : ''}{h.sentiment_score.toFixed(2)}</span>
                      {h.keywords.map((kw, ki) => (
                        <span key={ki} className="bg-white border border-gray-200 px-1 rounded text-[10px] text-slate-600">
                          {kw}
                        </span>
                      ))}
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="text-[11px] text-slate-500 pt-2 border-t border-gray-200 flex justify-between">
              <span>Source Feed: {news?.data_source || 'Google News RSS'}</span>
              <span>Updated: {news?.timestamp}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
