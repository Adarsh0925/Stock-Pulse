import React, { useState } from 'react';
import { Calendar, ShieldAlert, Building2, UserCheck, CheckCircle2, AlertCircle, ChevronDown, ChevronUp, Clock, Scale } from 'lucide-react';
import { MultiHorizonOutlook, CorporateGovernanceRisk } from '../types';
import { InfoTooltip } from './InfoTooltip';

interface MultiHorizonAndGovernanceCardProps {
  multiHorizon?: MultiHorizonOutlook | null;
  governanceRisk?: CorporateGovernanceRisk | null;
  ticker: string;
  companyName?: string;
}

export const MultiHorizonAndGovernanceCard: React.FC<MultiHorizonAndGovernanceCardProps> = ({
  multiHorizon,
  governanceRisk,
  ticker,
  companyName,
}) => {
  const [showFullGovernanceDetails, setShowFullGovernanceDetails] = useState(false);

  if (!multiHorizon && !governanceRisk) return null;

  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm space-y-6">
      {/* 1. Multi-Horizon Outlook Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-gray-200 pb-4">
        <div>
          <div className="flex items-center gap-2 text-teal-700 text-xs font-bold uppercase tracking-wider mb-1">
            <Clock className="w-4 h-4" />
            <span>Multi-Horizon Investment Outlook</span>
            <InfoTooltip text="Segmented projections across short-term tactical trading (1–5 days), medium-term cyclical investing (6–12 months), and structural 3–5 year compounding." />
          </div>
          <h3 className="text-xl font-bold text-gray-900">
            Time Horizon Analysis (Short, Medium & Long Term)
          </h3>
        </div>
        <span className="px-2.5 py-1 bg-gray-100 text-slate-700 border border-gray-200 rounded-lg text-xs font-mono">
          3-Tier Time Horizons
        </span>
      </div>

      {/* Multi-Horizon 3-Column Grid */}
      {multiHorizon && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Short-Term (1-5 Days) */}
          <div className="p-4 bg-gray-50 border border-gray-200 rounded-xl space-y-3 flex flex-col justify-between">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Short-Term (1–5 Days)
                </span>
                <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 text-[10px] font-mono font-bold rounded">
                  {multiHorizon.short_term.view}
                </span>
              </div>
              <div className="text-xl font-black font-mono text-gray-900">
                {multiHorizon.short_term.target_range}
              </div>
              <p className="text-xs text-slate-700 leading-relaxed">
                {multiHorizon.short_term.key_drivers}
              </p>
            </div>
            <div className="pt-2 border-t border-gray-200 text-[11px] text-slate-500">
              <strong className="text-slate-700">Risk Factor:</strong> {multiHorizon.short_term.risk_factors}
            </div>
          </div>

          {/* Medium-Term (6-12 Months) */}
          <div className="p-4 bg-teal-50/40 border border-teal-200 rounded-xl space-y-3 flex flex-col justify-between">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-teal-800 uppercase tracking-wider">
                  Medium-Term (6–12 Months)
                </span>
                <span className="px-2 py-0.5 bg-teal-100 text-teal-800 text-[10px] font-mono font-bold rounded">
                  {multiHorizon.medium_term.view}
                </span>
              </div>
              <div className="text-xl font-black font-mono text-teal-900">
                {multiHorizon.medium_term.target_range}
              </div>
              <p className="text-xs text-slate-700 leading-relaxed">
                {multiHorizon.medium_term.key_drivers}
              </p>
            </div>
            <div className="pt-2 border-t border-teal-200 text-[11px] text-teal-800">
              <strong className="text-teal-900">Risk Factor:</strong> {multiHorizon.medium_term.risk_factors}
            </div>
          </div>

          {/* Long-Term (3-5 Years) */}
          <div className="p-4 bg-emerald-50/40 border border-emerald-200 rounded-xl space-y-3 flex flex-col justify-between">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-emerald-800 uppercase tracking-wider">
                  Long-Term (3–5 Years)
                </span>
                <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 text-[10px] font-mono font-bold rounded">
                  {multiHorizon.long_term.view}
                </span>
              </div>
              <div className="text-xl font-black font-mono text-emerald-900">
                {multiHorizon.long_term.target_range}
              </div>
              <p className="text-xs text-slate-700 leading-relaxed">
                {multiHorizon.long_term.key_drivers}
              </p>
            </div>
            <div className="pt-2 border-t border-emerald-200 text-[11px] text-emerald-800">
              <strong className="text-emerald-900">Risk Factor:</strong> {multiHorizon.long_term.risk_factors}
            </div>
          </div>
        </div>
      )}

      {/* 2. Dedicated Corporate Governance & Executive Succession Risk Section */}
      {governanceRisk && (
        <div className="space-y-4 pt-3 border-t border-gray-200">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <div className="flex items-center gap-2 text-slate-800 text-xs font-bold uppercase tracking-wider mb-0.5">
                <ShieldAlert className="w-4 h-4 text-amber-600" />
                <span>Corporate Governance & Regulatory Risk Assessment</span>
              </div>
              <h4 className="text-base font-bold text-gray-900">
                Leadership Continuity & Regulatory Compliance
              </h4>
            </div>
            <span className={`px-2.5 py-1 text-xs font-mono font-bold rounded-lg border ${
              governanceRisk.overall_governance_risk === 'LOW'
                ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                : 'bg-amber-50 text-amber-900 border-amber-300'
            }`}>
              Governance Risk: {governanceRisk.overall_governance_risk}
            </span>
          </div>

          {/* CEO Succession Analysis Box */}
          <div className="p-4 bg-amber-50/40 border border-amber-200 rounded-xl space-y-3">
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-center gap-2">
                <UserCheck className="w-4 h-4 text-amber-700 shrink-0" />
                <span className="text-xs font-bold text-amber-900 uppercase">
                  Executive Succession Status: {governanceRisk.ceo_succession.status}
                </span>
              </div>
              <span className="text-[11px] font-mono text-amber-800 bg-amber-100 px-2 py-0.5 rounded font-semibold">
                {governanceRisk.ceo_succession.timeline}
              </span>
            </div>
            <p className="text-xs text-slate-700 leading-relaxed">
              {governanceRisk.ceo_succession.details}
            </p>
            <div className="text-[11px] text-amber-800 font-mono flex items-center gap-1.5 pt-1 border-t border-amber-200">
              <CheckCircle2 className="w-3.5 h-3.5 text-amber-700" />
              <span>Candidates Submitted: {governanceRisk.ceo_succession.candidates_status}</span>
            </div>
          </div>

          {/* Regulatory & Balance Sheet Subsections */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {/* Regulatory Compliance */}
            <div className="p-3.5 bg-gray-50 border border-gray-200 rounded-xl space-y-1.5 text-xs">
              <div className="flex items-center gap-1.5 font-bold text-slate-800 uppercase text-[11px]">
                <Scale className="w-3.5 h-3.5 text-teal-700" />
                <span>Regulatory & Capital Solvency</span>
              </div>
              <p className="text-slate-600 leading-normal text-[11px]">
                {governanceRisk.regulatory_compliance.rbi_status}
              </p>
              <div className="text-[10px] text-slate-500 font-mono pt-1">
                Risk Weight Buffer: {governanceRisk.regulatory_compliance.unsecured_risk_weight_impact}
              </div>
            </div>

            {/* Merger Integration Progress */}
            <div className="p-3.5 bg-gray-50 border border-gray-200 rounded-xl space-y-1.5 text-xs">
              <div className="flex items-center gap-1.5 font-bold text-slate-800 uppercase text-[11px]">
                <Building2 className="w-3.5 h-3.5 text-teal-700" />
                <span>Merger Balance Sheet Progress</span>
              </div>
              <p className="text-slate-600 leading-normal text-[11px]">
                {governanceRisk.merger_integration.progress_details}
              </p>
              <div className="text-[10px] text-slate-500 font-mono pt-1">
                Status: {governanceRisk.merger_integration.balance_sheet_digest}
              </div>
            </div>
          </div>

          {/* Monitoring Guidance */}
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-slate-500 shrink-0 mt-0.5" />
            <span>
              <strong>Analyst Monitoring Focus:</strong> {governanceRisk.monitoring_guidance}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};
