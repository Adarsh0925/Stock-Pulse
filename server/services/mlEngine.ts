import { Candle } from './marketData';

export interface MLPrediction {
  ticker: string;
  model_name: string; // "RandomForestClassifier"
  accuracy: number | null;
  precision: number | null;
  recall: number | null;
  f1_score: number | null;
  test_sample_count: number;
  training_period: string;
  testing_period: string;
  up_probability: number | null;
  down_probability: number | null;
  predicted_next_direction: 'UP' | 'DOWN' | 'UNAVAILABLE';
  timestamp: string;
  status: 'SUCCESS' | 'DATA UNAVAILABLE';
  confidence_status: 'HIGH' | 'MEDIUM' | 'LOW CONFIDENCE';
  is_reliable: boolean;
  error_reason: string | null;
  ml_score: number; // Max 20 points
}

interface FeatureRow {
  date: string;
  features: number[]; // [ret, sma20Ratio, sma50Ratio, rsi, macdHist, vol, volumeRatio]
  target: number; // 1 if next close > current close, else 0
}

interface TreeNode {
  isLeaf: boolean;
  prediction?: number; // 0 or 1 for hard vote
  probUp?: number; // p(class=1)
  featureIdx?: number;
  threshold?: number;
  left?: TreeNode;
  right?: TreeNode;
}

class RandomForestClassifier {
  private trees: TreeNode[] = [];
  private numTrees: number;
  private maxDepth: number;
  private minSamplesSplit: number;

  constructor(numTrees = 25, maxDepth = 4, minSamplesSplit = 4) {
    this.numTrees = numTrees;
    this.maxDepth = maxDepth;
    this.minSamplesSplit = minSamplesSplit;
  }

  private calculateGini(labels: number[]): number {
    if (labels.length === 0) return 0;
    const count1 = labels.filter(l => l === 1).length;
    const p1 = count1 / labels.length;
    const p0 = 1 - p1;
    return 1 - (p0 * p0 + p1 * p1);
  }

  private buildTree(X: number[][], y: number[], depth = 0): TreeNode {
    const numSamples = X.length;
    const count1 = y.filter(val => val === 1).length;
    const probUp = numSamples > 0 ? count1 / numSamples : 0.5;

    // Base conditions for leaf node
    if (
      depth >= this.maxDepth ||
      numSamples < this.minSamplesSplit ||
      count1 === 0 ||
      count1 === numSamples
    ) {
      return {
        isLeaf: true,
        prediction: probUp >= 0.5 ? 1 : 0,
        probUp
      };
    }

    const numFeatures = X[0].length;
    // Subsample sqrt(numFeatures) features
    const featureIndices: number[] = [];
    while (featureIndices.length < Math.max(2, Math.floor(Math.sqrt(numFeatures)))) {
      const idx = Math.floor(Math.random() * numFeatures);
      if (!featureIndices.includes(idx)) featureIndices.push(idx);
    }

    let bestGiniGain = -1;
    let bestFeature = -1;
    let bestThreshold = 0;
    let bestLeftX: number[][] = [];
    let bestLeftY: number[] = [];
    let bestRightX: number[][] = [];
    let bestRightY: number[] = [];

    const currentGini = this.calculateGini(y);

    for (const fIdx of featureIndices) {
      const values = X.map(row => row[fIdx]).sort((a, b) => a - b);
      // Sample a subset of candidate thresholds
      const candidateThresholds: number[] = [];
      const step = Math.max(1, Math.floor(values.length / 10));
      for (let k = 0; k < values.length - 1; k += step) {
        candidateThresholds.push((values[k] + values[k + 1]) / 2);
      }

      for (const thresh of candidateThresholds) {
        const leftX: number[][] = [];
        const leftY: number[] = [];
        const rightX: number[][] = [];
        const rightY: number[] = [];

        for (let i = 0; i < numSamples; i++) {
          if (X[i][fIdx] <= thresh) {
            leftX.push(X[i]);
            leftY.push(y[i]);
          } else {
            rightX.push(X[i]);
            rightY.push(y[i]);
          }
        }

        if (leftY.length === 0 || rightY.length === 0) continue;

        const leftGini = this.calculateGini(leftY);
        const rightGini = this.calculateGini(rightY);
        const weightedGini = (leftY.length / numSamples) * leftGini + (rightY.length / numSamples) * rightGini;
        const giniGain = currentGini - weightedGini;

        if (giniGain > bestGiniGain) {
          bestGiniGain = giniGain;
          bestFeature = fIdx;
          bestThreshold = thresh;
          bestLeftX = leftX;
          bestLeftY = leftY;
          bestRightX = rightX;
          bestRightY = rightY;
        }
      }
    }

    if (bestGiniGain <= 0.0001 || bestLeftY.length === 0 || bestRightY.length === 0) {
      return {
        isLeaf: true,
        prediction: probUp >= 0.5 ? 1 : 0,
        probUp
      };
    }

    const leftChild = this.buildTree(bestLeftX, bestLeftY, depth + 1);
    const rightChild = this.buildTree(bestRightX, bestRightY, depth + 1);

    return {
      isLeaf: false,
      featureIdx: bestFeature,
      threshold: bestThreshold,
      left: leftChild,
      right: rightChild,
      probUp
    };
  }

