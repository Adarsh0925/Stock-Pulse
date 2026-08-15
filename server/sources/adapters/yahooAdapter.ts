import { SourceProvenance } from '../types';
import { TickerResolverService } from '../../services/tickerResolver';

export async function fetchYahooQuote(ticker: string): Promise<{
  price: number | null;
  prevClose: number | null;
  openPrice: number | null;
  high52w: number | null;
  low52w: number | null;
  volume: number;
  exchange: string;
  provenance: SourceProvenance;
}> {
  const timestampStr = new Date().toISOString().replace('T', ' ').slice(0, 19) + ' UTC';
  const sourceName = 'Yahoo Finance API';

  try {
    const { data: json } = await TickerResolverService.resolveWorkingYahooChart(ticker, 'range=5d&interval=1d', 3500);
    const meta = json?.chart?.result?.[0]?.meta;

    if (!meta) {
      return {
        price: null,
        prevClose: null,
        openPrice: null,
        high52w: null,
        low52w: null,
        volume: 0,
        exchange: ticker.endsWith('.NS') ? 'NSE' : 'NASDAQ',
        provenance: {
          name: sourceName,
          value: null,
          timestamp: timestampStr,
          exchange: ticker.endsWith('.NS') ? 'NSE' : 'NASDAQ',
          delay_status: 'UNKNOWN',
          status: 'failed',
          error: 'Yahoo Finance feed unavailable'
        }
      };
    }

    const price = typeof meta.regularMarketPrice === 'number' && meta.regularMarketPrice > 0 ? meta.regularMarketPrice : null;
    const prevClose = typeof meta.regularMarketPreviousClose === 'number' && meta.regularMarketPreviousClose > 0
      ? meta.regularMarketPreviousClose
      : typeof meta.previousClose === 'number' && meta.previousClose > 0
      ? meta.previousClose
      : typeof meta.chartPreviousClose === 'number' && meta.chartPreviousClose > 0 
      ? meta.chartPreviousClose 
      : price;
    const openPrice = typeof meta.regularMarketDayOpen === 'number' && meta.regularMarketDayOpen > 0 ? meta.regularMarketDayOpen : prevClose;
    const high52w = typeof meta.fiftyTwoWeekHigh === 'number' && meta.fiftyTwoWeekHigh > 0 ? meta.fiftyTwoWeekHigh : price;
    const low52w = typeof meta.fiftyTwoWeekLow === 'number' && meta.fiftyTwoWeekLow > 0 ? meta.fiftyTwoWeekLow : price;
    const volume = typeof meta.regularMarketVolume === 'number' ? meta.regularMarketVolume : 0;
    const exchange = ticker.endsWith('.NS') ? 'NSE' : ticker.endsWith('.BO') ? 'BSE' : 'NASDAQ';

    return {
      price,
      prevClose,
      openPrice,
      high52w,
      low52w,
      volume,
      exchange,
      provenance: {
        name: sourceName,
        value: price,
        timestamp: timestampStr,
        exchange,
        delay_status: 'DELAYED',
        status: price !== null ? 'valid' : 'invalid'
      }
    };
  } catch (err: any) {
    return {
      price: null,
      prevClose: null,
      openPrice: null,
      high52w: null,
      low52w: null,
      volume: 0,
      exchange: ticker.endsWith('.NS') ? 'NSE' : 'NASDAQ',
      provenance: {
        name: sourceName,
        value: null,
        timestamp: timestampStr,
        exchange: ticker.endsWith('.NS') ? 'NSE' : 'NASDAQ',
        delay_status: 'UNKNOWN',
        status: 'failed',
        error: err?.message || 'Yahoo Finance endpoint unavailable'
      }
    };
  }
}
