from typing import Dict, Any, List, Tuple

def compute_research_score(
    quote: Dict[str, Any],
    technical: Dict[str, Any],
    fundamentals: Dict[str, Any],
    nlp: Dict[str, Any],
    ml: Dict[str, Any]
) -> Tuple[float, List[Dict[str, Any]], str, str]:
    """
    Computes a transparent research score mathematically from real analyzed data.
    Weights:
      News Sentiment: 25%
      Technical Analysis: 25%
      Fundamental Valuation: 20%
      Machine Learning Prediction: 20%
      Sector & Market Context: 10%
    """
    missing_critical = False

    # 1. News Component Score (0 - 100)
    if nlp.get("status") == "SUCCESS" and nlp.get("total_headlines_analyzed", 0) > 0:
        pos_pct = nlp.get("positive_percentage", 0.0)
        neg_pct = nlp.get("negative_percentage", 0.0)
        overall_score = nlp.get("overall_score", 0.0) # -1.0 to 1.0
        # Convert -1.0..1.0 to 0..100, blended with positive headline ratio
        news_raw = max(0.0, min(100.0, (overall_score + 1.0) * 35 + (pos_pct * 0.30)))
        news_desc = f"Based on {nlp.get('total_headlines_analyzed')} real headlines ({pos_pct}% positive, {neg_pct}% negative)."
    else:
        news_raw = 50.0 # Neutral baseline
        news_desc = "News stream unavailable or unverified; using baseline neutral score."

    # 2. Technical Component Score (0 - 100)
    if technical.get("status") == "SUCCESS" and technical.get("rsi14") is not None:
        rsi = technical.get("rsi14", 50.0)
        sma20 = technical.get("sma20")
        sma50 = technical.get("sma50")
        cur_price = quote.get("current_price") or sma20 or 100.0
        macd_hist = technical.get("macd_hist") or 0.0

        tech_points = 50.0 # start neutral

        # RSI logic
        if 40 <= rsi <= 65: tech_points += 15.0 # healthy bullish momentum
        elif rsi < 30: tech_points += 10.0 # oversold bounce potential
        elif rsi > 70: tech_points -= 15.0 # overbought risk

        # SMA crossover & trend
        if sma20 and sma50:
            if sma20 > sma50: tech_points += 15.0 # Golden alignment
            else: tech_points -= 15.0 # Death alignment

        # Price above SMA20
        if sma20 and cur_price > sma20: tech_points += 10.0
        elif sma20 and cur_price < sma20: tech_points -= 10.0

        # MACD momentum
        if macd_hist > 0: tech_points += 10.0
        else: tech_points -= 10.0

        tech_raw = max(0.0, min(100.0, tech_points))
        tech_desc = f"Calculated from OHLCV: RSI 14={rsi}, SMA20={sma20}, SMA50={sma50}, MACD Hist={macd_hist}."
    else:
        tech_raw = 50.0
        missing_critical = True
        tech_desc = "OHLCV technical indicators unavailable."

    # 3. Fundamental Component Score (0 - 100)
    if fundamentals.get("status") == "SUCCESS" and fundamentals.get("metrics"):
        fund_points = 50.0
        valid_m_count = 0

        for m in fundamentals.get("metrics", []):
            name = m.get("metric_name", "")
            val = m.get("value")
            if val is not None and isinstance(val, (int, float)):
                valid_m_count += 1
                if "P/E" in name:
                    if 0 < val < 25: fund_points += 10
                    elif val > 50: fund_points -= 10
                elif "ROE" in name:
                    if val > 0.15 or val > 15: fund_points += 12
                    elif val < 0: fund_points -= 12
                elif "Operating Margin" in name or "Net Profit Margin" in name:
                    if val > 0.10 or val > 10: fund_points += 10
                elif "Debt / Equity" in name:
                    if val < 1.0 or val < 100: fund_points += 8
                    elif val > 2.5 or val > 250: fund_points -= 10

        fund_raw = max(0.0, min(100.0, fund_points))
        fund_desc = f"Derived from {valid_m_count} verified online fundamental metrics."
    else:
        fund_raw = 50.0
        fund_desc = "Fundamental metrics unavailable."

    # 4. Machine Learning Component Score (0 - 100)
    if ml.get("status") == "SUCCESS" and ml.get("up_probability") is not None:
        up_prob = ml.get("up_probability", 50.0)
        ml_raw = up_prob # Directly 0 to 100% UP probability
        ml_desc = f"RandomForestClassifier predicted UP direction probability: {up_prob}% (Accuracy: {ml.get('accuracy')}%)."
    else:
        ml_raw = 50.0
        ml_desc = "Machine Learning model data unavailable."

    # 5. Sector & Market Context Score (0 - 100)
    change_pct = quote.get("change_percent") or 0.0
    sector_raw = max(0.0, min(100.0, 50.0 + (change_pct * 5.0)))
    sector_desc = f"Sector relative change: {change_pct:+.2f}%."

    # Weights: News 25%, Technical 25%, Fundamental 20%, ML 20%, Sector 10%
    components = [
        {
            "category": "News Sentiment",
            "raw_score": round(news_raw, 2),
            "weight": 0.25,
            "weighted_score": round(news_raw * 0.25, 2),
            "description": news_desc
        },
        {
            "category": "Technical Indicators",
            "raw_score": round(tech_raw, 2),
            "weight": 0.25,
            "weighted_score": round(tech_raw * 0.25, 2),
            "description": tech_desc
        },
        {
            "category": "Fundamental Analysis",
            "raw_score": round(fund_raw, 2),
            "weight": 0.20,
            "weighted_score": round(fund_raw * 0.20, 2),
            "description": fund_desc
        },
        {
            "category": "Machine Learning Prediction",
            "raw_score": round(ml_raw, 2),
            "weight": 0.20,
            "weighted_score": round(ml_raw * 0.20, 2),
            "description": ml_desc
        },
        {
            "category": "Sector & Price Context",
            "raw_score": round(sector_raw, 2),
            "weight": 0.10,
            "weighted_score": round(sector_raw * 0.10, 2),
            "description": sector_desc
        }
    ]

    final_score = round(sum(c["weighted_score"] for c in components), 2)

    # Determine Signal
    if missing_critical or (quote.get("status") == "DATA UNAVAILABLE" and technical.get("status") == "DATA UNAVAILABLE"):
        signal = "INSUFFICIENT DATA"
        explanation = "Critical market data feeds were unavailable. System cannot form a reliable research signal without primary market feeds."
    else:
        if final_score >= 68.0:
            signal = "BUY"
            explanation = f"Calculated Research Score is {final_score}/100. Strong multi-factor convergence across technical, sentiment, and fundamental metrics."
        elif final_score <= 45.0:
            signal = "SELL"
            explanation = f"Calculated Research Score is {final_score}/100. Unfavorable momentum and negative underlying score factors."
        else:
            signal = "HOLD"
            explanation = f"Calculated Research Score is {final_score}/100. Balanced risk/reward profile without clear directional bias."

    return final_score, components, signal, explanation
