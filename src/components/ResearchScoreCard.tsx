import React from 'react';
import { ShieldCheck, AlertTriangle, CheckCircle2, Info, Calculator, FileText } from 'lucide-react';
import { ScoreComponent } from '../types';

interface ResearchScoreCardProps {
  finalScore: number | null;
  signal: 'BUY' | 'HOLD' | 'SELL' | 'INSUFFICIENT DATA' | string;
  explanation: string;
  components: ScoreComponent[];
  timestamp: string;
}

export const ResearchScoreCard: React.FC<ResearchScoreCardProps> = ({
  finalScore,
  signal,
  explanation,
  components,
  timestamp
}) => {
  const getSignalBadge = () => {
    const normSignal = (signal || '').toUpperCase();
    if (normSignal.includes('BUY')) {
      return (
        <div className="flex items-center gap-2 px-4 py-2 bg-emerald-950 border border-emerald-500/50 text-emerald-300 rounded-xl font-black text-xl shadow-lg shadow-emerald-500/10">
          <CheckCircle2 className="w-6 h-6 text-emerald-400" />
          RESEARCH SIGNAL: BUY BIAS
        </div>
      );
    }
    if (normSignal.includes('SELL')) {
      return (
        <div className="flex items-center gap-2 px-4 py-2 bg-rose-950 border border-rose-500/50 text-rose-300 rounded-xl font-black text-xl shadow-lg shadow-rose-500/10">
          <AlertTriangle className="w-6 h-6 text-rose-400" />
          RESEARCH SIGNAL: SELL BIAS
        </div>
      );
    }
    if (normSignal.includes('HOLD')) {
      return (
        <div className="flex items-center gap-2 px-4 py-2 bg-amber-950 border border-amber-500/50 text-amber-300 rounded-xl font-black text-xl shadow-lg shadow-amber-500/10">
          <Info className="w-6 h-6 text-amber-400" />
          RESEARCH SIGNAL: HOLD BIAS
        </div>
      );
    }
    return (
      <div className="flex items-center gap-2 px-4 py-2 bg-slate-950 border border-slate-700 text-slate-300 rounded-xl font-black text-xl">
        <AlertTriangle className="w-6 h-6 text-slate-400" />
        INSUFFICIENT DATA
      </div>
    );
  };

  const getGaugeColor = (score: number | null) => {
    if (score === null) return '#64748b'; // slate
    if (score >= 68) return '#10b981'; // emerald
    if (score <= 45) return '#f43f5e'; // rose
    return '#f59e0b'; // amber
  };

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2 text-cyan-400 text-xs font-bold uppercase tracking-wider mb-1">
            <Calculator className="w-4 h-4" />
            Transparent Multi-Factor Research Model
          </div>
          <h3 className="text-xl font-extrabold text-slate-100">Overall Research Score & Signal</h3>
        </div>
        {getSignalBadge()}
      </div>

      {/* Main Score Gauge & Explanation */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center bg-slate-950/70 p-5 rounded-2xl border border-slate-800">
        {/* Score Gauge Circle */}
        <div className="md:col-span-4 flex flex-col items-center justify-center p-4 border-b md:border-b-0 md:border-r border-slate-800">
          <div className="relative w-36 h-36 flex items-center justify-center">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
              <path
                className="text-slate-800"
                strokeWidth="3.5"
                stroke="currentColor"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
              <path
                strokeWidth="3.5"
                strokeDasharray={`${typeof finalScore === 'number' ? finalScore : 0}, 100`}
                strokeLinecap="round"
                stroke={getGaugeColor(finalScore)}
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
            </svg>
            <div className="absolute text-center">
              <span className="text-2xl font-black text-slate-100 font-mono">
                {typeof finalScore === 'number' ? finalScore : 'N/A'}
              </span>
              {typeof finalScore === 'number' && (
                <span className="text-xs text-slate-400 block font-bold font-mono">/ 100</span>
              )}
            </div>
          </div>
          <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mt-3">Calculated Research Score</div>
        </div>

        {/* Signal Explanation */}
        <div className="md:col-span-8 space-y-3">
          <h4 className="text-sm font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
            <FileText className="w-4 h-4 text-cyan-400" />
            Research Signal Rationale
          </h4>
          <p className="text-sm text-slate-300 leading-relaxed font-normal">
            {explanation}
          </p>
          <div className="bg-slate-900 p-3 rounded-xl border border-slate-800/80 text-xs text-slate-400 leading-normal flex items-start gap-2">
            <Info className="w-4 h-4 text-slate-500 shrink-0 mt-0.5" />
            <span>
              <strong className="text-slate-300 font-semibold">Important Disclaimer:</strong> This Research Signal is generated purely from mathematical analysis of real market feeds, financial statements, NLP news sentiment, and Scikit-learn machine learning probability models. It does not constitute financial advice or investment recommendations.
            </span>
          </div>
        </div>
      </div>

      {/* Transparent Calculation Breakdown Table */}
      <div className="space-y-3">
        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
          Transparent Weighting Formula Breakdown
        </h4>
        <div className="overflow-x-auto rounded-xl border border-slate-800">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950 text-slate-400 font-mono uppercase text-[10px]">
              <tr>
                <th className="py-2.5 px-4 font-bold">Category</th>
                <th className="py-2.5 px-3 font-bold">Raw Score</th>
                <th className="py-2.5 px-3 font-bold">Weight</th>
                <th className="py-2.5 px-3 font-bold">Weighted Points</th>
                <th className="py-2.5 px-4 font-bold">Calculation Provenance</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 bg-slate-900/50 font-mono">
              {Array.isArray(components) && components.map((comp, idx) => (
                <tr key={idx} className="hover:bg-slate-800/40 transition-colors">
                  <td className="py-2.5 px-4 font-sans font-bold text-slate-200">{comp.category}</td>
                  <td className="py-2.5 px-3 font-bold text-cyan-300">{comp.raw_score} / 100</td>
                  <td className="py-2.5 px-3 text-slate-400">{(typeof comp.weight === 'number' ? comp.weight * 100 : 0).toFixed(0)}%</td>
                  <td className="py-2.5 px-3 font-bold text-emerald-400">+{(typeof comp.weighted_score === 'number' ? comp.weighted_score : 0).toFixed(2)}</td>
                  <td className="py-2.5 px-4 font-sans text-slate-400 text-[11px]">{comp.description}</td>
                </tr>
              ))}
            </tbody>
            <tfoot className="bg-slate-950 font-mono text-xs border-t border-slate-800">
              <tr>
                <td colSpan={3} className="py-3 px-4 font-sans font-bold text-slate-100 uppercase text-right">
                  Final Composite Score:
                </td>
                <td className="py-3 px-3 font-black text-cyan-400 text-sm">
                  {typeof finalScore === 'number' ? `${finalScore} / 100` : 'INSUFFICIENT DATA'}
                </td>
                <td className="py-3 px-4 text-slate-500 text-[10px] font-sans">
                  Sum of all 5 weighted factors ({timestamp})
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  );
};
