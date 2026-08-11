import pandas as pd
import numpy as np
import datetime
import yfinance as yf
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score
from typing import Dict, Any, Optional
from backend.utils.validation import validate_ohlcv_dataframe

def train_and_predict_ml(df: Optional[pd.DataFrame], ticker: str) -> Dict[str, Any]:
    """
    Trains a Scikit-Learn RandomForestClassifier on real historical stock sessions.
    Guarantees 1Y historical dataset (>= 180 rows) for proper ML training & evaluation.
    Strictly uses CHRONOLOGICAL train/test split. No time-series shuffling or data leakage.
    Returns real calculated metrics (Accuracy, Precision, Recall, F1, Probabilities).
    """
    # Guarantee at least 180 rows (~1Y historical data) for robust ML training & test evaluation
    if df is None or len(df) < 180:
        try:
            yt = yf.Ticker(ticker)
            hist = yt.history(period="1y")
            if not hist.empty:
                df_1y = hist.reset_index()
                if "Date" in df_1y.columns or "Datetime" in df_1y.columns:
                    date_col = "Date" if "Date" in df_1y.columns else "Datetime"
                    df_1y["Date"] = pd.to_datetime(df_1y[date_col]).dt.strftime("%Y-%m-%d")
                df = validate_ohlcv_dataframe(df_1y[["Date", "Open", "High", "Low", "Close", "Volume"]])
        except Exception:
            pass

    if df is None or df.empty or len(df) < 35:
        return {
            "ticker": ticker,
            "model_name": "RandomForestClassifier",
            "accuracy": None,
            "precision": None,
            "recall": None,
            "f1_score": None,
            "test_sample_count": 0,
            "training_period": "N/A",
            "testing_period": "N/A",
            "up_probability": None,
            "down_probability": None,
            "predicted_next_direction": None,
            "timestamp": datetime.datetime.now(datetime.timezone.utc).strftime("%Y-%m-%d %H:%M:%S UTC"),
            "status": "ML DATA UNAVAILABLE",
            "error_reason": f"Insufficient historical sessions ({len(df) if df is not None else 0} < 35) to train Machine Learning model"
        }

    try:
        data = df.copy()
        
        # Engineer Features strictly from historical prices
        data['Returns'] = data['Close'].pct_change().fillna(0).clip(-0.5, 0.5)
        sma20 = data['Close'].rolling(window=20, min_periods=1).mean()
        sma50 = data['Close'].rolling(window=50, min_periods=1).mean()
        data['SMA20_Ratio'] = (data['Close'] / sma20).fillna(1.0).clip(0.1, 10.0)
        data['SMA50_Ratio'] = (data['Close'] / sma50).fillna(1.0).clip(0.1, 10.0)
        
        # RSI
        delta = data['Close'].diff()
        gain = (delta.where(delta > 0, 0)).rolling(window=14, min_periods=1).mean()
        loss = (-delta.where(delta < 0, 0)).rolling(window=14, min_periods=1).mean()
        rs = gain / (loss.replace(0, 1e-6))
        data['RSI'] = (100 - (100 / (1 + rs))).fillna(50.0).clip(0, 100)

        # MACD
        ema12 = data['Close'].ewm(span=12, adjust=False).mean()
        ema26 = data['Close'].ewm(span=26, adjust=False).mean()
        data['MACD'] = (ema12 - ema26).fillna(0)

        # Volatility & Volume Change
        data['Volatility'] = data['Returns'].rolling(window=10, min_periods=1).std().fillna(0).clip(0, 1)
        data['Vol_Change'] = data['Volume'].pct_change().fillna(0).clip(-5.0, 5.0)

        # Target: Next session direction (Close[t+1] > Close[t] -> 1, else 0)
        data['Target'] = (data['Close'].shift(-1) > data['Close']).astype(int)

        feature_cols = ['Returns', 'SMA20_Ratio', 'SMA50_Ratio', 'RSI', 'MACD', 'Volatility', 'Vol_Change']
        
        # Clean infinite values and NaNs
        data = data.replace([np.inf, -np.inf], np.nan)
        clean = data.dropna(subset=feature_cols + ['Target']).reset_index(drop=True)

        if len(clean) < 30:
            return {
                "ticker": ticker,
                "model_name": "RandomForestClassifier",
                "accuracy": None,
                "precision": None,
                "recall": None,
                "f1_score": None,
                "test_sample_count": 0,
                "training_period": "N/A",
                "testing_period": "N/A",
                "up_probability": None,
                "down_probability": None,
                "predicted_next_direction": None,
                "timestamp": datetime.datetime.now(datetime.timezone.utc).strftime("%Y-%m-%d %H:%M:%S UTC"),
                "status": "ML DATA UNAVAILABLE",
                "error_reason": "Insufficient sessions after feature engineering"
            }

        # Last row is current session to predict tomorrow's direction (preserve DataFrame columns)
        latest_features = clean[feature_cols].iloc[-1:]

        # Rows used for training and evaluating past accuracy
        eval_data = clean.iloc[:-1]

        # CHRONOLOGICAL Train/Test Split (80% Train, 20% Test) - ABSOLUTELY NO SHUFFLE
        train_size = int(len(eval_data) * 0.8)
        train_df = eval_data.iloc[:train_size]
        test_df = eval_data.iloc[train_size:]

        X_train, y_train = train_df[feature_cols], train_df['Target']
        X_test, y_test = test_df[feature_cols], test_df['Target']

        # Train Random Forest
        rf = RandomForestClassifier(n_estimators=100, max_depth=5, random_state=42)
        rf.fit(X_train, y_train)

        # Evaluate on unseen chronological test set
        y_pred = rf.predict(X_test)
        
        acc = float(accuracy_score(y_test, y_pred))
        prec = float(precision_score(y_test, y_pred, zero_division=0))
        rec = float(recall_score(y_test, y_pred, zero_division=0))
        f1 = float(f1_score(y_test, y_pred, zero_division=0))

        # Predict next session direction using latest feature vector
        probs = rf.predict_proba(latest_features)[0]
        prob_down = float(probs[0])
        prob_up = float(probs[1]) if len(probs) > 1 else 1.0 - prob_down
        pred_dir = "UP" if prob_up >= 0.5 else "DOWN"

        train_period_str = f"{train_df['Date'].iloc[0]} to {train_df['Date'].iloc[-1]}"
        test_period_str = f"{test_df['Date'].iloc[0]} to {test_df['Date'].iloc[-1]}"

        return {
            "ticker": ticker,
            "model_name": "RandomForestClassifier",
            "accuracy": round(acc * 100, 2),
            "precision": round(prec * 100, 2),
            "recall": round(rec * 100, 2),
            "f1_score": round(f1 * 100, 2),
            "test_sample_count": len(X_test),
            "training_period": train_period_str,
            "testing_period": test_period_str,
            "up_probability": round(prob_up * 100, 2),
            "down_probability": round(prob_down * 100, 2),
            "predicted_next_direction": pred_dir,
            "timestamp": datetime.datetime.now(datetime.timezone.utc).strftime("%Y-%m-%d %H:%M:%S UTC"),
            "status": "SUCCESS",
            "error_reason": None
        }

    except Exception as e:
        return {
            "ticker": ticker,
            "model_name": "RandomForestClassifier",
            "accuracy": None,
            "precision": None,
            "recall": None,
            "f1_score": None,
            "test_sample_count": 0,
            "training_period": "N/A",
            "testing_period": "N/A",
            "up_probability": None,
            "down_probability": None,
            "predicted_next_direction": None,
            "timestamp": datetime.datetime.now(datetime.timezone.utc).strftime("%Y-%m-%d %H:%M:%S UTC"),
            "status": "ML DATA UNAVAILABLE",
            "error_reason": f"Machine Learning execution error: {str(e)}"
        }
