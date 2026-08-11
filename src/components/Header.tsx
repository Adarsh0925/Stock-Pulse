import React, { useState } from 'react';
import { Search, RefreshCw, TrendingUp, TrendingDown, Clock, ShieldCheck, Activity, BarChart2, Cpu, BookOpen, Layers, Globe, Shield, Lock, Newspaper } from 'lucide-react';
import { Nifty50Data, CompanySearchResult } from '../types';

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
  onToggleAdminMode
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

  return (
    <header className="border-b border-slate-800 bg-slate-900/95 backdrop-blur-md sticky top-0 z-50 shadow-xl">
      {/* 1. Live Market Ticker Banner across top */}
      <div className="bg-slate-950 px-4 py-1.5 border-b border-slate-800/80 text-xs flex flex-wrap items-center justify-between gap-3 text-slate-300 font-mono">
        <div className="flex flex-wrap items-center gap-4">
          <span className="flex items-center gap-1.5 font-bold text-cyan-400">
            <Activity className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
            NIFTY 50
          </span>

          {niftyData && typeof niftyData.current_price === 'number' ? (
            <div className="flex items-center gap-2">
              <span className="text-slate-100 font-bold">
                {niftyData.current_price.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </span>
              <span className={`flex items-center font-semibold ${isNiftyPositive ? 'text-emerald-400' : 'text-rose-400'}`}>
                {isNiftyPositive ? <TrendingUp className="w-3 h-3 mr-0.5" /> : <TrendingDown className="w-3 h-3 mr-0.5" />}
                {isNiftyPositive ? '+' : ''}{niftyData.change} ({isNiftyPositive ? '+' : ''}{niftyData.change_percent}%)
              </span>
            </div>
          ) : (
            <span className="text-amber-400 font-semibold bg-amber-950/40 px-2 py-0.5 rounded border border-amber-800/40">
              DATA UNAVAILABLE
            </span>
          )}

          <div className="hidden sm:flex items-center gap-2 border-l border-slate-800 pl-3 text-[11px]">
            <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
              niftyData?.market_status === 'OPEN' 
                ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-800/60' 
                : 'bg-amber-950/80 text-amber-300 border border-amber-800/60'
            }`}>
              {niftyData?.market_status || 'MARKET CLOSED'}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-4 text-[11px] text-slate-400">
          <span className="hidden lg:inline-flex items-center gap-1">
            <Clock className="w-3 h-3 text-slate-500" />
            {niftyData?.timestamp || 'Latest session'}
          </span>
          <span className="hidden sm:inline-flex items-center gap-1 text-slate-300">
            <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
            NSE & Yahoo Finance Feeds
          </span>
        </div>
      </div>

      {/* 2. Main Navigation Bar & Branding */}
      <div className="max-w-7xl mx-auto px-4 py-3 flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Brand Logo & Website Title */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center font-black text-slate-950 shadow-lg shadow-cyan-500/20 text-lg">
            ST
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-bold text-slate-100 leading-tight">StockPulse</h1>
              <span className="bg-cyan-950 text-cyan-300 text-[10px] font-mono px-2 py-0.5 rounded border border-cyan-800 font-bold uppercase">
                Web Portal
              </span>
            </div>
            <p className="text-xs text-slate-400">Equity Research • Technicals • VADER NLP • Scikit ML</p>
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
              placeholder="Search company or ticker (e.g. Reliance, TCS, NVDA)..."
              className="w-full pl-9 pr-10 py-2 bg-slate-950 border border-slate-700/80 rounded-xl text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500 font-medium"
            />
            {isSearching && (
              <RefreshCw className="w-4 h-4 absolute right-3 text-cyan-400 animate-spin" />
            )}
          </div>

          {/* Autocomplete Results Dropdown */}
          {showDropdown && searchResults.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-slate-900 border border-slate-700/80 rounded-xl shadow-2xl z-50 overflow-hidden divide-y divide-slate-800">
              <div className="px-3 py-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider bg-slate-950/60 font-mono">
                Verified Search Results
              </div>
              {searchResults.map((item, idx) => (
                <button
                  key={`${item.ticker}-${idx}`}
                  onClick={() => handleSelect(item)}
                  className="w-full text-left px-3 py-2.5 hover:bg-slate-800/80 transition-colors flex items-center justify-between group cursor-pointer"
                >
                  <div>
                    <div className="text-sm font-semibold text-slate-200 group-hover:text-cyan-400 transition-colors">
                      {item.name}
                    </div>
                    <div className="text-xs text-slate-400 flex items-center gap-2">
                      <span className="font-mono text-cyan-400">{item.ticker}</span>
                      <span>•</span>
                      <span>{item.sector || 'General'}</span>
                    </div>
                  </div>
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 bg-slate-800 text-slate-300 rounded border border-slate-700">
                    {item.exchange}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Global Refresh Data Action */}
        <div className="flex items-center gap-2 self-end md:self-auto">
          <button
            onClick={onRefresh}
            disabled={isRefreshing}
            className="flex items-center gap-2 px-3 py-2 bg-slate-800 hover:bg-slate-700 active:bg-slate-900 border border-slate-700/80 rounded-xl text-xs font-semibold text-slate-200 transition-all disabled:opacity-50 cursor-pointer shadow-sm"
            title="Refresh verified market data"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-cyan-400 ${isRefreshing ? 'animate-spin' : ''}`} />
            <span>{isRefreshing ? 'Refreshing Data...' : 'Refresh Market Data'}</span>
          </button>
        </div>
      </div>

      {/* 3. Primary Website Navigation Tabs */}
      <div className="bg-slate-950/80 border-t border-slate-800 px-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-2 overflow-x-auto py-2 text-xs font-mono no-scrollbar">
          <div className="flex items-center gap-1">
            <button
              onClick={() => onSelectTab('screener')}
              className={`px-4 py-2 rounded-xl flex items-center gap-2 transition-all font-bold cursor-pointer whitespace-nowrap ${
                activeTab === 'screener'
                  ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/10'
                  : 'text-slate-300 hover:text-slate-100 hover:bg-slate-900'
              }`}
            >
              <Globe className="w-4 h-4" />
              <span>Stock Screener</span>
            </button>

            <button
              onClick={() => onSelectTab('research')}
              className={`px-4 py-2 rounded-xl flex items-center gap-2 transition-all font-bold cursor-pointer whitespace-nowrap ${
                activeTab === 'research'
                  ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/10'
                  : 'text-slate-300 hover:text-slate-100 hover:bg-slate-900'
              }`}
            >
              <BarChart2 className="w-4 h-4" />
              <span>Research Dashboard</span>
            </button>

            <button
              onClick={() => onSelectTab('dictionary')}
              className={`px-4 py-2 rounded-xl flex items-center gap-2 transition-all font-bold cursor-pointer whitespace-nowrap ${
                activeTab === 'dictionary'
                  ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/10'
                  : 'text-slate-300 hover:text-slate-100 hover:bg-slate-900'
              }`}
            >
              <BookOpen className="w-4 h-4 text-cyan-400" />
              <span>Financial Dictionary</span>
            </button>

            <button
              onClick={() => onSelectTab('custom-news')}
              className={`px-4 py-2 rounded-xl flex items-center gap-2 transition-all font-bold cursor-pointer whitespace-nowrap ${
                activeTab === 'custom-news'
                  ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/10'
                  : 'text-slate-300 hover:text-slate-100 hover:bg-slate-900'
              }`}
            >
              <Newspaper className="w-4 h-4 text-cyan-400" />
              <span>Custom News Analyzer</span>
            </button>

            {/* Hidden / Internal Admin Tabs */}
            {isAdminMode && (
              <>
                <div className="h-4 w-px bg-slate-800 mx-1"></div>
                <button
                  onClick={() => onSelectTab('ml')}
                  className={`px-3 py-1.5 rounded-xl flex items-center gap-1.5 transition-all font-bold cursor-pointer whitespace-nowrap text-xs ${
                    activeTab === 'ml'
                      ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/10'
                      : 'text-amber-400 bg-amber-950/40 border border-amber-800/40 hover:bg-amber-900/60'
                  }`}
                >
                  <Cpu className="w-3.5 h-3.5" />
                  <span>ML Hub (Admin)</span>
                </button>

                <button
                  onClick={() => onSelectTab('methodology')}
                  className={`px-3 py-1.5 rounded-xl flex items-center gap-1.5 transition-all font-bold cursor-pointer whitespace-nowrap text-xs ${
                    activeTab === 'methodology'
                      ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/10'
                      : 'text-amber-400 bg-amber-950/40 border border-amber-800/40 hover:bg-amber-900/60'
                  }`}
                >
                  <BookOpen className="w-3.5 h-3.5" />
                  <span>Methodology (Admin)</span>
                </button>
              </>
            )}
          </div>

          {/* Internal Admin Console Toggle Button */}
          {onToggleAdminMode && (
            <button
              onClick={onToggleAdminMode}
              className={`px-3 py-1.5 rounded-xl border flex items-center gap-1.5 text-[11px] font-bold transition-all cursor-pointer whitespace-nowrap ${
                isAdminMode
                  ? 'bg-amber-950 text-amber-300 border-amber-700/80'
                  : 'bg-slate-900 text-slate-400 border-slate-800 hover:border-slate-700 hover:text-slate-300'
              }`}
              title="Toggle Internal Developer / Admin Mode"
            >
              <Lock className="w-3 h-3 text-amber-400" />
              <span>{isAdminMode ? 'Admin Mode ACTIVE' : 'Admin Console'}</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
