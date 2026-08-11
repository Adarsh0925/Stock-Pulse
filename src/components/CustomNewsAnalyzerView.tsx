import React from 'react';
import { CustomHeadlineAnalyzer } from './CustomHeadlineAnalyzer';
import { Sparkles, Newspaper, ShieldCheck, Cpu, CheckCircle2, Zap } from 'lucide-react';

export const CustomNewsAnalyzerView: React.FC = () => {
  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Title & Introduction Banner */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 sm:p-8 relative overflow-hidden shadow-2xl">
        <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="relative z-10 space-y-3">
          <div className="flex flex-wrap items-center gap-3">
            <span className="px-3 py-1 bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 rounded-full text-xs font-mono font-bold uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" /> Financial NLP Pipeline
            </span>
            <span className="px-3 py-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-full text-xs font-mono font-bold uppercase tracking-wider flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5" /> Code Jargon Filtering
            </span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-100 tracking-tight font-sans">
            Custom News Analyzer
          </h2>

          <p className="text-sm text-slate-300 max-w-3xl leading-relaxed">
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
        <div className="bg-slate-950/90 border border-slate-800 rounded-2xl p-6 space-y-4 shadow-xl">
          <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
            <Zap className="w-4 h-4 text-cyan-400" />
            <h3 className="text-sm font-bold text-slate-100 uppercase tracking-wider font-mono">
              NLP Architecture Rules
            </h3>
          </div>

          <ul className="space-y-3 text-xs text-slate-300">
            <li className="flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <strong className="text-slate-100 block font-mono">1. Non-Financial Detection</strong>
                Input containing technical code, system prompts, or non-news text is flagged as <code className="text-amber-300">NOT APPLICABLE</code>.
              </div>
            </li>

            <li className="flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <strong className="text-slate-100 block font-mono">2. Contextual "Down" Analysis</strong>
                "Debt down" or "costs decreased" generates positive sentiment; "profits down" generates bearish risk factors.
              </div>
            </li>

            <li className="flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <strong className="text-slate-100 block font-mono">3. Technical Word Exclusion</strong>
                Words like <code className="text-cyan-300">default</code>, <code className="text-cyan-300">fallback</code>, <code className="text-cyan-300">null</code>, <code className="text-cyan-300">validation</code> are excluded from standalone risk factors unless tied to financial obligations (e.g., "debt default").
              </div>
            </li>

            <li className="flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <strong className="text-slate-100 block font-mono">4. Grammatical Negation</strong>
                Modifiers like "not", "no", "never", "without" modify the polarity of adjacent words rather than counting as negative risk factors.
              </div>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};
