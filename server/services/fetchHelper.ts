import dns from 'node:dns';

if (dns.setDefaultResultOrder) {
  dns.setDefaultResultOrder('ipv4first');
}

/**
 * Resilient HTTP fetch utility with timeouts and automatic host fallback.
 */

export async function fetchWithTimeout(url: string, options: RequestInit = {}, timeoutMs = 6000): Promise<Response> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, {
      ...options,
      signal: controller.signal
    });
    return res;
  } finally {
    clearTimeout(timeoutId);
  }
}

export async function fetchYahooChart(ticker: string, queryParams: string, timeoutMs = 6000): Promise<any> {
  const hosts = ['query1.finance.yahoo.com', 'query2.finance.yahoo.com'];
  const cleanTicker = encodeURIComponent(ticker);

  for (const host of hosts) {
    try {
      const url = `https://${host}/v8/finance/chart/${cleanTicker}?${queryParams}`;
      const res = await fetchWithTimeout(
        url,
        {
          headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' }
        },
        timeoutMs
      );

      if (res.ok) {
        const json = await res.json();
        if (json?.chart?.result?.[0]) {
          console.log(`[PROVIDER DIAGNOSTIC] Host: ${host} | Ticker: ${ticker} | Status: SUCCESS`);
          return json;
        } else {
          console.warn(`[PROVIDER DIAGNOSTIC] Host: ${host} | Ticker: ${ticker} | Status: EMPTY_RESULT_BODY`);
        }
      } else {
        console.warn(`[PROVIDER DIAGNOSTIC] Host: ${host} | Ticker: ${ticker} | Status: HTTP_${res.status}`);
      }
    } catch (err: any) {
      if (err.name === 'AbortError') {
        console.warn(`[PROVIDER DIAGNOSTIC] Host: ${host} | Ticker: ${ticker} | Status: TIMEOUT_FALLBACK`);
      } else {
        console.warn(`[PROVIDER DIAGNOSTIC] Host: ${host} | Ticker: ${ticker} | Request Error: ${err?.message || err}`);
      }
    }
  }

  return null;
}
