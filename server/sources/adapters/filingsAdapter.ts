import { SourceProvenance } from '../types';
import { calculateFundamentals } from '../../services/fundamentals';

export async function fetchFilingsFundamentals(ticker: string, currentPrice: number | null): Promise<{
  fundamentals: ReturnType<typeof calculateFundamentals>;
  provenance: SourceProvenance[];
}> {
  const timestampStr = new Date().toISOString().replace('T', ' ').slice(0, 19) + ' UTC';
  const data = calculateFundamentals(ticker, currentPrice);

  const exchangeLabel = ticker.endsWith('.NS') ? 'NSE / BSE Filings' : 'SEC EDGAR Filings';
  const provenance: SourceProvenance[] = [
    {
      name: data.source,
      value: `P/E: ${data.pe_ratio ?? 'N/A'}, ROE: ${data.roe ?? 'N/A'}%`,
      timestamp: timestampStr,
      exchange: exchangeLabel,
      delay_status: 'HISTORICAL',
      status: data.status === 'SUCCESS' ? 'valid' : 'invalid'
    }
  ];

  return {
    fundamentals: data,
    provenance
  };
}
