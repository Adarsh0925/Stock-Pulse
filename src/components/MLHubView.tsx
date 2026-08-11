import React from 'react';
import { Cpu, ShieldCheck, CheckCircle2, Zap, BarChart, Clock, Database, Layers } from 'lucide-react';
import { MLData } from '../types';

interface MLHubViewProps {
  currentMl?: MLData | null;
  selectedTicker: string;
}

export const MLHubView: React.FC<MLHubViewProps> = ({ currentMl, selectedTicker }) => {
  return (
    <div className="space-y-6">
      {/* ML Hub Header */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/5 rounded-full blur-3xl pointer-events-none"></div>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-cyan-400 text-xs font-mono font-bold uppercase tracking-wider mb-1">
              <Cpu className="w-4 h-4 text-cyan-400" /> Machine Learning Prediction Hub
            </div>
            <h2 className="text-2xl font-bold text-slate-100">Scikit-Learn RandomForest Engine</h2>
            <p className="text-xs text-slate-400 mt-1 max-w-2xl">
              Strictly non-shuffled chronological time-series evaluation. Models are trained on 80% past market sessions and evaluated on 20% unseen recent sessions.
            </p>
          </div>
          <div className="flex items-center gap-3 bg-slate-950/60 px-4 py-2.5 rounded-xl border border-slate-800 text-xs font-mono">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <div>
              <span className="text-slate-200 font-bold">Time-Series Data Protection</span>
              <div className="text-[10px] text-slate-400">Strict chronological split validation</div>
            </div>
          </div>
        </div>
      </div>

      {/* Live Model Performance Grid for Selected Stock */}
      {currentMl && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
            <div>
              <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
                <span className="text-cyan-400 font-mono">{selectedTicker}</span> Active Model Audit
              </h3>
              <p className="text-xs text-slate-400 font-mono">
                Model: {currentMl.model_name} • Status: {currentMl.status}
              </p>
            </div>
            <div className="text-xs font-mono bg-slate-950 px-3 py-1.5 rounded-lg border border-slate-800 text-slate-300">
              Tested on <span className="text-cyan-400 font-bold">{currentMl.test_sample_count}</span> historical test sessions
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 font-mono text-center">
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800/80">
              <div className="text-xs text-slate-400 mb-1">Accuracy Score</div>
              <div className="text-2xl font-bold text-cyan-400">
                {currentMl.accuracy !== null ? `${currentMl.accuracy}%` : 'N/A'}
              </div>
            </div>
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800/80">
              <div className="text-xs text-slate-400 mb-1">Precision</div>
              <div className="text-2xl font-bold text-emerald-400">
                {currentMl.precision !== null ? `${currentMl.precision}%` : 'N/A'}
              </div>
            </div>
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800/80">
              <div className="text-xs text-slate-400 mb-1">Recall</div>
              <div className="text-2xl font-bold text-blue-400">
                {currentMl.recall !== null ? `${currentMl.recall}%` : 'N/A'}
              </div>
            </div>
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800/80">
              <div className="text-xs text-slate-400 mb-1">F1 Score</div>
              <div className="text-2xl font-bold text-purple-400">
                {currentMl.f1_score !== null ? `${currentMl.f1_score}%` : 'N/A'}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 font-mono text-xs">
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-cyan-400" />
                <span className="text-slate-300">Training Period (80%):</span>
              </div>
              <span className="text-slate-100 font-bold">{currentMl.training_period}</span>
            </div>
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-emerald-400" />
                <span className="text-slate-300">Testing Period (20%):</span>
              </div>
              <span className="text-slate-100 font-bold">{currentMl.testing_period}</span>
            </div>
          </div>
        </div>
      )}

      {/* Feature Engineering Architecture */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
        <h3 className="text-lg font-bold text-slate-100 flex items-center gap-2">
          <Layers className="w-5 h-5 text-cyan-400" /> Feature Engineering & Input Architecture
        </h3>
        <p className="text-xs text-slate-300 leading-relaxed">
          The Machine Learning engine derives strictly verified quantitative features from historical daily session candles. Every feature is computed dynamically on backend server request.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs font-mono">
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800/80 space-y-2">
            <div className="font-bold text-cyan-400 flex items-center gap-1.5">
              <BarChart className="w-4 h-4" /> Price Momentum Features
            </div>
            <ul className="text-slate-400 space-y-1 text-[11px] list-disc list-inside">
              <li>1-Day Percentage Return</li>
              <li>SMA20 Ratio (Close / 20 SMA)</li>
              <li>SMA50 Ratio (Close / 50 SMA)</li>
            </ul>
          </div>

          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800/80 space-y-2">
            <div className="font-bold text-emerald-400 flex items-center gap-1.5">
              <Zap className="w-4 h-4" /> Oscillator Features
            </div>
            <ul className="text-slate-400 space-y-1 text-[11px] list-disc list-inside">
              <li>14-Period Relative Strength Index (RSI)</li>
              <li>MACD Line (12 EMA - 26 EMA)</li>
              <li>MACD Signal Line (9 EMA)</li>
            </ul>
          </div>

          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800/80 space-y-2">
            <div className="font-bold text-purple-400 flex items-center gap-1.5">
              <Database className="w-4 h-4" /> Volatility & Volume
            </div>
            <ul className="text-slate-400 space-y-1 text-[11px] list-disc list-inside">
              <li>10-Day Rolling Return Volatility</li>
              <li>1-Day Volume Percentage Change</li>
              <li>Target: Next Session Direction (UP/DOWN)</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};
