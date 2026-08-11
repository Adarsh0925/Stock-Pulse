import React, { useState, useEffect } from 'react';
import { Search, Filter, TrendingUp, TrendingDown, Cpu, ShieldCheck, ExternalLink, BarChart2, Loader2, RefreshCw, Newspaper } from 'lucide-react';
import { CompanySearchResult } from '../types';

interface ScreenerStock {
  ticker: string;
  name: string;
  exchange: string;
  sector: string;
  marketCap: string;
  price: string;
  priceNum: number | null;
  changePercent: number | null;
  rsi: number | null;
  signal: 'BUY' | 'HOLD' | 'SELL' | 'INSUFFICIENT DATA';
  mlDirection: 'UP' | 'DOWN' | 'DATA UNAVAILABLE' | 'N/A';
  mlAccuracy: string;
  status: string;
  consensusStatus: string;
}

interface ScreenerViewProps {
  onSelectCompany: (result: CompanySearchResult) => void;
}

export const ScreenerView: React.FC<ScreenerViewProps> = ({ onSelectCompany }) => {
  const [stocks, setStocks] = useState<ScreenerStock[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const [search, setSearch] = useState('');
  const [selectedSignal, setSelectedSignal] = useState<string>('ALL');
  const [selectedExchange, setSelectedExchange] = useState<string>('ALL');
  const [selectedSector, setSelectedSector] = useState<string>('ALL');

  const fetchScreenerData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/screener');
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data: ScreenerStock[] = await res.json();
      setStocks(data);
    } catch (err: any) {
      console.error('Failed to load screener data:', err);
      setError('Failed to load canonical screener data from market pipeline.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchScreenerData();
  }, []);

  const filteredStocks = stocks.filter((stock) => {
    const matchesSearch = stock.name.toLowerCase().includes(search.toLowerCase()) || stock.ticker.toLowerCase().includes(search.toLowerCase());
    const matchesSignal = selectedSignal === 'ALL' || stock.signal === selectedSignal;
    const matchesExchange = selectedExchange === 'ALL' || stock.exchange === selectedExchange;
    const matchesSector = selectedSector === 'ALL' || stock.sector === selectedSector;
    return matchesSearch && matchesSignal && matchesExchange && matchesSector;
  });

  const sectors = Array.from(new Set(stocks.map((s) => s.sector)));

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/5 rounded-full blur-3xl pointer-events-none"></div>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-cyan-400 text-xs font-mono font-bold uppercase tracking-wider mb-1">
              <BarChart2 className="w-4 h-4" /> Market Research Portal • Stock Screener
            </div>
            <h2 className="text-2xl font-bold text-slate-100">Live Equity Screener & Watchlist</h2>
            <p className="text-xs text-slate-400 mt-1 max-w-2xl">
              Canonical market data feed rendering verified prices, 14-day RSI technical indicators, and RandomForest ML predictions directly from the backend pipeline.
            </p>
          </div>
          <div className="flex items-center gap-3 bg-slate-950/60 px-4 py-2.5 rounded-xl border border-slate-800 text-xs font-mono">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <div>
              <span className="text-slate-200 font-bold">Canonical Backend Feed</span>
              <div className="text-[10px] text-slate-400">Synchronized with Research Dashboard</div>
            </div>
            <button
              onClick={fetchScreenerData}
              disabled={isLoading}
              title="Refresh Screener Data"
              className="ml-2 p-1.5 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-cyan-400 transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>
      </div>

      {/* Filter Controls Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col lg:flex-row items-center justify-between gap-4">
        {/* Search Input */}
        <div className="relative w-full lg:w-80">
          <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400 pointer-events-none" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search symbol or company..."
            className="w-full pl-9 pr-4 py-2 bg-slate-950 border border-slate-700/80 rounded-xl text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500 font-mono"
          />
        </div>

        {/* Dropdown Filters */}
        <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto text-xs font-mono">
          <div className="flex items-center gap-1.5 text-slate-400">
            <Filter className="w-3.5 h-3.5 text-cyan-400" /> Filters:
          </div>

          <select
            value={selectedExchange}
            onChange={(e) => setSelectedExchange(e.target.value)}
            className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-cyan-500"
          >
            <option value="ALL">All Exchanges</option>
            <option value="NSE">NSE (India)</option>
            <option value="NASDAQ">NASDAQ (US)</option>
          </select>

          <select
            value={selectedSignal}
            onChange={(e) => setSelectedSignal(e.target.value)}
            className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-cyan-500"
          >
            <option value="ALL">All Research Signals</option>
            <option value="BUY">BUY Signal</option>
            <option value="HOLD">HOLD Signal</option>
            <option value="SELL">SELL Signal</option>
            <option value="INSUFFICIENT DATA">INSUFFICIENT DATA</option>
          </select>

          <select
            value={selectedSector}
            onChange={(e) => setSelectedSector(e.target.value)}
            className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-cyan-500"
          >
            <option value="ALL">All Sectors</option>
            {sectors.map((sec) => (
              <option key={sec} value={sec}>{sec}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Stocks Screener Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        {isLoading ? (
          <div className="py-20 flex flex-col items-center justify-center space-y-3 text-slate-400">
            <Loader2 className="w-8 h-8 text-cyan-400 animate-spin" />
            <div className="text-xs font-mono">Fetching canonical market quotes & analytics across tickers...</div>
          </div>
        ) : error ? (
          <div className="py-12 text-center text-rose-400 text-xs font-mono space-y-2">
            <div>{error}</div>
            <button
              onClick={fetchScreenerData}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg border border-slate-700 cursor-pointer"
            >
              Retry Pipeline Fetch
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-sans">
              <thead className="bg-slate-950 text-slate-400 font-mono text-[11px] uppercase tracking-wider border-b border-slate-800">
                <tr>
                  <th className="px-5 py-3.5 font-semibold">Company & Ticker</th>
                  <th className="px-4 py-3.5 font-semibold">Exchange / Sector</th>
                  <th className="px-4 py-3.5 font-semibold text-right">Last Price</th>
                  <th className="px-4 py-3.5 font-semibold text-right">Day Change</th>
                  <th className="px-4 py-3.5 font-semibold text-center">RSI (14D)</th>
                  <th className="px-4 py-3.5 font-semibold text-center">ML Next Dir.</th>
                  <th className="px-4 py-3.5 font-semibold text-center">Research Signal</th>
                  <th className="px-5 py-3.5 font-semibold text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80">
                {filteredStocks.map((stock) => {
                  const isPos = stock.changePercent !== null && stock.changePercent >= 0;
                  return (
                    <tr key={stock.ticker} className="hover:bg-slate-800/50 transition-colors group">
                      <td className="px-5 py-4">
                        <div className="font-bold text-slate-100 group-hover:text-cyan-400 transition-colors text-sm">
                          {stock.name}
                        </div>
                        <div className="text-[11px] font-mono text-cyan-400">{stock.ticker}</div>
                      </td>
                      <td className="px-4 py-4 font-mono text-slate-300">
                        <div className="text-slate-200">{stock.sector}</div>
                        <div className="text-[10px] text-slate-400">{stock.exchange} • Cap: {stock.marketCap}</div>
                      </td>
                      <td className="px-4 py-4 text-right font-mono font-bold text-slate-100 text-sm">
                        {stock.price}
                      </td>
                      <td className="px-4 py-4 text-right font-mono font-semibold">
                        {stock.changePercent !== null && stock.changePercent !== undefined ? (
                          <span className={`inline-flex items-center gap-0.5 px-2 py-0.5 rounded text-xs ${
                            isPos ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-800/60' : 'bg-rose-950/80 text-rose-300 border border-rose-800/60'
                          }`}>
                            {isPos ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                            {isPos ? '+' : ''}{stock.changePercent.toFixed(2)}%
                          </span>
                        ) : (
                          <span className="text-slate-500 font-mono text-[11px]">DATA UNAVAILABLE</span>
                        )}
                      </td>
                      <td className="px-4 py-4 text-center font-mono text-slate-300">
                        {stock.rsi !== null && stock.rsi !== undefined ? (
                          <span className={`px-2 py-0.5 rounded font-bold ${
                            stock.rsi > 70 ? 'text-amber-400 bg-amber-950/40 border border-amber-800/40' :
                            stock.rsi < 30 ? 'text-emerald-400 bg-emerald-950/40 border border-emerald-800/40' :
                            'text-slate-300 bg-slate-950 border border-slate-800'
                          }`}>
                            {stock.rsi.toFixed(1)}
                          </span>
                        ) : (
                          <span className="text-slate-500 font-mono text-[11px]">DATA UNAVAILABLE</span>
                        )}
                      </td>
                      <td className="px-4 py-4 text-center font-mono">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-bold ${
                          stock.mlDirection === 'UP' ? 'bg-emerald-950/80 text-emerald-400 border border-emerald-800/60' :
                          stock.mlDirection === 'DOWN' ? 'bg-rose-950/80 text-rose-400 border border-rose-800/60' :
                          'bg-slate-800 text-slate-400 border border-slate-700'
                        }`}>
                          <Cpu className="w-3 h-3" /> {stock.mlDirection === 'UP' || stock.mlDirection === 'DOWN' ? `${stock.mlDirection} (${stock.mlAccuracy})` : 'DATA UNAVAILABLE'}
                        </span>
                      </td>
                      <td className="px-4 py-4 text-center font-mono">
                        <span className={`px-3 py-1 rounded-lg text-xs font-bold uppercase tracking-wider ${
                          stock.signal === 'BUY' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40' :
                          stock.signal === 'SELL' ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40' :
                          stock.signal === 'HOLD' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40' :
                          'bg-slate-800 text-slate-400 border border-slate-700'
                        }`}>
                          {stock.signal}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-center">
                        <button
                          onClick={() => onSelectCompany({ ticker: stock.ticker, name: stock.name, exchange: stock.exchange })}
                          className="px-3 py-1.5 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold rounded-lg text-xs transition-all flex items-center justify-center gap-1.5 mx-auto cursor-pointer shadow-md shadow-cyan-500/10"
                        >
                          <span>Analyze</span>
                          <ExternalLink className="w-3 h-3" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