  public fit(X: number[][], y: number[]): void {
    this.trees = [];
    const numSamples = X.length;

    for (let t = 0; t < this.numTrees; t++) {
      // Bootstrap sampling with replacement
      const bootX: number[][] = [];
      const bootY: number[] = [];
      for (let i = 0; i < numSamples; i++) {
        const randIdx = Math.floor(Math.random() * numSamples);
        bootX.push(X[randIdx]);
        bootY.push(y[randIdx]);
      }
      const tree = this.buildTree(bootX, bootY);
      this.trees.push(tree);
    }
  }

  private predictTree(tree: TreeNode, x: number[]): number {
    if (tree.isLeaf || tree.featureIdx === undefined || tree.threshold === undefined) {
      return tree.probUp ?? 0.5;
    }
    if (x[tree.featureIdx] <= tree.threshold) {
      return this.predictTree(tree.left!, x);
    } else {
      return this.predictTree(tree.right!, x);
    }
  }

  public predictProba(x: number[]): { up: number; down: number } {
    if (this.trees.length === 0) return { up: 0.5, down: 0.5 };
    let sumUp = 0;
    for (const tree of this.trees) {
      sumUp += this.predictTree(tree, x);
    }
    const up = sumUp / this.trees.length;
    return { up, down: 1 - up };
  }
}

/**
 * Trains a Random Forest Classifier on real historical session features.
 * Strictly enforces CHRONOLOGICAL train (80%) / test (20%) split — NO FUTURE DATA LEAKAGE.
 * Features for session T are strictly restricted to data available at or before T.
 */
