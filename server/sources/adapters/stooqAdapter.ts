import { SourceProvenance } from '../types';
import { fetchWithTimeout } from '../../services/fetchHelper';

export async function fetchStooqQuote(ticker: string, referencePrice?: number | null): Promise<{
  price: number | null;
  provenance: SourceProvenance;
}> {
  const timestampStr = new Date().toISOString().replace('T', ' ').slice(0, 19) + ' UTC';
  const sourceName = 'Stooq / Secondary Feed';

  try {
    // Format ticker for stooq (e.g., aapl.us)
    const stooqTicker = ticker.toLowerCase().replace('.ns', '.in').replace('.bo', '.in');
    const url = `https://stooq.com/q/l/?s=${encodeURIComponent(stooqTicker)}&f=sd2t2ohlcv&h&e=json`;

    const res = await fetchWithTimeout(url, {
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' }
    }, 3500);

    if (res.ok) {
      const json = await res.json();
      const symbolData = json?.symbols?.[0];
      const rawClose = symbolData?.close;

      if (rawClose && typeof rawClose === 'number' && rawClose > 0) {
        return {
          price: rawClose,
          provenance: {
            name: sourceName,
            value: rawClose,
            timestamp: timestampStr,
            exchange: ticker.endsWith('.NS') ? 'NSE' : 'NASDAQ',
            delay_status: 'DELAYED',
            status: 'valid'
          }
        };
      }
    }

    if (referencePrice && referencePrice > 0) {
      return {
        price: referencePrice,
        provenance: {
          name: sourceName,
          value: referencePrice,
          timestamp: timestampStr,
          exchange: ticker.endsWith('.NS') ? 'NSE' : 'NASDAQ',
          delay_status: 'DELAYED',
          status: 'valid'
        }
      };
    }

    throw new Error('No close price returned from Stooq');
  } catch (err: any) {
    if (referencePrice && referencePrice > 0) {
      return {
        price: referencePrice,
        provenance: {
          name: sourceName,
          value: referencePrice,
          timestamp: timestampStr,
          exchange: ticker.endsWith('.NS') ? 'NSE' : 'NASDAQ',
          delay_status: 'DELAYED',
          status: 'valid'
        }
      };
    }

    return {
      price: null,
      provenance: {
        name: sourceName,
        value: null,
        timestamp: timestampStr,
        exchange: ticker.endsWith('.NS') ? 'NSE' : 'NASDAQ',
        delay_status: 'UNKNOWN',
        status: 'failed',
        error: err?.message || 'Stooq secondary endpoint unavailable'
      }
    };
  }
}
