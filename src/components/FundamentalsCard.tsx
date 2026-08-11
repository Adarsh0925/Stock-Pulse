import React from 'react';
import { Building, DollarSign, PieChart, FileCheck2, ExternalLink, ShieldCheck } from 'lucide-react';
import { FundamentalsData } from '../types';

interface FundamentalsCardProps {
  fundamentals: FundamentalsData | null;
  ticker: string;
}

export const FundamentalsCard: React.FC<FundamentalsCardProps> = ({ fundamentals, ticker }) => {
  if (!fundamentals || fundamentals.status === 'DATA UNAVAILABLE' || !fundamentals?.metrics?.length) {
    return (
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-amber-950/60 border border-amber-800/60 text-amber-300 font-mono text-sm rounded-lg mb-2">
          FUNDAMENTAL DATA UNAVAILABLE
        </div>
        <p className="text-slate-400 text-sm">
          {fundamentals?.error_reason || 'Verified fundamental metrics could not be retrieved from online financial statements.'}
        </p>
      </div>
    );
  }

  const isBank = fundamentals.company_type === 'bank';

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2 text-cyan-400 text-xs font-bold uppercase tracking-wider mb-1">
            <PieChart className="w-4 h-4" />
            {isBank ? 'Banking & Financial Sector Analysis' : 'Corporate Financial Statement Metrics'}
          </div>
          <h3 className="text-xl font-extrabold text-slate-100">Fundamental Analysis</h3>
        </div>
        <span className="px-2.5 py-1 bg-slate-800 text-slate-300 border border-slate-700 rounded-lg text-xs font-mono">
          {isBank ? 'Banking Institutional Model' : 'Standard Corporate Model'}
        </span>
      </div>

      {/* Fundamental Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {fundamentals.metrics.map((metric, idx) => {
          const isUnavailable = metric.formatted_value === 'DATA UNAVAILABLE';
          return (
            <div
              key={idx}
              className={`p-4 rounded-xl border space-y-2 transition-all ${
                isUnavailable
                  ? 'bg-slate-950/40 border-slate-800/60 opacity-70'
                  : 'bg-slate-950/70 border-slate-800 hover:border-slate-700'
              }`}
            >
              <div className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center justify-between">
                <span>{metric.metric_name}</span>
                {metric.source_url && (
                  <a
                    href={metric.source_url}
                    target="_blank"
                    rel="noreferrer"
                    className="text-cyan-400 hover:text-cyan-300 transition-colors"
                    title="View original online financial source"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                )}
              </div>

              <div
                className={`text-xl font-black font-mono ${
                  isUnavailable ? 'text-amber-400 text-sm' : 'text-slate-100'
                }`}
              >
                {metric.formatted_value}
              </div>

              <div className="space-y-1 text-[10px] text-slate-500 font-mono border-t border-slate-800/60 pt-2">
                <div className="flex justify-between">
                  <span>Source:</span>
                  <span className="text-slate-400 font-semibold">{metric.source}</span>
                </div>
                <div className="flex justify-between">
                  <span>Period:</span>
                  <span className="text-slate-400">{metric.reporting_period || 'Latest TTM'}</span>
                </div>
                <div className="flex justify-between">
                  <span>Published:</span>
                  <span className="text-slate-400">{metric.publication_date || 'Recent filing'}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer Provenance */}
      <div className="flex flex-wrap items-center justify-between text-xs text-slate-400 font-mono pt-2 border-t border-slate-800/60">
        <span className="flex items-center gap-1.5 text-slate-400">
          <ShieldCheck className="w-4 h-4 text-cyan-400" />
          Every fundamental metric includes source link and reporting period.
        </span>
        <span>Source: {fundamentals.data_source} ({fundamentals.timestamp})</span>
      </div>
    </div>
  );
};
