import React from 'react';
import { CustomHeadlineAnalyzer } from './CustomHeadlineAnalyzer';
import { Sparkles, Newspaper, ShieldCheck, Cpu, CheckCircle2, Zap } from 'lucide-react';

export const CustomNewsAnalyzerView: React.FC = () => {
  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Title & Introduction Banner */}
      <div className="bg-white border border-gray-200 rounded-3xl p-6 sm:p-8 relative overflow-hidden shadow-sm">
        <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-teal-50 rounded-full blur-3xl pointer-events-none"></div>
        <div className="relative z-10 space-y-3">
          <div className="flex flex-wrap items-center gap-3">
            <span className="px-3 py-1 bg-teal-50 text-teal-700 border border-teal-200 rounded-full text-xs font-mono font-bold uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-teal-700" /> Financial NLP Pipeline
            </span>
            <span className="px-3 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full text-xs font-mono font-bold uppercase tracking-wider flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" /> Code Jargon Filtering
            </span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight font-sans">
            Custom News Analyzer
          </h2>

          <p className="text-sm text-slate-600 max-w-3xl leading-relaxed">
            Test any custom news headline, article sentence, or corporate press release using StockPulse's context-aware VADER financial lexicon engine. The pipeline evaluates financial entity relationships, grammatical negation modifiers, directional metric dynamics (e.g. "debt down" vs "profits down"), and filters out non-financial programming jargon.
          </p>
        </div>
      </div>

      {/* Primary Interactive Analyzer */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <CustomHeadlineAnalyzer compact={false} />
        </div>

        {/* Feature Architecture Overview */}
        <div className="bg-white border border-gray-200 rounded-2xl p-6 space-y-4 shadow-sm">
          <div className="flex items-center gap-2 border-b border-gray-200 pb-3">
            <Zap className="w-4 h-4 text-teal-700" />
            <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider font-mono">
              NLP Architecture Rules
            </h3>
          </div>

          <ul className="space-y-3 text-xs text-slate-600">
            <li className="flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <strong className="text-gray-900 block font-mono">1. Non-Financial Detection</strong>
                Input containing technical code, system prompts, or non-news text is flagged as <code className="text-amber-700 bg-amber-50 px-1 py-0.5 rounded border border-amber-200 font-mono">NOT APPLICABLE</code>.
              </div>
            </li>

            <li className="flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <strong className="text-gray-900 block font-mono">2. Contextual "Down" Analysis</strong>
                "Debt down" or "costs decreased" generates positive sentiment; "profits down" generates bearish risk factors.
              </div>
            </li>

            <li className="flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <strong className="text-gray-900 block font-mono">3. Technical Word Exclusion</strong>
                Words like <code className="text-teal-700 bg-teal-50 px-1 py-0.5 rounded border border-teal-200 font-mono">default</code>, <code className="text-teal-700 bg-teal-50 px-1 py-0.5 rounded border border-teal-200 font-mono">fallback</code>, <code className="text-teal-700 bg-teal-50 px-1 py-0.5 rounded border border-teal-200 font-mono">null</code>, <code className="text-teal-700 bg-teal-50 px-1 py-0.5 rounded border border-teal-200 font-mono">validation</code> are excluded from standalone risk factors unless tied to financial obligations (e.g., "debt default").
              </div>
            </li>

            <li className="flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <strong className="text-gray-900 block font-mono">4. Grammatical Negation</strong>
                Modifiers like "not", "no", "never", "without" modify the polarity of adjacent words rather than counting as negative risk factors.
              </div>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};
