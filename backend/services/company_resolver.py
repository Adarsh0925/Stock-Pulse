import requests
from typing import List, Dict, Any

# Map of common prominent companies to avoid ambiguity
KNOWN_COMPANIES = {
    "HDFC BANK": {"ticker": "HDFCBANK.NS", "name": "HDFC Bank Limited", "exchange": "NSE", "sector": "Financial Services"},
    "HDFC": {"ticker": "HDFCBANK.NS", "name": "HDFC Bank Limited", "exchange": "NSE", "sector": "Financial Services"},
    "RELIANCE": {"ticker": "RELIANCE.NS", "name": "Reliance Industries Limited", "exchange": "NSE", "sector": "Energy"},
    "RELIANCE INDUSTRIES": {"ticker": "RELIANCE.NS", "name": "Reliance Industries Limited", "exchange": "NSE", "sector": "Energy"},
    "TCS": {"ticker": "TCS.NS", "name": "Tata Consultancy Services Limited", "exchange": "NSE", "sector": "Technology"},
    "TATA CONSULTANCY": {"ticker": "TCS.NS", "name": "Tata Consultancy Services Limited", "exchange": "NSE", "sector": "Technology"},
    "INFOSYS": {"ticker": "INFY.NS", "name": "Infosys Limited", "exchange": "NSE", "sector": "Technology"},
    "INFY": {"ticker": "INFY.NS", "name": "Infosys Limited", "exchange": "NSE", "sector": "Technology"},
    "TATA MOTORS": {"ticker": "TATAMOTORS.NS", "name": "Tata Motors Limited", "exchange": "NSE", "sector": "Automobile"},
    "ICICI BANK": {"ticker": "ICICIBANK.NS", "name": "ICICI Bank Limited", "exchange": "NSE", "sector": "Financial Services"},
    "SBI": {"ticker": "SBIN.NS", "name": "State Bank of India", "exchange": "NSE", "sector": "Financial Services"},
    "STATE BANK OF INDIA": {"ticker": "SBIN.NS", "name": "State Bank of India", "exchange": "NSE", "sector": "Financial Services"},
    "NVIDIA": {"ticker": "NVDA", "name": "NVIDIA Corporation", "exchange": "NASDAQ", "sector": "Technology"},
    "APPLE": {"ticker": "AAPL", "name": "Apple Inc.", "exchange": "NASDAQ", "sector": "Technology"},
    "TESLA": {"ticker": "TSLA", "name": "Tesla, Inc.", "exchange": "NASDAQ", "sector": "Consumer Cyclical"},
    "MICROSOFT": {"ticker": "MSFT", "name": "Microsoft Corporation", "exchange": "NASDAQ", "sector": "Technology"},
    "GOOGLE": {"ticker": "GOOGL", "name": "Alphabet Inc.", "exchange": "NASDAQ", "sector": "Technology"},
    "ALPHABET": {"ticker": "GOOGL", "name": "Alphabet Inc.", "exchange": "NASDAQ", "sector": "Technology"},
    "AMAZON": {"ticker": "AMZN", "name": "Amazon.com Inc.", "exchange": "NASDAQ", "sector": "Consumer Cyclical"},
    "BHARTI AIRTEL": {"ticker": "BHARTIARTL.NS", "name": "Bharti Airtel Limited", "exchange": "NSE", "sector": "Telecom"},
    "AIRTEL": {"ticker": "BHARTIARTL.NS", "name": "Bharti Airtel Limited", "exchange": "NSE", "sector": "Telecom"},
    "L&T": {"ticker": "LT.NS", "name": "Larsen & Toubro Limited", "exchange": "NSE", "sector": "Infrastructure"},
    "LARSEN & TOUBRO": {"ticker": "LT.NS", "name": "Larsen & Toubro Limited", "exchange": "NSE", "sector": "Infrastructure"},
    "ITC": {"ticker": "ITC.NS", "name": "ITC Limited", "exchange": "NSE", "sector": "Consumer Goods"},
    "AXIS BANK": {"ticker": "AXISBANK.NS", "name": "Axis Bank Limited", "exchange": "NSE", "sector": "Financial Services"},
    "KOTAK": {"ticker": "KOTAKBANK.NS", "name": "Kotak Mahindra Bank Limited", "exchange": "NSE", "sector": "Financial Services"},
    "KOTAK BANK": {"ticker": "KOTAKBANK.NS", "name": "Kotak Mahindra Bank Limited", "exchange": "NSE", "sector": "Financial Services"},
    "WIPRO": {"ticker": "WIPRO.NS", "name": "Wipro Limited", "exchange": "NSE", "sector": "Technology"},
    "HCL TECH": {"ticker": "HCLTECH.NS", "name": "HCL Technologies Limited", "exchange": "NSE", "sector": "Technology"},
    "MARUTI": {"ticker": "MARUTI.NS", "name": "Maruti Suzuki India Limited", "exchange": "NSE", "sector": "Automobile"},
}

def resolve_company(query: str) -> List[Dict[str, Any]]:
    """
    Resolves user search query to actual company objects.
    Searches known dictionary first, then calls Yahoo Finance live search API.
    """
    clean_q = query.strip().upper()
    results = []
    
    # Check known dict first
    if clean_q in KNOWN_COMPANIES:
        results.append(KNOWN_COMPANIES[clean_q])
    
    for key, val in KNOWN_COMPANIES.items():
        if clean_q in key or key in clean_q:
            if val not in results:
                results.append(val)
                
    # Search online Yahoo Finance API if results are few or user entered raw symbol/query
    try:
        url = f"https://query2.finance.yahoo.com/v1/finance/search?q={requests.utils.quote(query)}&quotesCount=10"
        headers = {'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'}
        resp = requests.get(url, headers=headers, timeout=5)
        if resp.status_code == 200:
            data = resp.json()
            quotes = data.get('quotes', [])
            for q in quotes:
                symbol = q.get('symbol')
                name = q.get('shortname') or q.get('longname') or symbol
                exch = q.get('exchange', 'UNKNOWN')
                quote_type = q.get('quoteType', '')
                if symbol and quote_type in ['EQUITY', 'INDEX', 'MUTUALFUND']:
                    item = {
                        "ticker": symbol,
                        "name": name,
                        "exchange": exch,
                        "sector": q.get('sector', 'General'),
                        "country": q.get('country', 'Global')
                    }
                    if not any(r['ticker'] == symbol for r in results):
                        results.append(item)
    except Exception:
        pass

    # If query looks like a raw ticker, include it directly
    if not results and len(query) >= 1:
        raw_ticker = clean_q
        if not raw_ticker.endswith(".NS") and not raw_ticker.endswith(".BO") and len(raw_ticker) > 5:
            raw_ticker += ".NS"
        results.append({
            "ticker": raw_ticker,
            "name": query.strip().title(),
            "exchange": "NSE" if raw_ticker.endswith(".NS") else "GLOBAL",
            "sector": "General",
            "country": "India" if raw_ticker.endswith(".NS") else "Global"
        })

    return results
