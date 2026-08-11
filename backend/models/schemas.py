from pydantic import BaseModel
from typing import List, Optional, Dict, Any

class Nifty50Response(BaseModel):
    index_name: str
    symbol: str
    current_price: Optional[float]
    previous_close: Optional[float]
    change: Optional[float]
    change_percent: Optional[float]
    market_status: str  # OPEN or CLOSED or DATA UNAVAILABLE
    timestamp: str
    data_source: str
    details: Optional[Dict[str, Any]] = None

class CompanySearchResult(BaseModel):
    ticker: str
    name: str
    exchange: str
    sector: Optional[str] = "Unknown"
    country: Optional[str] = "Unknown"

class CompanyQuoteResponse(BaseModel):
    ticker: str
    name: str
    current_price: Optional[float]
    previous_close: Optional[float]
    change: Optional[float]
    change_percent: Optional[float]
    volume: Optional[int]
    market_cap: Optional[float]
    exchange: str
    sector: Optional[str]
    timestamp: str
    data_source: str
    status: str = "SUCCESS" # SUCCESS or DATA UNAVAILABLE
    error_reason: Optional[str] = None

class HistoricalDataResponse(BaseModel):
    ticker: str
    period: str
    candle_count: int
    data_source: str
    timestamp: str
    ohlcv: List[Dict[str, Any]]
    chart_image_base64: Optional[str] = None
    status: str = "SUCCESS"
    error_reason: Optional[str] = None

class FundamentalMetric(BaseModel):
    metric_name: str
    value: Optional[Any]
    formatted_value: str
    source: str
    source_url: Optional[str] = None
    reporting_period: Optional[str] = None
    publication_date: Optional[str] = None

class FundamentalsResponse(BaseModel):
    ticker: str
    company_type: str # standard or bank
    metrics: List[FundamentalMetric]
    data_source: str
    timestamp: str
    status: str = "SUCCESS"
    error_reason: Optional[str] = None

class NewsArticle(BaseModel):
    headline: str
    publisher: str
    published_at: str
    url: str
    category: str
    time_filter: str
    verified: bool = True

class NewsResponse(BaseModel):
    ticker: str
    company_name: str
    time_filter: str
    article_count: int
    articles: List[NewsArticle]
    data_source: str
    timestamp: str
    status: str = "SUCCESS"
    error_reason: Optional[str] = None

class TechnicalAnalysisResponse(BaseModel):
    ticker: str
    sma20: Optional[float]
    sma50: Optional[float]
    rsi14: Optional[float]
    macd: Optional[float]
    macd_signal: Optional[float]
    macd_hist: Optional[float]
    support: Optional[float]
    resistance: Optional[float]
    volume_trend: Optional[str]
    volatility: Optional[float]
    calculation_period: str
    timestamp: str
    data_source: str
    status: str = "SUCCESS"
    error_reason: Optional[str] = None

class HeadlineNLP(BaseModel):
    headline: str
    publisher: str
    sentiment: str # POSITIVE, NEUTRAL, NEGATIVE
    sentiment_score: float
    confidence: Optional[float] = None
    category: str
    keywords: List[str]
    relevance: float

class NLPAnalysisResponse(BaseModel):
    ticker: str
    total_headlines_analyzed: int
    positive_percentage: float
    neutral_percentage: float
    negative_percentage: float
    overall_sentiment: str
    overall_score: float
    headline_analyses: List[HeadlineNLP]
    timestamp: str
    status: str = "SUCCESS"
    error_reason: Optional[str] = None

class MLMetricsResponse(BaseModel):
    ticker: str
    model_name: str = "RandomForestClassifier"
    accuracy: Optional[float]
    precision: Optional[float]
    recall: Optional[float]
    f1_score: Optional[float]
    test_sample_count: int
    training_period: str
    testing_period: str
    up_probability: Optional[float]
    down_probability: Optional[float]
    predicted_next_direction: Optional[str]
    timestamp: str
    status: str = "SUCCESS" # SUCCESS or ML DATA UNAVAILABLE
    error_reason: Optional[str] = None

class ResearchScoreComponent(BaseModel):
    category: str
    raw_score: float
    weight: float
    weighted_score: float
    description: str

class CompleteResearchResponse(BaseModel):
    ticker: str
    company_name: str
    quote: CompanyQuoteResponse
    historical: HistoricalDataResponse
    technical: TechnicalAnalysisResponse
    fundamentals: FundamentalsResponse
    news: NewsResponse
    nlp: NLPAnalysisResponse
    ml: MLMetricsResponse
    score_components: List[ResearchScoreComponent]
    final_research_score: float
    research_signal: str # BUY, HOLD, SELL, INSUFFICIENT DATA
    signal_explanation: str
    provenance_summary: Dict[str, Any]
    timestamp: str
    status: str = "SUCCESS"
