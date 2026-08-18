import React, { useState } from 'react';
import { Search, RefreshCw, TrendingUp, TrendingDown, ShieldCheck, Activity, BarChart2, BookOpen, Globe, Lock, Newspaper, Sparkles, Calendar, Sun, Moon } from 'lucide-react';
import { Nifty50Data, CompanySearchResult } from '../types';
import { getClientSessionInfo } from '../utils/marketTimeValidator';

interface HeaderProps {
  niftyData: Nifty50Data | null;
  onSearch: (query: string) => void;
  onSelectCompany: (result: CompanySearchResult) => void;
  searchResults: CompanySearchResult[];
  isSearching: boolean;
  onRefresh: () => void;
  isRefreshing: boolean;
  selectedTicker: string;
  activeTab: string;
  onSelectTab: (tab: string) => void;
  isAdminMode?: boolean;
  onToggleAdminMode?: () => void;
  isSimpleView?: boolean;
  onToggleSimpleView?: () => void;
  theme?: 'light' | 'dark';
  onToggleTheme?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  niftyData,
  onSearch,
  onSelectCompany,
  searchResults,
  isSearching,
  onRefresh,
  isRefreshing,
  selectedTicker,
  activeTab,
  onSelectTab,
  isAdminMode = false,
  onToggleAdminMode,
  isSimpleView = true,
  onToggleSimpleView,
  theme = 'light',
  onToggleTheme,
}) => {
  const [query, setQuery] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setQuery(val);
    if (val.length >= 2) {
      onSearch(val);
      setShowDropdown(true);
    } else {
      setShowDropdown(false);
    }
  };

  const handleSelect = (item: CompanySearchResult) => {
    setQuery(item.name);
    setShowDropdown(false);
    onSelectCompany(item);
    onSelectTab('research');
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && query.trim()) {
      setShowDropdown(false);
      onSelectCompany({ ticker: query.trim(), name: query.trim(), exchange: 'NSE' });
      onSelectTab('research');
    }
  };

  const isNiftyPositive = (niftyData?.change ?? 0) >= 0;
  const sessionInfo = niftyData?.session_info || getClientSessionInfo();
  const isMarketOpen = niftyData?.session_info?.isMarketOpen ?? (niftyData?.status === 'LIVE' || niftyData?.market_status === 'LIVE' || niftyData?.market_status === 'OPEN');

  return (
    <header className="border-b border-gray-200 bg-white sticky top-0 z-50 shadow-sm">
      {/* 1. Market Status Bar across top */}
      <div className="bg-gray-50 px-4 py-1.5 border-b border-gray-200 text-xs flex flex-wrap items-center justify-between gap-3 text-slate-600 font-sans">
        <div className="flex flex-wrap items-center gap-3">
          <span className="flex items-center gap-1.5 font-bold text-teal-700">
            <Activity className="w-3.5 h-3.5 text-teal-700 animate-pulse" />
            NIFTY 50 Index
          </span>

          {niftyData && typeof niftyData.current_price === 'number' ? (
            <div className="flex items-center gap-2">
              <span className="text-gray-900 font-bold font-mono text-sm">
                ₹{niftyData.current_price.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
              <span className={`flex items-center font-semibold font-mono text-xs ${isNiftyPositive ? 'text-emerald-600' : 'text-red-600'}`}>
                {isNiftyPositive ? <TrendingUp className="w-3 h-3 mr-0.5" /> : <TrendingDown className="w-3 h-3 mr-0.5" />}
                {isNiftyPositive ? '+' : ''}{Number(niftyData.change).toFixed(2)} ({isNiftyPositive ? '+' : ''}{Number(niftyData.change_percent).toFixed(2)}%)
              </span>
            </div>
          ) : (
            <span className="text-amber-700 font-semibold bg-amber-50 px-2 py-0.5 rounded border border-amber-200 text-[11px]">
              Data unavailable
            </span>
          )}

          {/* Market Status & Verified Session Badges */}
          <div className="flex items-center gap-2 border-l border-gray-200 pl-3">
            <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
              isMarketOpen 
                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' 
                : 'bg-amber-50 text-amber-700 border border-amber-200'
            }`}>
              {isMarketOpen ? '● Market Live' : 'Market Closed'}
            </span>
            <span className="inline-flex items-center gap-1 text-[11px] text-slate-600 font-medium bg-white px-2 py-0.5 rounded border border-gray-200">
              <Calendar className="w-3 h-3 text-teal-700" />
              Verified Session: <strong className="text-gray-900 font-bold">{sessionInfo.lastTradingFormatted}</strong>
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3 text-[11px] text-slate-500">
          <span className="inline-flex items-center gap-1 text-slate-600">
            <ShieldCheck className="w-3.5 h-3.5 text-teal-700" />
            Multi-Source Verified Data
          </span>
        </div>
      </div>

      {/* 2. Main Navigation Bar & Branding */}
      <div className="max-w-7xl mx-auto px-4 py-3 flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Brand Logo & Website Title */}
        <div className="flex items-center gap-3 cursor-pointer" onClick={() => onSelectTab('nifty-sentiment')}>
          <div className="w-10 h-10 rounded-xl bg-teal-700 flex items-center justify-center font-black text-white shadow-sm text-lg shrink-0">
            SP
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-bold text-gray-900 leading-tight">StockPulse</h1>
              <span className="bg-teal-50 text-teal-700 text-[10px] font-mono px-2 py-0.5 rounded border border-teal-200 font-bold uppercase">
                Market Research
              </span>
            </div>
            <p className="text-xs text-slate-500">Understand the Stock Market Using Data</p>
          </div>
        </div>

        {/* Company Search Input */}
        <div className="relative w-full md:w-80">
          <div className="relative flex items-center">
            <Search className="w-4 h-4 absolute left-3 text-slate-400 pointer-events-none" />
            <input
              type="text"
              value={query}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              onFocus={() => query.length >= 2 && setShowDropdown(true)}
              placeholder="Search company or stock symbol..."
              className="w-full pl-9 pr-10 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-900 placeholder-slate-400 focus:outline-none focus:border-teal-700 focus:bg-white font-medium transition-colors"
            />
            {isSearching && (
              <RefreshCw className="w-4 h-4 absolute right-3 text-teal-700 animate-spin" />
            )}
          </div>

          {/* Autocomplete Results Dropdown */}
          {showDropdown && searchResults.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-xl shadow-lg z-50 overflow-hidden divide-y divide-gray-100">
              <div className="px-3 py-1.5 text-[10px] font-bold text-slate-500 uppercase tracking-wider bg-gray-50 font-mono">
                Matching Companies
              </div>
              {searchResults.map((item, idx) => (
                <button
                  key={`${item.ticker}-${idx}`}
                  onClick={() => handleSelect(item)}
                  className="w-full text-left px-3 py-2.5 hover:bg-teal-50/50 transition-colors flex items-center justify-between group cursor-pointer"
                >
                  <div>
                    <div className="text-sm font-semibold text-gray-900 group-hover:text-teal-700 transition-colors">
                      {item.name}
                    </div>
                    <div className="text-xs text-slate-500 flex items-center gap-2">
                      <span className="font-mono text-teal-700">{item.ticker}</span>
                      <span>•</span>
                      <span>{item.sector || 'General'}</span>
                    </div>
                  </div>
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 bg-gray-100 text-slate-700 rounded border border-gray-200">
                    {item.exchange}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Global Refresh Data Action & Theme Toggle */}
        <div className="flex items-center gap-2 self-end md:self-auto">
          {onToggleTheme && (
            <button
              onClick={onToggleTheme}
              className="flex items-center gap-1.5 px-3 py-2 bg-white hover:bg-gray-50 active:bg-gray-100 border border-gray-200 rounded-xl text-xs font-semibold text-gray-800 transition-all cursor-pointer shadow-sm"
              title={theme === 'dark' ? 'Switch to Light Theme' : 'Switch to Dark Theme'}
            >
              {theme === 'dark' ? (
                <>
                  <Sun className="w-3.5 h-3.5 text-amber-400" />
                  <span>Light Theme</span>
                </>
              ) : (
                <>
                  <Moon className="w-3.5 h-3.5 text-slate-600" />
                  <span>Dark Theme</span>
                </>
              )}
            </button>
          )}

          <button
            onClick={onRefresh}
            disabled={isRefreshing}
            className="flex items-center gap-2 px-3 py-2 bg-white hover:bg-gray-50 active:bg-gray-100 border border-gray-200 rounded-xl text-xs font-semibold text-gray-800 transition-all disabled:opacity-50 cursor-pointer shadow-sm"
            title="Refresh verified market data"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-teal-700 ${isRefreshing ? 'animate-spin' : ''}`} />
            <span>{isRefreshing ? 'Updating...' : 'Update Data'}</span>
          </button>
        </div>
      </div>

      {/* 3. Primary Website Navigation Tabs */}
      <div className="bg-white border-t border-gray-200 px-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-2 overflow-x-auto py-2 text-xs font-sans no-scrollbar">
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => onSelectTab('nifty-sentiment')}
              className={`px-3.5 py-2 rounded-xl flex items-center gap-2 transition-all font-semibold cursor-pointer whitespace-nowrap ${
                activeTab === 'nifty-sentiment'
                  ? 'bg-teal-700 text-white font-bold shadow-sm'
                  : 'text-slate-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              <Activity className="w-4 h-4" />
              <span>NIFTY Sentiment Analysis</span>
            </button>

            <button
              onClick={() => onSelectTab('screener')}
              className={`px-3.5 py-2 rounded-xl flex items-center gap-2 transition-all font-semibold cursor-pointer whitespace-nowrap ${
                activeTab === 'screener'
                  ? 'bg-teal-700 text-white font-bold shadow-sm'
                  : 'text-slate-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              <Globe className="w-4 h-4" />
              <span>Stock Screener</span>
            </button>

            <button
              onClick={() => onSelectTab('research')}
              className={`px-3.5 py-2 rounded-xl flex items-center gap-2 transition-all font-semibold cursor-pointer whitespace-nowrap ${
                activeTab === 'research'
                  ? 'bg-teal-700 text-white font-bold shadow-sm'
                  : 'text-slate-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              <BarChart2 className="w-4 h-4" />
              <span>Research Dashboard</span>
            </button>

            <button
              onClick={() => onSelectTab('custom-news')}
              className={`px-3.5 py-2 rounded-xl flex items-center gap-2 transition-all font-semibold cursor-pointer whitespace-nowrap ${
                activeTab === 'custom-news'
                  ? 'bg-teal-700 text-white font-bold shadow-sm'
                  : 'text-slate-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              <Newspaper className="w-4 h-4" />
              <span>Custom News Analyzer</span>
            </button>

            <button
              onClick={() => onSelectTab('dictionary')}
              className={`px-3.5 py-2 rounded-xl flex items-center gap-2 transition-all font-semibold cursor-pointer whitespace-nowrap ${
                activeTab === 'dictionary'
                  ? 'bg-teal-700 text-white font-bold shadow-sm'
                  : 'text-slate-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              <BookOpen className="w-4 h-4" />
              <span>Financial Dictionary</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            {/* Simple View / Detailed View Switch */}
            {onToggleSimpleView && (
              <button
                onClick={onToggleSimpleView}
                className={`px-3 py-1.5 rounded-lg border flex items-center gap-1.5 text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
                  isSimpleView
                    ? 'bg-teal-50 text-teal-700 border-teal-200'
                    : 'bg-gray-50 text-slate-600 border-gray-200 hover:bg-gray-100 hover:text-gray-900'
                }`}
                title="Toggle between Simple View (easy to read) and Detailed View"
              >
                <Sparkles className="w-3.5 h-3.5 text-teal-700" />
                <span>{isSimpleView ? 'Simple View: ON' : 'Detailed View'}</span>
              </button>
            )}

            {/* Discreet Developer / Evaluator Mode Toggle */}
            {onToggleAdminMode && (
              <button
                onClick={onToggleAdminMode}
                className={`px-2.5 py-1.5 rounded-lg border flex items-center gap-1.5 text-[11px] font-mono transition-all cursor-pointer whitespace-nowrap ${
                  isAdminMode
                    ? 'bg-amber-50 text-amber-700 border-amber-200 font-bold'
                    : 'bg-gray-50 text-slate-500 border-gray-200 hover:bg-gray-100 hover:text-gray-800'
                }`}
                title="Toggle Evaluator & Developer tools"
              >
                <Lock className="w-3 h-3 text-amber-600" />
                <span>{isAdminMode ? 'Evaluator Mode' : 'Evaluator'}</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};


