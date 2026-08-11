from fastapi import APIRouter, Query
from typing import List, Optional
from backend.services.company_resolver import resolve_company
from backend.services.market_data import get_company_quote
from backend.services.historical_data import get_historical_data
from backend.services.fundamentals import get_fundamentals
from backend.analysis.technical import calculate_technical_indicators
from backend.models.schemas import CompanySearchResult, CompanyQuoteResponse, HistoricalDataResponse, FundamentalsResponse, TechnicalAnalysisResponse

router = APIRouter(prefix="/api/company", tags=["Company"])

@router.get("/search", response_model=List[CompanySearchResult])
def search_company(q: str = Query(..., description="Company name or ticker query")):
    """
    Resolves company search query to matching tickers.
    """
    results = resolve_company(q)
    return results

@router.get("/{ticker}/quote", response_model=CompanyQuoteResponse)
def company_quote(ticker: str):
    """
    Returns real online quote for ticker.
    """
    return get_company_quote(ticker)

@router.get("/{ticker}/history", response_model=HistoricalDataResponse)
def company_history(ticker: str, period: str = Query("3M", description="1M, 3M, 6M, 1Y")):
    """
    Returns real OHLCV historical data cleaned by Pandas with Matplotlib chart.
    """
    _, resp = get_historical_data(ticker, period=period)
    return resp

@router.get("/{ticker}/fundamentals", response_model=FundamentalsResponse)
def company_fundamentals(ticker: str):
    """
    Returns real fundamental metrics with provenance.
    """
    return get_fundamentals(ticker)

@router.get("/{ticker}/technical", response_model=TechnicalAnalysisResponse)
def company_technical(ticker: str):
    """
    Calculates technical indicators from real Pandas DataFrame.
    """
    df, _ = get_historical_data(ticker, period="6M")
    return calculate_technical_indicators(df, ticker)
