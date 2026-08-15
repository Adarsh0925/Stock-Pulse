import React from 'react';
import { BookOpen, ShieldCheck, CheckCircle2, Calculator, Scale, AlertTriangle, FileCode, Database } from 'lucide-react';

export const MethodologyView: React.FC = () => {
  return (
    <div className="space-y-6">
      {/* Methodology Header */}
      <div className="bg-white border border-gray-200 rounded-2xl p-6 relative overflow-hidden shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-teal-700 text-xs font-mono font-bold uppercase tracking-wider mb-1">
              <BookOpen className="w-4 h-4" /> Methodology & System Transparency
            </div>
            <h2 className="text-2xl font-bold text-gray-900">5-Source Consensus & Scoring Formulas</h2>
            <p className="text-xs text-slate-500 mt-1 max-w-2xl">
              Understand our 5 compulsory source validation architecture (including NSE, Yahoo, Stooq, Financial Data Proxy, and Verified OHLCV) requiring multi-source matching before displaying market outputs.
            </p>
          </div>
          <div className="flex items-center gap-3 bg-gray-50 px-4 py-2.5 rounded-xl border border-gray-200 text-xs font-mono">
            <ShieldCheck className="w-4 h-4 text-teal-700" />
            <div>
              <span className="text-gray-900 font-bold">5 Compulsory Sources</span>
              <div className="text-[10px] text-slate-500">Min 4/5 Match Required</div>
            </div>
          </div>
        </div>
      </div>

      {/* 5 Compulsory Data Sources Consensus Rule */}
      <div className="bg-white border border-gray-200 rounded-2xl p-6 space-y-4 shadow-sm">
        <div className="flex items-center justify-between border-b border-gray-200 pb-3">
          <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
            <Database className="w-5 h-5 text-teal-700" /> 5 Compulsory Data Sources Verification Architecture
          </h3>
          <span className="text-xs font-mono font-bold px-2.5 py-1 bg-teal-50 text-teal-700 border border-teal-200 rounded-lg">
            Minimum 4 / 5 Match Consensus
          </span>
        </div>
        <p className="text-xs text-slate-600 leading-relaxed font-mono">
          Every quote and stock streamer output is validated against 5 compulsory independent feeds:
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 text-xs font-mono">
          <div className="bg-gray-50 p-3 rounded-xl border border-gray-200">
            <span className="text-teal-700 font-bold block mb-1">1. Yahoo Finance Feed</span>
            <span className="text-[11px] text-slate-500">Primary market quote & intraday chart API</span>
          </div>
          <div className="bg-gray-50 p-3 rounded-xl border border-gray-200">
            <span className="text-teal-700 font-bold block mb-1">2. NSE / Exchange Feed</span>
            <span className="text-[11px] text-slate-500">Official exchange market feed (NSE / NASDAQ)</span>
          </div>
          <div className="bg-gray-50 p-3 rounded-xl border border-gray-200">
            <span className="text-teal-700 font-bold block mb-1">3. Stooq Market Feed</span>
            <span className="text-[11px] text-slate-500">Independent global market data provider</span>
          </div>
          <div className="bg-gray-50 p-3 rounded-xl border border-gray-200">
            <span className="text-teal-700 font-bold block mb-1">4. Financial Data API Proxy</span>
            <span className="text-[11px] text-slate-500">Institutional market data API proxy feed</span>
          </div>
          <div className="bg-gray-50 p-3 rounded-xl border border-gray-200">
            <span className="text-emerald-700 font-bold block mb-1">5. Verified OHLCV Feed</span>
            <span className="text-[11px] text-slate-500">Historical daily session candle dataset</span>
          </div>
        </div>
        <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 text-xs text-slate-700 font-mono space-y-1">
          <strong className="text-emerald-700 font-bold">Strict Validation Rule:</strong>
          <p>
            Without checking and validating across all 5 sources, if at least 4 sources match within ≤2.0% variance, output is validated and displayed with <span className="text-emerald-700 font-bold">MULTI-SOURCE CONSENSUS</span> status. If fewer than 4 sources match, output is tagged as <span className="text-red-700 font-bold">SOURCE DISAGREEMENT</span> or <span className="text-amber-700 font-bold">UNAVAILABLE</span>.
          </p>
        </div>
      </div>

      {/* 100-Point Scoring Component Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white border border-gray-200 rounded-2xl p-6 space-y-4 shadow-sm">
          <div className="flex items-center justify-between border-b border-gray-200 pb-3">
            <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
              <Calculator className="w-5 h-5 text-teal-700" /> Technical Analysis (35% Weight)
            </h3>
            <span className="text-xs font-mono font-bold px-2.5 py-1 bg-teal-50 text-teal-700 border border-teal-200 rounded-lg">
              35 Points Max
            </span>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed">
            Evaluated directly from verified Pandas OHLCV price histories over 1Y periods:
          </p>
          <ul className="text-xs text-slate-600 space-y-2 font-mono">
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-teal-700 shrink-0 mt-0.5" />
              <span><strong>SMA Trend Alignment:</strong> Close &gt; SMA20 & Close &gt; SMA50 (+12 pts)</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-teal-700 shrink-0 mt-0.5" />
              <span><strong>RSI Momentum:</strong> RSI 40-60 (+12 pts), RSI &gt; 70 overbought (+4 pts)</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-teal-700 shrink-0 mt-0.5" />
              <span><strong>MACD Histogram:</strong> Positive MACD Histogram Expansion (+11 pts)</span>
            </li>
          </ul>
        </div>

        <div className="bg-white border border-gray-200 rounded-2xl p-6 space-y-4 shadow-sm">
          <div className="flex items-center justify-between border-b border-gray-200 pb-3">
            <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
              <Scale className="w-5 h-5 text-emerald-700" /> Fundamental Valuation (25% Weight)
            </h3>
            <span className="text-xs font-mono font-bold px-2.5 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-lg">
              25 Points Max
            </span>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed">
            Evaluated from verified SEC/NSE corporate filing metrics and income statements:
          </p>
          <ul className="text-xs text-slate-600 space-y-2 font-mono">
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span><strong>P/E Ratio Valuation:</strong> P/E between 10 and 30 (+10 pts)</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span><strong>Profitability (ROE / Net Margin):</strong> Positive double-digit ROE (+8 pts)</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span><strong>Debt & Yield:</strong> Low Debt-to-Equity & Dividends (+7 pts)</span>
            </li>
          </ul>
        </div>

        <div className="bg-white border border-gray-200 rounded-2xl p-6 space-y-4 shadow-sm">
          <div className="flex items-center justify-between border-b border-gray-200 pb-3">
            <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
              <FileCode className="w-5 h-5 text-purple-700" /> News Sentiment NLP (20% Weight)
            </h3>
            <span className="text-xs font-mono font-bold px-2.5 py-1 bg-purple-50 text-purple-700 border border-purple-200 rounded-lg">
              20 Points Max
            </span>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed">
            Computed using VADER (Valence Aware Dictionary for Sentiment Reasoning) on live news RSS:
          </p>
          <ul className="text-xs text-slate-600 space-y-2 font-mono">
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-purple-600 shrink-0 mt-0.5" />
              <span><strong>Compound VADER Score:</strong> Scaled linearly from -1.0 to +1.0</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-purple-600 shrink-0 mt-0.5" />
              <span><strong>Positive Ratio:</strong> &gt;60% positive headlines earns full 20 pts</span>
            </li>
          </ul>
        </div>

        <div className="bg-white border border-gray-200 rounded-2xl p-6 space-y-4 shadow-sm">
          <div className="flex items-center justify-between border-b border-gray-200 pb-3">
            <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
              <Calculator className="w-5 h-5 text-amber-700" /> Machine Learning Prediction (20% Weight)
            </h3>
            <span className="text-xs font-mono font-bold px-2.5 py-1 bg-amber-50 text-amber-700 border border-amber-200 rounded-lg">
              20 Points Max
            </span>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed">
            Derived from Scikit-Learn Random Forest next-session direction probability:
          </p>
          <ul className="text-xs text-slate-600 space-y-2 font-mono">
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <span><strong>UP Prediction Probability:</strong> Scaled directly based on Up probability</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <span><strong>Historical Test Accuracy:</strong> Weighted by chronological test accuracy</span>
            </li>
          </ul>
        </div>
      </div>

      {/* Signal Decision Rules */}
      <div className="bg-white border border-gray-200 rounded-2xl p-6 space-y-4 shadow-sm">
        <h3 className="text-lg font-bold text-gray-900">Final Signal Threshold Matrix</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center font-mono">
          <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-xl">
            <div className="text-emerald-700 text-xl font-bold">BUY SIGNAL</div>
            <div className="text-gray-900 text-sm font-semibold mt-1">Score ≥ 65.0 / 100</div>
            <div className="text-[11px] text-slate-600 mt-2">Strong technical momentum & positive fundamentals</div>
          </div>
          <div className="bg-amber-50 border border-amber-200 p-4 rounded-xl">
            <div className="text-amber-700 text-xl font-bold">HOLD SIGNAL</div>
            <div className="text-gray-900 text-sm font-semibold mt-1">45.0 ≤ Score &lt; 65.0</div>
            <div className="text-[11px] text-slate-600 mt-2">Neutral technical consolidation or mixed fundamentals</div>
          </div>
          <div className="bg-red-50 border border-red-200 p-4 rounded-xl">
            <div className="text-red-700 text-xl font-bold">SELL SIGNAL</div>
            <div className="text-gray-900 text-sm font-semibold mt-1">Score &lt; 45.0 / 100</div>
            <div className="text-[11px] text-slate-600 mt-2">Deteriorating price action or negative sentiment</div>
          </div>
        </div>
      </div>

      {/* Data Integrity Standard */}
      <div className="bg-amber-50/70 border border-amber-200 rounded-2xl p-6 flex flex-col sm:flex-row items-center gap-5 shadow-sm">
        <AlertTriangle className="w-10 h-10 text-amber-700 shrink-0" />
        <div className="space-y-1">
          <h4 className="text-sm font-bold text-amber-900 uppercase tracking-wide font-mono">
            Data Integrity Standard Enforcement
          </h4>
          <p className="text-xs text-slate-700 leading-relaxed">
            If live connection to market feeds or RSS news providers experiences temporary connectivity issues, the system strictly presents an uncompromised "DATA UNAVAILABLE" state rather than injecting unverified values.
          </p>
        </div>
      </div>
    </div>
  );
};
