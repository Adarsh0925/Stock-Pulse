import React from 'react';
import { Cpu, TrendingUp, TrendingDown, Clock, ShieldCheck, CheckCircle2, BarChart3 } from 'lucide-react';
import { MLData } from '../types';

interface MLPredictionCardProps {
  ml: MLData | null;
  ticker: string;
}

export const MLPredictionCard: React.FC<MLPredictionCardProps> = ({ ml, ticker }) => {
  if (!ml || ml.status === 'ML DATA UNAVAILABLE' || ml.up_probability === null) {
    return (
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-amber-950/60 border border-amber-800/60 text-amber-300 font-mono text-sm rounded-lg mb-2">
          ML DATA UNAVAILABLE
        </div>
        <p className="text-slate-400 text-sm">
          {ml?.error_reason || 'Insufficient historical sessions to train Scikit-learn RandomForest model.'}
        </p>
      </div>
    );
  }

  const isPredictedUp = ml.predicted_next_direction === 'UP';

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2 text-cyan-400 text-xs font-bold uppercase tracking-wider mb-1">
            <Cpu className="w-4 h-4" />
            Scikit-Learn Machine Learning Engine
          </div>
          <h3 className="text-xl font-extrabold text-slate-100">Next-Session Direction Prediction</h3>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400 font-mono">Model:</span>
          <span className="px-3 py-1 bg-slate-950 text-cyan-300 border border-slate-800 rounded-xl text-xs font-mono font-bold">
            {ml.model_name}
          </span>
        </div>
      </div>

      {/* Main Direction Banner */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 bg-slate-950/80 p-5 rounded-2xl border border-slate-800 items-center">
        {/* Next Session Direction Badge */}
        <div className="md:col-span-5 flex flex-col items-center justify-center p-4 border-b md:border-b-0 md:border-r border-slate-800">
          <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Predicted Direction</div>
          <div
            className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl font-black text-2xl border shadow-xl ${
              isPredictedUp
                ? 'bg-emerald-950 text-emerald-300 border-emerald-600/60 shadow-emerald-500/10'
                : 'bg-rose-950 text-rose-300 border-rose-600/60 shadow-rose-500/10'
            }`}
          >
            {isPredictedUp ? <TrendingUp className="w-7 h-7 text-emerald-400" /> : <TrendingDown className="w-7 h-7 text-rose-400" />}
            {ml.predicted_next_direction}
          </div>
          {typeof ml.accuracy === 'number' && ml.accuracy <= 55 && (
            <div className="mt-2.5 px-3 py-1 bg-amber-950/80 border border-amber-600/60 text-amber-300 rounded-lg text-[10px] font-mono font-bold uppercase tracking-wider text-center">
              ⚠ LOW CONFIDENCE MODEL ({ml.accuracy}% Test Acc)
            </div>
          )}
          <div className="text-xs font-mono text-slate-400 mt-2">
            Target: Next Trading Session Close
          </div>
        </div>

        {/* Probabilities Breakdown */}
        <div className="md:col-span-7 space-y-4">
          <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            Predicted Direction Probabilities
          </div>

          <div className="space-y-3 font-mono">
            {/* UP Probability */}
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-emerald-400 font-bold flex items-center gap-1">
                  <TrendingUp className="w-3.5 h-3.5" /> Model-estimated probability of UP direction:
                </span>
                <span className="font-bold text-emerald-300">{ml.up_probability}%</span>
              </div>
              <div className="w-full h-2.5 bg-slate-900 rounded-full overflow-hidden border border-slate-800">
                <div
                  style={{ width: `${ml.up_probability}%` }}
                  className="bg-emerald-500 h-full transition-all"
                ></div>
              </div>
            </div>

            {/* DOWN Probability */}
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-rose-400 font-bold flex items-center gap-1">
                  <TrendingDown className="w-3.5 h-3.5" /> Model-estimated probability of DOWN direction:
                </span>
                <span className="font-bold text-rose-300">{ml.down_probability}%</span>
              </div>
              <div className="w-full h-2.5 bg-slate-900 rounded-full overflow-hidden border border-slate-800">
                <div
                  style={{ width: `${ml.down_probability}%` }}
                  className="bg-rose-500 h-full transition-all"
                ></div>
              </div>
            </div>
            <p className="text-[11px] text-slate-400 italic font-sans pt-1">
              Note: Machine learning output represents model estimation based on quantitative historical indicators, not a certainty or price target.
            </p>
          </div>
        </div>
      </div>

      {/* Model Performance Metrics (Chronological Test Set) */}
      <div className="space-y-3">
        <div className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center justify-between">
          <span>Actual Chronological Test Metrics (Out-Of-Sample)</span>
          <span className="font-mono text-[11px] text-cyan-400">Test Samples: {ml.test_sample_count}</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono">
          <div className="bg-slate-950/70 p-3.5 rounded-xl border border-slate-800">
            <div className="text-[10px] font-bold text-slate-400 uppercase">Test Accuracy</div>
            <div className="text-xl font-black text-cyan-300 mt-1">
              {ml.accuracy !== null ? `${ml.accuracy}%` : 'N/A'}
            </div>
          </div>

          <div className="bg-slate-950/70 p-3.5 rounded-xl border border-slate-800">
            <div className="text-[10px] font-bold text-slate-400 uppercase">Test Precision</div>
            <div className="text-xl font-black text-slate-200 mt-1">
              {ml.precision !== null ? `${ml.precision}%` : 'N/A'}
            </div>
          </div>

          <div className="bg-slate-950/70 p-3.5 rounded-xl border border-slate-800">
            <div className="text-[10px] font-bold text-slate-400 uppercase">Test Recall</div>
            <div className="text-xl font-black text-slate-200 mt-1">
              {ml.recall !== null ? `${ml.recall}%` : 'N/A'}
            </div>
          </div>

          <div className="bg-slate-950/70 p-3.5 rounded-xl border border-slate-800">
            <div className="text-[10px] font-bold text-slate-400 uppercase">F1 Score</div>
            <div className="text-xl font-black text-slate-200 mt-1">
              {ml.f1_score !== null ? `${ml.f1_score}%` : 'N/A'}
            </div>
          </div>
        </div>
      </div>

      {/* Chronological Validation Provenance Box */}
      <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2 text-xs font-mono text-slate-400">
        <div className="flex items-center gap-1.5 text-slate-300 font-bold">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          Strict Chronological Time-Series Validation (No Shuffling)
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] pt-1">
          <div>
            <span className="text-slate-400">Training Period:</span>{' '}
            <span className="text-slate-200">{ml.training_period}</span>
          </div>
          <div>
            <span className="text-slate-400">Testing Period:</span>{' '}
            <span className="text-slate-200">{ml.testing_period}</span>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between text-xs text-slate-400 font-mono pt-2 border-t border-slate-800/60">
        <span className="flex items-center gap-1 text-slate-400">
          <ShieldCheck className="w-4 h-4 text-cyan-400" />
          Engineered Features: Returns, SMA20/50 Ratios, RSI, MACD, Volatility, Volume Changes.
        </span>
        <span>Timestamp: {ml.timestamp}</span>
      </div>
    </div>
  );
};
