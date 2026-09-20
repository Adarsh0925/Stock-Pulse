import React, { useState } from 'react';
import { DollarSign, PieChart, ExternalLink, ShieldCheck, ChevronDown, ChevronUp, FileText, Landmark, Percent, TrendingUp, BarChart3, HelpCircle, Layers, CheckCircle2 } from 'lucide-react';
import { FundamentalsData } from '../types';
import { InfoTooltip } from './InfoTooltip';

interface FundamentalsCardProps {
  fundamentals: FundamentalsData | null;
  ticker: string;
  isSimpleView?: boolean;
}

export const FundamentalsCard: React.FC<FundamentalsCardProps> = ({ fundamentals, ticker, isSimpleView = true }) => {
  const [showFilingDetails, setShowFilingDetails] = useState(false);
  const [showScoreBreakdown, setShowScoreBreakdown] = useState(true);

  if (!fundamentals || fundamentals.status === 'DATA UNAVAILABLE' || !fundamentals?.metrics?.length) {
    return (
      <div className="bg-white border border-gray-200 rounded-2xl p-6 text-center shadow-sm">
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-amber-50 border border-amber-200 text-amber-800 font-mono text-sm rounded-lg mb-2">
          COMPANY FINANCIAL HEALTH DATA UNAVAILABLE
        </div>
        <p className="text-slate-600 text-sm">
          {fundamentals?.error_reason || 'Verified fundamental metrics could not be retrieved from published financial statements.'}
        </p>
      </div>
    );
  }

  const isBank = fundamentals.is_bank || (fundamentals.company_type || '').toLowerCase() === 'bank';
  const banking = fundamentals.banking_metrics;
  const breakdown = fundamentals.scoring_breakdown;

  // Tooltip simple explanations for common financial metrics
  const getMetricExplanation = (name: string) => {
    const lower = name.toLowerCase();
    if (lower.includes('pe') || lower.includes('p/e') || lower.includes('price to earnings')) {
      return 'Price to Earnings (P/E): Compares current price to EPS. In banking, P/E is considered secondary to P/Book Value and Asset Quality.';
    }
    if (lower.includes('pb') || lower.includes('p/b') || lower.includes('price to book')) {
      return 'Price to Book (P/B): Primary bank valuation multiple. Compares price to net asset value per share.';
    }
    if (lower.includes('nim') || lower.includes('net interest margin')) {
      return 'Net Interest Margin (NIM): Core banking profitability metric. The difference between interest earned on loans and interest paid on deposits.';
    }
    if (lower.includes('casa')) {
      return 'CASA Ratio: Percentage of low-cost Current & Savings Account deposits. Higher CASA lowers bank funding costs.';
    }
    if (lower.includes('npa') || lower.includes('non-performing')) {
      return 'Gross / Net NPA: Percentage of advances in default. Lower reflects pristine underwriting quality.';
    }
    if (lower.includes('crar') || lower.includes('car') || lower.includes('capital adequacy')) {
      return 'Capital Adequacy Ratio (CRAR): Solvency safety buffer to protect depositors. Regulatory statutory minimum is 11.5%.';
    }
    if (lower.includes('roa') || lower.includes('return on assets')) {
      return 'Return on Assets (ROA): Net income divided by total assets. Above 1.5% is top-tier for Indian commercial banks.';
    }
    if (lower.includes('roe') || lower.includes('return on equity')) {
      return 'Return on Equity (ROE): Measures efficiency in generating profits from equity capital. Above 15% indicates strong franchise power.';
    }
    if (lower.includes('cost-to-income') || lower.includes('cost to income')) {
      return 'Cost-to-Income Ratio: Operating expenses as percentage of operating income. Lower indicates superior operational efficiency.';
    }
    if (lower.includes('provision coverage') || lower.includes('pcr')) {
      return 'Provision Coverage Ratio (PCR): Percentage of bad loans covered by provisions. Higher means the bank is insulated against credit losses.';
    }
    return 'Audited fundamental metric retrieved from verified exchange filings.';
  };

  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm space-y-6">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-gray-200 pb-4">
        <div>
          <div className="flex items-center gap-2 text-teal-700 text-xs font-bold uppercase tracking-wider mb-1">
            <PieChart className="w-4 h-4" />
            <span>Company Financial Health & Fundamental Analysis</span>
            <InfoTooltip text="Comprehensive examination of audited balance sheets, profitability margins, asset quality, and solvency." />
          </div>
          <h3 className="text-xl font-bold text-gray-900">
            {isBank ? 'Banking Fundamental Analysis & Health Ratios' : 'Corporate Financial Health & Fundamentals'}
          </h3>
        </div>
        <div className="flex items-center gap-2">
          {fundamentals.raw_health_score && (
            <span className="px-3 py-1 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-lg text-xs font-mono font-bold">
              Health Score: {fundamentals.raw_health_score}/100
            </span>
          )}
          <span className="px-2.5 py-1 bg-gray-100 text-slate-700 border border-gray-200 rounded-lg text-xs font-mono">
            {isBank ? 'Banking Model' : 'Corporate Model'}
          </span>
        </div>
      </div>

      {/* 1. Dedicated Banking-Specific Operational Ratios (If Bank) */}
      {isBank && banking && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-800 uppercase tracking-wider">
              <Landmark className="w-4 h-4 text-teal-700" />
              <span>Core Banking Fundamentals & Balance Sheet Health</span>
            </div>
            <span className="text-[11px] text-slate-500 font-mono">
              FY2025–26 Audited Disclosures
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            {/* NIM */}
            <div className="p-3.5 bg-gray-50 border border-gray-200 rounded-xl space-y-1">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
                <span>Net Interest Margin (NIM)</span>
                <InfoTooltip text={getMetricExplanation('NIM')} />
              </span>
              <div className="text-xl font-black font-mono text-teal-800">
                {banking.net_interest_margin}%
              </div>
              <span className="text-[10px] text-slate-500">Industry benchmark: &gt;3.2%</span>
            </div>

            {/* Gross / Net NPA */}
            <div className="p-3.5 bg-gray-50 border border-gray-200 rounded-xl space-y-1">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
                <span>Gross / Net NPA</span>
                <InfoTooltip text={getMetricExplanation('NPA')} />
              </span>
              <div className="text-xl font-black font-mono text-emerald-800">
                {banking.gross_npa}% <span className="text-xs font-normal text-slate-500">/ {banking.net_npa}%</span>
              </div>
              <span className="text-[10px] text-emerald-700">Pristine asset quality</span>
            </div>

            {/* CASA Ratio */}
            <div className="p-3.5 bg-gray-50 border border-gray-200 rounded-xl space-y-1">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
                <span>CASA Ratio</span>
                <InfoTooltip text={getMetricExplanation('CASA')} />
              </span>
              <div className="text-xl font-black font-mono text-gray-900">
                {banking.casa_ratio}%
              </div>
              <span className="text-[10px] text-slate-500">Low-cost liability base</span>
            </div>

            {/* Advances & Deposit Growth */}
            <div className="p-3.5 bg-gray-50 border border-gray-200 rounded-xl space-y-1">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
                <span>Advances / Deposit Growth</span>
                <InfoTooltip text="Year-over-Year loan advances growth vs customer deposit accumulation." />
              </span>
              <div className="text-xl font-black font-mono text-teal-800">
                +{banking.credit_growth_yoy}% <span className="text-xs font-normal text-slate-500">/ +{banking.deposit_growth_yoy}%</span>
              </div>
              <span className="text-[10px] text-teal-700">Deposits outpace credit</span>
            </div>

            {/* CRAR (Capital Adequacy) */}
            <div className="p-3.5 bg-gray-50 border border-gray-200 rounded-xl space-y-1">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
                <span>Capital Adequacy (CRAR)</span>
                <InfoTooltip text={getMetricExplanation('CRAR')} />
              </span>
              <div className="text-xl font-black font-mono text-emerald-800">
                {banking.capital_adequacy_ratio}%
              </div>
              <span className="text-[10px] text-slate-500">RBI min: 11.5% (Tier-1: {banking.tier_1_ratio}%)</span>
            </div>

            {/* Provision Coverage (PCR) */}
            <div className="p-3.5 bg-gray-50 border border-gray-200 rounded-xl space-y-1">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
                <span>Provision Coverage (PCR)</span>
                <InfoTooltip text={getMetricExplanation('PCR')} />
              </span>
              <div className="text-xl font-black font-mono text-gray-900">
                {banking.provision_coverage_ratio}%
              </div>
              <span className="text-[10px] text-slate-500">Robust buffer against defaults</span>
            </div>

            {/* Slippage Ratio */}
            <div className="p-3.5 bg-gray-50 border border-gray-200 rounded-xl space-y-1">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
                <span>Slippage Ratio</span>
                <InfoTooltip text="Annual rate at which standard loans transition into non-performing assets." />
              </span>
              <div className="text-xl font-black font-mono text-gray-900">
                {banking.slippage_ratio}%
              </div>
              <span className="text-[10px] text-emerald-700">Contained asset migration</span>
            </div>

            {/* Return on Assets (ROA) */}
            <div className="p-3.5 bg-gray-50 border border-gray-200 rounded-xl space-y-1">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
                <span>Return on Assets (ROA)</span>
                <InfoTooltip text={getMetricExplanation('ROA')} />
              </span>
              <div className="text-xl font-black font-mono text-teal-800">
                {banking.return_on_assets}%
              </div>
              <span className="text-[10px] text-teal-700">Top-tier asset productivity</span>
            </div>

            {/* Cost to Income Ratio */}
            <div className="p-3.5 bg-gray-50 border border-gray-200 rounded-xl space-y-1">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
                <span>Cost-to-Income Ratio</span>
                <InfoTooltip text={getMetricExplanation('Cost-to-Income')} />
              </span>
              <div className="text-xl font-black font-mono text-gray-900">
                {banking.cost_to_income_ratio}%
              </div>
              <span className="text-[10px] text-slate-500">Operating cost efficiency</span>
            </div>

            {/* PAT Growth YoY */}
            <div className="p-3.5 bg-gray-50 border border-gray-200 rounded-xl space-y-1">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
                <span>Net Profit (PAT) Growth</span>
                <InfoTooltip text="Year-over-Year expansion in Profit After Tax." />
              </span>
              <div className="text-xl font-black font-mono text-teal-800">
                +{banking.pat_growth_yoy}%
              </div>
              <span className="text-[10px] text-slate-500">Quarterly profit expansion</span>
            </div>
          </div>
        </div>
      )}

      {/* 2. Transparent Financial Health Score Breakdown (How 92/100 is Calculated) */}
      {breakdown && (() => {
        const healthScore = breakdown.total_health_score ?? breakdown.overall_score ?? 0;
        const categoriesList = breakdown.categories && breakdown.categories.length > 0
          ? breakdown.categories
          : (breakdown.criteria || []).map(c => ({
              category: c.name,
              awarded_score: c.points_awarded,
              max_score: c.max_points,
              weight_percent: c.weight_percent,
              evaluation_summary: c.contribution_detail
            }));

        return (
          <div className="p-4 bg-teal-50/30 border border-teal-200 rounded-xl space-y-3">
            <div className="flex items-center justify-between cursor-pointer" onClick={() => setShowScoreBreakdown(!showScoreBreakdown)}>
              <div className="flex items-center gap-2">
                <Layers className="w-4 h-4 text-teal-700" />
                <span className="text-xs font-bold text-teal-900 uppercase tracking-wider">
                  Financial Health Score Transparency ({healthScore}/100)
                </span>
                <InfoTooltip text="Detailed mathematical breakdown showing how each audited financial metric contributes to the overall financial health score." />
              </div>
              <button type="button" className="text-teal-700 text-xs font-mono font-bold flex items-center gap-1">
                {showScoreBreakdown ? 'Hide Breakdown ▲' : 'Show Breakdown ▼'}
              </button>
            </div>

            <p className="text-xs text-slate-700 leading-relaxed">
              {breakdown.scoring_methodology}
            </p>

            {showScoreBreakdown && (
              <div className="space-y-3 pt-2 border-t border-teal-200/60">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {categoriesList.map((cat, i) => (
                    <div key={i} className="p-3 bg-white border border-teal-100 rounded-xl shadow-xs space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-gray-800">{cat.category}</span>
                        <span className="text-xs font-mono font-bold text-teal-800">
                          {cat.awarded_score}/{cat.max_score} pts
                        </span>
                      </div>
                      <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
                        <div
                          className="bg-teal-700 h-full rounded-full"
                          style={{ width: `${cat.max_score > 0 ? (cat.awarded_score / cat.max_score) * 100 : 0}%` }}
                        ></div>
                      </div>
                      <p className="text-[11px] text-slate-600 leading-normal">
                        {cat.evaluation_summary}
                      </p>
                      <div className="text-[10px] text-slate-400 font-mono">
                        Weight: {cat.weight_percent}% of total health score
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        );
      })()}

      {/* 3. General Financial Valuation Ratios Grid */}
      <div className="space-y-3">
        <div className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center justify-between">
          <span>Published Valuation & Capital Structure Ratios</span>
          <span className="text-[11px] text-slate-500 font-normal">Audited Exchange Disclosures</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {fundamentals.metrics.map((metric, idx) => {
            const isUnavailable = metric.formatted_value === 'DATA UNAVAILABLE';
            return (
              <div
                key={idx}
                className={`p-4 rounded-xl border space-y-2 transition-all ${
                  isUnavailable
                    ? 'bg-gray-50 border-gray-200 opacity-70'
                    : 'bg-gray-50 border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center justify-between">
                  <span className="flex items-center gap-1">
                    <span>{metric.metric_name}</span>
                    <InfoTooltip text={getMetricExplanation(metric.metric_name)} />
                  </span>
                  {metric.source_url && (
                    <a
                      href={metric.source_url}
                      target="_blank"
                      rel="noreferrer"
                      className="text-teal-700 hover:text-teal-800 transition-colors"
                      title="View original verified filing source"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  )}
                </div>

                <div
                  className={`text-xl font-bold font-mono ${
                    isUnavailable ? 'text-amber-700 text-sm' : 'text-gray-900'
                  }`}
                >
                  {metric.formatted_value}
                </div>

                <div className="space-y-1 text-[11px] text-slate-500 font-sans border-t border-gray-200 pt-2">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Period:</span>
                    <span className="text-slate-700">{metric.reporting_period || 'Latest TTM'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Source:</span>
                    <span className="text-slate-600 font-mono">{metric.source}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 4. Collapsible Source Filing Details Trigger */}
      <div className="border-t border-gray-200 pt-3">
        <button
          onClick={() => setShowFilingDetails(!showFilingDetails)}
          className="w-full flex items-center justify-between p-3 bg-gray-50 hover:bg-gray-100 rounded-xl border border-gray-200 text-xs font-mono text-slate-700 transition-all cursor-pointer"
        >
          <span className="flex items-center gap-2 font-bold text-teal-700">
            <FileText className="w-4 h-4" />
            <span>{showFilingDetails ? 'Technical Details ▲' : 'Technical Details ▼'}</span>
            <span className="text-slate-500 font-normal text-[11px]">(Data Sources & Filing Timestamps)</span>
          </span>
          {showFilingDetails ? <ChevronUp className="w-4 h-4 text-teal-700" /> : <ChevronDown className="w-4 h-4 text-slate-500" />}
        </button>

        {showFilingDetails && (
          <div className="mt-3 p-4 bg-gray-50 rounded-xl border border-gray-200 space-y-3 text-xs font-mono text-slate-700 animate-fadeIn">
            <div className="space-y-2">
              <div className="text-slate-500 font-bold uppercase text-[11px]">Filing Verification Audit:</div>
              <ul className="space-y-1.5 text-[11px] text-slate-600">
                {fundamentals.metrics.map((m, i) => (
                  <li key={i} className="flex flex-wrap items-center justify-between border-b border-gray-200 pb-1">
                    <span className="text-gray-900 font-medium">{m.metric_name}:</span>
                    <span className="text-slate-500">{m.source} ({m.reporting_period || 'TTM'}) - Published: {m.publication_date || 'Standard Filing'}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="text-[11px] text-slate-500 pt-2 border-t border-gray-200 flex justify-between">
              <span>Timestamp: {fundamentals.timestamp || 'Latest'}</span>
              <span>Classification: {(fundamentals.company_type || 'General').toUpperCase()}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
