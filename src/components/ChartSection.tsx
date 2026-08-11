import React, { useState } from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar, CartesianGrid, Legend } from 'recharts';
import { Calendar, Image as ImageIcon, BarChart2, Layers } from 'lucide-react';
import { HistoricalData } from '../types';

interface ChartSectionProps {
  historicalData: HistoricalData | null;
  onSelectPeriod: (period: string) => void;
  selectedPeriod: string;
  ticker: string;
}

export const ChartSection: React.FC<ChartSectionProps> = ({
  historicalData,
  onSelectPeriod,
  selectedPeriod,
  ticker
}) => {
  const [viewMode, setViewMode] = useState<'matplotlib' | 'interactive'>('matplotlib');

  if (!historicalData || historicalData.status === 'DATA UNAVAILABLE' || !historicalData?.ohlcv?.length) {
    return (
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-amber-950/60 border border-amber-800/60 text-amber-300 font-mono text-sm rounded-lg mb-2">
          HISTORICAL DATA UNAVAILABLE
        </div>
        <p className="text-slate-400 text-sm">
          {historicalData?.error_reason || 'Could not retrieve verified historical OHLCV data for this ticker.'}
        </p>
      </div>
    );
  }

  const periods = ['1M', '3M', '6M', '1Y'];

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-5">
      {/* Chart Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2 text-cyan-400 text-xs font-bold uppercase tracking-wider mb-1">
            <BarChart2 className="w-4 h-4" />
            Verified Historical OHLCV Dataset
          </div>
          <h3 className="text-xl font-extrabold text-slate-100">{ticker} Technical Chart</h3>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* View Mode Toggle */}
          <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs font-medium">
            <button
              onClick={() => setViewMode('matplotlib')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                viewMode === 'matplotlib'
                  ? 'bg-cyan-500 text-slate-950 font-bold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <ImageIcon className="w-3.5 h-3.5" />
              Matplotlib Engine
            </button>
            <button
              onClick={() => setViewMode('interactive')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                viewMode === 'interactive'
                  ? 'bg-cyan-500 text-slate-950 font-bold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <BarChart2 className="w-3.5 h-3.5" />
              Interactive View
            </button>
          </div>

          {/* Period Selector */}
          <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs font-mono font-bold">
            {periods.map((p) => (
              <button
                key={p}
                onClick={() => onSelectPeriod(p)}
                className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                  selectedPeriod === p
                    ? 'bg-slate-800 text-cyan-400 border border-slate-700'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {p}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Chart Render Area */}
      {viewMode === 'matplotlib' && historicalData.chart_image_base64 ? (
        <div className="bg-slate-950 rounded-xl p-2 border border-slate-800 flex flex-col items-center justify-center">
          <img
            src={`data:image/png;base64,${historicalData.chart_image_base64}`}
            alt={`${ticker} Matplotlib Chart`}
            className="w-full max-h-[420px] object-contain rounded-lg"
          />
          <div className="w-full mt-2 text-center text-[11px] font-mono text-slate-500 flex items-center justify-between px-2">
            <span>Matplotlib 2D Financial Plotter (Python Backend)</span>
            <span>Sessions Rendered: {historicalData.candle_count}</span>
          </div>
        </div>
      ) : (
        /* Interactive Recharts View */
        <div className="space-y-4 bg-slate-950 p-4 rounded-xl border border-slate-800">
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={historicalData.ohlcv}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="Date" stroke="#64748b" tick={{ fontSize: 10 }} />
                <YAxis stroke="#64748b" domain={['auto', 'auto']} tick={{ fontSize: 10 }} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', color: '#f8fafc', borderRadius: '8px' }}
                />
                <Legend />
                <Line type="monotone" dataKey="Close" stroke="#38bdf8" strokeWidth={2} dot={false} name="Closing Price" />
                <Line type="monotone" dataKey="High" stroke="#22c55e" strokeWidth={1} strokeDasharray="2 2" dot={false} name="High" />
                <Line type="monotone" dataKey="Low" stroke="#ef4444" strokeWidth={1} strokeDasharray="2 2" dot={false} name="Low" />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="h-28 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={historicalData.ohlcv}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="Date" stroke="#64748b" tick={{ fontSize: 10 }} />
                <YAxis stroke="#64748b" tick={{ fontSize: 10 }} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', color: '#f8fafc', borderRadius: '8px' }}
                />
                <Bar dataKey="Volume" fill="#0284c7" name="Volume" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Footer Info */}
      <div className="flex flex-wrap items-center justify-between text-xs text-slate-400 font-mono pt-2 border-t border-slate-800/60">
        <span>Dataset Period: {selectedPeriod} ({historicalData.candle_count} sessions)</span>
        <span>Source: {historicalData.data_source}</span>
      </div>
    </div>
  );
};
