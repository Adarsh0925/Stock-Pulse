import io
import base64
import datetime
import yfinance as yf
import pandas as pd
import matplotlib
matplotlib.use('Agg') # Non-interactive backend
import matplotlib.pyplot as plt
from typing import Dict, Any, Tuple
from backend.utils.validation import validate_ohlcv_dataframe
from backend.utils.cache import history_cache

PERIOD_MAP = {
    "1M": "1mo",
    "3M": "3mo",
    "6M": "6mo",
    "1Y": "1y"
}

def get_historical_data(ticker_symbol: str, period: str = "3M") -> Tuple[pd.DataFrame, Dict[str, Any]]:
    """
    Retrieves real historical OHLCV data, cleans it using Pandas,
    generates a Matplotlib chart, and returns both the DataFrame and a JSON response dict.
    """
    cache_key = f"{ticker_symbol}_{period}"
    cached = history_cache.get(cache_key)
    if cached:
        return cached["df"], cached["response"]

    yf_period = PERIOD_MAP.get(period, "3mo")

    try:
        yt = yf.Ticker(ticker_symbol)
        hist = yt.history(period=yf_period)

        if hist.empty:
            resp = {
                "ticker": ticker_symbol,
                "period": period,
                "candle_count": 0,
                "data_source": "Yahoo Finance OHLCV Feed",
                "timestamp": datetime.datetime.now(datetime.timezone.utc).strftime("%Y-%m-%d %H:%M:%S UTC"),
                "ohlcv": [],
                "chart_image_base64": None,
                "status": "DATA UNAVAILABLE",
                "error_reason": f"No historical sessions returned for {ticker_symbol} ({period})"
            }
            return pd.DataFrame(), resp

        # Format into explicit columns Date, Open, High, Low, Close, Volume
        df = hist.reset_index()
        
        # Ensure column names
        if "Date" in df.columns or "Datetime" in df.columns:
            date_col = "Date" if "Date" in df.columns else "Datetime"
            df["Date"] = pd.to_datetime(df[date_col]).dt.strftime("%Y-%m-%d")

        for col in ["Open", "High", "Low", "Close", "Volume"]:
            if col not in df.columns:
                df[col] = 0.0

        # Validate with Pandas
        clean_df = validate_ohlcv_dataframe(df[["Date", "Open", "High", "Low", "Close", "Volume"]])

        if clean_df.empty:
            resp = {
                "ticker": ticker_symbol,
                "period": period,
                "candle_count": 0,
                "data_source": "Yahoo Finance OHLCV Feed",
                "timestamp": datetime.datetime.now(datetime.timezone.utc).strftime("%Y-%m-%d %H:%M:%S UTC"),
                "ohlcv": [],
                "chart_image_base64": None,
                "status": "DATA UNAVAILABLE",
                "error_reason": "Historical data failed validation (empty after cleaning)"
            }
            return pd.DataFrame(), resp

        # Generate Matplotlib chart
        chart_base64 = generate_matplotlib_chart(clean_df, ticker_symbol, period)

        # Convert clean_df to list of dicts for frontend
        ohlcv_list = clean_df.to_dict(orient="records")

        resp = {
            "ticker": ticker_symbol,
            "period": period,
            "candle_count": len(clean_df),
            "data_source": "Yahoo Finance OHLCV Feed",
            "timestamp": datetime.datetime.now(datetime.timezone.utc).strftime("%Y-%m-%d %H:%M:%S UTC"),
            "ohlcv": ohlcv_list,
            "chart_image_base64": chart_base64,
            "status": "SUCCESS",
            "error_reason": None
        }

        history_cache.set(cache_key, {"df": clean_df, "response": resp})
        return clean_df, resp

    except Exception as e:
        resp = {
            "ticker": ticker_symbol,
            "period": period,
            "candle_count": 0,
            "data_source": "Yahoo Finance OHLCV Feed",
            "timestamp": datetime.datetime.now(datetime.timezone.utc).strftime("%Y-%m-%d %H:%M:%S UTC"),
            "ohlcv": [],
            "chart_image_base64": None,
            "status": "DATA UNAVAILABLE",
            "error_reason": f"Historical data fetch error: {str(e)}"
        }
        return pd.DataFrame(), resp


def generate_matplotlib_chart(df: pd.DataFrame, ticker: str, period: str) -> str:
    """
    Generates a financial Matplotlib chart showing Closing Price, SMA 20, SMA 50, and Volume.
    Returns base64 encoded PNG string.
    """
    try:
        if df is None or len(df) < 5:
            return ""

        df = df.copy()
        df['SMA20'] = df['Close'].rolling(window=20, min_periods=1).mean()
        df['SMA50'] = df['Close'].rolling(window=50, min_periods=1).mean()

        plt.style.use('dark_background')
        fig, (ax1, ax2) = plt.subplots(2, 1, figsize=(10, 5), gridspec_kw={'height_ratios': [3, 1]}, sharex=True)
        fig.patch.set_facecolor('#0f172a') # Tailwind Slate 900
        ax1.set_facecolor('#0f172a')
        ax2.set_facecolor('#0f172a')

        # Price & Moving Averages
        ax1.plot(df['Date'], df['Close'], label='Close Price', color='#38bdf8', linewidth=1.8)
        ax1.plot(df['Date'], df['SMA20'], label='SMA 20', color='#f59e0b', linewidth=1.2, linestyle='--')
        ax1.plot(df['Date'], df['SMA50'], label='SMA 50', color='#ec4899', linewidth=1.2, linestyle=':')

        ax1.set_title(f"{ticker} Technical Chart ({period}) - Real OHLCV", color='#f8fafc', fontsize=12, pad=10, fontweight='bold')
        ax1.set_ylabel('Price', color='#94a3b8')
        ax1.legend(loc='upper left', frameon=True, facecolor='#1e293b', edgecolor='#334155', labelcolor='#f8fafc')
        ax1.grid(True, linestyle=':', alpha=0.3, color='#475569')

        # Volume bars
        colors = ['#22c55e' if c >= o else '#ef4444' for c, o in zip(df['Close'], df['Open'])]
        ax2.bar(df['Date'], df['Volume'], color=colors, alpha=0.7, width=0.8)
        ax2.set_ylabel('Volume', color='#94a3b8')
        ax2.grid(True, linestyle=':', alpha=0.3, color='#475569')

        # Format X ticks
        tick_spacing = max(1, len(df) // 8)
        ax2.set_xticks(range(0, len(df), tick_spacing))
        ax2.set_xticklabels(df['Date'].iloc[::tick_spacing], rotation=30, ha='right', color='#94a3b8', fontsize=8)

        ax1.tick_params(colors='#94a3b8')
        ax2.tick_params(colors='#94a3b8')

        plt.tight_layout()

        buffer = io.BytesIO()
        plt.savefig(buffer, format='png', dpi=120, bbox_inches='tight', facecolor=fig.get_facecolor())
        buffer.seek(0)
        image_png = buffer.getvalue()
        buffer.close()
        plt.close(fig)

        return base64.b64encode(image_png).decode('utf-8')
    except Exception:
        return ""
