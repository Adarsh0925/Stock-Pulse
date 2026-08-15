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
      <div className="bg-white border border-gray-200 rounded-2xl p-6 text-center shadow-sm">
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-amber-50 border border-amber-200 text-amber-800 font-mono text-sm rounded-lg mb-2">
          HISTORICAL DATA UNAVAILABLE
        </div>
        <p className="text-slate-600 text-sm">
          {historicalData?.error_reason || 'Could not retrieve verified historical OHLCV data for this ticker.'}
        </p>
      </div>
    );
  }

  const periods = ['1M', '3M', '6M', '1Y'];

  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm space-y-5">
      {/* Chart Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-200 pb-4">
        <div>
          <div className="flex items-center gap-2 text-teal-700 text-xs font-bold uppercase tracking-wider mb-1">
            <BarChart2 className="w-4 h-4" />
            Verified Historical OHLCV Dataset
          </div>
          <h3 className="text-xl font-extrabold text-gray-900">{ticker} Technical Chart</h3>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* View Mode Toggle */}
          <div className="flex bg-gray-100 p-1 rounded-xl border border-gray-200 text-xs font-medium">
            <button
              onClick={() => setViewMode('matplotlib')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                viewMode === 'matplotlib'
                  ? 'bg-teal-700 text-white font-bold shadow-sm'
                  : 'text-slate-600 hover:text-gray-900'
              }`}
            >
              <ImageIcon className="w-3.5 h-3.5" />
              Matplotlib Engine
            </button>
            <button
              onClick={() => setViewMode('interactive')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                viewMode === 'interactive'
                  ? 'bg-teal-700 text-white font-bold shadow-sm'
                  : 'text-slate-600 hover:text-gray-900'
              }`}
            >
              <BarChart2 className="w-3.5 h-3.5" />
              Interactive View
            </button>
          </div>

          {/* Period Selector */}
          <div className="flex bg-gray-100 p-1 rounded-xl border border-gray-200 text-xs font-mono font-bold">
            {periods.map((p) => (
              <button
                key={p}
                onClick={() => onSelectPeriod(p)}
                className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                  selectedPeriod === p
                    ? 'bg-white text-teal-700 border border-gray-200 shadow-sm'
                    : 'text-slate-600 hover:text-gray-900'
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
        <div className="bg-gray-50 rounded-xl p-2 border border-gray-200 flex flex-col items-center justify-center">
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
        <div className="space-y-4 bg-gray-50 p-4 rounded-xl border border-gray-200">
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={historicalData.ohlcv}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                <XAxis dataKey="Date" stroke="#64748B" tick={{ fontSize: 10 }} />
                <YAxis stroke="#64748B" domain={['auto', 'auto']} tick={{ fontSize: 10 }} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#FFFFFF', borderColor: '#E5E7EB', color: '#111827', borderRadius: '8px', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
                <Legend />
                <Line type="monotone" dataKey="Close" stroke="#0F766E" strokeWidth={2} dot={false} name="Closing Price" />
                <Line type="monotone" dataKey="High" stroke="#16A34A" strokeWidth={1} strokeDasharray="2 2" dot={false} name="High" />
                <Line type="monotone" dataKey="Low" stroke="#DC2626" strokeWidth={1} strokeDasharray="2 2" dot={false} name="Low" />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="h-28 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={historicalData.ohlcv}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                <XAxis dataKey="Date" stroke="#64748B" tick={{ fontSize: 10 }} />
                <YAxis stroke="#64748B" tick={{ fontSize: 10 }} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#FFFFFF', borderColor: '#E5E7EB', color: '#111827', borderRadius: '8px', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
                <Bar dataKey="Volume" fill="#0F766E" name="Volume" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Footer Info */}
      <div className="flex flex-wrap items-center justify-between text-xs text-slate-500 font-mono pt-2 border-t border-gray-200">
        <span>Dataset Period: {selectedPeriod} ({historicalData.candle_count} sessions)</span>
        <span>Source: {historicalData.data_source}</span>
      </div>
    </div>
  );
};
