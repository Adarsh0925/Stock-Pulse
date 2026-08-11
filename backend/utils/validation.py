import pandas as pd

def validate_ohlcv_dataframe(df: pd.DataFrame) -> pd.DataFrame:
    """
    Validates and cleans OHLCV Pandas DataFrame:
    1. Checks for required columns: Date, Open, High, Low, Close, Volume
    2. Sorts chronologically by Date
    3. Drops duplicate dates
    4. Handles missing values (forward fill then backward fill)
    5. Filters out invalid non-positive prices
    """
    if df is None or df.empty:
        return pd.DataFrame()

    df = df.copy()
    
    # Ensure Date is datetime
    if "Date" in df.columns:
        df["Date"] = pd.to_datetime(df["Date"])
        df = df.sort_values("Date", ascending=True)
        df = df.drop_duplicates(subset=["Date"], keep="last")

    required_cols = ["Open", "High", "Low", "Close", "Volume"]
    for col in required_cols:
        if col in df.columns:
            df[col] = pd.to_numeric(df[col], errors="coerce")

    # Handle missing numeric values safely
    df[required_cols] = df[required_cols].ffill().bfill()

    # Filter out invalid prices <= 0
    if "Close" in df.columns:
        df = df[df["Close"] > 0]

    df = df.reset_index(drop=True)
    return df
