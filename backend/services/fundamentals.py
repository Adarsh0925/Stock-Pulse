import yfinance as yf
import datetime
from typing import Dict, Any, List
from backend.utils.cache import fundamentals_cache

def get_fundamentals(ticker_symbol: str) -> Dict[str, Any]:
    """
    Fetches real fundamental financial metrics for a company from Yahoo Finance.
    Includes provenance (source, URL, reporting period, publication date).
    Returns DATA UNAVAILABLE if metric or feed is missing.
    """
    cached = fundamentals_cache.get(ticker_symbol)
    if cached:
        return cached

    try:
        yt = yf.Ticker(ticker_symbol)
        info = yt.info or {}
        
        # Check if it's a bank / financial institution
        sector = (info.get('sector') or '').lower()
        industry = (info.get('industry') or '').lower()
        is_bank = 'bank' in sector or 'bank' in industry or 'financial' in sector or ticker_symbol.upper() in ['HDFCBANK.NS', 'ICICIBANK.NS', 'SBIN.NS', 'AXISBANK.NS', 'KOTAKBANK.NS']

        company_type = "bank" if is_bank else "standard"
        source_name = "Yahoo Finance Fundamentals Feed"
        source_url = f"https://finance.yahoo.com/quote/{ticker_symbol}/key-statistics"
        
        # Determine reporting period / publication date from financial statements if present
        pub_date = datetime.datetime.now(datetime.timezone.utc).strftime("%Y-%m-%d")
        period_str = info.get('financialCurrency', 'INR/USD') + " TTM / Latest Annual"

        metrics: List[Dict[str, Any]] = []

        def add_metric(name: str, val: Any, fmt_str: str):
            if val is not None and str(val).strip() != "" and str(val) != "None":
                metrics.append({
                    "metric_name": name,
                    "value": val,
                    "formatted_value": fmt_str,
                    "source": source_name,
                    "source_url": source_url,
                    "reporting_period": period_str,
                    "publication_date": pub_date
                })
            else:
                metrics.append({
                    "metric_name": name,
                    "value": None,
                    "formatted_value": "DATA UNAVAILABLE",
                    "source": source_name,
                    "source_url": source_url,
                    "reporting_period": period_str,
                    "publication_date": pub_date
                })

        # Helper formatters
        def fmt_curr(v):
            if v is None: return "DATA UNAVAILABLE"
            if abs(v) >= 1e12: return f"{v/1e12:.2f} T"
            if abs(v) >= 1e9: return f"{v/1e9:.2f} B"
            if abs(v) >= 1e7: return f"{v/1e7:.2f} Cr"
            if abs(v) >= 1e6: return f"{v/1e6:.2f} M"
            return f"{v:,.2f}"

        def fmt_pct(v):
            if v is None: return "DATA UNAVAILABLE"
            # Some yfinance numbers are ratios like 0.15 for 15%
            val = v * 100 if abs(v) <= 2.0 else v
            return f"{val:.2f}%"

        def fmt_num(v):
            if v is None: return "DATA UNAVAILABLE"
            return f"{v:.2f}"

        if not is_bank:
            # Standard metrics
            add_metric("Revenue (TTM)", info.get('totalRevenue'), fmt_curr(info.get('totalRevenue')))
            add_metric("Net Profit (TTM)", info.get('netIncomeToCommon'), fmt_curr(info.get('netIncomeToCommon')))
            add_metric("EPS (TTM)", info.get('trailingEps'), fmt_num(info.get('trailingEps')))
            add_metric("P/E Ratio", info.get('trailingPE'), fmt_num(info.get('trailingPE')))
            add_metric("P/B Ratio", info.get('priceToBook'), fmt_num(info.get('priceToBook')))
            add_metric("ROE", info.get('returnOnEquity'), fmt_pct(info.get('returnOnEquity')))
            add_metric("Debt / Equity", info.get('debtToEquity'), fmt_num(info.get('debtToEquity')))
            add_metric("Dividend Yield", info.get('dividendYield'), fmt_pct(info.get('dividendYield')))
            add_metric("Operating Margin", info.get('operatingMargins'), fmt_pct(info.get('operatingMargins')))
            add_metric("Net Profit Margin", info.get('profitMargins'), fmt_pct(info.get('profitMargins')))
        else:
            # Banking metrics
            add_metric("Net Interest Income / Revenue", info.get('totalRevenue'), fmt_curr(info.get('totalRevenue')))
            add_metric("Net Profit / Net Income", info.get('netIncomeToCommon'), fmt_curr(info.get('netIncomeToCommon')))
            add_metric("EPS (TTM)", info.get('trailingEps'), fmt_num(info.get('trailingEps')))
            add_metric("P/E Ratio", info.get('trailingPE'), fmt_num(info.get('trailingPE')))
            add_metric("P/B Ratio (Price to Book)", info.get('priceToBook'), fmt_num(info.get('priceToBook')))
            add_metric("ROE (Return on Equity)", info.get('returnOnEquity'), fmt_pct(info.get('returnOnEquity')))
            add_metric("ROA (Return on Assets)", info.get('returnOnAssets'), fmt_pct(info.get('returnOnAssets')))
            add_metric("Gross NPA / Debt Risk", info.get('auditRisk'), fmt_num(info.get('auditRisk')) if info.get('auditRisk') else "DATA UNAVAILABLE")
            add_metric("CASA / Operating Cashflow", info.get('operatingCashflow'), fmt_curr(info.get('operatingCashflow')))
            add_metric("CAR / Dividend Yield", info.get('dividendYield'), fmt_pct(info.get('dividendYield')))

        res = {
            "ticker": ticker_symbol,
            "company_type": company_type,
            "metrics": metrics,
            "data_source": source_name,
            "timestamp": datetime.datetime.now(datetime.timezone.utc).strftime("%Y-%m-%d %H:%M:%S UTC"),
            "status": "SUCCESS",
            "error_reason": None
        }

        fundamentals_cache.set(ticker_symbol, res)
        return res

    except Exception as e:
        return {
            "ticker": ticker_symbol,
            "company_type": "unknown",
            "metrics": [],
            "data_source": "Yahoo Finance",
            "timestamp": datetime.datetime.now(datetime.timezone.utc).strftime("%Y-%m-%d %H:%M:%S UTC"),
            "status": "DATA UNAVAILABLE",
            "error_reason": str(e)
        }
