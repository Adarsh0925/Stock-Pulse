import React, { useState } from 'react';
import { Activity, TrendingUp, TrendingDown, Layers, ChevronDown, ChevronUp } from 'lucide-react';
import { TechnicalData } from '../types';
import { InfoTooltip } from './InfoTooltip';

interface TechnicalAnalysisCardProps {
  technical: TechnicalData | null;
  ticker?: string;
  isSimpleView?: boolean;
}

export const TechnicalAnalysisCard: React.FC<TechnicalAnalysisCardProps> = ({ technical, ticker = '', isSimpleView = true }) => {
  const [showTechnicalDetails, setShowTechnicalDetails] = useState(false);
  const isIndianStock = ticker.endsWith('.NS') || ticker.endsWith('.BO') || technical?.ticker?.endsWith('.NS') || technical?.ticker?.endsWith('.BO');
  const currencySymbol = isIndianStock ? '₹' : '$';

  if (!technical || technical.status === 'DATA UNAVAILABLE') {
    return (
      <div className="bg-white border border-gray-200 rounded-2xl p-6 text-center shadow-sm">
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-amber-50 border border-amber-200 text-amber-800 font-mono text-sm rounded-lg mb-2">
          PRICE & TREND DATA UNAVAILABLE
        </div>
        <p className="text-slate-600 text-sm">
          {technical?.error_reason || 'Could not calculate price and trend indicators from recent trading data.'}
        </p>
      </div>
    );
  }

  const rsi = technical.rsi14;
  let rsiLabel = 'Balanced Range';
  let rsiBadgeColor = 'bg-gray-100 text-slate-700 border-gray-200';

  if (rsi !== null) {
    if (rsi > 70) {
      rsiLabel = 'High (Overbought)';
      rsiBadgeColor = 'bg-amber-50 text-amber-800 border-amber-200';
    } else if (rsi < 30) {
      rsiLabel = 'Low (Oversold)';
      rsiBadgeColor = 'bg-emerald-50 text-emerald-700 border-emerald-200';
    } else if (rsi >= 50) {
      rsiLabel = 'Positive Strength';
      rsiBadgeColor = 'bg-teal-50 text-teal-700 border-teal-200';
    }
  }

  const macdHist = technical.macd_histogram ?? technical.macd_hist;
  const isMacdBullish = (macdHist ?? 0) >= 0;
  const isSmaBullish = typeof technical.sma20 === 'number' && typeof technical.sma50 === 'number' && technical.sma20 > technical.sma50;

  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm space-y-5">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-gray-200 pb-4">
        <div>
          <div className="flex items-center gap-2 text-teal-700 text-xs font-bold uppercase tracking-wider mb-1">
            <Activity className="w-4 h-4" />
            <span>Price & Trend</span>
            <InfoTooltip text="Evaluates recent price direction, price strength, short-term momentum, and key price levels." />
          </div>
          <h3 className="text-xl font-bold text-gray-900">
            Price & Trend
          </h3>
        </div>
        <div className="text-xs text-slate-500 font-mono">
          Time Period: {technical.calculation_period}
        </div>
      </div>

      {/* 4 Summary Cards for Simple View */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* 1. Overall Trend */}
        <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 space-y-2">
          <div className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center justify-between">
            <span className="flex items-center gap-1">
              <span>Overall Trend</span>
              <InfoTooltip text="Compares short-term and medium-term price moving averages to identify current trend." />
            </span>
            {isSmaBullish ? <TrendingUp className="w-4 h-4 text-emerald-600" /> : <TrendingDown className="w-4 h-4 text-amber-600" />}
          </div>
          <div className={`text-xl font-bold ${isSmaBullish ? 'text-emerald-700' : 'text-amber-800'}`}>
            {isSmaBullish ? 'Upward Trend' : 'No Clear Direction'}
          </div>
          <div className="text-[11px] text-slate-600">
            {isSmaBullish ? 'Short-term price average is above medium-term average' : 'Short-term price average is near or below medium-term average'}
          </div>
        </div>

        {/* 2. Price Strength */}
        <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 space-y-2">
          <div className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center justify-between">
            <span className="flex items-center gap-1">
              <span>Price Strength</span>
              <InfoTooltip text="Price Strength measures if price moved too quickly. Above 70 is strongly bought; below 30 is heavily sold." />
            </span>
            <span className={`text-[10px] px-2 py-0.5 rounded font-mono border ${rsiBadgeColor}`}>
              {rsiLabel}
            </span>
          </div>
          <div className="text-xl font-bold text-gray-900 font-mono">
            {typeof rsi === 'number' ? rsi.toFixed(1) : 'DATA UNAVAILABLE'}
          </div>
          <div className="text-[11px] text-slate-600">
            {typeof rsi === 'number' ? (rsi > 70 ? 'High buying strength (overbought)' : rsi < 30 ? 'Heavy selling (oversold)' : 'Balanced range (30-70)') : 'N/A'}
          </div>
        </div>

        {/* 3. Short-Term Momentum */}
        <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 space-y-2">
          <div className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center justify-between">
            <span className="flex items-center gap-1">
              <span>Short-Term Momentum</span>
              <InfoTooltip text="Indicates whether recent buyer momentum is speeding up or slowing down." />
            </span>
            <span className={`text-[10px] px-2 py-0.5 rounded font-mono font-bold ${isMacdBullish ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
              {isMacdBullish ? 'POSITIVE' : 'CAUTIOUS'}
            </span>
          </div>
          <div className={`text-xl font-bold ${isMacdBullish ? 'text-emerald-700' : 'text-red-700'}`}>
            {isMacdBullish ? 'Positive Momentum' : 'Slowing Momentum'}
          </div>
          <div className="text-[11px] text-slate-600">
            {isMacdBullish ? 'Recent buyer momentum is active' : 'Short-term momentum is slowing down'}
          </div>
        </div>

        {/* 4. Key Price Levels */}
        <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 space-y-2">
          <div className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center justify-between">
            <span className="flex items-center gap-1">
              <span>Key Price Levels</span>
              <InfoTooltip text="Possible Price Ceiling is an upper price level where price may pause. Possible Price Floor is a lower price level where price may bounce." />
            </span>
          </div>
          <div className="space-y-1 font-mono text-xs">
            <div className="flex justify-between items-center">
              <span className="text-slate-600">Possible Price Ceiling:</span>
              <span className="font-bold text-red-700">
                {typeof technical.resistance === 'number' ? `${currencySymbol} ${technical.resistance.toLocaleString()}` : 'N/A'}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-600">Possible Price Floor:</span>
              <span className="font-bold text-emerald-700">
                {typeof technical.support === 'number' ? `${currencySymbol} ${technical.support.toLocaleString()}` : 'N/A'}
              </span>
            </div>
          </div>
          <div className="text-[11px] text-slate-600">
            Yearly Price Movement: <strong className="text-gray-900 font-mono">{technical.volatility !== null ? `${technical.volatility}%` : 'N/A'}</strong>
          </div>
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
            <span className="text-slate-500 font-normal text-[11px]">(SMA20, SMA50, RSI-14, MACD Signal & Histogram)</span>
          </span>
          {showTechnicalDetails ? <ChevronUp className="w-4 h-4 text-teal-700" /> : <ChevronDown className="w-4 h-4 text-slate-500" />}
        </button>

        {showTechnicalDetails && (
          <div className="mt-3 p-4 bg-gray-50 rounded-xl border border-gray-200 space-y-4 text-xs font-mono animate-fadeIn">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3 bg-white rounded-lg border border-gray-200 space-y-1">
                <span className="text-slate-500 text-[10px] uppercase">SMA20 (20-Day Average)</span>
                <div className="text-amber-700 font-bold text-sm">
                  {typeof technical.sma20 === 'number' ? technical.sma20.toLocaleString() : 'N/A'}
                </div>
              </div>

              <div className="p-3 bg-white rounded-lg border border-gray-200 space-y-1">
                <span className="text-slate-500 text-[10px] uppercase">SMA50 (50-Day Average)</span>
                <div className="text-teal-700 font-bold text-sm">
                  {typeof technical.sma50 === 'number' ? technical.sma50.toLocaleString() : 'N/A'}
                </div>
              </div>

              <div className="p-3 bg-white rounded-lg border border-gray-200 space-y-1">
                <span className="text-slate-500 text-[10px] uppercase">MACD Line Value</span>
                <div className="text-gray-900 font-bold text-sm">
                  {technical.macd ?? 'N/A'}
                </div>
              </div>

              <div className="p-3 bg-white rounded-lg border border-gray-200 space-y-1">
                <span className="text-slate-500 text-[10px] uppercase">MACD Signal / Hist</span>
                <div className="text-gray-900 font-bold text-sm">
                  {technical.macd_signal ?? 'N/A'} / {macdHist ?? 'N/A'}
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-between text-[11px] text-slate-500 pt-2 border-t border-gray-200">
              <span>Trading Volume: {technical.volume_trend || 'NORMAL'}</span>
              <span>Calculated from historical price & volume data ({technical.timestamp})</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
