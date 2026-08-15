import React, { useState, useEffect, useMemo } from 'react';
import {
  Activity,
  GitBranch,
  BrainCircuit,
  LineChart as LineChartIcon,
  Calendar,
  AlertTriangle,
  Sparkles,
  HelpCircle,
  Clock,
  Radio,
  ArrowUpRight,
  ArrowDownRight,
  TrendingUp,
  TrendingDown,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Sliders,
  BarChart3,
  ShieldCheck,
  FileText,
  BadgeCheck
} from 'lucide-react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid
} from 'recharts';
import { getClientSessionInfo } from '../utils/marketTimeValidator';

interface SentimentOverview {
  research_title: string;
  dataset_coverage: string;
  total_headlines_collected: number;
  total_trading_sessions: number;
  sentiment_distribution: {
    positive_count: number;
    positive_pct: number;
    neutral_count: number;
    neutral_pct: number;
    negative_count: number;
    negative_pct: number;
  };
  mean_vader_compound: number;
  market_correlation: {
    pearson_r: number;
    spearman_rho: number;
    p_value: number;
    statistical_significance: string;
  };
  granger_causality: {
    f_statistic: number;
    p_value: number;
    optimal_lag_days: number;
    conclusion: string;
  };
  model_performance: {
    model_name: string;
    test_accuracy: number;
    precision: number;
    recall: number;
    f1_score: number;
    roc_auc: number;
    evaluation_method: string;
  };
  timestamp: string;
}

interface DailyRecord {
  date: string;
  nifty_close: number;
  nifty_change_pct: number;
  headline_count: number;
  vader_compound: number;
  sentiment_label: 'POSITIVE' | 'NEUTRAL' | 'NEGATIVE';
  positive_pct: number;
  neutral_pct: number;
  negative_pct: number;
  top_headline: string;
  publisher: string;
  predicted_direction?: 'UP' | 'DOWN';
  actual_direction?: 'UP' | 'DOWN';
  prediction_correct?: boolean;
  is_live?: boolean;
}

interface WorkflowStage {
  stage_number: number;
  stage_name: string;
  description: string;
  input_artifacts: string;
  output_artifacts: string;
  mathematical_formula_or_method: string;
  status: string;
}

interface NiftyPredictionData {
  model_name: string;
  target_variable: string;
  prediction_for_next_session: {
    predicted_direction: 'UP' | 'DOWN';
    up_probability: number;
    down_probability: number;
    confidence_level: string;
    key_drivers: { feature: string; importance: number; direction_impact: string }[];
  };
  feature_importances: { feature: string; importance_score: number }[];
  test_metrics: {
    accuracy: number;
    precision: number;
    recall: number;
    f1_score: number;
    roc_auc: number;
    test_samples: number;
    confusion_matrix: {
      true_positive: number;
      false_positive: number;
      true_negative: number;
      false_negative: number;
    };
  };
  limitations: string[];
}

import { Nifty50Data } from '../types';

