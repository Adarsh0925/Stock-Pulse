import React, { useState, useEffect, useCallback } from 'react';
import { Header } from './components/Header';
import { CompanyHeader } from './components/CompanyHeader';
import { ResearchScoreCard } from './components/ResearchScoreCard';
import { ChartSection } from './components/ChartSection';
import { TechnicalAnalysisCard } from './components/TechnicalAnalysisCard';
import { FundamentalsCard } from './components/FundamentalsCard';
import { NewsNLPSection } from './components/NewsNLPSection';
import { MLPredictionCard } from './components/MLPredictionCard';
import { ProvenanceSection } from './components/ProvenanceSection';
import { ScreenerView } from './components/ScreenerView';
import { FinancialDictionaryView } from './components/FinancialDictionaryView';
import { CustomNewsAnalyzerView } from './components/CustomNewsAnalyzerView';
import { MLHubView } from './components/MLHubView';
import { MethodologyView } from './components/MethodologyView';
import { Footer } from './components/Footer';
import { Nifty50Data, CompanySearchResult, ResearchReport } from './types';
import { AlertCircle, Building2, Globe2, ShieldCheck, Cpu, ArrowUpRight } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<string>('screener');
  const [isAdminMode, setIsAdminMode] = useState<boolean>(false);

  const [niftyData, setNiftyData] = useState<Nifty50Data | null>(null);
  const [selectedTicker, setSelectedTicker] = useState<string>('HDFCBANK.NS');
  const [selectedCompanyName, setSelectedCompanyName] = useState<string>('HDFC Bank Limited');
  const [selectedPeriod, setSelectedPeriod] = useState<string>('3M');
  const [selectedTimeFilter, setSelectedTimeFilter] = useState<string>('7d');

  const [searchResults, setSearchResults] = useState<CompanySearchResult[]>([]);
  const [isSearching, setIsSearching] = useState<boolean>(false);

  const [researchReport, setResearchReport] = useState<ResearchReport | null>(null);
  const [isLoadingReport, setIsLoadingReport] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [errorReason, setErrorReason] = useState<string | null>(null);

  // Fetch NIFTY 50 Header Data
  const fetchNifty = useCallback(async () => {
    try {
      const res = await fetch('/api/market/nifty50');
      if (res.ok) {
        const data = await res.json();
        setNiftyData(data);
      }
    } catch (e) {
      console.error('Error fetching NIFTY 50:', e);
    }
  }, []);

  // Fetch Full Company Research Report
  const fetchResearchReport = useCallback(async (ticker: string, name?: string) => {
    setIsLoadingReport(true);
    setErrorReason(null);
    try {
      const encodedTicker = encodeURIComponent(ticker);
      const nameParam = name ? `?name=${encodeURIComponent(name)}` : '';
      const res = await fetch(`/api/company/${encodedTicker}/research${nameParam}`);
      if (res.ok) {
        const data: ResearchReport = await res.json();
        setResearchReport(data);
      } else {
        setErrorReason('DATA UNAVAILABLE: Failed to connect to market research backend');
      }
    } catch (e) {
      console.error('Error fetching research report:', e);
      setErrorReason('DATA UNAVAILABLE: Network or backend server error');
    } finally {
      setIsLoadingReport(false);
      setIsRefreshing(false);
    }
  }, []);

  // Initial Load
  useEffect(() => {
    fetchNifty();
    fetchResearchReport('HDFCBANK.NS', 'HDFC Bank Limited');
  }, [fetchNifty, fetchResearchReport]);

  // Handle Search Input Query
  const handleSearch = async (query: string) => {
    setIsSearching(true);
    try {
      const res = await fetch(`/api/company/search?q=${encodeURIComponent(query)}`);
      if (res.ok) {
        const data = await res.json();
        setSearchResults(data);
      }
    } catch (e) {
      console.error('Search error:', e);
    } finally {
      setIsSearching(false);
    }
  };

  // Handle Company Selection
  const handleSelectCompany = (item: CompanySearchResult) => {
    setSelectedTicker(item.ticker);
    setSelectedCompanyName(item.name);
    fetchResearchReport(item.ticker, item.name);
    setActiveTab('research');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Handle Historical Period Change (1M, 3M, 6M, 1Y)
  const handlePeriodChange = async (period: string) => {
    setSelectedPeriod(period);
    if (!researchReport) return;
    try {
      const res = await fetch(`/api/company/${encodeURIComponent(selectedTicker)}/history?period=${period}`);
      if (res.ok) {
        const histData = await res.json();
        setResearchReport((prev) => (prev ? { ...prev, historical: histData } : null));
      }
    } catch (e) {
      console.error('Error changing period:', e);
    }
  };

  // Handle News Time Filter Change (24h, 3d, 7d, 30d)
  const handleNewsTimeFilterChange = async (timeFilter: string) => {
    setSelectedTimeFilter(timeFilter);
    if (!researchReport) return;
    try {
      const nameParam = selectedCompanyName ? `?name=${encodeURIComponent(selectedCompanyName)}&` : '?';
      const newsRes = await fetch(`/api/company/${encodeURIComponent(selectedTicker)}/news${nameParam}period=${timeFilter}`);
      const nlpRes = await fetch(`/api/company/${encodeURIComponent(selectedTicker)}/nlp${nameParam.slice(0, -1)}`);
      if (newsRes.ok && nlpRes.ok) {
        const newsData = await newsRes.json();
        const nlpData = await nlpRes.json();
        setResearchReport((prev) => (prev ? { ...prev, news: newsData, nlp: nlpData } : null));
      }
    } catch (e) {
      console.error('Error changing news filter:', e);
    }
  };

  // Handle Manual Refresh Button
  const handleRefresh = () => {
    setIsRefreshing(true);
    fetchNifty();
    fetchResearchReport(selectedTicker, selectedCompanyName);
  };

  const sampleCompanies = [
    { ticker: 'HDFCBANK.NS', name: 'HDFC Bank' },
    { ticker: 'RELIANCE.NS', name: 'Reliance' },
    { ticker: 'TCS.NS', name: 'TCS' },
    { ticker: 'INFY.NS', name: 'Infosys' },
    { ticker: 'BHARTIARTL.NS', name: 'Bharti Airtel' },
    { ticker: 'ICICIBANK.NS', name: 'ICICI Bank' },
    { ticker: 'SBIN.NS', name: 'State Bank of India' },
    { ticker: 'NVDA', name: 'NVIDIA' },
    { ticker: 'AAPL', name: 'Apple' },
    { ticker: 'TSLA', name: 'Tesla' }
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans flex flex-col selection:bg-cyan-500 selection:text-slate-950">
      {/* Website Top Header & Navigation */}
      <Header
        niftyData={niftyData}
        onSearch={handleSearch}
        onSelectCompany={handleSelectCompany}
        searchResults={searchResults}
        isSearching={isSearching}
        onRefresh={handleRefresh}
        isRefreshing={isRefreshing}
        selectedTicker={selectedTicker}
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        isAdminMode={isAdminMode}
        onToggleAdminMode={() => setIsAdminMode(!isAdminMode)}
      />

      {/* Main Website Content Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 py-6 space-y-6">
        {/* Render Tab Views */}
        {activeTab === 'screener' ? (
          <ScreenerView onSelectCompany={handleSelectCompany} />
        ) : activeTab === 'dictionary' ? (
          <FinancialDictionaryView />
        ) : activeTab === 'custom-news' ? (
          <CustomNewsAnalyzerView />
        ) : activeTab === 'ml' ? (
          <MLHubView currentMl={researchReport?.ml} selectedTicker={selectedTicker} />
        ) : activeTab === 'methodology' ? (
          <MethodologyView />
        ) : (
          /* Default: Research Dashboard View */
          <div className="space-y-6">
            {/* Stock Quick Selector Bar */}
            <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-900/60 p-3 rounded-2xl border border-slate-800 text-xs font-mono">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-slate-400 font-bold uppercase tracking-wider flex items-center gap-1">
                  <Building2 className="w-3.5 h-3.5 text-cyan-400" /> Prominent Equities:
                </span>
                {sampleCompanies.map((c) => (
                  <button
                    key={c.ticker}
                    onClick={() => handleSelectCompany({ ticker: c.ticker, name: c.name, exchange: c?.ticker?.endsWith('.NS') ? 'NSE' : 'NASDAQ' })}
                    className={`px-2.5 py-1 rounded-lg border transition-all cursor-pointer ${
                      selectedTicker === c.ticker
                        ? 'bg-cyan-500 text-slate-950 font-bold border-cyan-400 shadow-md shadow-cyan-500/10'
                        : 'bg-slate-950 text-slate-300 border-slate-800 hover:border-slate-700 hover:text-slate-100'
                    }`}
                  >
                    {c.name}
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-2 text-[11px] text-slate-400">
                <Globe2 className="w-3.5 h-3.5 text-cyan-400" />
                <span>NSE India & US Exchanges</span>
              </div>
            </div>

            {/* Global Loading Spinner */}
            {isLoadingReport ? (
              <div className="min-h-[400px] bg-slate-900/60 border border-slate-800 rounded-3xl p-12 flex flex-col items-center justify-center text-center space-y-4">
                <div className="relative">
                  <div className="w-16 h-16 border-4 border-cyan-500/20 border-t-cyan-400 rounded-full animate-spin"></div>
                  <div className="w-10 h-10 border-4 border-emerald-500/20 border-b-emerald-400 rounded-full animate-spin absolute top-3 left-3"></div>
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-100">Fetching Live Market Research Feeds...</h3>
                  <p className="text-xs text-slate-400 font-mono mt-1">
                    Executing Pandas OHLCV Validation • VADER Financial NLP • Scikit-learn RandomForest ML
                  </p>
                </div>
              </div>
            ) : errorReason ? (
              <div className="bg-amber-950/40 border border-amber-800/80 rounded-2xl p-8 text-center space-y-3">
                <AlertCircle className="w-10 h-10 text-amber-400 mx-auto" />
                <div className="text-xl font-bold text-amber-300 font-mono">{errorReason}</div>
                <p className="text-sm text-slate-400 max-w-md mx-auto">
                  The website strictly enforces data integrity standards. Re-query verified online market feeds.
                </p>
                <button
                  onClick={handleRefresh}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl text-xs font-bold font-mono transition-colors cursor-pointer"
                >
                  Retry Live Connection
                </button>
              </div>
            ) : researchReport ? (
              <div className="space-y-6">
                {/* 1. Real Company Quote Header */}
                <CompanyHeader quote={researchReport.quote} companyName={selectedCompanyName} />

                {/* 2. Transparent Research Score & Signal */}
                <ResearchScoreCard
                  finalScore={researchReport.final_research_score}
                  signal={researchReport.research_signal}
                  explanation={researchReport.signal_explanation}
                  components={researchReport.score_components}
                  timestamp={researchReport.timestamp}
                />

                {/* 3. Historical Data & Technical Chart (Matplotlib Base64 + Recharts) */}
                <ChartSection
                  historicalData={researchReport.historical}
                  onSelectPeriod={handlePeriodChange}
                  selectedPeriod={selectedPeriod}
                  ticker={selectedTicker}
                />

                {/* 4. Technical Analysis & Fundamental Analysis Split Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <TechnicalAnalysisCard technical={researchReport.technical} />
                  <FundamentalsCard fundamentals={researchReport.fundamentals} ticker={selectedTicker} />
                </div>

                {/* 5. Company News & NLP Sentiment Analysis */}
                <NewsNLPSection
                  news={researchReport.news}
                  nlp={researchReport.nlp}
                  selectedTimeFilter={selectedTimeFilter}
                  onSelectTimeFilter={handleNewsTimeFilterChange}
                  companyName={selectedCompanyName}
                />

                {/* 6. Scikit-learn Machine Learning Prediction Engine */}
                <MLPredictionCard ml={researchReport.ml} ticker={selectedTicker} />

                {/* 7. Data Provenance & Transparency Audit */}
                <ProvenanceSection report={researchReport} />
              </div>
            ) : null}
          </div>
        )}
      </main>

      {/* Website Footer */}
      <Footer
        onSelectTab={setActiveTab}
        activeTab={activeTab}
        isAdminMode={isAdminMode}
        onToggleAdminMode={() => setIsAdminMode(!isAdminMode)}
      />
    </div>
  );
}
