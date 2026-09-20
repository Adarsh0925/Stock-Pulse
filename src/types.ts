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
  percent_change?: number | null;
  high_price?: number | null;
  low_price?: number | null;
  fifty_two_week_high?: number | null;
  fifty_two_week_low?: number | null;
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
  category?: string;
  is_banking_metric?: boolean;
}

export interface BankingMetrics {
  gross_npa?: number | null;
  gross_npa_percent?: number | null;
  net_npa?: number | null;
  net_npa_percent?: number | null;
  net_interest_margin?: number | null;
  nim_percent?: number | null; // Net Interest Margin
  casa_ratio?: number | null;
  casa_ratio_percent?: number | null;
  credit_growth_yoy?: number | null;
  advances_growth_yoy?: number | null; // Credit / Loan growth
  deposit_growth_yoy?: number | null;
  deposits_growth_yoy?: number | null;
  capital_adequacy_ratio?: number | null;
  crar_percent?: number | null; // Capital Adequacy Ratio
  tier_1_ratio?: number | null;
  tier1_capital_percent?: number | null;
  provision_coverage_ratio?: number | null; // PCR
  slippage_ratio?: number | null;
  return_on_assets?: number | null;
  roa_percent?: number | null; // Return on Assets
  cost_to_income_ratio?: number | null;
  pat_growth_yoy?: number | null;
}

export interface ScoringCriterion {
  name: string;
  weight_percent: number;
  points_awarded: number;
  max_points: number;
  metric_value: string;
  benchmark_target: string;
  peer_comparison: string;
  contribution_detail: string;
}

export interface ScoringCategoryItem {
  category: string;
  weight_percent: number;
  max_score: number;
  awarded_score: number;
  evaluation_summary: string;
}

export interface ScoringBreakdown {
  overall_score?: number;
  total_health_score?: number;
  max_score?: number;
  classification?: string;
  scoring_methodology: string;
  categories?: ScoringCategoryItem[];
  criteria?: ScoringCriterion[];
  peer_benchmarks_summary?: string;
  historical_trend_summary?: string;
}

export interface FundamentalsData {
  ticker: string;
  company_type: string;
  is_bank: boolean;
  fundamental_score: number;
  raw_health_score?: number;
  metrics: FundamentalMetric[];
  banking_metrics?: BankingMetrics | null;
  scoring_breakdown?: ScoringBreakdown | null;
  data_source: string;
  period?: string;
  publication_date?: string;
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

export interface MLEvidence {
  total_observations?: number;
  sample_count_sessions?: number;
  data_period_years?: string;
  training_split_methodology?: string;
  validation_protocol?: string;
  features_used?: string[];
  features_list?: string[];
  lookahead_leakage_control?: string;
  stress_testing?: {
    max_drawdown: string;
    benchmark_max_drawdown: string;
    period: string;
  };
  stress_test_drawdown?: string;
  transaction_costs?: {
    slippage_assumed_bps: number;
    annual_turnover_approx: string;
    net_sharpe_ratio: number;
  };
  transaction_cost_friction?: string;
  simulated_sharpe_ratio?: number;
  methodology_notes?: string;
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
  ml_score?: number;
  confidence_status?: string;
  is_reliable?: boolean;
  ml_evidence?: MLEvidence;
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

export interface ValuationAnalysis {
  fair_value_min: number;
  fair_value_max: number;
  fair_value_mid: number;
  current_price: number;
  discount_premium_percent: number;
  valuation_status: 'UNDERVALUED' | 'FAIRLY VALUED' | 'OVERVALUED';
  methodology_summary: string;
  target_pb_ratio: number;
  target_pe_ratio: number;
  historical_5y_pb_mean: number;
  technical_support_vs_fundamental_diff: string;
}

export interface ScenarioItem {
  target_price: number;
  upside_percent: number;
  downside_percent?: number;
  probability_percent: number;
  rationale: string;
  catalysts: string[];
}

export interface ScenarioAnalysis {
  recommended_entry_zone: string;
  tactical_stop_loss: number;
  downside_risk_percent: number;
  risk_reward_ratio: string;
  base_case: ScenarioItem;
  bull_case: ScenarioItem;
  bear_case: ScenarioItem;
}

export interface HorizonItem {
  horizon: string;
  view: 'BULLISH' | 'NEUTRAL' | 'CAUTIOUS' | 'COMPOUNDING BUY';
  target_range: string;
  key_drivers: string;
  risk_factors: string;
}

export interface MultiHorizonOutlook {
  short_term: HorizonItem; // 1-5 Sessions
  medium_term: HorizonItem; // 6-12 Months
  long_term: HorizonItem; // 3-5 Years
}

export interface CorporateGovernanceRisk {
  overall_governance_risk: 'LOW' | 'MODERATE' | 'ELEVATED';
  ceo_succession: {
    status: string;
    details: string;
    timeline: string;
    candidates_status: string;
  };
  regulatory_compliance: {
    rbi_status: string;
    unsecured_risk_weight_impact: string;
    audit_findings: string;
  };
  merger_integration: {
    status: string;
    progress_details: string;
    balance_sheet_digest: string;
  };
  monitoring_guidance: string;
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
  valuation?: ValuationAnalysis;
  scenario_analysis?: ScenarioAnalysis;
  multi_horizon_outlook?: MultiHorizonOutlook;
  governance_risk?: CorporateGovernanceRisk;
  final_research_score: number;
  research_signal: 'BUY' | 'HOLD' | 'SELL' | 'INSUFFICIENT DATA';
  signal_explanation: string;
  provenance_summary: Record<string, any>;
  provenance_details?: Record<string, any>;
  timestamp: string;
  status: string;
}
