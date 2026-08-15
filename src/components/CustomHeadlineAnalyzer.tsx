import React, { useState } from 'react';
import { Newspaper, Send, Sparkles, AlertCircle, ThumbsUp, ThumbsDown, Minus, CheckCircle2, RefreshCw } from 'lucide-react';

export interface HeadlineAnalysisResult {
  headline: string;
  ticker?: string;
  vader_score: number;
  sentiment: 'BULLISH' | 'NEUTRAL' | 'BEARISH' | 'NOT APPLICABLE';
  input_type?: 'FINANCIAL_HEADLINE' | 'NON_FINANCIAL_TEXT';
  nlp_score_contribution: number;
  matched_positive_words: string[];
  matched_negative_words: string[];
  negations_detected: string[];
  explanation: string;
  timestamp: string;
}

interface CustomHeadlineAnalyzerProps {
  defaultTicker?: string;
  compact?: boolean;
}

export const CustomHeadlineAnalyzer: React.FC<CustomHeadlineAnalyzerProps> = ({ defaultTicker, compact = false }) => {
  const [headlineText, setHeadlineText] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<HeadlineAnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const sampleHeadlines = [
    "Company reports record quarterly profit surge and 25% revenue growth",
    "Regulatory investigation launched after sudden drop in earnings and debt default warning",
    "Board approves strategic partnership and dividend expansion plan",
    "Firm fails to meet market expectations as sales decline sharply"
  ];

  const handleAnalyze = async (textToAnalyze?: string) => {
    const text = textToAnalyze || headlineText;
    if (!text.trim()) {
      setError('Please enter a news headline to analyze.');
      return;
    }

    setIsAnalyzing(true);
    setError(null);

    try {
      const res = await fetch('/api/analyze-headline', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ headline: text.trim(), ticker: defaultTicker })
      });

      if (!res.ok) {
        throw new Error(`Server returned HTTP ${res.status}`);
      }

      const data: HeadlineAnalysisResult = await res.json();
      setResult(data);
    } catch (err: any) {
      console.error('Failed to analyze headline:', err);
      setError('Failed to analyze headline sentiment. Please try again.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className={`bg-white border border-gray-200 rounded-2xl ${compact ? 'p-4' : 'p-6'} shadow-sm space-y-4`}>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-gray-200 pb-3">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-teal-700" />
          <h4 className="text-sm font-extrabold text-gray-900 uppercase tracking-wider font-mono">
            Custom News Headline Sentiment Analyzer
          </h4>
        </div>
        <span className="text-[11px] font-mono text-teal-700 bg-teal-50 px-2.5 py-1 rounded-lg border border-teal-200 font-semibold">
          VADER Financial NLP Engine
        </span>
      </div>

      <p className="text-xs text-slate-500 leading-relaxed">
        Input any real or custom news headline below to run live financial NLP analysis. The VADER lexicon engine will classify sentiment, match financial catalysts, and compute score contribution.
      </p>

      {/* Input Area */}
      <div className="space-y-2">
        <div className="relative">
          <textarea
            value={headlineText}
            onChange={(e) => {
              setHeadlineText(e.target.value);
              if (error) setError(null);
            }}
            placeholder="Type or paste a news headline (e.g., 'Company announces 30% revenue growth and debt clearance')..."
            rows={2}
            className="w-full bg-gray-50 border border-gray-300 rounded-xl p-3 text-xs text-gray-900 placeholder-slate-400 focus:outline-none focus:border-teal-700 focus:bg-white font-sans resize-none"
          />
        </div>

        <div className="flex flex-wrap items-center justify-between gap-2">
          {/* Sample Headline Pill Quick-Buttons */}
          <div className="flex flex-wrap items-center gap-1.5 text-[11px]">
            <span className="text-slate-400 font-mono">Try samples:</span>
            {sampleHeadlines.slice(0, compact ? 2 : 3).map((sample, idx) => (
              <button
                key={idx}
                onClick={() => {
                  setHeadlineText(sample);
                  handleAnalyze(sample);
                }}
                className="px-2 py-1 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-lg text-slate-600 hover:text-teal-700 transition-all text-left truncate max-w-[200px] cursor-pointer"
                title={sample}
              >
                Sample {idx + 1}
              </button>
            ))}
          </div>

          <button
            onClick={() => handleAnalyze()}
            disabled={isAnalyzing || !headlineText.trim()}
            className="px-4 py-2 bg-teal-700 hover:bg-teal-800 text-white font-bold text-xs rounded-xl flex items-center gap-2 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed shrink-0 font-mono shadow-sm"
          >
            {isAnalyzing ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                <span>Analyzing NLP...</span>
              </>
            ) : (
              <>
                <Send className="w-3.5 h-3.5" />
                <span>Analyze Headline</span>
              </>
            )}
          </button>
        </div>
      </div>

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Analysis Output Result Box */}
      {result && (
        <div className="bg-gray-50 border border-gray-200 rounded-2xl p-4 space-y-3.5 animate-fadeIn">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-gray-200 pb-3">
            <div className="space-y-0.5">
              <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider">Analyzed Headline</span>
              <p className="text-xs font-semibold text-gray-900 italic">"{result.headline}"</p>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              {result.input_type === 'NON_FINANCIAL_TEXT' && (
                <span className="px-2.5 py-1 bg-amber-50 text-amber-800 border border-amber-200 rounded-xl text-[10px] font-mono font-bold uppercase">
                  NON-NEWS / TECHNICAL TEXT
                </span>
              )}
              <span className={`px-3 py-1 rounded-xl text-xs font-mono font-bold border flex items-center gap-1.5 ${
                result.sentiment === 'BULLISH'
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                  : result.sentiment === 'BEARISH'
                  ? 'bg-red-50 text-red-700 border-red-200'
                  : result.sentiment === 'NOT APPLICABLE'
                  ? 'bg-amber-50 text-amber-700 border-amber-200'
                  : 'bg-gray-100 text-slate-700 border-gray-200'
              }`}>
                {result.sentiment === 'BULLISH' && <ThumbsUp className="w-3.5 h-3.5 text-emerald-600" />}
                {result.sentiment === 'BEARISH' && <ThumbsDown className="w-3.5 h-3.5 text-red-600" />}
                {result.sentiment === 'NEUTRAL' && <Minus className="w-3.5 h-3.5 text-slate-500" />}
                {result.sentiment === 'NOT APPLICABLE' && <AlertCircle className="w-3.5 h-3.5 text-amber-600" />}
                <span>{result.sentiment}</span>
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs font-mono">
            <div className="bg-white p-3 rounded-xl border border-gray-200 space-y-1 shadow-sm">
              <span className="text-slate-500 text-[10px] uppercase">VADER Score</span>
              <div className="text-base font-extrabold text-gray-900">
                {result.vader_score > 0 ? `+${result.vader_score}` : result.vader_score}
              </div>
            </div>

            <div className="bg-white p-3 rounded-xl border border-gray-200 space-y-1 shadow-sm">
              <span className="text-slate-500 text-[10px] uppercase">Est. Score Contribution</span>
              <div className="text-base font-extrabold text-teal-700">
                {result.nlp_score_contribution} <span className="text-xs text-slate-400 font-normal">/ 20 pts</span>
              </div>
            </div>

            <div className="bg-white p-3 rounded-xl border border-gray-200 space-y-1 shadow-sm">
              <span className="text-slate-500 text-[10px] uppercase">Matched Keywords</span>
              <div className="text-xs font-bold text-gray-900">
                {(result.matched_positive_words.length + result.matched_negative_words.length)} Found
              </div>
            </div>
          </div>

          {/* Lexicon Matches Badges */}
          <div className="flex flex-wrap items-center gap-2 text-xs">
            {result.matched_positive_words.length > 0 && (
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-[11px] font-mono text-emerald-700 font-bold">Positive Catalysts:</span>
                {result.matched_positive_words.map((w, i) => (
                  <span key={i} className="px-2 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-md text-[11px] font-mono">
                    +{w}
                  </span>
                ))}
              </div>
            )}

            {result.matched_negative_words.length > 0 && (
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-[11px] font-mono text-red-700 font-bold">Risk Factors:</span>
                {result.matched_negative_words.map((w, i) => (
                  <span key={i} className="px-2 py-0.5 bg-red-50 text-red-700 border border-red-200 rounded-md text-[11px] font-mono">
                    -{w}
                  </span>
                ))}
              </div>
            )}

            {result.negations_detected.length > 0 && (
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-[11px] font-mono text-amber-700 font-bold">Negations:</span>
                {result.negations_detected.map((w, i) => (
                  <span key={i} className="px-2 py-0.5 bg-amber-50 text-amber-700 border border-amber-200 rounded-md text-[11px] font-mono">
                    {w}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Automated NLP Explanation */}
          <div className="bg-white p-3 rounded-xl border border-gray-200 text-xs text-slate-700 leading-relaxed font-sans flex items-start gap-2.5 shadow-sm">
            <CheckCircle2 className="w-4 h-4 text-teal-700 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-gray-900 font-mono uppercase text-[11px]">NLP Rationale: </span>
              {result.explanation}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
