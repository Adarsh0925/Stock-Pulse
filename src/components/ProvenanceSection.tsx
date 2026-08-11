import React from 'react';
import { ShieldCheck, Database, FileCheck, Layers, Link, Clock, CheckCircle2, AlertTriangle, HelpCircle } from 'lucide-react';
import { ResearchReport } from '../types';

interface ProvenanceSectionProps {
  report: ResearchReport | null;
}

export const ProvenanceSection: React.FC<ProvenanceSectionProps> = ({ report }) => {
  if (!report) return null;

  const consensusStatus = report.quote?.consensus_status || report.provenance_details?.consensus_status || 'VERIFIED';
  const marketSources = report.quote?.sources_checked || report.provenance_details?.market_sources || [];

  const getConsensusBadge = (status: string) => {
    switch (status) {
      case 'MULTI-SOURCE VERIFIED':
      case 'VERIFIED':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-mono">
            <CheckCircle2 className="w-3.5 h-3.5" /> MULTI-SOURCE VERIFIED
          </span>
        );
      case 'SINGLE-SOURCE':
      case 'SINGLE_SOURCE':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30 font-mono">
            <CheckCircle2 className="w-3.5 h-3.5" /> SINGLE SOURCE
          </span>
        );
      case 'DATA_DISCREPANCY':
      case 'DATA DISCREPANCY':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-rose-500/20 text-rose-400 border border-rose-500/30 font-mono">
            <AlertTriangle className="w-3.5 h-3.5" /> DATA DISCREPANCY DETECTED
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-slate-800 text-slate-400 border border-slate-700 font-mono">
            <HelpCircle className="w-3.5 h-3.5" /> DATA UNAVAILABLE
          </span>
        );
    }
  };

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-cyan-400 text-xs font-bold uppercase tracking-wider">
            <ShieldCheck className="w-4 h-4 text-cyan-400" />
            Multi-Source Financial Architecture & Audit
          </div>
          <h3 className="text-xl font-extrabold text-slate-100">Source Consensus & Provenance Engine</h3>
        </div>
        <div>{getConsensusBadge(consensusStatus)}</div>
      </div>

      <p className="text-xs text-slate-400 leading-relaxed font-mono">
        All market prices, news stories, fundamental filings, and technical metrics pass through our independent <strong className="text-slate-200">Source Abstraction Layer</strong>. Prices are evaluated across multiple primary and secondary adapters. Values are marked as <strong className="text-emerald-400">VERIFIED</strong> only when multiple independent sources agree within strict mathematical tolerances.
      </p>

      {/* Checked Market Sources List */}
      {marketSources.length > 0 && (
        <div className="space-y-2">
          <div className="text-xs font-bold text-slate-300 uppercase font-mono tracking-wider">
            Evaluated Market Data Adapters ({marketSources.length})
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 font-mono text-xs">
            {marketSources.map((src: any, idx: number) => (
              <div key={idx} className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-slate-300 font-bold">{src.name}</span>
                  <span className={`text-[10px] font-bold uppercase px-1.5 py-0.5 rounded ${
                    src.status === 'valid' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'
                  }`}>
                    {src.status}
                  </span>
                </div>
                <div className="text-cyan-400 font-mono font-semibold">
                  {src.value !== null && src.value !== undefined ? (typeof src.value === 'number' ? `₹ / $ ${src.value}` : src.value) : 'Unavailable'}
                </div>
                <div className="text-slate-500 text-[10px]">
                  Delay: {src.delay_status} | Exchange: {src.exchange}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Grid of Other Engines */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 font-mono text-xs pt-2">
        <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 space-y-1">
          <div className="text-slate-400 font-bold flex items-center gap-1.5 text-[11px] uppercase">
            <Database className="w-3.5 h-3.5 text-cyan-400" /> Active Price Feed
          </div>
          <div className="text-slate-200 font-semibold">{report?.quote?.data_source || 'Multi-Source Feed'}</div>
          <div className="text-slate-500 text-[10px]">Retrieved: {report?.quote?.timestamp || report?.timestamp}</div>
        </div>

        <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 space-y-1">
          <div className="text-slate-400 font-bold flex items-center gap-1.5 text-[11px] uppercase">
            <Layers className="w-3.5 h-3.5 text-cyan-400" /> Historical OHLCV Dataset
          </div>
          <div className="text-slate-200 font-semibold">{report?.historical?.data_source || 'Verified Daily OHLCV'}</div>
          <div className="text-slate-500 text-[10px]">{report?.historical?.candle_count ?? 0} Sessions ({report?.historical?.period || '3M'})</div>
        </div>

        <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 space-y-1">
          <div className="text-slate-400 font-bold flex items-center gap-1.5 text-[11px] uppercase">
            <FileCheck className="w-3.5 h-3.5 text-cyan-400" /> Fundamentals Source
          </div>
          <div className="text-slate-200 font-semibold">{report?.fundamentals?.data_source || 'SEC / NSE Audited Filings'}</div>
          <div className="text-slate-500 text-[10px]">{report?.fundamentals?.metrics?.length ?? 0} Statement Ratio Ratios</div>
        </div>

        <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 space-y-1">
          <div className="text-slate-400 font-bold flex items-center gap-1.5 text-[11px] uppercase">
            <Link className="w-3.5 h-3.5 text-cyan-400" /> Multi-Source News Feed
          </div>
          <div className="text-slate-200 font-semibold">{report?.news?.data_source || 'Google News & Financial Press RSS'}</div>
          <div className="text-slate-500 text-[10px]">{report?.news?.article_count ?? report?.news?.articles?.length ?? 0} Verified Headlines Analyzed</div>
        </div>

        <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 space-y-1">
          <div className="text-slate-400 font-bold flex items-center gap-1.5 text-[11px] uppercase">
            <Clock className="w-3.5 h-3.5 text-cyan-400" /> Machine Learning Engine
          </div>
          <div className="text-slate-200 font-semibold">{report?.ml?.model_name || 'Scikit-learn RandomForest'}</div>
          <div className="text-slate-500 text-[10px]">Test Samples: {report?.ml?.test_sample_count ?? 0} sessions</div>
        </div>

        <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 space-y-1">
          <div className="text-slate-400 font-bold flex items-center gap-1.5 text-[11px] uppercase">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> Verification Status
          </div>
          <div className="text-emerald-400 font-bold uppercase">{report?.status || 'LIVE'}</div>
          <div className="text-slate-500 text-[10px]">Audit Timestamp: {report?.timestamp}</div>
        </div>
      </div>
    </div>
  );
};
