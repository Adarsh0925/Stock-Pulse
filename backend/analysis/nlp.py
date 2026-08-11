import re
import datetime
from typing import List, Dict, Any

# Try importing vaderSentiment or nltk
try:
    from vaderSentiment.vaderSentiment import SentimentIntensityAnalyzer
    vader_analyzer = SentimentIntensityAnalyzer()
except Exception:
    try:
        import nltk
        nltk.download('vader_lexicon', quiet=True)
        from nltk.sentiment.vader import SentimentIntensityAnalyzer
        vader_analyzer = SentimentIntensityAnalyzer()
    except Exception:
        vader_analyzer = None

# Custom financial lexicon adjustments for VADER
FINANCIAL_WORDS = {
    'surge': 2.0, 'jump': 1.8, 'rally': 2.2, 'growth': 1.5, 'profit': 2.0,
    'record': 1.5, 'gain': 1.5, 'bullish': 2.0, 'outperform': 2.0, 'upgrade': 2.0,
    'plunge': -2.2, 'slump': -2.0, 'drop': -1.5, 'loss': -2.0, 'bearish': -2.0,
    'downgrade': -2.0, 'probe': -1.8, 'lawsuit': -1.8, 'fine': -1.5, 'fraud': -3.0
}

if vader_analyzer:
    vader_analyzer.lexicon.update(FINANCIAL_WORDS)

def analyze_headlines_nlp(articles: List[Dict[str, Any]], ticker: str) -> Dict[str, Any]:
    """
    Analyzes real company news headlines using Financial Sentiment NLP (VADER).
    Calculates exact mathematical sentiment scores, positive/neutral/negative %, and event categories.
    Never uses hardcoded percentages.
    """
    if not articles:
        return {
            "ticker": ticker,
            "total_headlines_analyzed": 0,
            "positive_percentage": 0.0,
            "neutral_percentage": 0.0,
            "negative_percentage": 0.0,
            "overall_sentiment": "NEUTRAL",
            "overall_score": 0.0,
            "headline_analyses": [],
            "timestamp": datetime.datetime.now(datetime.timezone.utc).strftime("%Y-%m-%d %H:%M:%S UTC"),
            "status": "NO VERIFIED NEWS FOUND",
            "error_reason": "No headlines available to perform NLP analysis"
        }

    headline_results = []
    pos_count = 0
    neu_count = 0
    neg_count = 0
    score_sum = 0.0

    for art in articles:
        text = art.get('headline', '')
        pub = art.get('publisher', 'News Source')
        cat = art.get('category', 'General News')

        if vader_analyzer:
            vs = vader_analyzer.polarity_scores(text)
            compound = vs['compound']
        else:
            # Lexicon based fallback calculation
            compound = rule_based_sentiment(text)

        score_sum += compound

        if compound >= 0.05:
            sentiment = "POSITIVE"
            pos_count += 1
        elif compound <= -0.05:
            sentiment = "NEGATIVE"
            neg_count += 1
        else:
            sentiment = "NEUTRAL"
            neu_count += 1

        # Extract keywords
        words = re.findall(r'\b[A-Za-z]{4,}\b', text)
        stop_words = {'this', 'that', 'with', 'from', 'have', 'more', 'about', 'company', 'stock', 'shares', 'india'}
        keywords = [w.capitalize() for w in words if w.lower() not in stop_words][:4]

        # Calculate relevance
        relevance = 1.0 if any(term in text.lower() for term in [ticker.split('.')[0].lower(), 'company']) else 0.85

        headline_results.append({
            "headline": text,
            "publisher": pub,
            "sentiment": sentiment,
            "sentiment_score": round(float(compound), 4),
            "confidence": round(abs(float(compound)), 2),
            "category": cat,
            "keywords": keywords,
            "relevance": relevance
        })

    total = len(articles)
    pos_pct = round((pos_count / total) * 100, 2)
    neu_pct = round((neu_count / total) * 100, 2)
    neg_pct = round((neg_count / total) * 100, 2)
    avg_score = round(score_sum / total, 4)

    if avg_score >= 0.10:
        overall_sentiment = "BULLISH"
    elif avg_score <= -0.10:
        overall_sentiment = "BEARISH"
    else:
        overall_sentiment = "NEUTRAL"

    return {
        "ticker": ticker,
        "total_headlines_analyzed": total,
        "positive_percentage": pos_pct,
        "neutral_percentage": neu_pct,
        "negative_percentage": neg_pct,
        "overall_sentiment": overall_sentiment,
        "overall_score": avg_score,
        "headline_analyses": headline_results,
        "timestamp": datetime.datetime.now(datetime.timezone.utc).strftime("%Y-%m-%d %H:%M:%S UTC"),
        "status": "SUCCESS",
        "error_reason": None
    }


def rule_based_sentiment(text: str) -> float:
    text_lower = text.lower()
    score = 0.0
    for word, weight in FINANCIAL_WORDS.items():
        if word in text_lower:
            score += weight
    return max(-1.0, min(1.0, score / 3.0))
