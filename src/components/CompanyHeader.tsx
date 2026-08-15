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
      <div className="bg-white border border-gray-200 rounded-2xl p-6 text-center shadow-sm">
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-amber-50 border border-amber-200 text-amber-800 font-mono text-sm rounded-lg mb-2">
          DATA UNAVAILABLE
        </div>
        <p className="text-slate-600 text-sm">
          {quote?.error_reason || 'Latest market price feed is currently unavailable for this ticker.'}
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
    <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm relative overflow-hidden">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
        {/* Company Title & Details */}
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <span className="px-2.5 py-1 bg-teal-50 text-teal-700 border border-teal-200 rounded-lg text-xs font-mono font-bold tracking-wider">
              {quote.ticker}
            </span>
            <span className="px-2.5 py-1 bg-gray-100 text-slate-700 border border-gray-200 rounded-lg text-xs font-medium flex items-center gap-1">
              <Building2 className="w-3 h-3 text-slate-500" />
              {quote.exchange}
            </span>
            <span className="px-2.5 py-1 bg-gray-100 text-slate-700 border border-gray-200 rounded-lg text-xs font-medium flex items-center gap-1">
              <Layers className="w-3 h-3 text-slate-500" />
              {quote.sector || 'General'}
            </span>
          </div>

          <h2 className="text-2xl md:text-3xl font-extrabold text-gray-900 tracking-tight">
            {companyName || quote.name}
          </h2>

          <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 font-mono">
            <span className="flex items-center gap-1 text-slate-500">
              <Clock className="w-3.5 h-3.5 text-slate-400" />
              Timestamp: {quote.timestamp}
            </span>
            <span className="flex items-center gap-1 text-slate-500">
              <Database className="w-3.5 h-3.5 text-teal-700" />
              Source: {quote.data_source}
            </span>
          </div>
        </div>

        {/* Price & Metrics Grid */}
        <div className="flex flex-wrap items-center gap-6 lg:gap-8 bg-gray-50 p-4 rounded-xl border border-gray-200">
          <div>
            <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">Current Price</div>
            <div className="text-3xl font-black text-gray-900 font-mono">
              {typeof quote.current_price === 'number' ? `${currencySymbol}${quote.current_price.toLocaleString('en-IN', { minimumFractionDigits: 2 })}` : 'DATA UNAVAILABLE'}
            </div>
            {typeof quote.change === 'number' && typeof quote.change_percent === 'number' ? (
              <div className={`flex items-center gap-1 font-bold text-sm mt-0.5 font-mono ${isPositive ? 'text-emerald-700' : 'text-red-700'}`}>
                {isPositive ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                {isPositive ? '+' : ''}{quote.change} ({isPositive ? '+' : ''}{quote.change_percent}%)
              </div>
            ) : null}
          </div>

          <div className="h-10 w-px bg-gray-200 hidden sm:block"></div>

          <div>
            <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">Previous Close</div>
            <div className="text-lg font-bold text-gray-800 font-mono">
              {typeof quote.previous_close === 'number' ? `${currencySymbol}${quote.previous_close.toLocaleString('en-IN', { minimumFractionDigits: 2 })}` : 'DATA UNAVAILABLE'}
            </div>
          </div>

          <div className="h-10 w-px bg-gray-200 hidden sm:block"></div>

          <div>
            <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">Volume</div>
            <div className="text-lg font-bold text-gray-800 font-mono">
              {typeof quote.volume === 'number' ? quote.volume.toLocaleString() : 'DATA UNAVAILABLE'}
            </div>
          </div>

          <div className="h-10 w-px bg-gray-200 hidden sm:block"></div>

          <div>
            <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">Market Cap</div>
            <div className="text-lg font-bold text-gray-800 font-mono">
              {formatLargeNum(quote.market_cap)}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
