import React from 'react';
import { Activity, ShieldCheck, Cpu, ExternalLink, Globe, Layers, Lock } from 'lucide-react';

interface FooterProps {
  onSelectTab: (tab: string) => void;
  activeTab: string;
  onToggleAdminMode?: () => void;
  isAdminMode?: boolean;
}

export const Footer: React.FC<FooterProps> = ({ onSelectTab, onToggleAdminMode, isAdminMode }) => {
  return (
    <footer className="border-t border-slate-800/80 bg-slate-950 text-slate-400 font-sans mt-12">
      {/* Upper Footer Links & Branding */}
      <div className="max-w-7xl mx-auto px-4 py-12 grid grid-cols-1 md:grid-cols-4 gap-8">
        {/* Brand & Mission */}
        <div className="space-y-4 md:col-span-1">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center font-black text-slate-950 text-sm shadow-md shadow-cyan-500/20">
              ST
            </div>
            <span className="font-bold text-slate-100 text-base">StockPulse Web Portal</span>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            Institutional-grade web portal for real-time stock market analysis, quantitative technical indicators, financial VADER NLP sentiment, and machine learning directional models.
          </p>
          <div className="flex items-center gap-2 text-[11px] font-mono text-emerald-400">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            Node.js Express Analytics Engine Online
          </div>
        </div>

        {/* Website Navigation Sitemap */}
        <div className="space-y-3">
          <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider font-mono">Website Sections</h4>
          <ul className="space-y-2 text-xs font-medium">
            <li>
              <button onClick={() => onSelectTab('research')} className="hover:text-cyan-400 transition-colors cursor-pointer">
                📊 Live Research Dashboard
              </button>
            </li>
            <li>
              <button onClick={() => onSelectTab('screener')} className="hover:text-cyan-400 transition-colors cursor-pointer">
                📈 Stock Screener & Watchlist
              </button>
            </li>
            <li>
              <button onClick={() => onSelectTab('dictionary')} className="hover:text-cyan-400 transition-colors cursor-pointer">
                📖 Financial Lexicon & Dictionary
              </button>
            </li>
            {onToggleAdminMode && (
              <li>
                <button
                  onClick={onToggleAdminMode}
                  className="hover:text-amber-400 text-amber-400/80 transition-colors cursor-pointer flex items-center gap-1 font-mono text-[11px]"
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
          <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider font-mono">Market Feeds</h4>
          <ul className="space-y-2 text-xs font-medium text-slate-400">
            <li className="flex items-center gap-1.5">
              <Globe className="w-3.5 h-3.5 text-cyan-400" />
              <span>National Stock Exchange (NSE India)</span>
            </li>
            <li className="flex items-center gap-1.5">
              <Globe className="w-3.5 h-3.5 text-blue-400" />
              <span>NASDAQ & NYSE (US Global)</span>
            </li>
            <li className="flex items-center gap-1.5">
              <Activity className="w-3.5 h-3.5 text-emerald-400" />
              <span>Real-time NIFTY 50 Index Feed</span>
            </li>
            <li className="flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-purple-400" />
              <span>Verified Yahoo Finance Data Sources</span>
            </li>
          </ul>
        </div>

        {/* Security & Data Policy */}
        <div className="space-y-3">
          <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider font-mono">Data Integrity Standard</h4>
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-3 space-y-2 text-[11px]">
            <div className="flex items-center gap-1.5 font-bold text-emerald-400">
              <ShieldCheck className="w-4 h-4" /> Verified Live Market Feeds Policy
            </div>
            <p className="text-slate-400 leading-normal">
              All quotes, financial ratios, historical prices, news articles, and ML predictions are computed directly on real market data.
            </p>
          </div>
        </div>
      </div>

      {/* Bottom Bar & Disclaimer */}
      <div className="border-t border-slate-800/80 bg-slate-950/80 py-6">
        <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-4 text-xs font-mono">
          <div className="text-slate-400 text-center md:text-left">
            © 2026 StockPulse Market Research Website Portal • Python FastAPI & Scikit-Learn Architecture
          </div>
          <div className="text-slate-400 text-[11px] text-center md:text-right">
            Financial Education & Research Tool. Not personalized investment advice.
          </div>
        </div>
      </div>
    </footer>
  );
};
