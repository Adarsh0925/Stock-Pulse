import React, { useState } from 'react';
import { AlertTriangle, CheckCircle2, Info, Calculator, FileText, ChevronDown, ChevronUp, Activity, HelpCircle } from 'lucide-react';
import { ScoreComponent } from '../types';
import { InfoTooltip } from './InfoTooltip';

interface ResearchScoreCardProps {
  finalScore: number | null;
  signal: 'BUY' | 'HOLD' | 'SELL' | 'INSUFFICIENT DATA' | string;
  explanation: string;
  components: ScoreComponent[];
  timestamp: string;
  isSimpleView?: boolean;
}

export const ResearchScoreCard: React.FC<ResearchScoreCardProps> = ({
  finalScore,
  signal,
  explanation,
  components,
  timestamp,
  isSimpleView = true
}) => {
  const [showTechnicalDetails, setShowTechnicalDetails] = useState(false);

  const cleanSignal = (signal || '').replace(/ BIAS/gi, '').trim().toUpperCase();

  const getSignalBadge = () => {
    if (cleanSignal.includes('BUY')) {
      return (
        <div className="flex items-center gap-2 px-4 py-2 bg-emerald-50 border border-emerald-300 text-emerald-700 rounded-xl font-bold text-base shadow-sm">
          <CheckCircle2 className="w-5 h-5 text-emerald-600" />
          <span>OVERALL VIEW: BUY</span>
        </div>
      );
    }
    if (cleanSignal.includes('SELL')) {
      return (
        <div className="flex items-center gap-2 px-4 py-2 bg-red-50 border border-red-300 text-red-700 rounded-xl font-bold text-base shadow-sm">
          <AlertTriangle className="w-5 h-5 text-red-600" />
          <span>OVERALL VIEW: SELL</span>
        </div>
      );
    }
    if (cleanSignal.includes('HOLD')) {
      return (
        <div className="flex items-center gap-2 px-4 py-2 bg-amber-50 border border-amber-300 text-amber-800 rounded-xl font-bold text-base shadow-sm">
          <Activity className="w-5 h-5 text-amber-600" />
          <span>OVERALL VIEW: HOLD</span>
        </div>
      );
    }
    return (
      <div className="flex items-center gap-2 px-4 py-2 bg-gray-50 border border-gray-300 text-slate-700 rounded-xl font-bold text-base">
        <Info className="w-5 h-5 text-slate-500" />
        <span>OVERALL VIEW: INSUFFICIENT DATA</span>
      </div>
    );
  };

  const getGaugeColor = (score: number | null) => {
    if (score === null) return '#64748B';
    if (score >= 65) return '#16A34A'; // green
    if (score <= 45) return '#DC2626'; // red
    return '#D97706'; // amber
  };

  // Convert any remaining technical terms in explanation into simple, friendly language
  const cleanExplanation = (explanation || '')
    .replace(/STRONG BUY BIAS/gi, 'BUY')
    .replace(/BUY BIAS/gi, 'BUY')
    .replace(/HOLD BIAS/gi, 'HOLD')
    .replace(/SELL BIAS/gi, 'SELL')
    .replace(/BIAS/gi, 'VIEW')
    .replace(/Bias/gi, 'View')
    .replace(/Composite Research Signal:?/gi, 'Overall Stock View:')
    .replace(/composite research score/gi, 'overall score')
    .replace(/multi-factor/gi, 'overall stock analysis')
    .replace(/fundamental valuation/gi, 'company financial health')
    .replace(/technical indicators/gi, 'price & trend')
    .replace(/news sentiment/gi, 'news mood')
    .replace(/VADER NLP/gi, 'news mood')
    .replace(/Normalized across/gi, 'Based on')
    .replace(/normalized/gi, '');

  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-200 pb-4">
        <div>
          <div className="flex items-center gap-2 text-teal-700 text-xs font-bold uppercase tracking-wider mb-1">
            <Calculator className="w-4 h-4" />
            <span>Overall Stock View</span>
            <InfoTooltip text="Combined overall score computed from price trend, company financials, news mood, and computer predictions." />
          </div>
          <h3 className="text-xl font-bold text-gray-900">
            Overall Stock View
          </h3>
        </div>
        {getSignalBadge()}
      </div>

      {/* Main Score Gauge & Dynamic Explanation */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center bg-gray-50 p-5 rounded-2xl border border-gray-200">
        {/* Score Gauge Circle */}
        <div className="md:col-span-4 flex flex-col items-center justify-center p-4 border-b md:border-b-0 md:border-r border-gray-200">
          <div className="relative w-36 h-36 flex items-center justify-center">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
              <path
                className="text-gray-200"
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
              <span className="text-2xl font-black text-gray-900 font-mono">
                {typeof finalScore === 'number' ? finalScore : 'N/A'}
              </span>
              {typeof finalScore === 'number' && (
                <span className="text-xs text-slate-500 block font-bold font-mono">/ 100</span>
              )}
            </div>
          </div>
          <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mt-3">Overall Score</div>
        </div>

        {/* Why this view? Dynamic Explanation */}
        <div className="md:col-span-8 space-y-3">
          <h4 className="text-sm font-bold text-gray-800 uppercase tracking-wider flex items-center gap-2">
            <FileText className="w-4 h-4 text-teal-700" />
            <span>Why this view?</span>
          </h4>
          <p className="text-sm text-slate-700 leading-relaxed font-normal">
            {cleanExplanation || "The stock's recent price trend, company financials, and recent news have been analyzed to form this score."}
          </p>

          <div className="bg-white p-3 rounded-xl border border-gray-200 text-xs text-slate-600 leading-normal flex items-start gap-2 shadow-sm">
            <Info className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <span>
              <strong className="text-gray-800 font-semibold">Please Note:</strong> This view is created for learning and research. It helps you understand the data, but cannot predict the future with 100% certainty.
            </span>
          </div>
        </div>
      </div>

      {/* Category Score Cards */}
      <div className="space-y-3">
        <div className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center justify-between">
          <span>What Makes Up This Score?</span>
          <span className="text-[11px] text-slate-500 font-normal">Points out of 100</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {Array.isArray(components) && components.map((comp, idx) => {
            const labelMap: Record<string, string> = {
              'TECHNICAL INDICATORS': 'Price & Trend',
              'TECHNICALS': 'Price & Trend',
              'PRICE & TREND': 'Price & Trend',
              'FUNDAMENTAL STATEMENT RATIOS': 'Company Financial Health',
              'FUNDAMENTALS': 'Company Financial Health',
              'COMPANY FINANCIAL HEALTH': 'Company Financial Health',
              'NEWS NLP SENTIMENT': 'News Mood',
              'NEWS NLP': 'News Mood',
              'NEWS MOOD': 'News Mood',
              'MACHINE LEARNING PROBABILITY': 'Computer Model',
              'ML PREDICTION': 'Computer Model',
              'COMPUTER MODEL': 'Computer Model'
            };
            const catKey = (comp?.category || '').toUpperCase();
            const displayCategory = labelMap[catKey] || comp?.category || 'Category';
            const isMlExcluded = displayCategory === 'Computer Model' && (comp.weight === 0 || comp.status?.includes('LOW CONFIDENCE') || comp.description?.includes('Not included'));

            return (
              <div key={idx} className="bg-gray-50 p-4 rounded-xl border border-gray-200 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-gray-800 font-semibold text-xs">{displayCategory}</span>
                  {isMlExcluded ? (
                    <span className="text-[11px] text-amber-700 bg-amber-50 border border-amber-200 px-1.5 py-0.5 rounded font-mono font-medium">
                      Excluded
                    </span>
                  ) : (
                    <span className="text-teal-700 font-mono font-bold text-sm">
                      {comp.weighted_score.toFixed(1)} <span className="text-[10px] text-slate-500 font-normal">pts</span>
                    </span>
                  )}
                </div>

                {isMlExcluded ? (
                  <div className="text-[11px] text-slate-500 leading-snug py-1">
                    Computer Model: Not included in overall score (recent test performance was too weak)
                  </div>
                ) : (
                  <>
                    <div className="w-full bg-gray-200 h-2 rounded-full overflow-hidden border border-gray-200">
                      <div
                        className="bg-teal-700 h-full rounded-full transition-all"
                        style={{ width: `${Math.min(100, Math.max(0, comp.raw_score))}%` }}
                      ></div>
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-slate-500">
                      <span>Score: {comp.raw_score}/100</span>
                      <span>Weight: {(comp.weight * 100).toFixed(0)}%</span>
                    </div>
                  </>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Collapsible Technical Details Trigger */}
      <div className="border-t border-gray-200 pt-3">
        <button
          onClick={() => setShowTechnicalDetails(!showTechnicalDetails)}
          className="w-full flex items-center justify-between p-3 bg-gray-50 hover:bg-gray-100 rounded-xl border border-gray-200 text-xs font-mono text-slate-700 transition-all cursor-pointer"
        >
          <span className="flex items-center gap-2 font-bold text-teal-700">
            <span>{showTechnicalDetails ? 'Technical Details ▲' : 'Technical Details ▼'}</span>
            <span className="text-slate-500 font-normal text-[11px]">(Raw Scores, Weights & Mathematical Calculation)</span>
          </span>
          {showTechnicalDetails ? <ChevronUp className="w-4 h-4 text-teal-700" /> : <ChevronDown className="w-4 h-4 text-slate-500" />}
        </button>

        {showTechnicalDetails && (
          <div className="mt-3 space-y-4 animate-fadeIn">
            <div className="overflow-x-auto rounded-xl border border-gray-200">
              <table className="w-full text-left text-xs text-slate-700">
                <thead className="bg-gray-100 text-slate-600 font-mono uppercase text-[10px]">
                  <tr>
                    <th className="py-2.5 px-4 font-bold">Category</th>
                    <th className="py-2.5 px-3 font-bold">Raw Score</th>
                    <th className="py-2.5 px-3 font-bold">Weight</th>
                    <th className="py-2.5 px-3 font-bold">Weighted Points</th>
                    <th className="py-2.5 px-4 font-bold">Calculation Details</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white font-mono">
                  {Array.isArray(components) && components.map((comp, idx) => (
                    <tr key={idx} className="hover:bg-gray-50 transition-colors">
                      <td className="py-2.5 px-4 font-sans font-bold text-gray-900">{comp.category}</td>
                      <td className="py-2.5 px-3 font-bold text-teal-700">{comp.raw_score} / 100</td>
                      <td className="py-2.5 px-3 text-slate-500">{(typeof comp.weight === 'number' ? comp.weight * 100 : 0).toFixed(0)}%</td>
                      <td className="py-2.5 px-3 font-bold text-emerald-700">+{(typeof comp.weighted_score === 'number' ? comp.weighted_score : 0).toFixed(1)}</td>
                      <td className="py-2.5 px-4 font-sans text-slate-600 text-[11px]">{comp.description}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="bg-gray-50 font-mono text-xs border-t border-gray-200">
                  <tr>
                    <td colSpan={3} className="py-3 px-4 font-sans font-bold text-gray-900 uppercase text-right">
                      Overall Score:
                    </td>
                    <td className="py-3 px-3 font-black text-teal-700 text-sm">
                      {typeof finalScore === 'number' ? `${finalScore} / 100` : 'DATA PENDING'}
                    </td>
                    <td className="py-3 px-4 text-slate-500 text-[10px] font-sans">
                      Sum of all weighted categories ({timestamp})
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