export function runMLEngine(ticker: string, candles: Candle[]): MLPrediction {
  const timestampStr = new Date().toISOString().replace('T', ' ').slice(0, 19) + ' UTC';

  if (!candles || candles.length < 50) {
    return {
      ticker,
      model_name: "RandomForestClassifier",
      accuracy: null,
      precision: null,
      recall: null,
      f1_score: null,
      test_sample_count: 0,
      training_period: "N/A",
      testing_period: "N/A",
      up_probability: null,
      down_probability: null,
      predicted_next_direction: "UNAVAILABLE",
      timestamp: timestampStr,
      status: "DATA UNAVAILABLE",
      confidence_status: "LOW CONFIDENCE",
      is_reliable: false,
      error_reason: `Insufficient historical sessions (${candles?.length || 0} < 50) for Machine Learning model training`,
      ml_score: 0.0
    };
  }

  const closes = candles.map(c => c.close);
  const volumes = candles.map(c => c.volume || 1);

  // Pre-calculate MACD series to ensure accurate 12/26/9 MACD Histogram feature
  const calcEMASeries = (data: number[], span: number): number[] => {
    const k = 2 / (span + 1);
    const emaSeries: number[] = [data[0]];
    for (let i = 1; i < data.length; i++) {
      emaSeries.push(data[i] * k + emaSeries[i - 1] * (1 - k));
    }
    return emaSeries;
  };

  const ema12 = calcEMASeries(closes, 12);
  const ema26 = calcEMASeries(closes, 26);
  const macdSeries: number[] = [];
  for (let i = 0; i < closes.length; i++) {
    macdSeries.push(ema12[i] - ema26[i]);
  }
  const macdSignalSeries = calcEMASeries(macdSeries, 9);

  // Build Feature Dataset
  // Day T uses ONLY data up to index i
  // Target Y uses index i+1 (whether Close[i+1] > Close[i])
  const featureRows: FeatureRow[] = [];

  for (let i = 50; i < candles.length - 1; i++) {
    const c = closes[i];
    const prevC = closes[i - 1];
    const ret = (c - prevC) / prevC;

    // SMA 20 ratio
    const sma20 = closes.slice(i - 19, i + 1).reduce((a, b) => a + b, 0) / 20;
    const sma20Ratio = c / sma20;

    // SMA 50 ratio
    const sma50 = closes.slice(i - 49, i + 1).reduce((a, b) => a + b, 0) / 50;
    const sma50Ratio = c / sma50;

    // RSI 14
    let gains = 0, losses = 0;
    for (let k = i - 13; k <= i; k++) {
      const diff = closes[k] - closes[k - 1];
      if (diff >= 0) gains += diff;
      else losses += Math.abs(diff);
    }
    const rs = losses === 0 ? 100 : gains / losses;
    const rsi = 100 - (100 / (1 + rs));

    // MACD Histogram
    const macdHist = macdSeries[i] - macdSignalSeries[i];

    // 20-day Volatility
    const last20 = closes.slice(i - 19, i + 1);
    const rets20: number[] = [];
    for (let j = 1; j < last20.length; j++) {
      rets20.push((last20[j] - last20[j - 1]) / last20[j - 1]);
    }
    const meanRet = rets20.reduce((a, b) => a + b, 0) / rets20.length;
    const varRet = rets20.reduce((s, r) => s + Math.pow(r - meanRet, 2), 0) / rets20.length;
    const vol = Math.sqrt(varRet) * Math.sqrt(252);

    // Volume ratio
    const avgVol20 = volumes.slice(i - 19, i + 1).reduce((a, b) => a + b, 0) / 20;
    const volumeRatio = volumes[i] / (avgVol20 || 1);

    const target = closes[i + 1] > c ? 1 : 0;

    featureRows.push({
      date: candles[i].date,
      features: [ret, sma20Ratio, sma50Ratio, rsi, macdHist, vol, volumeRatio],
      target
    });
  }

  if (featureRows.length < 20) {
    return {
      ticker,
      model_name: "RandomForestClassifier",
      accuracy: null,
      precision: null,
      recall: null,
      f1_score: null,
      test_sample_count: 0,
      training_period: "N/A",
      testing_period: "N/A",
      up_probability: null,
      down_probability: null,
      predicted_next_direction: "UNAVAILABLE",
      timestamp: timestampStr,
      status: "DATA UNAVAILABLE",
      confidence_status: "LOW CONFIDENCE",
      is_reliable: false,
      error_reason: "ML PREDICTION UNAVAILABLE — INSUFFICIENT VERIFIED SAMPLES",
      ml_score: 0.0
    };
  }

  // Strict Chronological Train/Test Split (80% Train, 20% Test) — NO SHUFFLING
  const trainCount = Math.floor(featureRows.length * 0.8);
  const trainRows = featureRows.slice(0, trainCount);
  const testRows = featureRows.slice(trainCount);

  const trainX = trainRows.map(r => r.features);
  const trainY = trainRows.map(r => r.target);

  const testX = testRows.map(r => r.features);
  const testY = testRows.map(r => r.target);

  // Train RandomForestClassifier
  const rf = new RandomForestClassifier(30, 4, 4);
  rf.fit(trainX, trainY);

  // Out-of-Sample Test Evaluation
  let tp = 0, fp = 0, tn = 0, fn = 0;
  for (let i = 0; i < testX.length; i++) {
    const proba = rf.predictProba(testX[i]);
    const pred = proba.up >= 0.5 ? 1 : 0;
    const actual = testY[i];

    if (pred === 1 && actual === 1) tp++;
    else if (pred === 1 && actual === 0) fp++;
    else if (pred === 0 && actual === 0) tn++;
    else if (pred === 0 && actual === 1) fn++;
  }

  const accuracy = Number((((tp + tn) / testRows.length) * 100).toFixed(2));
  const precision = Number((tp + fp > 0 ? (tp / (tp + fp)) * 100 : 0).toFixed(2));
  const recall = Number((tp + fn > 0 ? (tp / (tp + fn)) * 100 : 0).toFixed(2));
  const f1_score = Number((precision + recall > 0 ? (2 * precision * recall) / (precision + recall) : 0).toFixed(2));

  // Determine model confidence and reliability
  // Model is reliable ONLY IF test sample >= 10, accuracy >= 50%, f1_score >= 50%, precision > 0, and recall > 0
  const isReliable = testRows.length >= 10 && accuracy >= 50.0 && f1_score >= 50.0 && precision > 0 && recall > 0;
  let confidenceStatus: 'HIGH' | 'MEDIUM' | 'LOW CONFIDENCE' = 'LOW CONFIDENCE';

  if (isReliable) {
    if (accuracy >= 65.0 && f1_score >= 60.0) {
      confidenceStatus = 'HIGH';
    } else {
      confidenceStatus = 'MEDIUM';
    }
  } else {
    confidenceStatus = 'LOW CONFIDENCE';
  }

  // Predict Next Day Direction using latest available session features
  const lastIdx = candles.length - 1;
  const lastC = closes[lastIdx];
  const lastPrevC = closes[lastIdx - 1];
  const lastRet = (lastC - lastPrevC) / lastPrevC;
  const lastSma20 = closes.slice(lastIdx - 19, lastIdx + 1).reduce((a, b) => a + b, 0) / 20;
  const lastSma50 = closes.slice(lastIdx - 49, lastIdx + 1).reduce((a, b) => a + b, 0) / 50;

  let lastGains = 0, lastLosses = 0;
  for (let k = lastIdx - 13; k <= lastIdx; k++) {
    const diff = closes[k] - closes[k - 1];
    if (diff >= 0) lastGains += diff;
    else lastLosses += Math.abs(diff);
  }
  const lastRs = lastLosses === 0 ? 100 : lastGains / lastLosses;
  const lastRsi = 100 - (100 / (1 + lastRs));
  const lastMacdHist = macdSeries[lastIdx] - macdSignalSeries[lastIdx];

  const last20 = closes.slice(lastIdx - 19, lastIdx + 1);
  const lastRets20: number[] = [];
  for (let j = 1; j < last20.length; j++) {
    lastRets20.push((last20[j] - last20[j - 1]) / last20[j - 1]);
  }
  const lastMeanRet = lastRets20.reduce((a, b) => a + b, 0) / lastRets20.length;
  const lastVarRet = lastRets20.reduce((s, r) => s + Math.pow(r - lastMeanRet, 2), 0) / lastRets20.length;
  const lastVol = Math.sqrt(lastVarRet) * Math.sqrt(252);
  const lastAvgVol20 = volumes.slice(lastIdx - 19, lastIdx + 1).reduce((a, b) => a + b, 0) / 20;
  const lastVolumeRatio = volumes[lastIdx] / (lastAvgVol20 || 1);

  const latestFeatures = [lastRet, lastC / lastSma20, lastC / lastSma50, lastRsi, lastMacdHist, lastVol, lastVolumeRatio];

  const nextProba = rf.predictProba(latestFeatures);
  const upProb = Number((nextProba.up * 100).toFixed(2));
  const downProb = Number((100 - upProb).toFixed(2));
  const predictedDirection: 'UP' | 'DOWN' = upProb >= 50.0 ? 'UP' : 'DOWN';

  const trainPeriod = `${trainRows[0].date} to ${trainRows[trainRows.length - 1].date}`;
  const testPeriod = `${testRows[0].date} to ${testRows[testRows.length - 1].date}`;

  // Composite ML score out of 20 points
  let mlScore = (upProb / 100) * 12 + (accuracy / 100) * 8;
  mlScore = Math.min(Math.max(mlScore, 2.0), 20.0);

  return {
    ticker,
    model_name: "RandomForestClassifier",
    accuracy,
    precision,
    recall,
    f1_score,
    test_sample_count: testRows.length,
    training_period: trainPeriod,
    testing_period: testPeriod,
    up_probability: upProb,
    down_probability: downProb,
    predicted_next_direction: predictedDirection,
    timestamp: timestampStr,
    status: "SUCCESS",
    confidence_status: confidenceStatus,
    is_reliable: isReliable,
    error_reason: null,
    ml_score: Number(mlScore.toFixed(2))
  };
}
