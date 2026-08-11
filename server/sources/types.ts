export interface SourceProvenance {
  name: string;
  value: any;
  timestamp: string;
  exchange: string;
  delay_status: 'REALTIME' | 'DELAYED' | 'HISTORICAL' | 'UNKNOWN';
  status: 'valid' | 'invalid' | 'failed';
  error?: string;
}

export interface ConsensusValue<T> {
  value: T;
  status: 'VERIFIED' | 'SINGLE_SOURCE' | 'DATA_DISCREPANCY' | 'UNAVAILABLE';
  primary_source: string;
  provenance: SourceProvenance[];
  explanation?: string;
}

export interface UnifiedQuote {
  current_price: number | null;
  change: number;
  change_percent: number;
  open_price: number | null;
  high_52w: number | null;
  low_52w: number | null;
  previous_close: number | null;
  volume: number;
  avg_volume: number;
  market_cap: string;
  exchange: string;
  status: 'LIVE' | 'MARKET CLOSED — LAST VERIFIED CLOSE' | 'DATA UNAVAILABLE' | 'DATA DISCREPANCY';
  consensus_status: 'VERIFIED' | 'SINGLE_SOURCE' | 'DATA_DISCREPANCY' | 'UNAVAILABLE';
  sources_checked: SourceProvenance[];
  error_reason?: string;
}

export interface UnifiedNewsItem {
  title: string;
  publisher: string;
  link: string;
  published_date: string;
  retrieval_timestamp: string;
  sentiment: 'POSITIVE' | 'NEUTRAL' | 'NEGATIVE';
  vader_score: number;
  source_adapter: string;
}

export interface UnifiedNews {
  articles: UnifiedNewsItem[];
  status: 'SUCCESS' | 'DATA UNAVAILABLE';
  consensus_status: 'VERIFIED' | 'SINGLE_SOURCE' | 'DATA_DISCREPANCY' | 'UNAVAILABLE';
  sources_checked: SourceProvenance[];
  error_reason?: string;
}
