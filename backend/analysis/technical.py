import pandas as pd
import numpy as np
import datetime
from typing import Dict, Any

def calculate_technical_indicators(df: pd.DataFrame, ticker: str) -> Dict[str, Any]:
    """
    Calculates technical indicators from real Pandas OHLCV DataFrame using Pandas & NumPy.
    Indicators: SMA20, SMA50, RSI14, MACD, MACD Signal, MACD Hist, Support, Resistance, Volume Trend, Volatility.
    """
    if df is None or df.empty or len(df) < 5:
        return {
            "ticker": ticker,
            "sma20": None,
            "sma50": None,
            "rsi14": None,
            "macd": None,
            "macd_signal": None,
            "macd_hist": None,
            "support": None,
            "resistance": None,
            "volume_trend": None,
            "volatility": None,
            "calculation_period": "0 sessions",
            "timestamp": datetime.datetime.now(datetime.timezone.utc).strftime("%Y-%m-%d %H:%M:%S UTC"),
            "data_source": "Pandas DataFrame Calculation",
            "status": "DATA UNAVAILABLE",
            "error_reason": "Insufficient OHLCV data for technical indicators"
        }

    df = df.copy()
    close = df['Close']
    volume = df['Volume']

    # 1. Moving Averages
    sma20_series = close.rolling(window=20, min_periods=1).mean()
    sma50_series = close.rolling(window=50, min_periods=1).mean()
    
    latest_sma20 = float(sma20_series.iloc[-1]) if len(sma20_series) >= 1 else None
    latest_sma50 = float(sma50_series.iloc[-1]) if len(sma50_series) >= 1 else None

    # 2. RSI 14
    delta = close.diff()
    gain = (delta.where(delta > 0, 0)).rolling(window=14, min_periods=1).mean()
    loss = (-delta.where(delta < 0, 0)).rolling(window=14, min_periods=1).mean()
    rs = gain / (loss.replace(0, 1e-6))
    rsi_series = 100 - (100 / (1 + rs))
    latest_rsi = float(rsi_series.iloc[-1]) if not rsi_series.empty else None

    # 3. MACD (12, 26, 9)
    ema12 = close.ewm(span=12, adjust=False).mean()
    ema26 = close.ewm(span=26, adjust=False).mean()
    macd_line = ema12 - ema26
    signal_line = macd_line.ewm(span=9, adjust=False).mean()
    macd_hist = macd_line - signal_line

    latest_macd = float(macd_line.iloc[-1]) if not macd_line.empty else None
    latest_signal = float(signal_line.iloc[-1]) if not signal_line.empty else None
    latest_hist = float(macd_hist.iloc[-1]) if not macd_hist.empty else None

    # 4. Support & Resistance (Lowest Low and Highest High in last 30 sessions)
    lookback = min(30, len(df))
    recent_lows = df['Low'].iloc[-lookback:]
    recent_highs = df['High'].iloc[-lookback:]
    support_val = float(recent_lows.min()) if not recent_lows.empty else None
    resistance_val = float(recent_highs.max()) if not recent_highs.empty else None

    # 5. Volume Trend (Compare latest volume to 20-period volume SMA)
    vol_sma20 = volume.rolling(window=20, min_periods=1).mean().iloc[-1]
    latest_vol = float(volume.iloc[-1]) if len(volume) > 0 else 0
    if vol_sma20 > 0:
        vol_ratio = latest_vol / vol_sma20
        if vol_ratio > 1.3:
            vol_trend = "HIGH (30%+ Above Average)"
        elif vol_ratio < 0.7:
            vol_trend = "LOW (30%+ Below Average)"
        else:
            vol_trend = "NORMAL (Average Range)"
    else:
        vol_trend = "NORMAL"

    # 6. Volatility (Annualized std dev of daily log returns)
    daily_returns = np.log(close / close.shift(1)).dropna()
    if len(daily_returns) > 2:
        annualized_vol = float(daily_returns.std() * np.sqrt(252) * 100) # Percentage
    else:
        annualized_vol = None

    return {
        "ticker": ticker,
        "sma20": round(latest_sma20, 2) if latest_sma20 is not None else None,
        "sma50": round(latest_sma50, 2) if latest_sma50 is not None else None,
        "rsi14": round(latest_rsi, 2) if latest_rsi is not None else None,
        "macd": round(latest_macd, 4) if latest_macd is not None else None,
        "macd_signal": round(latest_signal, 4) if latest_signal is not None else None,
        "macd_hist": round(latest_hist, 4) if latest_hist is not None else None,
        "support": round(support_val, 2) if support_val is not None else None,
        "resistance": round(resistance_val, 2) if resistance_val is not None else None,
        "volume_trend": vol_trend,
        "volatility": round(annualized_vol, 2) if annualized_vol is not None else None,
        "calculation_period": f"{len(df)} trading sessions",
        "timestamp": datetime.datetime.now(datetime.timezone.utc).strftime("%Y-%m-%d %H:%M:%S UTC"),
        "data_source": "Pandas & NumPy Indicator Engine",
        "status": "SUCCESS",
        "error_reason": None
    }
