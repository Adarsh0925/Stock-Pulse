import { generateFullResearchReport, ResearchReport } from './researchEngine';
import { getHistoricalCandles } from './marketData';
import { fetchNewsAndNlp, analyzeCustomHeadline } from './newsNlp';
import { validatorService, OverallValidationSummary } from './validatorService';

export interface ProminentStock {
  ticker: string;
  name: string;
  exchange: string;
  sector: string;
}

export const PROMINENT_STOCKS: ProminentStock[] = [
  { ticker: 'HDFCBANK.NS', name: 'HDFC Bank Limited', exchange: 'NSE', sector: 'Banking & Financials' },
  { ticker: 'RELIANCE.NS', name: 'Reliance Industries Limited', exchange: 'NSE', sector: 'Energy & Petrochemicals' },
  { ticker: 'TCS.NS', name: 'Tata Consultancy Services', exchange: 'NSE', sector: 'Information Technology' },
  { ticker: 'INFY.NS', name: 'Infosys Limited', exchange: 'NSE', sector: 'Information Technology' },
  { ticker: 'TATAMOTORS.NS', name: 'Tata Motors Limited', exchange: 'NSE', sector: 'Automobile' },
  { ticker: 'ICICIBANK.NS', name: 'ICICI Bank Limited', exchange: 'NSE', sector: 'Banking & Financials' },
  { ticker: 'SBIN.NS', name: 'State Bank of India', exchange: 'NSE', sector: 'Public Banking' },
  { ticker: 'BHARTIARTL.NS', name: 'Bharti Airtel Limited', exchange: 'NSE', sector: 'Telecommunications' },
  { ticker: 'ITC.NS', name: 'ITC Limited', exchange: 'NSE', sector: 'Consumer Goods (FMCG)' },
  { ticker: 'LTIM.NS', name: 'LTIMindtree Limited', exchange: 'NSE', sector: 'Information Technology' },
  { ticker: 'NVDA', name: 'NVIDIA Corporation', exchange: 'NASDAQ', sector: 'Semiconductors & AI' },
  { ticker: 'AAPL', name: 'Apple Inc.', exchange: 'NASDAQ', sector: 'Consumer Electronics' },
  { ticker: 'TSLA', name: 'Tesla Inc.', exchange: 'NASDAQ', sector: 'Automotive & Clean Energy' },
  { ticker: 'MSFT', name: 'Microsoft Corporation', exchange: 'NASDAQ', sector: 'Software & Cloud' },
  { ticker: 'GOOGL', name: 'Alphabet Inc.', exchange: 'NASDAQ', sector: 'Internet & Search' }
];

export interface ScreenerItem {
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

/**
 * Unified StockService implementing canonical stock data fetching,
 * normalization, technical indicators, and signal calculation.
 */
export class StockService {
  /**
   * Primary canonical research method for any ticker.
   * Ensures unified normalization, indicator generation, news sentiment,
   * ML modeling, and Research Score generation.
   */
  public async getStockResearch(ticker: string, companyName?: string): Promise<ResearchReport> {
    return await generateFullResearchReport(ticker, companyName);
  }

  /**
   * Canonical Screener fetching method.
   * Maps every ticker through getStockResearch to ensure price, RSI, ML, and signal
   * are 100% synchronized between the screener and detail pages.
   */
  public async getScreenerData(stocks: ProminentStock[] = PROMINENT_STOCKS): Promise<ScreenerItem[]> {
    return await Promise.all(
      stocks.map(async (stock) => {
        try {
          const report = await this.getStockResearch(stock.ticker, stock.name);
          const q = report.quote || {};
          const priceVal = q.current_price;
          const isNse = stock.ticker.endsWith('.NS');

          let priceStr = 'DATA UNAVAILABLE';
          if (typeof priceVal === 'number' && priceVal > 0) {
            priceStr = isNse
              ? `₹${priceVal.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
              : `$${priceVal.toFixed(2)}`;
          }

          const changePct = typeof q.change_percent === 'number' && !isNaN(q.change_percent)
            ? q.change_percent
            : null;

          const rsiVal = typeof report.technical?.rsi14 === 'number' && !isNaN(report.technical.rsi14)
            ? report.technical.rsi14
            : null;

          let signalMapped: 'BUY' | 'HOLD' | 'SELL' | 'INSUFFICIENT DATA' = 'INSUFFICIENT DATA';
          if (report.research_signal?.includes('BUY')) signalMapped = 'BUY';
          else if (report.research_signal?.includes('SELL')) signalMapped = 'SELL';
          else if (report.research_signal?.includes('HOLD')) signalMapped = 'HOLD';

          let mlDir: 'UP' | 'DOWN' | 'DATA UNAVAILABLE' | 'N/A' = 'DATA UNAVAILABLE';
          if (report.ml?.predicted_next_direction === 'UP') mlDir = 'UP';
          else if (report.ml?.predicted_next_direction === 'DOWN') mlDir = 'DOWN';

          const mlAcc = typeof report.ml?.accuracy === 'number' && report.ml.accuracy > 0
            ? `${report.ml.accuracy}%`
            : 'DATA UNAVAILABLE';

          return {
            ticker: stock.ticker,
            name: stock.name,
            exchange: stock.exchange,
            sector: stock.sector,
            marketCap: q.market_cap ? (typeof q.market_cap === 'number' ? `$${(q.market_cap / 1e9).toFixed(2)}B` : String(q.market_cap)) : 'DATA UNAVAILABLE',
            price: priceStr,
            priceNum: typeof priceVal === 'number' ? priceVal : null,
            changePercent: changePct,
            rsi: rsiVal,
            signal: signalMapped,
            mlDirection: mlDir,
            mlAccuracy: mlAcc,
            status: q.status || 'DATA UNAVAILABLE',
            consensusStatus: q.consensus_status || 'UNAVAILABLE'
          };
        } catch (err) {
          console.error(`Error in StockService.getScreenerData for ${stock.ticker}:`, err);
          return {
            ticker: stock.ticker,
            name: stock.name,
            exchange: stock.exchange,
            sector: stock.sector,
            marketCap: 'DATA UNAVAILABLE',
            price: 'DATA UNAVAILABLE',
            priceNum: null,
            changePercent: null,
            rsi: null,
            signal: 'INSUFFICIENT DATA' as const,
            mlDirection: 'DATA UNAVAILABLE' as const,
            mlAccuracy: 'DATA UNAVAILABLE',
            status: 'DATA UNAVAILABLE',
            consensusStatus: 'UNAVAILABLE'
          };
        }
      })
    );
  }

  public async getHistoricalCandles(ticker: string, period?: string) {
    return await getHistoricalCandles(ticker, period);
  }

  public async getNewsAndNlp(ticker: string, companyName?: string, period?: string) {
    return await fetchNewsAndNlp(ticker, companyName || ticker.replace('.NS', ''), period);
  }

  public analyzeHeadline(headline: string, ticker?: string) {
    return analyzeCustomHeadline(headline, ticker);
  }

  public async validateStockData(ticker: string, companyName?: string): Promise<OverallValidationSummary> {
    const report = await this.getStockResearch(ticker, companyName);
    return validatorService.validateFullReport(ticker, report);
  }
}

export const stockService = new StockService();
