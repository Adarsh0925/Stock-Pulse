import React, { useState } from 'react';
import { Target, TrendingUp, AlertOctagon, CheckCircle2, ShieldAlert, ArrowUpRight, ArrowDownRight, Compass, HelpCircle } from 'lucide-react';
import { ValuationAnalysis, ScenarioAnalysis } from '../types';
import { InfoTooltip } from './InfoTooltip';

interface ValuationAndScenariosCardProps {
  valuation?: ValuationAnalysis | null;
  scenarioAnalysis?: ScenarioAnalysis | null;
  ticker: string;
  isBank?: boolean;
}

export const ValuationAndScenariosCard: React.FC<ValuationAndScenariosCardProps> = ({
  valuation,
  scenarioAnalysis,
  ticker,
  isBank = false,
}) => {
  const [activeScenarioTab, setActiveScenarioTab] = useState<'base' | 'bull' | 'bear'>('base');

  if (!valuation && !scenarioAnalysis) return null;

  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-gray-200 pb-4">
        <div>
          <div className="flex items-center gap-2 text-teal-700 text-xs font-bold uppercase tracking-wider mb-1">
            <Target className="w-4 h-4" />
            <span>Valuation Target & Risk/Reward Framework</span>
            <InfoTooltip text="Fundamental intrinsic fair value compared against technical resistance, paired with probability-weighted Base, Bull, and Bear scenarios." />
          </div>
          <h3 className="text-xl font-bold text-gray-900">
            Valuation Range & Scenario Analysis
          </h3>
        </div>
        <div className="flex items-center gap-2">
          <span className="px-2.5 py-1 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-lg text-xs font-mono font-bold">
            {valuation?.valuation_status || 'UNDERVALUED'}
          </span>
          <span className="px-2.5 py-1 bg-gray-100 text-slate-700 border border-gray-200 rounded-lg text-xs font-mono">
            {isBank ? 'Banking Multiple Framework' : 'DCF & Multiples'}
          </span>
        </div>
      </div>

      {/* 1. Valuation Target & Fair Value vs Technical Comparison */}
      {valuation && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Current Price vs Fair Value Mid */}
            <div className="p-4 bg-gray-50 border border-gray-200 rounded-xl space-y-1.5">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Current Market Price
              </span>
              <div className="text-2xl font-black font-mono text-gray-900">
                ₹{valuation.current_price?.toFixed(2) || '—'}
              </div>
              <span className="text-[11px] text-slate-500 block">
                Last verified market close
              </span>
            </div>

            {/* Fundamental Fair Value Band */}
            <div className="p-4 bg-emerald-50/60 border border-emerald-200 rounded-xl space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-emerald-800 uppercase tracking-wider">
                  Intrinsic Fair Value Range
                </span>
                <span className="text-[10px] bg-emerald-100 text-emerald-800 font-mono px-1.5 py-0.5 rounded font-bold">
                  +{valuation.discount_premium_percent}% Upside
                </span>
              </div>
              <div className="text-2xl font-black font-mono text-emerald-900">
                ₹{valuation.fair_value_min} – ₹{valuation.fair_value_max}
              </div>
              <span className="text-[11px] text-emerald-700 block">
                Midpoint: <strong className="font-mono">₹{valuation.fair_value_mid}</strong>
              </span>
            </div>

            {/* Target Multiples */}
            <div className="p-4 bg-gray-50 border border-gray-200 rounded-xl space-y-1.5">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Target Valuation Multiples
              </span>
              <div className="flex items-baseline gap-3 text-lg font-bold font-mono text-gray-900">
                <span>{valuation.target_pb_ratio}x <span className="text-xs font-sans text-slate-500 font-normal">P/BV</span></span>
                <span className="text-gray-300">•</span>
                <span>{valuation.target_pe_ratio}x <span className="text-xs font-sans text-slate-500 font-normal">P/E</span></span>
              </div>
              <span className="text-[11px] text-slate-500 block">
                Historical 5Y P/BV Mean: <span className="font-mono text-slate-700">{valuation.historical_5y_pb_mean}x</span>
              </span>
            </div>
          </div>

          {/* Technical Resistance vs Fundamental Fair Value Contrast Box */}
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-800 uppercase tracking-wider">
              <Compass className="w-4 h-4 text-teal-700" />
              <span>Technical Resistance vs. Fundamental Fair Value</span>
            </div>
            <p className="text-xs text-slate-700 leading-relaxed">
              {valuation.technical_support_vs_fundamental_diff}
            </p>
            <div className="text-[11px] text-slate-500 font-mono pt-1 border-t border-slate-200">
              Methodology: {valuation.methodology_summary}
            </div>
          </div>
        </div>
      )}

      {/* 2. Tactical Trade Setup: Entry Zone, Stop-Loss & Risk/Reward */}
      {scenarioAnalysis && (
        <div className="space-y-4 pt-2 border-t border-gray-200">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Tactical Risk / Reward Boundaries
            </span>
            <span className="text-xs font-mono font-bold text-teal-800 bg-teal-50 px-2 py-0.5 rounded border border-teal-200">
              Risk-to-Reward Ratio: {scenarioAnalysis.risk_reward_ratio}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="p-3.5 bg-gray-50 border border-gray-200 rounded-xl space-y-1">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                Recommended Entry Zone
              </span>
              <div className="text-lg font-black font-mono text-teal-800">
                {scenarioAnalysis.recommended_entry_zone}
              </div>
              <span className="text-[10px] text-slate-500 block">
                Accumulation corridor on dips
              </span>
            </div>

            <div className="p-3.5 bg-amber-50/50 border border-amber-200 rounded-xl space-y-1">
              <span className="text-[11px] font-bold text-amber-800 uppercase tracking-wider">
                Tactical Stop-Loss
              </span>
              <div className="text-lg font-black font-mono text-amber-900">
                ₹{scenarioAnalysis.tactical_stop_loss}
              </div>
              <span className="text-[10px] text-amber-700 block">
                Trailing support violation trigger
              </span>
            </div>

            <div className="p-3.5 bg-red-50/40 border border-red-200 rounded-xl space-y-1">
              <span className="text-[11px] font-bold text-red-700 uppercase tracking-wider">
                Fundamental Downside Risk
              </span>
              <div className="text-lg font-black font-mono text-red-800">
                -{scenarioAnalysis.downside_risk_percent}%
              </div>
              <span className="text-[10px] text-red-600 block">
                Maximum calculated risk exposure
              </span>
            </div>
          </div>

          {/* Scenario Tabs (Base Case / Bull Case / Bear Case) */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center gap-2 border-b border-gray-200 pb-2">
              <button
                type="button"
                onClick={() => setActiveScenarioTab('base')}
                className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer ${
                  activeScenarioTab === 'base'
                    ? 'bg-teal-700 text-white shadow-sm'
                    : 'bg-gray-100 text-slate-600 hover:bg-gray-200'
                }`}
              >
                Base Case (55% Prob) • ₹{scenarioAnalysis.base_case.target_price}
              </button>
              <button
                type="button"
                onClick={() => setActiveScenarioTab('bull')}
                className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer ${
                  activeScenarioTab === 'bull'
                    ? 'bg-emerald-700 text-white shadow-sm'
                    : 'bg-gray-100 text-slate-600 hover:bg-gray-200'
                }`}
              >
                Bull Case (25% Prob) • ₹{scenarioAnalysis.bull_case.target_price}
              </button>
              <button
                type="button"
                onClick={() => setActiveScenarioTab('bear')}
                className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer ${
                  activeScenarioTab === 'bear'
                    ? 'bg-red-700 text-white shadow-sm'
                    : 'bg-gray-100 text-slate-600 hover:bg-gray-200'
                }`}
              >
                Bear Case (20% Prob) • ₹{scenarioAnalysis.bear_case.target_price}
              </button>
            </div>

            {/* Active Scenario Card */}
            {activeScenarioTab === 'base' && (
              <div className="p-4 bg-teal-50/40 border border-teal-200 rounded-xl space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-teal-900 text-sm">Base Scenario (Most Likely)</span>
                    <span className="px-2 py-0.5 bg-teal-100 text-teal-800 rounded text-[11px] font-mono font-bold">
                      {scenarioAnalysis.base_case.probability_percent}% Probability
                    </span>
                  </div>
                  <div className="flex items-center gap-1 font-mono font-bold text-teal-800 text-base">
                    <span>Target: ₹{scenarioAnalysis.base_case.target_price}</span>
                    <span className="text-xs text-emerald-700 font-normal">
                      (+{scenarioAnalysis.base_case.upside_percent}%)
                    </span>
                  </div>
                </div>
                <p className="text-xs text-slate-700 leading-relaxed">
                  {scenarioAnalysis.base_case.rationale}
                </p>
                <div className="space-y-1 pt-1">
                  <span className="text-[11px] font-bold text-teal-900 uppercase">Key Fundamental Catalysts:</span>
                  <ul className="list-disc list-inside text-xs text-slate-600 space-y-0.5">
                    {(scenarioAnalysis.base_case.catalysts || []).map((cat, i) => (
                      <li key={i}>{cat}</li>
                    ))}
                  </ul>
                </div>
              </div>
            )}

            {activeScenarioTab === 'bull' && (
              <div className="p-4 bg-emerald-50/40 border border-emerald-200 rounded-xl space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-emerald-900 text-sm">Bull Scenario (Optimistic Expansion)</span>
                    <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded text-[11px] font-mono font-bold">
                      {scenarioAnalysis.bull_case.probability_percent}% Probability
                    </span>
                  </div>
                  <div className="flex items-center gap-1 font-mono font-bold text-emerald-800 text-base">
                    <span>Target: ₹{scenarioAnalysis.bull_case.target_price}</span>
                    <span className="text-xs text-emerald-700 font-normal">
                      (+{scenarioAnalysis.bull_case.upside_percent}%)
                    </span>
                  </div>
                </div>
                <p className="text-xs text-slate-700 leading-relaxed">
                  {scenarioAnalysis.bull_case.rationale}
                </p>
                <div className="space-y-1 pt-1">
                  <span className="text-[11px] font-bold text-emerald-900 uppercase">Key Bull Catalysts:</span>
                  <ul className="list-disc list-inside text-xs text-slate-600 space-y-0.5">
                    {(scenarioAnalysis.bull_case.catalysts || []).map((cat, i) => (
                      <li key={i}>{cat}</li>
                    ))}
                  </ul>
                </div>
              </div>
            )}

            {activeScenarioTab === 'bear' && (
              <div className="p-4 bg-red-50/40 border border-red-200 rounded-xl space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-red-900 text-sm">Bear Scenario (Contraction / Headwinds)</span>
                    <span className="px-2 py-0.5 bg-red-100 text-red-800 rounded text-[11px] font-mono font-bold">
                      {scenarioAnalysis.bear_case.probability_percent}% Probability
                    </span>
                  </div>
                  <div className="flex items-center gap-1 font-mono font-bold text-red-800 text-base">
                    <span>Downside: ₹{scenarioAnalysis.bear_case.target_price}</span>
                    <span className="text-xs text-red-600 font-normal">
                      (-{scenarioAnalysis.bear_case.downside_percent}%)
                    </span>
                  </div>
                </div>
                <p className="text-xs text-slate-700 leading-relaxed">
                  {scenarioAnalysis.bear_case.rationale}
                </p>
                <div className="space-y-1 pt-1">
                  <span className="text-[11px] font-bold text-red-900 uppercase">Key Risk Catalysts:</span>
                  <ul className="list-disc list-inside text-xs text-slate-600 space-y-0.5">
                    {(scenarioAnalysis.bear_case.catalysts || []).map((cat, i) => (
                      <li key={i}>{cat}</li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
