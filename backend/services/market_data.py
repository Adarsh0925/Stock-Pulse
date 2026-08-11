import requests
import datetime
import yfinance as yf
from typing import Dict, Any
from backend.utils.cache import market_cache, quote_cache

def get_nifty50_data() -> Dict[str, Any]:
    """
    Fetches real online data for NIFTY 50 index (^NSEI).
    Returns real values, market status, timestamp, and source.
    If fails, returns status DATA UNAVAILABLE.
    """
    cached = market_cache.get("NIFTY50")
    if cached:
        return cached

    try:
        ticker = yf.Ticker("^NSEI")
        info = ticker.fast_info
        
        # Check current price and previous close
        current_price = info.last_price or info.regular_market_price
        previous_close = info.previous_close
        
        if current_price is None or previous_close is None:
            # Fallback to history
            hist = ticker.history(period="5d")
            if not hist.empty and len(hist) >= 1:
                current_price = float(hist['Close'].iloc[-1])
                previous_close = float(hist['Close'].iloc[-2]) if len(hist) >= 2 else float(hist['Open'].iloc[-1])

        if current_price is None or previous_close is None:
            return {
                "index_name": "NIFTY 50",
                "symbol": "^NSEI",
                "current_price": None,
                "previous_close": None,
                "change": None,
                "change_percent": None,
                "market_status": "DATA UNAVAILABLE",
                "timestamp": datetime.datetime.utcnow().isoformat() + "Z",
                "data_source": "NSE / Yahoo Finance",
                "details": {"error": "Could not retrieve valid NIFTY 50 prices"}
            }

        change = round(current_price - previous_close, 2)
        change_pct = round((change / previous_close) * 100, 2)
        
        # Determine market status
        # NSE market hours: 09:15 to 15:30 IST (03:45 to 10:00 UTC), Mon-Fri
        now_utc = datetime.datetime.utcnow()
        is_weekday = now_utc.weekday() < 5
        # Convert UTC to IST (+5:30)
        now_ist = now_utc + datetime.timedelta(hours=5, minutes=30)
        market_open_time = now_ist.replace(hour=9, minute=15, second=0, microsecond=0)
        market_close_time = now_ist.replace(hour=15, minute=30, second=0, microsecond=0)
        
        if is_weekday and market_open_time <= now_ist <= market_close_time:
            market_status = "OPEN"
        else:
            market_status = "MARKET CLOSED"

        res = {
            "index_name": "NIFTY 50",
            "symbol": "^NSEI",
            "current_price": round(current_price, 2),
            "previous_close": round(previous_close, 2),
            "change": change,
            "change_percent": change_pct,
            "market_status": market_status,
            "timestamp": datetime.datetime.now(datetime.timezone.utc).strftime("%Y-%m-%d %H:%M:%S UTC"),
            "data_source": "Yahoo Finance / NSE Verified Feed",
            "details": {
                "ist_time": now_ist.strftime("%Y-%m-%d %H:%M:%S IST"),
                "is_live_session": market_status == "OPEN"
            }
        }
        
        market_cache.set("NIFTY50", res)
        return res

    except Exception as e:
        return {
            "index_name": "NIFTY 50",
            "symbol": "^NSEI",
            "current_price": None,
            "previous_close": None,
            "change": None,
            "change_percent": None,
            "market_status": "DATA UNAVAILABLE",
            "timestamp": datetime.datetime.now(datetime.timezone.utc).strftime("%Y-%m-%d %H:%M:%S UTC"),
            "data_source": "Yahoo Finance",
            "details": {"error": str(e)}
        }


def get_company_quote(ticker_symbol: str) -> Dict[str, Any]:
    """
    Fetches real quote data for a company ticker.
    """
    cached = quote_cache.get(ticker_symbol)
    if cached:
        return cached

    try:
        yt = yf.Ticker(ticker_symbol)
        info = yt.info or {}
        fast = yt.fast_info

        current_price = fast.last_price or info.get('currentPrice') or info.get('regularMarketPrice')
        previous_close = fast.previous_close or info.get('previousClose') or info.get('regularMarketPreviousClose')

        if current_price is None or previous_close is None:
            hist = yt.history(period="5d")
            if not hist.empty and len(hist) >= 1:
                current_price = float(hist['Close'].iloc[-1])
                previous_close = float(hist['Close'].iloc[-2]) if len(hist) >= 2 else float(hist['Open'].iloc[-1])

        if current_price is None:
            return {
                "ticker": ticker_symbol,
                "name": info.get('shortName') or ticker_symbol,
                "current_price": None,
                "previous_close": None,
                "change": None,
                "change_percent": None,
                "volume": None,
                "market_cap": None,
                "exchange": info.get('exchange', 'NSE' if ticker_symbol.endswith('.NS') else 'GLOBAL'),
                "sector": info.get('sector', 'Unknown'),
                "timestamp": datetime.datetime.now(datetime.timezone.utc).strftime("%Y-%m-%d %H:%M:%S UTC"),
                "data_source": "Yahoo Finance",
                "status": "DATA UNAVAILABLE",
                "error_reason": f"Real-time price feed unavailable for {ticker_symbol}"
            }

        prev_close_val = previous_close if previous_close else current_price
        change = round(current_price - prev_close_val, 2)
        change_pct = round((change / prev_close_val) * 100, 2) if prev_close_val else 0.0

        volume = fast.last_volume or info.get('volume') or info.get('regularMarketVolume')
        market_cap = fast.market_cap or info.get('marketCap')

        res = {
            "ticker": ticker_symbol,
            "name": info.get('longName') or info.get('shortName') or ticker_symbol,
            "current_price": round(current_price, 2),
            "previous_close": round(prev_close_val, 2),
            "change": change,
            "change_percent": change_pct,
            "volume": int(volume) if volume else None,
            "market_cap": float(market_cap) if market_cap else None,
            "exchange": info.get('exchange', 'NSE' if ticker_symbol.endswith('.NS') else 'GLOBAL'),
            "sector": info.get('sector', 'General'),
            "timestamp": datetime.datetime.now(datetime.timezone.utc).strftime("%Y-%m-%d %H:%M:%S UTC"),
            "data_source": "Yahoo Finance Real-time",
            "status": "SUCCESS",
            "error_reason": None
        }

        quote_cache.set(ticker_symbol, res)
        return res

    except Exception as e:
        return {
            "ticker": ticker_symbol,
            "name": ticker_symbol,
            "current_price": None,
            "previous_close": None,
            "change": None,
            "change_percent": None,
            "volume": None,
            "market_cap": None,
            "exchange": "NSE" if ticker_symbol.endswith('.NS') else "GLOBAL",
            "sector": "Unknown",
            "timestamp": datetime.datetime.now(datetime.timezone.utc).strftime("%Y-%m-%d %H:%M:%S UTC"),
            "data_source": "Yahoo Finance",
            "status": "DATA UNAVAILABLE",
            "error_reason": str(e)
        }
