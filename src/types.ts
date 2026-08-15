export interface Nifty50Data {
  index_name?: string;
  symbol?: string;
  ticker?: string;
  current_price: number | null;
  previous_close: number | null;
  change: number | null;
  change_percent: number | null;
  market_status: string;
  status?: string;
  open_price?: number | null;
  high_52w?: number | null;
  low_52w?: number | null;
  timestamp: string;
  data_source: string;
  session_info?: {
    currentTimeIST: string;
    currentDateIST: string;
    currentDayName: string;
    dayOfWeek: number;
    isWeekend: boolean;
    isHoliday: boolean;
    holidayName?: string;
    isMarketOpen: boolean;
    statusBadge: string;
    statusDetail: string;
    lastTradingDate: string;
    lastTradingFormatted: string;
    nextTradingDate: string;
    nextTradingFormatted: string;
    validationChecks?: {
      dayCheck: string;
      timeCheck: string;
      holidayCheck: string;
      sessionAlignmentCheck: string;
    };
  };
  validation_status?: {
    isValid: boolean;
    priceCheck: string;
    mathCheck: string;
    dateCheck: string;
    sourcesCount: number;
  };
  details?: Record<string, any>;
}

export interface CompanySearchResult {
  ticker: string;
  name: string;
  exchange: string;
  sector?: string;
  country?: string;
}

export interface CompanyQuote {
  ticker: string;
  name: string;
  current_price: number | null;
  previous_close: number | null;
  change: number | null;
  change_percent: number | null;
  volume: number | null;
  market_cap: number | null;
  exchange: string;
  sector: string;
  timestamp: string;
  data_source: string;
  status: string;
  consensus_status?: string;
  sources_checked?: any[];
  error_reason?: string | null;
}

export interface OHLCVCandle {
  Date: string;
  Open: number;
  High: number;
  Low: number;
  Close: number;
  Volume: number;
}

export interface HistoricalData {
  ticker: string;
  period: string;
  candle_count: number;
  data_source: string;
  timestamp: string;
  ohlcv: OHLCVCandle[];
  chart_image_base64?: string | null;
  status: string;
  error_reason?: string | null;
}

export interface FundamentalMetric {
  metric_name: string;
  value: any;
  formatted_value: string;
  source: string;
  source_url?: string | null;
  reporting_period?: string | null;
  publication_date?: string | null;
}

export interface FundamentalsData {
  ticker: string;
  company_type: string;
  metrics: FundamentalMetric[];
  data_source: string;
  timestamp: string;
  status: string;
  error_reason?: string | null;
}

export interface NewsArticle {
  headline: string;
  publisher: string;
  published_at: string;
  url: string;
  category: string;
  time_filter: string;
  verified: boolean;
}

export interface NewsData {
  ticker: string;
  company_name: string;
  time_filter: string;
  article_count: number;
  articles: NewsArticle[];
  data_source: string;
  timestamp: string;
  status: string;
  error_reason?: string | null;
}

export interface TechnicalData {
  ticker: string;
  sma20: number | null;
  sma50: number | null;
  rsi14: number | null;
  macd: number | null;
  macd_signal: number | null;
  macd_hist: number | null;
  macd_histogram?: number | null;
  ma_description?: string | null;
  support: number | null;
  resistance: number | null;
  volume_trend: string | null;
  volatility: number | null;
  calculation_period: string;
  timestamp: string;
  data_source: string;
  status: string;
  error_reason?: string | null;
}

export interface HeadlineNLP {
  headline: string;
  publisher: string;
  sentiment: 'POSITIVE' | 'NEUTRAL' | 'NEGATIVE';
  sentiment_score: number;
  confidence?: number;
  category: string;
  keywords: string[];
  relevance: number;
}

export interface NLPData {
  ticker: string;
  total_headlines_analyzed: number;
  positive_percentage: number;
  neutral_percentage: number;
  negative_percentage: number;
  overall_sentiment: string;
  overall_score: number;
  headline_analyses: HeadlineNLP[];
  timestamp: string;
  status: string;
  error_reason?: string | null;
}

export interface MLData {
  ticker: string;
  model_name: string;
  accuracy: number | null;
  precision: number | null;
  recall: number | null;
  f1_score: number | null;
  test_sample_count: number;
  training_period: string;
  testing_period: string;
  up_probability: number | null;
  down_probability: number | null;
  predicted_next_direction: 'UP' | 'DOWN' | null;
  timestamp: string;
  status: string;
  error_reason?: string | null;
}

export interface ScoreComponent {
  category: string;
  raw_score: number;
  weight: number;
  weighted_score: number;
  description: string;
  status?: string;
}

export interface ResearchReport {
  ticker: string;
  company_name: string;
  quote: CompanyQuote;
  historical: HistoricalData;
  technical: TechnicalData;
  fundamentals: FundamentalsData;
  news: NewsData;
  nlp: NLPData;
  ml: MLData;
  score_components: ScoreComponent[];
  final_research_score: number;
  research_signal: 'BUY' | 'HOLD' | 'SELL' | 'INSUFFICIENT DATA';
  signal_explanation: string;
  provenance_summary: Record<string, any>;
  provenance_details?: Record<string, any>;
  timestamp: string;
  status: string;
}
