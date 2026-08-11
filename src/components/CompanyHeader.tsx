import React from 'react';
import { TrendingUp, TrendingDown, Building2, Globe, Database, Clock, Layers } from 'lucide-react';
import { CompanyQuote } from '../types';

interface CompanyHeaderProps {
  quote: CompanyQuote | null;
  companyName: string;
}

export const CompanyHeader: React.FC<CompanyHeaderProps> = ({ quote, companyName }) => {
  if (!quote || quote.status === 'DATA UNAVAILABLE') {
    return (
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-amber-950/60 border border-amber-800/60 text-amber-300 font-mono text-sm rounded-lg mb-2">
          DATA UNAVAILABLE
        </div>
        <p className="text-slate-400 text-sm">
          {quote?.error_reason || 'Real-time price feed is currently unavailable for this ticker.'}
        </p>
      </div>
    );
  }

  const isPositive = (quote.change ?? 0) >= 0;
  const currencySymbol = (quote?.ticker?.endsWith('.NS') || quote?.ticker?.endsWith('.BO')) ? '₹' : '$';

  const formatLargeNum = (num: number | string | null | undefined) => {
    if (num === null || num === undefined) return 'DATA UNAVAILABLE';
    if (typeof num === 'string') return num;
    if (typeof num !== 'number' || isNaN(num)) return 'DATA UNAVAILABLE';
    if (num >= 1e12) return `${currencySymbol}${(num / 1e12).toFixed(2)} T`;
    if (num >= 1e9) return `${currencySymbol}${(num / 1e9).toFixed(2)} B`;
    if (num >= 1e7) return `${currencySymbol}${(num / 1e7).toFixed(2)} Cr`;
    if (num >= 1e6) return `${currencySymbol}${(num / 1e6).toFixed(2)} M`;
    return `${currencySymbol}${num.toLocaleString()}`;
  };

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl relative overflow-hidden">
      <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/5 blur-3xl pointer-events-none rounded-full -mr-20 -mt-20"></div>

      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
        {/* Company Title & Details */}
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <span className="px-2.5 py-1 bg-cyan-950/80 text-cyan-300 border border-cyan-800/60 rounded-lg text-xs font-mono font-bold tracking-wider">
              {quote.ticker}
            </span>
            <span className="px-2.5 py-1 bg-slate-800 text-slate-300 border border-slate-700/60 rounded-lg text-xs font-medium flex items-center gap-1">
              <Building2 className="w-3 h-3 text-slate-400" />
              {quote.exchange}
            </span>
            <span className="px-2.5 py-1 bg-slate-800 text-slate-300 border border-slate-700/60 rounded-lg text-xs font-medium flex items-center gap-1">
              <Layers className="w-3 h-3 text-slate-400" />
              {quote.sector || 'General'}
            </span>
          </div>

          <h2 className="text-2xl md:text-3xl font-extrabold text-slate-100 tracking-tight">
            {companyName || quote.name}
          </h2>

          <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400 font-mono">
            <span className="flex items-center gap-1 text-slate-400">
              <Clock className="w-3.5 h-3.5 text-slate-500" />
              Timestamp: {quote.timestamp}
            </span>
            <span className="flex items-center gap-1 text-slate-400">
              <Database className="w-3.5 h-3.5 text-cyan-400" />
              Source: {quote.data_source}
            </span>
          </div>
        </div>

        {/* Price & Metrics Grid */}
        <div className="flex flex-wrap items-center gap-6 lg:gap-8 bg-slate-950/70 p-4 rounded-xl border border-slate-800/80">
          <div>
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">Current Price</div>
            <div className="text-3xl font-black text-slate-100 font-mono">
              {typeof quote.current_price === 'number' ? `${currencySymbol}${quote.current_price.toLocaleString('en-IN', { minimumFractionDigits: 2 })}` : 'DATA UNAVAILABLE'}
            </div>
            {typeof quote.change === 'number' && typeof quote.change_percent === 'number' ? (
              <div className={`flex items-center gap-1 font-bold text-sm mt-0.5 font-mono ${isPositive ? 'text-emerald-400' : 'text-rose-400'}`}>
                {isPositive ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                {isPositive ? '+' : ''}{quote.change} ({isPositive ? '+' : ''}{quote.change_percent}%)
              </div>
            ) : null}
          </div>

          <div className="h-10 w-px bg-slate-800 hidden sm:block"></div>

          <div>
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">Previous Close</div>
            <div className="text-lg font-bold text-slate-200 font-mono">
              {typeof quote.previous_close === 'number' ? `${currencySymbol}${quote.previous_close.toLocaleString('en-IN', { minimumFractionDigits: 2 })}` : 'DATA UNAVAILABLE'}
            </div>
          </div>

          <div className="h-10 w-px bg-slate-800 hidden sm:block"></div>

          <div>
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">Volume</div>
            <div className="text-lg font-bold text-slate-200 font-mono">
              {typeof quote.volume === 'number' ? quote.volume.toLocaleString() : 'DATA UNAVAILABLE'}
            </div>
          </div>

          <div className="h-10 w-px bg-slate-800 hidden sm:block"></div>

          <div>
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">Market Cap</div>
            <div className="text-lg font-bold text-slate-200 font-mono">
              {formatLargeNum(quote.market_cap)}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
