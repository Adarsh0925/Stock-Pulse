import React from 'react';
import { BookOpen, ShieldCheck, CheckCircle2, Calculator, Scale, AlertTriangle, FileCode, Database } from 'lucide-react';

export const MethodologyView: React.FC = () => {
  return (
    <div className="space-y-6">
      {/* Methodology Header */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/5 rounded-full blur-3xl pointer-events-none"></div>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-cyan-400 text-xs font-mono font-bold uppercase tracking-wider mb-1">
              <BookOpen className="w-4 h-4" /> Methodology & System Transparency
            </div>
            <h2 className="text-2xl font-bold text-slate-100">5-Source Consensus & Scoring Formulas</h2>
            <p className="text-xs text-slate-400 mt-1 max-w-2xl">
              Understand our 5 compulsory source validation architecture (including NSE, Yahoo, Stooq, Financial Data Proxy, and Verified OHLCV) requiring multi-source matching before displaying market outputs.
            </p>
          </div>
          <div className="flex items-center gap-3 bg-slate-950/60 px-4 py-2.5 rounded-xl border border-slate-800 text-xs font-mono">
            <ShieldCheck className="w-4 h-4 text-cyan-400" />
            <div>
              <span className="text-slate-200 font-bold">5 Compulsory Sources</span>
              <div className="text-[10px] text-slate-400">Min 4/5 Match Required</div>
            </div>
          </div>
        </div>
      </div>

      {/* 5 Compulsory Data Sources Consensus Rule */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
            <Database className="w-5 h-5 text-cyan-400" /> 5 Compulsory Data Sources Verification Architecture
          </h3>
          <span className="text-xs font-mono font-bold px-2.5 py-1 bg-cyan-950 text-cyan-300 border border-cyan-800 rounded-lg">
            Minimum 4 / 5 Match Consensus
          </span>
        </div>
        <p className="text-xs text-slate-300 leading-relaxed font-mono">
          Every quote and stock streamer output is validated against 5 compulsory independent feeds:
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 text-xs font-mono">
          <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
            <span className="text-cyan-400 font-bold block mb-1">1. Yahoo Finance Feed</span>
            <span className="text-[11px] text-slate-400">Primary market quote & intraday chart API</span>
          </div>
          <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
            <span className="text-cyan-400 font-bold block mb-1">2. NSE / Exchange Feed</span>
            <span className="text-[11px] text-slate-400">Official exchange market feed (NSE / NASDAQ)</span>
          </div>
          <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
            <span className="text-cyan-400 font-bold block mb-1">3. Stooq Market Feed</span>
            <span className="text-[11px] text-slate-400">Independent global market data provider</span>
          </div>
          <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
            <span className="text-cyan-400 font-bold block mb-1">4. Financial Data API Proxy</span>
            <span className="text-[11px] text-slate-400">Institutional market data API proxy feed</span>
          </div>
          <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
            <span className="text-emerald-400 font-bold block mb-1">5. Verified OHLCV Feed</span>
            <span className="text-[11px] text-slate-400">Historical daily session candle dataset</span>
          </div>
        </div>
        <div className="bg-slate-950/70 p-4 rounded-xl border border-slate-800/80 text-xs text-slate-300 font-mono space-y-1">
          <strong className="text-emerald-400 font-bold">Strict Validation Rule:</strong>
          <p>
            Without checking and validating across all 5 sources, if at least 4 sources match within ≤2.0% variance, output is validated and displayed with <span className="text-emerald-400">MULTI-SOURCE CONSENSUS</span> status. If fewer than 4 sources match, output is tagged as <span className="text-rose-400">SOURCE DISAGREEMENT</span> or <span className="text-amber-400">UNAVAILABLE</span>.
          </p>
        </div>
      </div>

      {/* 100-Point Scoring Component Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
              <Calculator className="w-5 h-5 text-cyan-400" /> Technical Analysis (35% Weight)
            </h3>
            <span className="text-xs font-mono font-bold px-2.5 py-1 bg-cyan-950 text-cyan-300 border border-cyan-800 rounded-lg">
              35 Points Max
            </span>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            Evaluated directly from verified Pandas OHLCV price histories over 1Y periods:
          </p>
          <ul className="text-xs text-slate-400 space-y-2 font-mono">
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
              <span><strong>SMA Trend Alignment:</strong> Close &gt; SMA20 & Close &gt; SMA50 (+12 pts)</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
              <span><strong>RSI Momentum:</strong> RSI 40-60 (+12 pts), RSI &gt; 70 overbought (+4 pts)</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
              <span><strong>MACD Histogram:</strong> Positive MACD Histogram Expansion (+11 pts)</span>
            </li>
          </ul>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
              <Scale className="w-5 h-5 text-emerald-400" /> Fundamental Valuation (25% Weight)
            </h3>
            <span className="text-xs font-mono font-bold px-2.5 py-1 bg-emerald-950 text-emerald-300 border border-emerald-800 rounded-lg">
              25 Points Max
            </span>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            Evaluated from verified SEC/NSE corporate filing metrics and income statements:
          </p>
          <ul className="text-xs text-slate-400 space-y-2 font-mono">
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <span><strong>P/E Ratio Valuation:</strong> P/E between 10 and 30 (+10 pts)</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <span><strong>Profitability (ROE / Net Margin):</strong> Positive double-digit ROE (+8 pts)</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <span><strong>Debt & Yield:</strong> Low Debt-to-Equity & Dividends (+7 pts)</span>
            </li>
          </ul>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
              <FileCode className="w-5 h-5 text-purple-400" /> News Sentiment NLP (20% Weight)
            </h3>
            <span className="text-xs font-mono font-bold px-2.5 py-1 bg-purple-950 text-purple-300 border border-purple-800 rounded-lg">
              20 Points Max
            </span>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            Computed using VADER (Valence Aware Dictionary for Sentiment Reasoning) on live news RSS:
          </p>
          <ul className="text-xs text-slate-400 space-y-2 font-mono">
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
              <span><strong>Compound VADER Score:</strong> Scaled linearly from -1.0 to +1.0</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
              <span><strong>Positive Ratio:</strong> &gt;60% positive headlines earns full 20 pts</span>
            </li>
          </ul>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
              <Calculator className="w-5 h-5 text-amber-400" /> Machine Learning Prediction (20% Weight)
            </h3>
            <span className="text-xs font-mono font-bold px-2.5 py-1 bg-amber-950 text-amber-300 border border-amber-800 rounded-lg">
              20 Points Max
            </span>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            Derived from Scikit-Learn Random Forest next-session direction probability:
          </p>
          <ul className="text-xs text-slate-400 space-y-2 font-mono">
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <span><strong>UP Prediction Probability:</strong> Scaled directly based on Up probability</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <span><strong>Historical Test Accuracy:</strong> Weighted by chronological test accuracy</span>
            </li>
          </ul>
        </div>
      </div>

      {/* Signal Decision Rules */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
        <h3 className="text-lg font-bold text-slate-100">Final Signal Threshold Matrix</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center font-mono">
          <div className="bg-emerald-950/40 border border-emerald-800/60 p-4 rounded-xl">
            <div className="text-emerald-400 text-xl font-bold">BUY SIGNAL</div>
            <div className="text-slate-200 text-sm mt-1">Score ≥ 65.0 / 100</div>
            <div className="text-[11px] text-slate-400 mt-2">Strong technical momentum & positive fundamentals</div>
          </div>
          <div className="bg-amber-950/40 border border-amber-800/60 p-4 rounded-xl">
            <div className="text-amber-400 text-xl font-bold">HOLD SIGNAL</div>
            <div className="text-slate-200 text-sm mt-1">45.0 ≤ Score &lt; 65.0</div>
            <div className="text-[11px] text-slate-400 mt-2">Neutral technical consolidation or mixed fundamentals</div>
          </div>
          <div className="bg-rose-950/40 border border-rose-800/60 p-4 rounded-xl">
            <div className="text-rose-400 text-xl font-bold">SELL SIGNAL</div>
            <div className="text-slate-200 text-sm mt-1">Score &lt; 45.0 / 100</div>
            <div className="text-[11px] text-slate-400 mt-2">Deteriorating price action or negative sentiment</div>
          </div>
        </div>
      </div>

      {/* Data Integrity Standard */}
      <div className="bg-slate-950 border border-slate-800 rounded-2xl p-6 flex flex-col sm:flex-row items-center gap-5">
        <AlertTriangle className="w-10 h-10 text-amber-400 shrink-0" />
        <div className="space-y-1">
          <h4 className="text-sm font-bold text-slate-100 uppercase tracking-wide font-mono">
            Data Integrity Standard Enforcement
          </h4>
          <p className="text-xs text-slate-400 leading-relaxed">
            If live connection to market feeds or RSS news providers experiences temporary connectivity issues, the system strictly presents an uncompromised "DATA UNAVAILABLE" state rather than injecting unverified values.
          </p>
        </div>
      </div>
    </div>
  );
};
