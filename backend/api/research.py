import datetime
from fastapi import APIRouter, Query
from typing import Optional
from backend.services.company_resolver import resolve_company
from backend.services.market_data import get_company_quote
from backend.services.historical_data import get_historical_data
from backend.services.fundamentals import get_fundamentals
from backend.services.news_service import get_company_news
from backend.analysis.technical import calculate_technical_indicators
from backend.analysis.nlp import analyze_headlines_nlp
from backend.ml.model import train_and_predict_ml
from backend.analysis.scoring import compute_research_score
from backend.models.schemas import MLMetricsResponse, CompleteResearchResponse

router = APIRouter(prefix="/api/company", tags=["ML & Research"])

@router.get("/{ticker}/ml", response_model=MLMetricsResponse)
def company_ml_endpoint(ticker: str):
    """
    Trains Scikit-Learn RandomForest model on real historical OHLCV sessions and returns real test metrics.
    """
    df, _ = get_historical_data(ticker, period="1Y")
    return train_and_predict_ml(df, ticker)

@router.get("/{ticker}/research", response_model=CompleteResearchResponse)
def complete_research_endpoint(ticker: str, name: Optional[str] = Query(default=None, description="Company name")):
    """
    Primary endpoint that aggregates quote, history, technicals, fundamentals, news, NLP, ML,
    computes mathematical Research Score and Research Signal with full provenance.
    """
    # 1. Resolve Name
    company_name = name
    if not company_name:
        resolved = resolve_company(ticker)
        company_name = resolved[0]["name"] if resolved else ticker

    # 2. Fetch Quote
    quote = get_company_quote(ticker)

    # 3. Fetch Historical Data (1Y for ML & Technicals)
    df, history_resp = get_historical_data(ticker, period="6M")

    # 4. Technical Analysis
    technical = calculate_technical_indicators(df, ticker)

    # 5. Fundamentals
    fundamentals = get_fundamentals(ticker)

    # 6. News
    news = get_company_news(company_name, ticker, time_filter="7d")

    # 7. NLP Analysis
    nlp = analyze_headlines_nlp(news.get("articles", []), ticker)

    # 8. ML Analysis
    ml = train_and_predict_ml(df, ticker)

    # 9. Scoring & Signal
    final_score, components, signal, explanation = compute_research_score(
        quote=quote,
        technical=technical,
        fundamentals=fundamentals,
        nlp=nlp,
        ml=ml
    )

    provenance_summary = {
        "price_data_source": quote.get("data_source"),
        "ohlcv_dataset": history_resp.get("data_source"),
        "technical_calculation_engine": technical.get("data_source"),
        "fundamental_source": fundamentals.get("data_source"),
        "news_publisher_sources": news.get("data_source"),
        "nlp_model": "VADER Financial Lexicon NLP Engine",
        "ml_model": ml.get("model_name"),
        "scoring_algorithm": "Transparent Weighted Multi-Factor Formula"
    }

    now_str = datetime.datetime.now(datetime.timezone.utc).strftime("%Y-%m-%d %H:%M:%S UTC")

    return {
        "ticker": ticker,
        "company_name": company_name,
        "quote": quote,
        "historical": history_resp,
        "technical": technical,
        "fundamentals": fundamentals,
        "news": news,
        "nlp": nlp,
        "ml": ml,
        "score_components": components,
        "final_research_score": final_score,
        "research_signal": signal,
        "signal_explanation": explanation,
        "provenance_summary": provenance_summary,
        "timestamp": now_str,
        "status": "SUCCESS"
    }
