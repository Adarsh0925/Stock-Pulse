import React from 'react';
import { Activity, ShieldCheck, Cpu, ExternalLink, Globe, Layers, Lock, Sun, Moon } from 'lucide-react';

interface FooterProps {
  onSelectTab: (tab: string) => void;
  activeTab: string;
  onToggleAdminMode?: () => void;
  isAdminMode?: boolean;
  theme?: 'light' | 'dark';
  onToggleTheme?: (theme: 'light' | 'dark') => void;
}

export const Footer: React.FC<FooterProps> = ({ onSelectTab, onToggleAdminMode, isAdminMode, theme = 'light', onToggleTheme }) => {
  return (
    <footer className="border-t border-gray-200 bg-white text-slate-500 font-sans mt-12">
      {/* Upper Footer Links & Branding */}
      <div className="max-w-7xl mx-auto px-4 py-12 grid grid-cols-1 md:grid-cols-4 gap-8">
        {/* Brand & Mission */}
        <div className="space-y-4 md:col-span-1">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-teal-700 flex items-center justify-center font-black text-white text-sm shadow-sm">
              ST
            </div>
            <span className="font-bold text-gray-900 text-base">StockPulse Web Portal</span>
          </div>
          <p className="text-xs text-slate-500 leading-relaxed">
            Institutional-grade web portal for stock market analysis, quantitative technical indicators, financial VADER NLP sentiment, and machine learning directional models.
          </p>
          <div className="flex items-center gap-2 text-[11px] font-mono text-emerald-700">
            <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse"></span>
            Node.js Express Analytics Engine Online
          </div>
        </div>

        {/* Website Navigation Sitemap */}
        <div className="space-y-3">
          <h4 className="text-xs font-bold text-gray-900 uppercase tracking-wider font-mono">Website Sections</h4>
          <ul className="space-y-2 text-xs font-medium">
            <li>
              <button onClick={() => onSelectTab('nifty-sentiment')} className="hover:text-teal-700 transition-colors cursor-pointer text-slate-600">
                ⚡ NIFTY Sentiment Analysis
              </button>
            </li>
            <li>
              <button onClick={() => onSelectTab('screener')} className="hover:text-teal-700 transition-colors cursor-pointer text-slate-600">
                📈 Stock Screener & Watchlist
              </button>
            </li>
            <li>
              <button onClick={() => onSelectTab('research')} className="hover:text-teal-700 transition-colors cursor-pointer text-slate-600">
                📊 Live Research Dashboard
              </button>
            </li>
            <li>
              <button onClick={() => onSelectTab('custom-news')} className="hover:text-teal-700 transition-colors cursor-pointer text-slate-600">
                📰 Custom News Analyzer
              </button>
            </li>
            <li>
              <button onClick={() => onSelectTab('dictionary')} className="hover:text-teal-700 transition-colors cursor-pointer text-slate-600">
                📖 Financial Lexicon & Dictionary
              </button>
            </li>
            {onToggleAdminMode && (
              <li>
                <button
                  onClick={onToggleAdminMode}
                  className="hover:text-amber-700 text-amber-700 transition-colors cursor-pointer flex items-center gap-1 font-mono text-[11px]"
                >
                  <Lock className="w-3 h-3" />
                  <span>{isAdminMode ? 'Admin Console (Active)' : 'Admin / Internal Console'}</span>
                </button>
              </li>
            )}
          </ul>
        </div>

        {/* Supported Exchanges & Feeds */}
        <div className="space-y-3">
          <h4 className="text-xs font-bold text-gray-900 uppercase tracking-wider font-mono">Market Feeds</h4>
          <ul className="space-y-2 text-xs font-medium text-slate-600">
            <li className="flex items-center gap-1.5">
              <Globe className="w-3.5 h-3.5 text-teal-700" />
              <span>National Stock Exchange (NSE India)</span>
            </li>
            <li className="flex items-center gap-1.5">
              <Globe className="w-3.5 h-3.5 text-teal-700" />
              <span>NASDAQ & NYSE (US Global)</span>
            </li>
            <li className="flex items-center gap-1.5">
              <Activity className="w-3.5 h-3.5 text-emerald-600" />
              <span>Latest NIFTY 50 Index Feed</span>
            </li>
            <li className="flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-teal-700" />
              <span>Verified Yahoo Finance Data Sources</span>
            </li>
          </ul>
        </div>

        {/* Theme Selection */}
        <div className="space-y-4">
          <div className="space-y-2">
            <h4 className="text-xs font-bold text-gray-900 uppercase tracking-wider font-mono">Theme Mode</h4>
            <div className="bg-gray-50 border border-gray-200 rounded-xl p-2.5 flex items-center gap-2">
              <button
                type="button"
                onClick={() => onToggleTheme && onToggleTheme('light')}
                className={`flex-1 py-1.5 px-2.5 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  theme === 'light'
                    ? 'bg-white text-teal-700 shadow-sm border border-gray-200 font-bold'
                    : 'text-slate-500 hover:text-gray-900'
                }`}
              >
                <Sun className="w-3.5 h-3.5 text-amber-500" />
                <span>Light</span>
              </button>
              <button
                type="button"
                onClick={() => onToggleTheme && onToggleTheme('dark')}
                className={`flex-1 py-1.5 px-2.5 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  theme === 'dark'
                    ? 'bg-teal-700 text-white shadow-sm border border-teal-800 font-bold'
                    : 'text-slate-500 hover:text-gray-900'
                }`}
              >
                <Moon className="w-3.5 h-3.5 text-slate-400" />
                <span>Dark</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Full Horizontal Width Market Data Notice */}
      <div className="max-w-7xl mx-auto px-4 pb-10">
        <div className="w-full bg-slate-900 border-2 border-amber-500/60 rounded-2xl p-5 md:p-6 shadow-md flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-start md:items-center gap-4 flex-1">
            <div className="w-11 h-11 rounded-xl bg-amber-950/80 border border-amber-500/50 flex items-center justify-center shrink-0 shadow-xs">
              <ShieldCheck className="w-6 h-6 text-amber-400" />
            </div>
            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="text-sm md:text-base font-extrabold text-amber-400 tracking-tight">
                  Market Data Notice
                </h3>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-950/80 text-amber-300 border border-amber-500/50 uppercase tracking-wider font-mono">
                  Educational & Research Notice
                </span>
              </div>
              <p className="text-xs md:text-sm font-medium text-amber-200 leading-relaxed">
                Market data and computer-generated predictions are for research and educational purposes only. Predictions may be wrong and do not guarantee future market movement.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0 self-end md:self-center text-xs font-mono text-amber-300 font-bold bg-amber-950/80 border border-amber-500/50 px-3.5 py-2 rounded-xl">
            <span>Research & Educational Only</span>
          </div>
        </div>
      </div>

      {/* Bottom Bar & Disclaimer */}
      <div className="border-t border-gray-200 bg-gray-50 py-6">
        <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-4 text-xs font-mono">
          <div className="text-slate-500 text-center md:text-left">
            © 2026 StockPulse Market Research Website Portal
          </div>
          <div className="flex items-center gap-4">
            <div className="text-slate-500 text-[11px] text-center md:text-right">
              Financial Education & Research Tool. Not personalized investment advice.
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

