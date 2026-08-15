import React, { useState } from 'react';
import { DollarSign, PieChart, ExternalLink, ShieldCheck, ChevronDown, ChevronUp, FileText } from 'lucide-react';
import { FundamentalsData } from '../types';
import { InfoTooltip } from './InfoTooltip';

interface FundamentalsCardProps {
  fundamentals: FundamentalsData | null;
  ticker: string;
  isSimpleView?: boolean;
}

export const FundamentalsCard: React.FC<FundamentalsCardProps> = ({ fundamentals, ticker, isSimpleView = true }) => {
  const [showFilingDetails, setShowFilingDetails] = useState(false);

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

  const isBank = fundamentals.company_type === 'bank';

  // Tooltip simple explanations for common financial metrics
  const getMetricExplanation = (name: string) => {
    const lower = name.toLowerCase();
    if (lower.includes('pe') || lower.includes('p/e') || lower.includes('price to earnings')) {
      return 'Price to Earnings (P/E): Compares the current share price to the company’s profit per share. A lower number often means you pay less for each rupee of profit.';
    }
    if (lower.includes('pb') || lower.includes('p/b') || lower.includes('price to book')) {
      return 'Price to Book (P/B): Compares market price to the company’s book value (net worth). It shows how much you pay relative to the company’s actual physical and cash assets.';
    }
    if (lower.includes('roe') || lower.includes('return on equity')) {
      return 'Return on Equity (ROE): Measures how efficiently management generates profit from shareholder investments. Above 15% is generally considered strong.';
    }
    if (lower.includes('debt') || lower.includes('debt to equity')) {
      return 'Debt to Equity: Shows how much debt the company uses to fund its operations relative to its own capital. A lower ratio generally indicates lower financial risk.';
    }
    if (lower.includes('dividend') || lower.includes('yield')) {
      return 'Dividend Yield: The annual cash dividend payout as a percentage of the share price.';
    }
    if (lower.includes('eps') || lower.includes('earnings per share')) {
      return 'Earnings Per Share (EPS): Net company profit divided by total outstanding shares.';
    }
    if (lower.includes('margin') || lower.includes('profit margin')) {
      return 'Profit Margin: The percentage of total revenue that remains as pure profit after paying all expenses.';
    }
    if (lower.includes('npa') || lower.includes('asset quality')) {
      return 'Asset Quality / NPA: Percentage of bank loans at risk of default. Lower is healthier for banks.';
    }
    if (lower.includes('capital adequacy') || lower.includes('car')) {
      return 'Capital Adequacy Ratio (CAR): Capital cushion a bank holds to protect depositors from unexpected losses.';
    }
    return 'Financial ratio retrieved from verified quarterly and annual corporate reports.';
  };

  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm space-y-5">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-gray-200 pb-4">
        <div>
          <div className="flex items-center gap-2 text-teal-700 text-xs font-bold uppercase tracking-wider mb-1">
            <PieChart className="w-4 h-4" />
            <span>Company Financial Health</span>
            <InfoTooltip text="Evaluates published company financial statements, profitability metrics, and debt levels." />
          </div>
          <h3 className="text-xl font-bold text-gray-900">
            Company Financial Health
          </h3>
        </div>
        <span className="px-2.5 py-1 bg-gray-100 text-slate-700 border border-gray-200 rounded-lg text-xs font-mono">
          {isBank ? 'Banking Model' : 'Corporate Model'}
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

      {/* Collapsible Source Filing Trigger */}
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
              <span>Timestamp: {fundamentals.timestamp}</span>
              <span>Classification: {fundamentals.company_type.toUpperCase()}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
