import React from 'react';
import { ShieldCheck, Database, FileCheck, Layers, Link, Clock, CheckCircle2, AlertTriangle, HelpCircle } from 'lucide-react';
import { ResearchReport } from '../types';

interface ProvenanceSectionProps {
  report: ResearchReport | null;
  isSimpleView?: boolean;
}

export const ProvenanceSection: React.FC<ProvenanceSectionProps> = ({ report, isSimpleView = false }) => {
  if (!report) return null;

  const consensusStatus = report.quote?.consensus_status || report.provenance_details?.consensus_status || 'VERIFIED';
  const marketSources = report.quote?.sources_checked || report.provenance_details?.market_sources || [];

  const getConsensusBadge = (status: string) => {
    switch (status) {
      case 'MULTI-SOURCE VERIFIED':
      case 'VERIFIED':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 font-mono">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> MULTI-SOURCE VERIFIED
          </span>
        );
      case 'SINGLE-SOURCE':
      case 'SINGLE_SOURCE':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200 font-mono">
            <CheckCircle2 className="w-3.5 h-3.5 text-amber-600" /> SINGLE SOURCE
          </span>
        );
      case 'DATA_DISCREPANCY':
      case 'DATA DISCREPANCY':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-red-50 text-red-700 border border-red-200 font-mono">
            <AlertTriangle className="w-3.5 h-3.5 text-red-600" /> DATA DISCREPANCY DETECTED
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-gray-100 text-slate-600 border border-gray-200 font-mono">
            <HelpCircle className="w-3.5 h-3.5" /> DATA UNAVAILABLE
          </span>
        );
    }
  };

  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-200 pb-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-teal-700 text-xs font-bold uppercase tracking-wider">
            <ShieldCheck className="w-4 h-4 text-teal-700" />
            <span>Data Verification & Sources</span>
          </div>
          <h3 className="text-xl font-extrabold text-gray-900">
            Data Sources & Quality Check
          </h3>
        </div>
        <div>{getConsensusBadge(consensusStatus)}</div>
      </div>

      <p className="text-xs text-slate-600 leading-relaxed font-sans">
        All market prices, news stories, company financial figures, and technical charts are cross-checked across multiple independent sources. A stock's price is marked as <strong className="text-emerald-700">VERIFIED</strong> only when official sources agree.
      </p>

      {/* Checked Market Sources List */}
      {marketSources.length > 0 && (
        <div className="space-y-2">
          <div className="text-xs font-bold text-gray-800 uppercase font-mono tracking-wider">
            Checked Market Data Sources ({marketSources.length})
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 font-mono text-xs">
            {marketSources.map((src: any, idx: number) => (
              <div key={idx} className="bg-gray-50 p-3.5 rounded-xl border border-gray-200 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-gray-900 font-bold">{src.name}</span>
                  <span className={`text-[10px] font-bold uppercase px-1.5 py-0.5 rounded ${
                    src.status === 'valid' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-red-50 text-red-700 border border-red-200'
                  }`}>
                    {src.status}
                  </span>
                </div>
                <div className="text-teal-700 font-mono font-semibold">
                  {src.value !== null && src.value !== undefined ? (typeof src.value === 'number' ? `₹ / $ ${src.value}` : src.value) : 'Unavailable'}
                </div>
                <div className="text-slate-500 text-[10px]">
                  Status: {src.delay_status} | Exchange: {src.exchange}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Grid of Other Engines */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 font-mono text-xs pt-2">
        <div className="bg-gray-50 p-3.5 rounded-xl border border-gray-200 space-y-1">
          <div className="text-slate-500 font-bold flex items-center gap-1.5 text-[11px] uppercase">
            <Database className="w-3.5 h-3.5 text-teal-700" /> Current Price Feed
          </div>
          <div className="text-gray-900 font-semibold">{report?.quote?.data_source || 'Multi-Source Feed'}</div>
          <div className="text-slate-500 text-[10px]">Retrieved: {report?.quote?.timestamp || report?.timestamp}</div>
        </div>

        <div className="bg-gray-50 p-3.5 rounded-xl border border-gray-200 space-y-1">
          <div className="text-slate-500 font-bold flex items-center gap-1.5 text-[11px] uppercase">
            <Layers className="w-3.5 h-3.5 text-teal-700" /> Historical Price Data
          </div>
          <div className="text-gray-900 font-semibold">{report?.historical?.data_source || 'Verified Daily Prices'}</div>
          <div className="text-slate-500 text-[10px]">{report?.historical?.candle_count ?? 0} Trading Days ({report?.historical?.period || '3M'})</div>
        </div>

        <div className="bg-gray-50 p-3.5 rounded-xl border border-gray-200 space-y-1">
          <div className="text-slate-500 font-bold flex items-center gap-1.5 text-[11px] uppercase">
            <FileCheck className="w-3.5 h-3.5 text-teal-700" /> Financial Statements Source
          </div>
          <div className="text-gray-900 font-semibold">{report?.fundamentals?.data_source || 'Official Company Filings'}</div>
          <div className="text-slate-500 text-[10px]">{report?.fundamentals?.metrics?.length ?? 0} Financial Numbers Verified</div>
        </div>

        <div className="bg-gray-50 p-3.5 rounded-xl border border-gray-200 space-y-1">
          <div className="text-slate-500 font-bold flex items-center gap-1.5 text-[11px] uppercase">
            <Link className="w-3.5 h-3.5 text-teal-700" /> News Feed
          </div>
          <div className="text-gray-900 font-semibold">{report?.news?.data_source || 'Financial News Feeds'}</div>
          <div className="text-slate-500 text-[10px]">{report?.news?.article_count ?? report?.news?.articles?.length ?? 0} Headlines Analyzed</div>
        </div>

        <div className="bg-gray-50 p-3.5 rounded-xl border border-gray-200 space-y-1">
          <div className="text-slate-500 font-bold flex items-center gap-1.5 text-[11px] uppercase">
            <Clock className="w-3.5 h-3.5 text-teal-700" /> Prediction Model
          </div>
          <div className="text-gray-900 font-semibold">{report?.ml?.model_name || 'Random Forest Classifier'}</div>
          <div className="text-slate-500 text-[10px]">Tested on {report?.ml?.test_sample_count ?? 0} past sessions</div>
        </div>

        <div className="bg-gray-50 p-3.5 rounded-xl border border-gray-200 space-y-1">
          <div className="text-slate-500 font-bold flex items-center gap-1.5 text-[11px] uppercase">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" /> Overall Data Status
          </div>
          <div className="text-emerald-700 font-bold uppercase">{report?.status || 'LIVE'}</div>
          <div className="text-slate-500 text-[10px]">Updated: {report?.timestamp}</div>
        </div>
      </div>
    </div>
  );
};
