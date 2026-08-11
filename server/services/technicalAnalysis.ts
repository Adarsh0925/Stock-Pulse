import { Candle } from './marketData';

export interface TechnicalData {
  rsi14: number | null;
  sma20: number | null;
  sma50: number | null;
  prev_sma20: number | null;
  prev_sma50: number | null;
  ma_signal: string;
  ma_description: string;
  macd: number | null;
  macd_signal: number | null;
  macd_histogram: number | null;
  support: number | null;
  resistance: number | null;
  trend_status: string;
  volatility_10d: number | null;
  technical_score: number; // Max 35 points
  status: 'SUCCESS' | 'INSUFFICIENT VERIFIED HISTORICAL DATA';
  error_reason?: string;
}

export function calculateTechnicals(candles: Candle[]): TechnicalData {
  if (!candles || candles.length < 20) {
    return {
      rsi14: null,
      sma20: null,
      sma50: null,
      prev_sma20: null,
      prev_sma50: null,
      ma_signal: "INSUFFICIENT_DATA",
      ma_description: "Insufficient data for moving averages",
      macd: null,
      macd_signal: null,
      macd_histogram: null,
      support: null,
      resistance: null,
      trend_status: "Insufficient verified historical data",
      volatility_10d: null,
      technical_score: 0,
      status: "INSUFFICIENT VERIFIED HISTORICAL DATA",
      error_reason: `Fewer than 20 verified historical daily candles available (${candles?.length || 0}/20 required)`
    };
  }

  const closes = candles.map(c => c.close);
  const lows = candles.map(c => c.low);
  const highs = candles.map(c => c.high);
  const lastClose = closes[closes.length - 1];

  // 1. Calculate 14-day RSI
  let rsi14: number | null = null;
  if (closes.length >= 15) {
    let gains = 0;
    let losses = 0;
    for (let i = closes.length - 14; i < closes.length; i++) {
      const diff = closes[i] - closes[i - 1];
      if (diff >= 0) gains += diff;
      else losses += Math.abs(diff);
    }
    const avgGain = gains / 14;
    const avgLoss = losses / 14;
    const rs = avgLoss === 0 ? 100 : avgGain / avgLoss;
    rsi14 = Number((100 - (100 / (1 + rs))).toFixed(2));
  }

  // 2. Calculate SMA20 and SMA50 (Current and Previous session)
  const sma20Window = closes.slice(-20);
  const sma20 = Number((sma20Window.reduce((a, b) => a + b, 0) / sma20Window.length).toFixed(2));

  let sma50: number | null = null;
  if (closes.length >= 50) {
    const sma50Window = closes.slice(-50);
    sma50 = Number((sma50Window.reduce((a, b) => a + b, 0) / sma50Window.length).toFixed(2));
  } else {
    sma50 = sma20;
  }

  let prev_sma20: number | null = null;
  let prev_sma50: number | null = null;
  if (closes.length >= 21) {
    const prev20Window = closes.slice(-21, -1);
    prev_sma20 = Number((prev20Window.reduce((a, b) => a + b, 0) / prev20Window.length).toFixed(2));
  }
  if (closes.length >= 51) {
    const prev50Window = closes.slice(-51, -1);
    prev_sma50 = Number((prev50Window.reduce((a, b) => a + b, 0) / prev50Window.length).toFixed(2));
  } else if (prev_sma20 !== null) {
    prev_sma50 = prev_sma20;
  }

  // Moving Average Crossover vs Alignment Logic
  let maSignal = "BULLISH_ALIGNMENT";
  let maDescription = "Bullish Alignment (SMA20 > SMA50)";

  if (prev_sma20 !== null && prev_sma50 !== null && sma20 !== null && sma50 !== null) {
    if (prev_sma20 >= prev_sma50 && sma20 < sma50) {
      maSignal = "BEARISH_CROSSOVER";
      maDescription = "Bearish Crossover (SMA20 crossed below SMA50 in current session)";
    } else if (prev_sma20 <= prev_sma50 && sma20 > sma50) {
      maSignal = "BULLISH_CROSSOVER";
      maDescription = "Bullish Crossover (Golden Cross — SMA20 crossed above SMA50 in current session)";
    } else if (sma20 < sma50) {
      maSignal = "BEARISH_ALIGNMENT";
      maDescription = "Bearish Alignment (SMA20 < SMA50)";
    } else {
      maSignal = "BULLISH_ALIGNMENT";
      maDescription = "Bullish Alignment (SMA20 > SMA50)";
    }
  } else if (sma20 !== null && sma50 !== null) {
    if (sma20 < sma50) {
      maSignal = "BEARISH_ALIGNMENT";
      maDescription = "Bearish Alignment (SMA20 < SMA50)";
    } else {
      maSignal = "BULLISH_ALIGNMENT";
      maDescription = "Bullish Alignment (SMA20 > SMA50)";
    }
  }

  // 3. Calculate MACD (12,26) & MACD Signal Line (9-period EMA of MACD)
  const calcEMASeries = (data: number[], span: number): number[] => {
    const k = 2 / (span + 1);
    const emaSeries: number[] = [data[0]];
    for (let i = 1; i < data.length; i++) {
      emaSeries.push(data[i] * k + emaSeries[i - 1] * (1 - k));
    }
    return emaSeries;
  };

  let macdLine: number | null = null;
  let macdSignal: number | null = null;
  let macdHistogram: number | null = null;

  if (closes.length >= 26) {
    const ema12Series = calcEMASeries(closes, 12);
    const ema26Series = calcEMASeries(closes, 26);
    const macdSeries: number[] = [];
    for (let i = 0; i < closes.length; i++) {
      macdSeries.push(ema12Series[i] - ema26Series[i]);
    }
    const signalSeries = calcEMASeries(macdSeries, 9);

    macdLine = Number(macdSeries[macdSeries.length - 1].toFixed(2));
    macdSignal = Number(signalSeries[signalSeries.length - 1].toFixed(2));
    macdHistogram = Number((macdLine - macdSignal).toFixed(2));
  }

  // 4. Support and Resistance (20-period swing low / high)
  const last20Lows = lows.slice(-20);
  const last20Highs = highs.slice(-20);
  const support = Number(Math.min(...last20Lows).toFixed(2));
  const resistance = Number(Math.max(...last20Highs).toFixed(2));

  // 5. Calculate Annualized Volatility (%) from daily returns
  const returns: number[] = [];
  for (let i = 1; i < closes.length; i++) {
    returns.push((closes[i] - closes[i - 1]) / closes[i - 1]);
  }
  let volatility10d: number | null = null;
  if (returns.length >= 10) {
    const lastReturns = returns.slice(-20);
    const meanReturn = lastReturns.reduce((a, b) => a + b, 0) / lastReturns.length;
    const variance = lastReturns.reduce((sum, r) => sum + Math.pow(r - meanReturn, 2), 0) / Math.max(1, lastReturns.length - 1);
    const annualizedVol = Math.sqrt(variance) * Math.sqrt(252) * 100;
    volatility10d = Number(annualizedVol.toFixed(2));
  }

  // 6. Compute Technical Score (out of 35 pts)
  let score = 0;
  let trendStatus = "NEUTRAL CONSOLIDATION";

  if (sma50 !== null && lastClose > sma20 && lastClose > sma50) {
    score += 12;
    trendStatus = "BULLISH UPTREND";
  } else if (lastClose > sma20) {
    score += 8;
    trendStatus = "MODERATE UPTREND";
  } else if (sma50 !== null && lastClose < sma20 && lastClose < sma50) {
    score += 2;
    trendStatus = "BEARISH DOWNTREND";
  } else {
    score += 5;
  }

  if (rsi14 !== null) {
    if (rsi14 >= 45 && rsi14 <= 65) score += 12;
    else if (rsi14 > 65 && rsi14 <= 75) score += 8;
    else if (rsi14 > 75) score += 4;
    else if (rsi14 < 35) score += 3;
    else score += 6;
  }

  if (macdHistogram !== null) {
    if (macdHistogram > 0) score += 11;
    else if (macdHistogram > -2.0) score += 6;
    else score += 2;
  } else {
    score += 5;
  }

  return {
    rsi14,
    sma20,
    sma50,
    prev_sma20,
    prev_sma50,
    ma_signal: maSignal,
    ma_description: maDescription,
    macd: macdLine,
    macd_signal: macdSignal,
    macd_histogram: macdHistogram,
    support,
    resistance,
    trend_status: trendStatus,
    volatility_10d: volatility10d,
    technical_score: Number(Math.min(score, 35).toFixed(2)),
    status: 'SUCCESS'
  };
}