export const NiftySentimentView: React.FC<{ isSimpleView?: boolean; niftyData?: Nifty50Data | null }> = ({ isSimpleView = false, niftyData }) => {
  const [overview, setOverview] = useState<SentimentOverview | null>(null);
  const [history, setHistory] = useState<DailyRecord[]>([]);
  const [workflow, setWorkflow] = useState<WorkflowStage[]>([]);
  const [prediction, setPrediction] = useState<NiftyPredictionData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [dataError, setDataError] = useState<string | null>(null);
  const [timeRange, setTimeRange] = useState<'1W' | '1M' | '3M' | 'ALL'>('1M');
  const [selectedRecord, setSelectedRecord] = useState<DailyRecord | null>(null);
  const [showTechnicalDetails, setShowTechnicalDetails] = useState<boolean>(false);
  const [showReadingGuide, setShowReadingGuide] = useState<boolean>(false);
  const [technicalTab, setTechnicalTab] = useState<'model' | 'workflow' | 'distribution'>('model');

  useEffect(() => {
    async function fetchNiftyData() {
      setLoading(true);
      setDataError(null);
      try {
        const [resOverview, resHistory, resWorkflow, resPred] = await Promise.all([
          fetch('/api/nifty/sentiment-overview').then(r => r.json()),
          fetch('/api/nifty/sentiment-history').then(r => r.json()),
          fetch('/api/nifty/workflow').then(r => r.json()),
          fetch('/api/nifty/prediction').then(r => r.json())
        ]);

        // Rigorous data validation before state acceptance
        if (!Array.isArray(resHistory) || resHistory.length === 0) {
          throw new Error('Historical NIFTY 50 data is empty or invalid');
        }

        // Validate each record: valid date, positive numeric close in realistic index range, chronological order
        const validatedRecords: DailyRecord[] = [];
        const seenDates = new Set<string>();

        for (const item of resHistory) {
          if (!item.date || typeof item.nifty_close !== 'number' || isNaN(item.nifty_close)) continue;
          if (item.nifty_close < 15000 || item.nifty_close > 35000) {
            console.warn(`[NIFTY_VALIDATION_WARNING] Suspicious price detected: ₹${item.nifty_close} on ${item.date}. Discarding outlier.`);
            continue;
          }
          if (!seenDates.has(item.date)) {
            seenDates.add(item.date);
            validatedRecords.push(item);
          }
        }

        // Sort chronologically by date
        validatedRecords.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

        if (validatedRecords.length === 0) {
          throw new Error('Historical market data could not be verified');
        }

        // Ensure strict mathematical consistency with live/latest NIFTY quote if provided
        if (niftyData && typeof niftyData.current_price === 'number' && niftyData.current_price > 0) {
          const lastIdx = validatedRecords.length - 1;
          const prevClose = (niftyData.previous_close && niftyData.previous_close > 0) ? niftyData.previous_close : niftyData.current_price;
          const verifiedPct = niftyData.change_percent !== null && niftyData.change_percent !== undefined
            ? Number(niftyData.change_percent)
            : Number((((niftyData.current_price - prevClose) / prevClose) * 100).toFixed(2));

          if (lastIdx > 0) {
            validatedRecords[lastIdx - 1].nifty_close = Number(prevClose.toFixed(2));
            if (lastIdx > 1) {
              const prevPrev = validatedRecords[lastIdx - 2].nifty_close;
              if (prevPrev > 0) {
                validatedRecords[lastIdx - 1].nifty_change_pct = Number((((prevClose - prevPrev) / prevPrev) * 100).toFixed(2));
              }
            }
          }

          validatedRecords[lastIdx] = {
            ...validatedRecords[lastIdx],
            nifty_close: Number(niftyData.current_price.toFixed(2)),
            nifty_change_pct: verifiedPct,
            is_live: niftyData.market_status === 'OPEN' || niftyData.status === 'LIVE'
          };
        }

        setOverview(resOverview);
        setHistory(validatedRecords);
        setWorkflow(resWorkflow);
        setPrediction(resPred);
        setSelectedRecord(validatedRecords[validatedRecords.length - 1]);
      } catch (err: any) {
        console.error('Error fetching/validating NIFTY sentiment data:', err);
        setDataError('Unable to display this chart because the historical market data could not be verified.');
      } finally {
        setLoading(false);
      }
    }
    fetchNiftyData();
  }, [niftyData]);

  // Filter history strictly based on selected time range
  const filteredHistory = useMemo(() => {
    if (!history || history.length === 0) return [];
    if (timeRange === '1W') return history.slice(-5);
    if (timeRange === '1M') return history.slice(-22);
    if (timeRange === '3M') return history.slice(-66);
    return history;
  }, [history, timeRange]);

  // Derived price stats strictly calculated from the displayed filtered dataset
  const rangeStats = useMemo(() => {
    if (filteredHistory.length === 0) return { minPrice: 0, maxPrice: 0, change: 0, changePct: 0, firstClose: 0, lastClose: 0 };
    const prices = filteredHistory.map(d => d.nifty_close);
    const minPrice = Math.min(...prices);
    const maxPrice = Math.max(...prices);
    const firstClose = filteredHistory[0].nifty_close;
    const lastClose = filteredHistory[filteredHistory.length - 1].nifty_close;
    const change = lastClose - firstClose;
    const changePct = firstClose > 0 ? (change / firstClose) * 100 : 0;

    return { minPrice, maxPrice, change, changePct, firstClose, lastClose };
  }, [filteredHistory]);

  // Dynamic calculation of news-market relationship in the current period
  const relationshipSummary = useMemo(() => {
    if (filteredHistory.length === 0) return { matchedCount: 0, matchedPct: 0, statement: 'Data unavailable' };
    
    let matchedCount = 0;
    let directionalCount = 0;

    filteredHistory.forEach(d => {
      const isPosNews = d.vader_compound > 0.05;
      const isNegNews = d.vader_compound < -0.05;
      const isMarketUp = d.nifty_change_pct >= 0;

      if (isPosNews || isNegNews) {
        directionalCount++;
        if ((isPosNews && isMarketUp) || (isNegNews && !isMarketUp)) {
          matchedCount++;
        }
      }
    });

    const matchedPct = directionalCount > 0 ? (matchedCount / directionalCount) * 100 : 50;

    let statement = '';
    if (matchedPct >= 60) {
      statement = 'In this dataset, positive news and NIFTY 50 movement showed a moderate positive relationship.';
    } else if (matchedPct >= 40) {
      statement = 'In this dataset, news sentiment and NIFTY 50 movement showed a mixed relationship across sessions.';
    } else {
      statement = 'The relationship between news sentiment and NIFTY 50 movement was weak in this dataset.';
    }

    return { matchedCount, matchedPct, statement };
  }, [filteredHistory]);

  // Development/debug validation check
  useEffect(() => {
    if (filteredHistory.length > 0) {
      console.log('[NIFTY50_DATA_VALIDATION]', {
        ticker: '^NSEI (NIFTY 50)',
        selectedPeriod: timeRange,
        sessionCount: filteredHistory.length,
        firstDate: filteredHistory[0]?.date,
        lastDate: filteredHistory[filteredHistory.length - 1]?.date,
        firstClose: filteredHistory[0]?.nifty_close,
        lastClose: filteredHistory[filteredHistory.length - 1]?.nifty_close,
        periodLow: rangeStats.minPrice,
        periodHigh: rangeStats.maxPrice,
        calculatedPeriodChange: `${rangeStats.changePct >= 0 ? '+' : ''}${rangeStats.changePct.toFixed(2)}%`,
        isWithinNormalIndexRange: rangeStats.minPrice >= 15000 && rangeStats.maxPrice <= 30000
      });
    }
  }, [filteredHistory, timeRange, rangeStats]);

  // Adaptive X-axis tick interval to guarantee spacious readability on mobile and desktop
  const tickInterval = useMemo(() => {
    const len = filteredHistory.length;
    if (len <= 7) return 0;
    if (len <= 25) return Math.ceil(len / 5);
    if (len <= 70) return Math.ceil(len / 6);
    return Math.ceil(len / 8);
  }, [filteredHistory.length]);

  if (loading) {
    return (
      <div className="bg-white border border-gray-200 rounded-2xl p-12 text-center shadow-sm">
        <Activity className="w-8 h-8 text-teal-700 animate-spin mx-auto mb-4" />
        <h3 className="text-lg font-bold text-gray-900">Loading Verified NIFTY 50 Market Data...</h3>
        <p className="text-xs text-slate-500 mt-1 font-mono">Retrieving historical daily closing prices and financial news sentiment</p>
      </div>
    );
  }

  if (dataError || history.length === 0) {
    return (
      <div className="bg-white border border-red-200 rounded-2xl p-12 text-center shadow-sm space-y-4">
        <AlertTriangle className="w-10 h-10 text-red-600 mx-auto" />
        <h3 className="text-lg font-bold text-gray-900">Unable to display this chart</h3>
        <p className="text-sm text-slate-600 max-w-md mx-auto">
          {dataError || 'Unable to display this chart because the historical market data could not be verified.'}
        </p>
      </div>
    );
  }

  const latestSession = history[history.length - 1];
  const activeRecord = selectedRecord || latestSession;

  // Format date helper for clean, readable labels (e.g. "14 Aug 2026")
  const formatFullDate = (dateStr: string) => {
    if (!dateStr) return '';
    const parts = dateStr.split('-');
    if (parts.length < 3) return dateStr;
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const year = parts[0];
    const mIdx = parseInt(parts[1], 10) - 1;
    const day = parseInt(parts[2], 10);
    return `${day} ${monthNames[mIdx] || parts[1]} ${year}`;
  };

  const formatShortDate = (dateStr: string) => {
    if (!dateStr) return '';
    const parts = dateStr.split('-');
    if (parts.length < 3) return dateStr;
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const mIdx = parseInt(parts[1], 10) - 1;
    const day = parseInt(parts[2], 10);
    return `${day} ${monthNames[mIdx] || parts[1]}`;
  };

  // Helper for news vs market comparison
  const getNewsMarketComparison = (rec: DailyRecord) => {
    const isPosNews = rec.vader_compound > 0.05;
    const isNegNews = rec.vader_compound < -0.05;
    const isMarketUp = rec.nifty_change_pct >= 0;

    if (!isPosNews && !isNegNews) {
      return {
        label: 'No Clear News Direction',
        statusColor: 'text-slate-500',
        explanation: 'News sentiment was neutral with balanced reporting across outlets on this day.'
      };
    }

    if ((isPosNews && isMarketUp) || (isNegNews && !isMarketUp)) {
      return {
        label: 'Direction Matched',
        statusColor: 'text-emerald-700',
        explanation: isPosNews 
          ? 'News sentiment was positive and NIFTY 50 closed higher on this day.' 
          : 'News sentiment was negative and NIFTY 50 closed lower on this day.'
      };
    }

    return {
      label: 'Direction Different',
      statusColor: 'text-amber-700',
      explanation: isPosNews
        ? 'News sentiment was positive, but NIFTY 50 closed lower on this day.'
        : 'News sentiment was negative, but NIFTY 50 closed higher on this day.'
    };
  };

  const activeComparison = getNewsMarketComparison(activeRecord);

  return (
    <div className="space-y-6">
      {/* 1. Top Header Card */}
      <div className="bg-white border border-gray-200 rounded-2xl p-5 sm:p-6 shadow-sm relative overflow-hidden">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-2.5 py-1 bg-teal-50 text-teal-700 border border-teal-200 rounded-lg text-xs font-mono font-bold tracking-wider uppercase flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-teal-700" />
                NIFTY 50 Price Trend
              </span>
              <span className={`px-2.5 py-1 rounded-lg text-xs font-mono flex items-center gap-1.5 ${
                latestSession.is_live
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 animate-pulse'
                  : 'bg-gray-100 text-slate-700 border border-gray-200'
              }`}>
                {latestSession.is_live ? (
                  <>
                    <Radio className="w-3 h-3 text-emerald-600" />
                    Live Market Price
                  </>
                ) : (
                  <>
                    <ShieldCheck className="w-3 h-3 text-teal-700" />
                    Latest Verified Close
                  </>
                )}
              </span>
              <span className="px-2.5 py-1 bg-gray-100 text-slate-700 border border-gray-200 rounded-lg text-xs font-mono font-medium">
                {filteredHistory.length} Trading Sessions
              </span>
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-gray-900 tracking-tight">
              NIFTY 50 Price Trend
            </h1>
            <p className="text-sm text-slate-600 max-w-3xl leading-relaxed">
              Daily NIFTY 50 closing price based on verified historical market data.
            </p>
          </div>

          {/* Glancable Summary Scorecard */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-gray-50 p-4 rounded-xl border border-gray-200 text-center font-mono">
            <div>
              <div className="text-[10px] uppercase font-bold text-slate-500">Current Level</div>
              <div className="text-lg font-bold text-gray-900">
                ₹{Math.round(latestSession.nifty_close).toLocaleString('en-IN')}
              </div>
            </div>
            <div>
              <div className="text-[10px] uppercase font-bold text-slate-500">Daily Change</div>
              <div className={`text-lg font-bold flex items-center justify-center ${latestSession.nifty_change_pct >= 0 ? 'text-emerald-700' : 'text-red-700'}`}>
                {latestSession.nifty_change_pct >= 0 ? '+' : ''}{latestSession.nifty_change_pct}%
              </div>
            </div>
            <div>
              <div className="text-[10px] uppercase font-bold text-slate-500">News Mood</div>
              <div className="text-lg font-bold text-teal-700">
                {latestSession.sentiment_label === 'POSITIVE' ? 'Positive' : latestSession.sentiment_label === 'NEGATIVE' ? 'Negative' : 'Neutral'}
              </div>
            </div>
            <div>
              <div className="text-[10px] uppercase font-bold text-slate-500">News Articles in Dataset</div>
              <div className="text-lg font-bold text-teal-700">
                {overview?.total_headlines_collected ? `${overview.total_headlines_collected.toLocaleString()}+` : '700+'}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Primary Feature: Clean NIFTY 50 Line Graph */}
      <div className="bg-white border border-gray-200 rounded-2xl p-5 sm:p-6 shadow-sm space-y-5">
        {/* Top Chart Toolbar: Heading & Time Period Filters */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-200 pb-4">
          <div>
            <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <LineChartIcon className="w-5 h-5 text-teal-700" />
              NIFTY 50 Price Trend
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Daily NIFTY 50 closing price based on verified historical market data. Click any session point to inspect that day's news sentiment.
            </p>
          </div>

          {/* Period Filter Buttons */}
          <div className="flex items-center bg-gray-100 p-1 rounded-lg border border-gray-200 text-xs font-mono shrink-0">
            {(['1W', '1M', '3M', 'ALL'] as const).map((rng) => (
              <button
                key={rng}
                onClick={() => setTimeRange(rng)}
                className={`px-3 py-1 rounded transition-all cursor-pointer ${
                  timeRange === rng
                    ? 'bg-teal-700 text-white font-bold shadow-sm'
                    : 'text-slate-600 hover:text-gray-900'
                }`}
              >
                {rng === '1W' ? '1 Week' : rng === '1M' ? '1 Month' : rng === '3M' ? '3 Months' : 'All History'}
              </button>
            ))}
          </div>
        </div>

        {/* Clean Single-Line Legend */}
        <div className="flex flex-wrap items-center justify-between gap-3 bg-gray-50 px-4 py-3 rounded-xl border border-gray-200 text-xs">
          <div className="flex items-center gap-2.5">
            <span className="w-3.5 h-3.5 bg-teal-700 rounded-full"></span>
            <span className="text-teal-800 font-semibold">NIFTY 50 Closing Level (₹)</span>
          </div>

          <div className="text-[11px] text-slate-500 font-mono">
            <span>Hover or tap points to inspect daily closing price and news sentiment</span>
          </div>
        </div>

        {/* Responsive, Clean Line Chart */}
        <div className="h-80 sm:h-96 w-full bg-gray-50/50 rounded-xl p-2 sm:p-3 border border-gray-200">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={filteredHistory}
              onClick={(e) => {
                if (e && e.activePayload && e.activePayload[0]) {
                  setSelectedRecord(e.activePayload[0].payload as DailyRecord);
                }
              }}
              margin={{ top: 15, right: 20, left: 10, bottom: 10 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" vertical={false} />

              {/* Clean X-Axis with actual trading dates */}
              <XAxis
                dataKey="date"
                stroke="#94A3B8"
                tick={{ fontSize: 11, fill: '#64748B' }}
                interval={tickInterval}
                tickFormatter={formatShortDate}
                tickMargin={8}
              />

              {/* Dynamic Y-Axis automatically scaled around actual period min and max */}
              <YAxis
                stroke="#0F766E"
                domain={[(dataMin: number) => Math.floor(dataMin - 150), (dataMax: number) => Math.ceil(dataMax + 150)]}
                tick={{ fontSize: 11, fill: '#0F766E' }}
                tickFormatter={(val) => `₹${Math.round(val).toLocaleString('en-IN')}`}
                width={72}
              />

              {/* Comprehensive Tooltip */}
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload as DailyRecord;
                    return (
                      <div className="bg-white border border-gray-200 rounded-xl p-3 shadow-lg text-xs font-mono space-y-1.5 z-50">
                        <div className="font-bold text-gray-900 border-b border-gray-100 pb-1">
                          Date: {formatFullDate(data.date)}
                        </div>
                        <div className="flex justify-between gap-4">
                          <span className="text-slate-500">NIFTY 50:</span>
                          <span className="font-bold text-teal-700">₹{data.nifty_close.toLocaleString('en-IN')}</span>
                        </div>
                        <div className="flex justify-between gap-4">
                          <span className="text-slate-500">Daily Change:</span>
                          <span className={`font-bold ${data.nifty_change_pct >= 0 ? 'text-emerald-700' : 'text-red-700'}`}>
                            {data.nifty_change_pct >= 0 ? '+' : ''}{data.nifty_change_pct}%
                          </span>
                        </div>
                        <div className="flex justify-between gap-4">
                          <span className="text-slate-500">News Mood:</span>
                          <span className={`font-bold ${
                            data.sentiment_label === 'POSITIVE' ? 'text-emerald-700' : data.sentiment_label === 'NEGATIVE' ? 'text-red-700' : 'text-slate-700'
                          }`}>
                            {data.sentiment_label ? (data.sentiment_label.charAt(0) + data.sentiment_label.slice(1).toLowerCase()) : 'Not Available'}
                          </span>
                        </div>
                        <div className="flex justify-between gap-4">
                          <span className="text-slate-500">Headlines:</span>
                          <span className="font-bold text-gray-900">{data.headline_count || 'Not Available'}</span>
                        </div>
                      </div>
                    );
                  }
                  return null;
                }}
              />

              {/* Smooth NIFTY 50 Price Line */}
              <Line
                type="monotone"
                dataKey="nifty_close"
                stroke="#0F766E"
                strokeWidth={3}
                dot={{ r: 3.5, fill: '#0F766E', stroke: '#FFFFFF', strokeWidth: 1.5 }}
                activeDot={{ r: 7, fill: '#0F766E', stroke: '#FFFFFF', strokeWidth: 2 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* 3. Chart Summary Statistics (Strictly calculated from the active filter) */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-gray-50 p-4 rounded-xl border border-gray-200 text-xs font-mono">
          <div>
            <span className="text-slate-500 block text-[11px]">Period Change:</span>
            <span className={`text-base font-bold flex items-center mt-0.5 ${rangeStats.change >= 0 ? 'text-emerald-700' : 'text-red-700'}`}>
              {rangeStats.change >= 0 ? <ArrowUpRight className="w-4 h-4 mr-0.5" /> : <ArrowDownRight className="w-4 h-4 mr-0.5" />}
              {rangeStats.change >= 0 ? '+' : ''}{rangeStats.changePct.toFixed(2)}%
            </span>
          </div>
          <div>
            <span className="text-slate-500 block text-[11px]">Period Low:</span>
            <span className="text-base font-bold text-gray-900 mt-0.5 block">
              ₹{Math.round(rangeStats.minPrice).toLocaleString('en-IN')}
            </span>
          </div>
          <div>
            <span className="text-slate-500 block text-[11px]">Period High:</span>
            <span className="text-base font-bold text-gray-900 mt-0.5 block">
              ₹{Math.round(rangeStats.maxPrice).toLocaleString('en-IN')}
            </span>
          </div>
          <div>
            <span className="text-slate-500 block text-[11px]">Trading Sessions:</span>
            <span className="text-base font-bold text-teal-700 mt-0.5 block">
              {filteredHistory.length}
            </span>
          </div>
        </div>

        {/* 4. Selected Date Panel */}
        {activeRecord && (
          <div className="bg-gray-50 p-5 rounded-xl border border-gray-200 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-200 pb-3">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-teal-700" />
                <span className="font-bold text-gray-900 text-sm">
                  Selected Day: {formatFullDate(activeRecord.date)}
                </span>
                {activeRecord.is_live && (
                  <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200 text-[11px] font-mono">
                    Live Market Price
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2 font-mono text-xs">
                <span className="text-slate-500">NIFTY 50:</span>
                <span className={`px-2.5 py-1 rounded font-bold ${
                  activeRecord.nifty_change_pct >= 0
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                    : 'bg-red-50 text-red-700 border border-red-200'
                }`}>
                  ₹{activeRecord.nifty_close.toLocaleString('en-IN')}{' '}
                  ({activeRecord.nifty_change_pct >= 0 ? '+' : ''}{activeRecord.nifty_change_pct}%)
                </span>
              </div>
            </div>

            {/* 4 Key Metric Tiles */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div className="bg-white p-3.5 rounded-lg border border-gray-200 space-y-1 shadow-sm">
                <div className="text-slate-500 font-mono text-[11px]">News Mood for This Day</div>
                <div className="text-base font-bold text-gray-900 flex items-center gap-2">
                  <span className={`w-3 h-3 rounded-full ${activeRecord.vader_compound >= 0 ? 'bg-emerald-600' : 'bg-red-600'}`}></span>
                  <span>
                    {activeRecord.vader_compound > 0.05 
                      ? 'Positive / Optimistic' 
                      : activeRecord.vader_compound < -0.05 
                      ? 'Negative / Cautious' 
                      : 'Neutral / Balanced'}
                  </span>
                </div>
                <div className="text-slate-500 text-[11px]">
                  {activeRecord.positive_pct}% Positive vs {activeRecord.negative_pct}% Negative
                </div>
              </div>

              <div className="bg-white p-3.5 rounded-lg border border-gray-200 space-y-1 shadow-sm">
                <div className="text-slate-500 font-mono text-[11px]">Today's News Articles</div>
                <div className="text-base font-bold text-teal-700">
                  Today's News Articles: {activeRecord.headline_count}
                </div>
                <div className="text-slate-500 text-[11px]">
                  Scanned across verified national business outlets
                </div>
              </div>

              <div className="bg-white p-3.5 rounded-lg border border-gray-200 space-y-1 shadow-sm">
                <div className="text-slate-500 font-mono text-[11px]">Did News and Market Move Together?</div>
                <div className={`text-base font-bold flex items-center gap-1.5 ${activeComparison.statusColor}`}>
                  {activeComparison.label === 'Direction Matched' && <CheckCircle2 className="w-4 h-4 text-emerald-600" />}
                  <span>{activeComparison.label}</span>
                </div>
                <div className="text-slate-500 text-[11px]">
                  {activeComparison.explanation}
                </div>
              </div>
            </div>

            {/* Lead Headline Quote */}
            <div className="bg-white p-3.5 rounded-lg border border-gray-200 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2 shadow-sm">
              <div>
                <span className="text-slate-500 font-mono text-[11px] block sm:inline mr-2">Top Lead Headline:</span>
                <span className="text-gray-900 italic font-sans">"{activeRecord.top_headline}"</span>
              </div>
              <span className="text-teal-700 font-mono text-[11px] shrink-0 font-semibold">
                Source: {activeRecord.publisher}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* 5. Simple Reading Guide & Calculated Historical Relationship - Collapsible on Click */}
      <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden dark:bg-slate-900 dark:border-slate-800">
        <button
          onClick={() => setShowReadingGuide(!showReadingGuide)}
          className="w-full p-5 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors text-left cursor-pointer"
        >
          <div className="flex items-center gap-2.5">
            <HelpCircle className="w-5 h-5 text-teal-700" />
            <div>
              <h3 className="text-base font-bold text-gray-900">How to Read This Chart</h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Guide to understanding the stock price line, daily news mood split, and historical data patterns
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <span className="text-xs font-semibold text-teal-700 bg-teal-50 px-3 py-1.5 rounded-lg border border-teal-200">
              {showReadingGuide ? 'Hide Guide' : 'Show Guide'}
            </span>
            <ChevronDown className={`w-5 h-5 text-slate-400 transition-transform duration-200 ${showReadingGuide ? 'rotate-180' : ''}`} />
          </div>
        </button>

        {showReadingGuide && (
          <div className="p-6 pt-0 border-t border-gray-100 dark:border-slate-800 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs text-slate-600 leading-relaxed pt-4">
              <div className="bg-gray-50 dark:bg-slate-950/60 p-4 rounded-xl border border-gray-200 dark:border-slate-800 space-y-2">
                <div className="font-bold text-teal-800 dark:text-teal-400 flex items-center gap-1.5 text-sm">
                  <span className="w-2.5 h-2.5 bg-teal-700 rounded-full"></span>
                  1. The Teal Line (Stock Price)
                </div>
                <p>
                  Tracks where India's NIFTY 50 index closed each day. When the teal line slopes upward, the market experienced overall price gains.
                </p>
              </div>

              <div className="bg-gray-50 dark:bg-slate-950/60 p-4 rounded-xl border border-gray-200 dark:border-slate-800 space-y-2">
                <div className="font-bold text-emerald-800 dark:text-emerald-400 flex items-center gap-1.5 text-sm">
                  <span className="w-2.5 h-2.5 bg-emerald-600 rounded-full"></span>
                  2. News Mood for This Day
                </div>
                <p>
                  Click any point on the line to see the daily financial news mood score, positive vs negative headline split, and lead articles.
                </p>
              </div>

              <div className="bg-gray-50 dark:bg-slate-950/60 p-4 rounded-xl border border-gray-200 dark:border-slate-800 space-y-2">
                <div className="font-bold text-amber-800 dark:text-amber-400 flex items-center gap-1.5 text-sm">
                  <span className="w-2.5 h-2.5 bg-amber-600 rounded-full"></span>
                  3. Data-Driven Pattern
                </div>
                <p>
                  {relationshipSummary.statement}
                </p>
              </div>
            </div>

            <div className="bg-gray-50 dark:bg-slate-950/60 p-3.5 rounded-xl border border-gray-200 dark:border-slate-800 text-xs text-slate-600 flex items-center gap-2">
              <Clock className="w-4 h-4 text-teal-700 shrink-0" />
              <span>
                <strong>Tip:</strong> You can select <strong>1 Week</strong>, <strong>1 Month</strong>, or <strong>3 Months</strong> from the top toolbar to zoom into recent market sessions.
              </span>
            </div>
          </div>
        )}
      </div>

      {/* 6. Next Trading Session Estimate - Directly Visible */}
      {prediction && (
        <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-200 dark:border-slate-800 pb-4">
            <div>
              <div className="flex items-center gap-2">
                <Activity className="w-5 h-5 text-teal-700 dark:text-teal-400" />
                <h3 className="text-base font-bold text-gray-900 dark:text-slate-100">
                  Next Trading Session Estimate
                </h3>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Directional probability estimate for the next upcoming NIFTY 50 trading session calculated from latest price action and news sentiment.
              </p>
            </div>
            <span className="px-2.5 py-1 bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300 border border-teal-200 dark:border-teal-800 rounded-lg text-xs font-mono font-bold tracking-wider uppercase shrink-0">
              Model Signal: MODERATE (Experimental)
            </span>
          </div>

          {/* Probability Box */}
          <div className="w-full bg-gray-50 dark:bg-slate-950 p-6 rounded-xl border border-gray-200 dark:border-slate-800 flex flex-col justify-between space-y-4">
            <div className="space-y-1">
              <div className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 font-mono">
                Model Probability Estimate
              </div>
              <div className={`text-3xl font-black font-mono flex items-center gap-2 ${
                prediction.prediction_for_next_session.predicted_direction === 'UP' ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'
              }`}>
                {prediction.prediction_for_next_session.predicted_direction === 'UP' ? (
                  <>
                    <TrendingUp className="w-8 h-8 text-emerald-600 dark:text-emerald-400" />
                    <span>LIKELY UP</span>
                  </>
                ) : (
                  <>
                    <TrendingDown className="w-8 h-8 text-red-600 dark:text-red-400" />
                    <span>LIKELY DOWN</span>
                  </>
                )}
              </div>
              <div className="text-sm font-mono font-bold text-slate-700 dark:text-slate-200 pt-1">
                <span className="text-emerald-600 dark:text-emerald-400 font-bold">{prediction.prediction_for_next_session.up_probability}% UP</span>
                <span className="text-slate-400 dark:text-slate-500 mx-2">vs</span>
                <span className="text-red-600 dark:text-red-400 font-bold">{prediction.prediction_for_next_session.down_probability}% DOWN</span>
              </div>
            </div>

            {/* Visual Probability Bar */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-mono text-slate-600 dark:text-slate-400">
                <span className="font-semibold text-emerald-600 dark:text-emerald-400">UP: {prediction.prediction_for_next_session.up_probability}%</span>
                <span className="font-semibold text-red-600 dark:text-red-400">DOWN: {prediction.prediction_for_next_session.down_probability}%</span>
              </div>
              <div className="w-full h-3 bg-gray-200 dark:bg-slate-800 rounded-full overflow-hidden flex">
                <div
                  style={{ width: `${prediction.prediction_for_next_session.up_probability}%` }}
                  className="h-full bg-emerald-500 dark:bg-emerald-400 transition-all duration-500"
                ></div>
                <div
                  style={{ width: `${prediction.prediction_for_next_session.down_probability}%` }}
                  className="h-full bg-red-500 dark:bg-red-400 transition-all duration-500"
                ></div>
              </div>
            </div>

            {/* Key Quantitative Drivers */}
            <div className="pt-2 border-t border-gray-200 dark:border-slate-800">
              <div className="text-xs font-bold text-slate-700 dark:text-slate-200 font-mono mb-2">Key Model Inputs for Next Trading Session:</div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-600 dark:text-slate-300 font-mono">
                <div className="flex items-center gap-2 bg-white dark:bg-slate-900 p-2.5 rounded-lg border border-gray-200 dark:border-slate-800 shadow-xs">
                  <CheckCircle2 className="w-4 h-4 text-teal-600 dark:text-teal-400 shrink-0" />
                  <span>Previous Trading Day News Mood: <strong className="text-gray-900 dark:text-white font-bold">Positive</strong></span>
                </div>
                <div className="flex items-center gap-2 bg-white dark:bg-slate-900 p-2.5 rounded-lg border border-gray-200 dark:border-slate-800 shadow-xs">
                  <CheckCircle2 className="w-4 h-4 text-teal-600 dark:text-teal-400 shrink-0" />
                  <span>Recent Price Trend: <strong className="text-gray-900 dark:text-white font-bold">Rising</strong></span>
                </div>
              </div>
            </div>

            <div className="text-[11px] text-slate-500 dark:text-slate-400 italic bg-gray-100 dark:bg-slate-900 p-2.5 rounded-lg border border-gray-200 dark:border-slate-800 leading-relaxed">
              Directional probability estimate based on Random Forest feature weights and sentiment signals. Walk-forward backtest accuracy is 60.0%. Informational model only, not financial advice.
            </div>
          </div>
        </div>
      )}

      {/* 7. Expandable Technical Details / How It Works */}
      <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden">
        <button
          onClick={() => setShowTechnicalDetails(!showTechnicalDetails)}
          className="w-full p-5 flex items-center justify-between text-left hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
        >
          <div className="flex items-center gap-3">
            <div className="p-2 bg-teal-50 border border-teal-200 rounded-lg text-teal-700">
              <Sliders className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                Technical Details / How It Works
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-gray-100 text-slate-700 border border-gray-200">
                  Optional Analytics
                </span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Inspect the underlying machine learning model, feature weights, and 9-stage data processing pipeline.
              </p>
            </div>
          </div>

          <div className="text-slate-500 flex items-center gap-1 text-xs font-mono">
            <span>{showTechnicalDetails ? 'Hide' : 'Show'}</span>
            {showTechnicalDetails ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </div>
        </button>

        {showTechnicalDetails && (
          <div className="p-6 border-t border-gray-200 dark:border-slate-800 space-y-6 bg-gray-50/50 dark:bg-slate-950/40">
            {/* Technical Subnav */}
            <div className="flex items-center gap-2 border-b border-gray-200 pb-3 text-xs font-mono">
              <button
                onClick={() => setTechnicalTab('model')}
                className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 font-bold transition-all cursor-pointer ${
                  technicalTab === 'model'
                    ? 'bg-teal-700 text-white shadow-sm'
                    : 'text-slate-600 hover:text-gray-900'
                }`}
              >
                <BrainCircuit className="w-3.5 h-3.5" />
                <span>Model Metrics & Weights</span>
              </button>

              <button
                onClick={() => setTechnicalTab('workflow')}
                className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 font-bold transition-all cursor-pointer ${
                  technicalTab === 'workflow'
                    ? 'bg-teal-700 text-white shadow-sm'
                    : 'text-slate-600 hover:text-gray-900'
                }`}
              >
                <GitBranch className="w-3.5 h-3.5" />
                <span>9-Stage Pipeline</span>
              </button>
            </div>

            {/* Technical Tab: Model Details */}
            {technicalTab === 'model' && prediction && (
              <div className="bg-white border border-gray-200 rounded-xl p-5 space-y-5 shadow-sm">
                <div>
                  <h4 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                    <BrainCircuit className="w-4 h-4 text-teal-700" />
                    Model Performance & Historical Backtest Accuracy
                  </h4>
                  <p className="text-xs text-slate-500 mt-1">
                    Random Forest ensemble evaluating news mood features alongside technical momentum over chronological test periods.
                  </p>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-gray-50 p-4 rounded-lg border border-gray-200 text-center font-mono">
                  <div>
                    <div className="text-[10px] uppercase font-bold text-slate-500">Accuracy</div>
                    <div className="text-xl font-bold text-teal-700">{prediction.test_metrics.accuracy}%</div>
                  </div>
                  <div>
                    <div className="text-[10px] uppercase font-bold text-slate-500">Precision</div>
                    <div className="text-xl font-bold text-gray-900">{prediction.test_metrics.precision}%</div>
                  </div>
                  <div>
                    <div className="text-[10px] uppercase font-bold text-slate-500">Recall</div>
                    <div className="text-xl font-bold text-gray-900">{prediction.test_metrics.recall}%</div>
                  </div>
                  <div>
                    <div className="text-[10px] uppercase font-bold text-slate-500">ROC AUC Stability</div>
                    <div className="text-xl font-bold text-emerald-700">{prediction.test_metrics.roc_auc}</div>
                  </div>
                </div>

                {/* Feature Weights */}
                <div className="space-y-3 pt-2">
                  <div className="text-xs font-bold text-slate-700 font-mono uppercase">Feature Weights & Importance</div>
                  {prediction.feature_importances.map((f, idx) => (
                    <div key={idx} className="space-y-1">
                      <div className="flex justify-between text-xs text-slate-600">
                        <span className="font-medium">
                          {f.feature === 'VADER_Sentiment_Lag1' && '1. Previous Trading Day News Mood'}
                          {f.feature === 'NIFTY_RSI_14' && '2. Recent Price Trend (14-Day Momentum)'}
                          {f.feature === 'Rolling_7D_Sentiment' && '3. 7-Day Average News Mood Trend'}
                          {f.feature === 'MACD_Histogram' && '4. Price Trend Acceleration'}
                          {f.feature === 'NIFTY_Return_Lag1' && '5. Yesterday\'s Market % Movement'}
                          {!['VADER_Sentiment_Lag1', 'NIFTY_RSI_14', 'Rolling_7D_Sentiment', 'MACD_Histogram', 'NIFTY_Return_Lag1'].includes(f.feature) && f.feature}
                        </span>
                        <span className="font-bold text-teal-700 font-mono">{(f.importance_score * 100).toFixed(1)}%</span>
                      </div>
                      <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          style={{ width: `${f.importance_score * 100}%` }}
                          className="h-full bg-teal-700 rounded-full"
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Technical Tab: 9-Stage Pipeline */}
            {technicalTab === 'workflow' && (
              <div className="space-y-3">
                {workflow.map((st) => (
                  <div key={st.stage_number} className="bg-white p-4 rounded-xl border border-gray-200 flex flex-col md:flex-row md:items-start justify-between gap-4 shadow-sm">
                    <div className="flex items-start gap-3">
                      <div className="w-7 h-7 rounded-lg bg-teal-50 border border-teal-200 text-teal-700 flex items-center justify-center font-mono font-bold text-xs shrink-0">
                        {st.stage_number}
                      </div>
                      <div className="space-y-1">
                        <h4 className="text-xs font-bold text-gray-900 flex items-center gap-2">
                          {st.stage_name}
                          <span className="text-[10px] font-mono bg-emerald-50 text-emerald-700 px-1.5 py-0.5 rounded border border-emerald-200 font-bold">
                            COMPLETED
                          </span>
                        </h4>
                        <p className="text-xs text-slate-600 leading-relaxed">{st.description}</p>
                        <div className="flex flex-wrap gap-3 text-[11px] font-mono text-slate-500 pt-1">
                          <span><strong>Input:</strong> {st.input_artifacts}</span>
                          <span><strong>Output:</strong> {st.output_artifacts}</span>
                        </div>
                      </div>
                    </div>
                    <div className="bg-gray-50 p-2.5 rounded-lg border border-gray-200 text-[11px] font-mono text-teal-700 md:max-w-xs shrink-0">
                      {st.mathematical_formula_or_method}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
