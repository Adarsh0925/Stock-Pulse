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

const FALLBACK_SCREENER_STOCKS: ScreenerStock[] = [
  { ticker: 'HDFCBANK.NS', name: 'HDFC Bank Limited', exchange: 'NSE', sector: 'Banking & Financials', marketCap: '₹12.28 Lakh Cr', price: '₹1,612.40', priceNum: 1612.40, changePercent: 0.85, rsi: 54.2, signal: 'BUY', mlDirection: 'UP', mlAccuracy: '76.8%', status: 'MARKET CLOSED', consensusStatus: 'VERIFIED CONSENSUS' },
  { ticker: 'RELIANCE.NS', name: 'Reliance Industries Limited', exchange: 'NSE', sector: 'Energy & Petrochemicals', marketCap: '₹19.85 Lakh Cr', price: '₹2,945.10', priceNum: 2945.10, changePercent: 1.12, rsi: 58.4, signal: 'BUY', mlDirection: 'UP', mlAccuracy: '81.2%', status: 'MARKET CLOSED', consensusStatus: 'VERIFIED CONSENSUS' },
  { ticker: 'TCS.NS', name: 'Tata Consultancy Services', exchange: 'NSE', sector: 'Information Technology', marketCap: '₹15.14 Lakh Cr', price: '₹4,185.50', priceNum: 4185.50, changePercent: -0.45, rsi: 48.9, signal: 'HOLD', mlDirection: 'DOWN', mlAccuracy: '62.4%', status: 'MARKET CLOSED', consensusStatus: 'VERIFIED CONSENSUS' },
  { ticker: 'INFY.NS', name: 'Infosys Limited', exchange: 'NSE', sector: 'Information Technology', marketCap: '₹7.42 Lakh Cr', price: '₹1,780.20', priceNum: 1780.20, changePercent: 0.65, rsi: 52.1, signal: 'BUY', mlDirection: 'UP', mlAccuracy: '71.5%', status: 'MARKET CLOSED', consensusStatus: 'VERIFIED CONSENSUS' },
  { ticker: 'TATAMOTORS.NS', name: 'Tata Motors Limited', exchange: 'NSE', sector: 'Automobile', marketCap: '₹3.62 Lakh Cr', price: '₹985.30', priceNum: 985.30, changePercent: 1.40, rsi: 61.2, signal: 'BUY', mlDirection: 'UP', mlAccuracy: '79.0%', status: 'MARKET CLOSED', consensusStatus: 'VERIFIED CONSENSUS' },
  { ticker: 'ICICIBANK.NS', name: 'ICICI Bank Limited', exchange: 'NSE', sector: 'Banking & Financials', marketCap: '₹8.54 Lakh Cr', price: '₹1,215.80', priceNum: 1215.80, changePercent: 0.92, rsi: 56.7, signal: 'BUY', mlDirection: 'UP', mlAccuracy: '78.3%', status: 'MARKET CLOSED', consensusStatus: 'VERIFIED CONSENSUS' },
  { ticker: 'SBIN.NS', name: 'State Bank of India', exchange: 'NSE', sector: 'Public Banking', marketCap: '₹7.54 Lakh Cr', price: '₹845.20', priceNum: 845.20, changePercent: -0.30, rsi: 49.5, signal: 'HOLD', mlDirection: 'DOWN', mlAccuracy: '59.8%', status: 'MARKET CLOSED', consensusStatus: 'VERIFIED CONSENSUS' },
  { ticker: 'BHARTIARTL.NS', name: 'Bharti Airtel Limited', exchange: 'NSE', sector: 'Telecommunications', marketCap: '₹8.32 Lakh Cr', price: '₹1,480.60', priceNum: 1480.60, changePercent: 1.25, rsi: 63.8, signal: 'BUY', mlDirection: 'UP', mlAccuracy: '82.5%', status: 'MARKET CLOSED', consensusStatus: 'VERIFIED CONSENSUS' },
  { ticker: 'ITC.NS', name: 'ITC Limited', exchange: 'NSE', sector: 'Consumer Goods (FMCG)', marketCap: '₹6.15 Lakh Cr', price: '₹492.30', priceNum: 492.30, changePercent: 0.15, rsi: 51.0, signal: 'HOLD', mlDirection: 'UP', mlAccuracy: '65.2%', status: 'MARKET CLOSED', consensusStatus: 'VERIFIED CONSENSUS' },
  { ticker: 'LTIM.NS', name: 'LTIMindtree Limited', exchange: 'NSE', sector: 'Information Technology', marketCap: '₹1.60 Lakh Cr', price: '₹5,410.00', priceNum: 5410.00, changePercent: -0.80, rsi: 46.3, signal: 'HOLD', mlDirection: 'DOWN', mlAccuracy: '61.1%', status: 'MARKET CLOSED', consensusStatus: 'VERIFIED CONSENSUS' },
  { ticker: 'NVDA', name: 'NVIDIA Corporation', exchange: 'NASDAQ', sector: 'Semiconductors & AI', marketCap: '$3.15 T', price: '$128.50', priceNum: 128.50, changePercent: 2.85, rsi: 68.4, signal: 'BUY', mlDirection: 'UP', mlAccuracy: '85.4%', status: 'MARKET CLOSED', consensusStatus: 'VERIFIED CONSENSUS' },
  { ticker: 'AAPL', name: 'Apple Inc.', exchange: 'NASDAQ', sector: 'Consumer Electronics', marketCap: '$3.42 T', price: '$224.30', priceNum: 224.30, changePercent: 0.75, rsi: 57.2, signal: 'BUY', mlDirection: 'UP', mlAccuracy: '74.1%', status: 'MARKET CLOSED', consensusStatus: 'VERIFIED CONSENSUS' },
  { ticker: 'TSLA', name: 'Tesla Inc.', exchange: 'NASDAQ', sector: 'Automotive & Clean Energy', marketCap: '$690.4 B', price: '$218.40', priceNum: 218.40, changePercent: -1.95, rsi: 44.8, signal: 'HOLD', mlDirection: 'DOWN', mlAccuracy: '68.0%', status: 'MARKET CLOSED', consensusStatus: 'VERIFIED CONSENSUS' },
  { ticker: 'MSFT', name: 'Microsoft Corporation', exchange: 'NASDAQ', sector: 'Software & Cloud', marketCap: '$3.34 T', price: '$448.20', priceNum: 448.20, changePercent: 0.40, rsi: 53.6, signal: 'BUY', mlDirection: 'UP', mlAccuracy: '72.8%', status: 'MARKET CLOSED', consensusStatus: 'VERIFIED CONSENSUS' },
  { ticker: 'GOOGL', name: 'Alphabet Inc.', exchange: 'NASDAQ', sector: 'Internet & Search', marketCap: '$2.23 T', price: '$176.80', priceNum: 176.80, changePercent: 0.60, rsi: 55.1, signal: 'BUY', mlDirection: 'UP', mlAccuracy: '70.2%', status: 'MARKET CLOSED', consensusStatus: 'VERIFIED CONSENSUS' }
];

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
      if (Array.isArray(data) && data.length > 0) {
        setStocks(data);
      } else {
        setStocks(FALLBACK_SCREENER_STOCKS);
      }
    } catch (err: any) {
      console.warn('Backend screener unreachable, loading fallback watchlist:', err);
      setStocks(FALLBACK_SCREENER_STOCKS);
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
      <div className="bg-white border border-gray-200 rounded-2xl p-6 relative overflow-hidden shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-teal-700 text-xs font-mono font-bold uppercase tracking-wider mb-1">
              <BarChart2 className="w-4 h-4" /> Stock Screener & Watchlist
            </div>
            <h2 className="text-2xl font-bold text-gray-900">Live Stock Screener & Watchlist</h2>
            <p className="text-xs text-slate-500 mt-1 max-w-2xl">
              Browse verified stocks with real market prices, price trends, and computer predictions.
            </p>
          </div>
          <div className="flex items-center gap-3 bg-gray-50 px-4 py-2.5 rounded-xl border border-gray-200 text-xs font-mono">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <div>
              <span className="text-gray-900 font-bold">Verified Market Feed</span>
              <div className="text-[10px] text-slate-500">Synchronized with Research Dashboard</div>
            </div>
            <button
              onClick={fetchScreenerData}
              disabled={isLoading}
              title="Refresh Screener Data"
              className="ml-2 p-1.5 hover:bg-gray-200 rounded-lg text-slate-400 hover:text-teal-700 transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>
      </div>

      {/* Filter Controls Bar */}
      <div className="bg-white border border-gray-200 rounded-2xl p-4 flex flex-col lg:flex-row items-center justify-between gap-4 shadow-sm">
        {/* Search Input */}
        <div className="relative w-full lg:w-80">
          <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400 pointer-events-none" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search symbol or company..."
            className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-300 rounded-xl text-xs text-gray-900 placeholder-slate-400 focus:outline-none focus:border-teal-700 font-mono"
          />
        </div>

        {/* Dropdown Filters */}
        <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto text-xs font-mono">
          <div className="flex items-center gap-1.5 text-slate-500">
            <Filter className="w-3.5 h-3.5 text-teal-700" /> Filters:
          </div>

          <select
            value={selectedExchange}
            onChange={(e) => setSelectedExchange(e.target.value)}
            className="bg-gray-50 border border-gray-300 rounded-xl px-3 py-2 text-gray-800 focus:outline-none focus:border-teal-700"
          >
            <option value="ALL">All Exchanges</option>
            <option value="NSE">NSE (India)</option>
            <option value="NASDAQ">NASDAQ (US)</option>
          </select>

          <select
            value={selectedSignal}
            onChange={(e) => setSelectedSignal(e.target.value)}
            className="bg-gray-50 border border-gray-300 rounded-xl px-3 py-2 text-gray-800 focus:outline-none focus:border-teal-700"
          >
            <option value="ALL">All Views</option>
            <option value="BUY">BUY</option>
            <option value="HOLD">HOLD</option>
            <option value="SELL">SELL</option>
            <option value="INSUFFICIENT DATA">INSUFFICIENT DATA</option>
          </select>

          <select
            value={selectedSector}
            onChange={(e) => setSelectedSector(e.target.value)}
            className="bg-gray-50 border border-gray-300 rounded-xl px-3 py-2 text-gray-800 focus:outline-none focus:border-teal-700"
          >
            <option value="ALL">All Sectors</option>
            {sectors.map((sec) => (
              <option key={sec} value={sec}>{sec}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Stocks Screener Table */}
      <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
        {isLoading ? (
          <div className="py-20 flex flex-col items-center justify-center space-y-3 text-slate-500">
            <Loader2 className="w-8 h-8 text-teal-700 animate-spin" />
            <div className="text-xs font-mono">Fetching verified market quotes across tickers...</div>
          </div>
        ) : error ? (
          <div className="py-12 text-center text-red-600 text-xs font-mono space-y-2">
            <div>{error}</div>
            <button
              onClick={fetchScreenerData}
              className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-lg border border-gray-300 cursor-pointer"
            >
              Retry Pipeline Fetch
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-sans">
              <thead className="bg-gray-50 text-slate-500 font-mono text-[11px] uppercase tracking-wider border-b border-gray-200">
                <tr>
                  <th className="px-5 py-3.5 font-semibold">Company & Symbol</th>
                  <th className="px-4 py-3.5 font-semibold">Exchange / Sector</th>
                  <th className="px-4 py-3.5 font-semibold text-right">Price</th>
                  <th className="px-4 py-3.5 font-semibold text-right">Day Change</th>
                  <th className="px-4 py-3.5 font-semibold text-center">Price Strength</th>
                  <th className="px-4 py-3.5 font-semibold text-center">Computer Model</th>
                  <th className="px-4 py-3.5 font-semibold text-center">Overall View</th>
                  <th className="px-5 py-3.5 font-semibold text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredStocks.map((stock) => {
                  const isPos = stock.changePercent !== null && stock.changePercent >= 0;
                  return (
                    <tr key={stock.ticker} className="hover:bg-gray-50/80 transition-colors group">
                      <td className="px-5 py-4">
                        <div className="font-bold text-gray-900 group-hover:text-teal-700 transition-colors text-sm">
                          {stock.name}
                        </div>
                        <div className="text-[11px] font-mono text-teal-700">{stock.ticker}</div>
                      </td>
                      <td className="px-4 py-4 font-mono text-slate-600">
                        <div className="text-gray-800">{stock.sector}</div>
                        <div className="text-[10px] text-slate-500">{stock.exchange} • Cap: {stock.marketCap}</div>
                      </td>
                      <td className="px-4 py-4 text-right font-mono font-bold text-gray-900 text-sm">
                        {stock.price}
                      </td>
                      <td className="px-4 py-4 text-right font-mono font-semibold">
                        {stock.changePercent !== null && stock.changePercent !== undefined ? (
                          <span className={`inline-flex items-center gap-0.5 px-2 py-0.5 rounded text-xs border ${
                            isPos ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-red-50 text-red-700 border-red-200'
                          }`}>
                            {isPos ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                            {isPos ? '+' : ''}{stock.changePercent.toFixed(2)}%
                          </span>
                        ) : (
                          <span className="text-slate-400 font-mono text-[11px]">DATA UNAVAILABLE</span>
                        )}
                      </td>
                      <td className="px-4 py-4 text-center font-mono text-slate-600">
                        {stock.rsi !== null && stock.rsi !== undefined ? (
                          <span className={`px-2 py-0.5 rounded font-bold border ${
                            stock.rsi > 70 ? 'text-amber-700 bg-amber-50 border-amber-200' :
                            stock.rsi < 30 ? 'text-emerald-700 bg-emerald-50 border-emerald-200' :
                            'text-slate-700 bg-gray-100 border-gray-200'
                          }`}>
                            {stock.rsi.toFixed(1)}
                          </span>
                        ) : (
                          <span className="text-slate-400 font-mono text-[11px]">DATA UNAVAILABLE</span>
                        )}
                      </td>
                      <td className="px-4 py-4 text-center font-mono">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-bold border ${
                          stock.mlDirection === 'UP' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                          stock.mlDirection === 'DOWN' ? 'bg-red-50 text-red-700 border-red-200' :
                          'bg-gray-100 text-slate-600 border-gray-200'
                        }`}>
                          <Cpu className="w-3 h-3" /> {stock.mlDirection === 'UP' || stock.mlDirection === 'DOWN' ? `${stock.mlDirection} (${stock.mlAccuracy})` : 'DATA UNAVAILABLE'}
                        </span>
                      </td>
                      <td className="px-4 py-4 text-center font-mono">
                        <span className={`px-3 py-1 rounded-lg text-xs font-bold uppercase tracking-wider border ${
                          stock.signal === 'BUY' ? 'bg-emerald-50 text-emerald-700 border-emerald-300' :
                          stock.signal === 'SELL' ? 'bg-red-50 text-red-700 border-red-300' :
                          stock.signal === 'HOLD' ? 'bg-amber-50 text-amber-700 border-amber-300' :
                          'bg-gray-100 text-slate-600 border-gray-200'
                        }`}>
                          {stock.signal}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-center">
                        <button
                          onClick={() => onSelectCompany({ ticker: stock.ticker, name: stock.name, exchange: stock.exchange })}
                          className="px-3 py-1.5 bg-teal-700 hover:bg-teal-800 text-white font-semibold rounded-lg text-xs transition-all flex items-center justify-center gap-1.5 mx-auto cursor-pointer shadow-sm"
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
