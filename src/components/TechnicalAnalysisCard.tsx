import React from 'react';
import { Activity, Clock, Database, TrendingUp, TrendingDown, Layers, Zap } from 'lucide-react';
import { TechnicalData } from '../types';

interface TechnicalAnalysisCardProps {
  technical: TechnicalData | null;
}

export const TechnicalAnalysisCard: React.FC<TechnicalAnalysisCardProps> = ({ technical }) => {
  if (!technical || technical.status === 'DATA UNAVAILABLE') {
    return (
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-amber-950/60 border border-amber-800/60 text-amber-300 font-mono text-sm rounded-lg mb-2">
          TECHNICAL ANALYSIS UNAVAILABLE
        </div>
        <p className="text-slate-400 text-sm">
          {technical?.error_reason || 'Could not calculate technical indicators from OHLCV data.'}
        </p>
      </div>
    );
  }

  const rsi = technical.rsi14;
  let rsiLabel = 'NEUTRAL';
  let rsiBadgeColor = 'bg-slate-800 text-slate-300 border-slate-700';

  if (rsi !== null) {
    if (rsi > 70) {
      rsiLabel = 'OVERBOUGHT';
      rsiBadgeColor = 'bg-rose-950 text-rose-300 border-rose-800';
    } else if (rsi < 30) {
      rsiLabel = 'OVERSOLD';
      rsiBadgeColor = 'bg-emerald-950 text-emerald-300 border-emerald-800';
    } else if (rsi >= 50) {
      rsiLabel = 'BULLISH MOMENTUM';
      rsiBadgeColor = 'bg-cyan-950 text-cyan-300 border-cyan-800';
    }
  }

  const macdHist = technical.macd_histogram ?? technical.macd_hist;
  const isMacdBullish = (macdHist ?? 0) >= 0;

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2 text-cyan-400 text-xs font-bold uppercase tracking-wider mb-1">
            <Activity className="w-4 h-4" />
            Pandas & NumPy Indicator Engine
          </div>
          <h3 className="text-xl font-extrabold text-slate-100">Technical Analysis</h3>
        </div>
        <div className="text-xs text-slate-400 font-mono">
          Period: {technical.calculation_period}
        </div>
      </div>

      {/* Grid of Technical Indicators */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* RSI 14 */}
        <div className="bg-slate-950/70 p-4 rounded-xl border border-slate-800 space-y-2">
          <div className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center justify-between">
            <span>RSI (14)</span>
            <span className={`text-[10px] px-2 py-0.5 rounded font-mono border ${rsiBadgeColor}`}>
              {rsiLabel}
            </span>
          </div>
          <div className="text-2xl font-black text-slate-100 font-mono">
            {typeof rsi === 'number' ? rsi.toFixed(2) : 'DATA UNAVAILABLE'}
          </div>
          <div className="text-[11px] text-slate-400">
            {typeof rsi === 'number' ? (rsi > 70 ? 'High overbought territory (>70)' : rsi < 30 ? 'Oversold bounce region (<30)' : 'Moderate momentum zone (30-70)') : 'N/A'}
          </div>
        </div>

        {/* SMA 20 vs SMA 50 */}
        <div className="bg-slate-950/70 p-4 rounded-xl border border-slate-800 space-y-2">
          <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            Moving Averages
          </div>
          <div className="space-y-1 font-mono text-sm">
            <div className="flex justify-between items-center">
              <span className="text-slate-400">SMA 20:</span>
              <span className="font-bold text-amber-400">
                {typeof technical.sma20 === 'number' ? technical.sma20.toLocaleString() : 'N/A'}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-400">SMA 50:</span>
              <span className="font-bold text-pink-400">
                {typeof technical.sma50 === 'number' ? technical.sma50.toLocaleString() : 'N/A'}
              </span>
            </div>
          </div>
          <div className="text-[11px] text-slate-400 pt-1">
            {technical.ma_description || (typeof technical.sma20 === 'number' && typeof technical.sma50 === 'number' ? (
              technical.sma20 > technical.sma50 ? 'Bullish Alignment (SMA20 > SMA50)' : 'Bearish Alignment (SMA20 < SMA50)'
            ) : 'N/A')}
          </div>
        </div>

        {/* MACD */}
        <div className="bg-slate-950/70 p-4 rounded-xl border border-slate-800 space-y-2">
          <div className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center justify-between">
            <span>MACD (12,26,9)</span>
            <span className={`text-[10px] px-2 py-0.5 rounded font-mono font-bold ${isMacdBullish ? 'bg-emerald-950 text-emerald-300 border border-emerald-800' : 'bg-rose-950 text-rose-300 border border-rose-800'}`}>
              {isMacdBullish ? 'BULLISH' : 'BEARISH'}
            </span>
          </div>
          <div className="space-y-1 font-mono text-sm">
            <div className="flex justify-between items-center">
              <span className="text-slate-400">MACD Line:</span>
              <span className="font-bold text-slate-200">{technical.macd ?? 'N/A'}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-400">Histogram:</span>
              <span className={`font-bold ${isMacdBullish ? 'text-emerald-400' : 'text-rose-400'}`}>
                {macdHist ?? 'N/A'}
              </span>
            </div>
          </div>
        </div>

        {/* Support & Resistance */}
        <div className="bg-slate-950/70 p-4 rounded-xl border border-slate-800 space-y-2">
          <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            Key Pivot Levels
          </div>
          <div className="space-y-1 font-mono text-sm">
            <div className="flex justify-between items-center">
              <span className="text-slate-400">Resistance:</span>
              <span className="font-bold text-rose-400">
                {typeof technical.resistance === 'number' ? technical.resistance.toLocaleString() : 'N/A'}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-400">Support:</span>
              <span className="font-bold text-emerald-400">
                {typeof technical.support === 'number' ? technical.support.toLocaleString() : 'N/A'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Volume Trend & Volatility Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-950/40 p-4 rounded-xl border border-slate-800/80">
        <div className="flex items-center justify-between text-xs font-mono">
          <span className="text-slate-400">Volume Trend:</span>
          <span className="font-bold text-slate-200">{technical.volume_trend || 'NORMAL'}</span>
        </div>
        <div className="flex items-center justify-between text-xs font-mono">
          <span className="text-slate-400">Annualized Volatility:</span>
          <span className="font-bold text-cyan-400">
            {technical.volatility !== null ? `${technical.volatility}%` : 'N/A'}
          </span>
        </div>
      </div>

      {/* Provenance Footer */}
      <div className="flex flex-wrap items-center justify-between text-[11px] text-slate-400 font-mono pt-2 border-t border-slate-800/60">
        <span>Calculated from OHLCV dataset</span>
        <span>Timestamp: {technical.timestamp}</span>
      </div>
    </div>
  );
};
