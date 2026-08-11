from fastapi import APIRouter, Query
from typing import Optional
from backend.services.news_service import get_company_news
from backend.analysis.nlp import analyze_headlines_nlp
from backend.models.schemas import NewsResponse, NLPAnalysisResponse

router = APIRouter(prefix="/api/company", tags=["News & NLP"])

@router.get("/{ticker}/news", response_model=NewsResponse)
def company_news_endpoint(ticker: str, name: Optional[str] = Query(default=None, description="Company name"), period: str = Query(default="7d", description="24h, 3d, 7d, 30d")):
    """
    Returns real verified online news headlines for company.
    """
    company_name = name or ticker
    return get_company_news(company_name, ticker, time_filter=period)

@router.get("/{ticker}/nlp", response_model=NLPAnalysisResponse)
def company_nlp_endpoint(ticker: str, name: Optional[str] = Query(default=None, description="Company name")):
    """
    Performs NLP sentiment analysis on real retrieved headlines.
    """
    company_name = name or ticker
    news_res = get_company_news(company_name, ticker, time_filter="7d")
    articles = news_res.get("articles", [])
    return analyze_headlines_nlp(articles, ticker)
