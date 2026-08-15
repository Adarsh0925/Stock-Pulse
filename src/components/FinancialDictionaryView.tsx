import React, { useState, useEffect } from 'react';
import { BookOpen, Plus, Trash2, Search, CheckCircle2, AlertCircle, Sparkles, Filter, Info, ShieldCheck } from 'lucide-react';

interface LexiconResponse {
  builtin_positive: string[];
  builtin_negative: string[];
  custom_positive: string[];
  custom_negative: string[];
}

export const FinancialDictionaryView: React.FC = () => {
  const [lexicon, setLexicon] = useState<LexiconResponse>({
    builtin_positive: [],
    builtin_negative: [],
    custom_positive: [],
    custom_negative: []
  });
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [categoryFilter, setCategoryFilter] = useState<'ALL' | 'POSITIVE' | 'NEGATIVE'>('ALL');

  // New Word Form State
  const [newWord, setNewWord] = useState<string>('');
  const [newCategory, setNewCategory] = useState<'POSITIVE' | 'NEGATIVE'>('POSITIVE');
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const fetchLexicon = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/dictionary');
      if (res.ok) {
        const data = await res.json();
        setLexicon(data);
      }
    } catch (e) {
      console.error('Error fetching lexicon:', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLexicon();
  }, []);

  const handleAddWord = async (e: React.FormEvent) => {
    e.preventDefault();
    setFeedback(null);
    if (!newWord.trim()) return;

    try {
      const res = await fetch('/api/dictionary/add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ word: newWord.trim(), category: newCategory })
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setLexicon(data.lexicon);
        setNewWord('');
        setFeedback({ type: 'success', message: data.message });
      } else {
        setFeedback({ type: 'error', message: data.message || 'Failed to add word' });
      }
    } catch (e) {
      setFeedback({ type: 'error', message: 'Server communication error' });
    }
  };

  const handleDeleteCustomWord = async (word: string) => {
    setFeedback(null);
    try {
      const res = await fetch('/api/dictionary/delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ word })
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setLexicon(data.lexicon);
        setFeedback({ type: 'success', message: data.message });
      } else {
        setFeedback({ type: 'error', message: data.message || 'Failed to delete word' });
      }
    } catch (e) {
      setFeedback({ type: 'error', message: 'Server communication error' });
    }
  };

  // Combine and prepare list
  const allPositive = [
    ...lexicon.builtin_positive.map(w => ({ word: w, isCustom: false, category: 'POSITIVE' as const })),
    ...lexicon.custom_positive.map(w => ({ word: w, isCustom: true, category: 'POSITIVE' as const }))
  ];

  const allNegative = [
    ...lexicon.builtin_negative.map(w => ({ word: w, isCustom: false, category: 'NEGATIVE' as const })),
    ...lexicon.custom_negative.map(w => ({ word: w, isCustom: true, category: 'NEGATIVE' as const }))
  ];

  const filterWords = (words: Array<{ word: string; isCustom: boolean; category: 'POSITIVE' | 'NEGATIVE' }>) => {
    return words.filter(item => item.word.toLowerCase().includes(searchQuery.toLowerCase().trim()));
  };

  const displayedPositive = filterWords(allPositive);
  const displayedNegative = filterWords(allNegative);

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <BookOpen className="w-5 h-5 text-teal-700" />
            <h2 className="text-xl font-bold text-gray-900">Financial Lexicon & Word Dictionary</h2>
            <span className="bg-teal-50 text-teal-700 text-[10px] font-mono px-2 py-0.5 rounded border border-teal-200 font-bold uppercase">
              NLP Engine Vocabulary
            </span>
          </div>
          <p className="text-xs text-slate-500">
            Manage the financial words used by the sentiment analysis engine when processing headlines.
          </p>
        </div>

        <div className="flex items-center gap-3 text-xs font-mono">
          <div className="px-3 py-1.5 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-xl flex items-center gap-1.5 font-bold">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            <span>{allPositive.length} Positive Terms</span>
          </div>
          <div className="px-3 py-1.5 bg-red-50 border border-red-200 text-red-700 rounded-xl flex items-center gap-1.5 font-bold">
            <AlertCircle className="w-3.5 h-3.5 text-red-600" />
            <span>{allNegative.length} Negative Terms</span>
          </div>
        </div>
      </div>

      {/* Methodology Context Notice */}
      <div className="bg-white border border-gray-200 rounded-xl p-4 text-xs text-gray-700 space-y-2 font-sans shadow-sm">
        <div className="flex items-center gap-2 font-bold text-teal-700 font-mono text-xs uppercase tracking-wider">
          <Info className="w-4 h-4 text-teal-700" /> Multi-Layered Sentiment Analysis Context
        </div>
        <p className="text-slate-600 leading-relaxed">
          The dictionary lexicon provides rule-based keyword weights for financial headline parsing. Note that keyword matches alone do not determine direction. The final sentiment combines <strong className="text-gray-900">lexicon rule matches</strong>, <strong className="text-gray-900">VADER sentiment intensity</strong>, and <strong className="text-gray-900">headline context</strong> before outputting a research score.
        </p>
      </div>

      {/* Add New Word Form */}
      <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm space-y-4">
        <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2 font-mono uppercase tracking-wider">
          <Plus className="w-4 h-4 text-teal-700" /> Add Custom Word to Sentiment Engine
        </h3>

        <form onSubmit={handleAddWord} className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <div className="relative flex-1">
            <input
              type="text"
              value={newWord}
              onChange={(e) => setNewWord(e.target.value)}
              placeholder="Enter financial word (e.g. outperformance, impairment)..."
              className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-900 placeholder-slate-400 focus:outline-none focus:border-teal-700 focus:bg-white font-medium transition-colors"
            />
          </div>

          <select
            value={newCategory}
            onChange={(e) => setNewCategory(e.target.value as 'POSITIVE' | 'NEGATIVE')}
            className="px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold font-mono text-gray-800 focus:outline-none focus:border-teal-700 cursor-pointer"
          >
            <option value="POSITIVE">Category: POSITIVE WORD</option>
            <option value="NEGATIVE">Category: NEGATIVE WORD</option>
          </select>

          <button
            type="submit"
            className="px-5 py-2.5 bg-teal-700 hover:bg-teal-800 active:bg-teal-900 text-white font-bold font-mono text-xs rounded-xl transition-all cursor-pointer shadow-sm flex items-center justify-center gap-1.5 whitespace-nowrap"
          >
            <Plus className="w-4 h-4" />
            <span>Add Custom Word</span>
          </button>
        </form>

        {feedback && (
          <div className={`p-3 rounded-xl border text-xs font-mono ${
            feedback.type === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
              : 'bg-red-50 border-red-200 text-red-700'
          }`}>
            {feedback.message}
          </div>
        )}
      </div>

      {/* Controls: Search and Filter Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-gray-200 shadow-sm">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search dictionary words..."
            className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-900 placeholder-slate-400 focus:outline-none focus:border-teal-700 focus:bg-white transition-colors"
          />
        </div>

        <div className="flex items-center gap-1 text-xs font-mono">
          <span className="text-slate-500 mr-2 flex items-center gap-1">
            <Filter className="w-3.5 h-3.5 text-teal-700" /> Filter View:
          </span>
          <button
            onClick={() => setCategoryFilter('ALL')}
            className={`px-3 py-1.5 rounded-lg border transition-all cursor-pointer ${
              categoryFilter === 'ALL'
                ? 'bg-teal-700 text-white font-bold border-teal-700'
                : 'bg-gray-50 text-slate-600 border-gray-200 hover:text-gray-900 hover:bg-gray-100'
            }`}
          >
            All Words
          </button>
          <button
            onClick={() => setCategoryFilter('POSITIVE')}
            className={`px-3 py-1.5 rounded-lg border transition-all cursor-pointer ${
              categoryFilter === 'POSITIVE'
                ? 'bg-emerald-600 text-white font-bold border-emerald-600'
                : 'bg-gray-50 text-slate-600 border-gray-200 hover:text-gray-900 hover:bg-gray-100'
            }`}
          >
            Positive Only
          </button>
          <button
            onClick={() => setCategoryFilter('NEGATIVE')}
            className={`px-3 py-1.5 rounded-lg border transition-all cursor-pointer ${
              categoryFilter === 'NEGATIVE'
                ? 'bg-red-600 text-white font-bold border-red-600'
                : 'bg-gray-50 text-slate-600 border-gray-200 hover:text-gray-900 hover:bg-gray-100'
            }`}
          >
            Negative Only
          </button>
        </div>
      </div>

      {/* Main Grid: Positive and Negative Word Collections */}
      {isLoading ? (
        <div className="p-12 text-center text-slate-400 font-mono text-sm bg-white border border-gray-200 rounded-2xl shadow-sm">
          Loading Financial Lexicon Dictionary...
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* POSITIVE WORDS COLUMN */}
          {(categoryFilter === 'ALL' || categoryFilter === 'POSITIVE') && (
            <div className="bg-white border border-gray-200 rounded-2xl p-6 space-y-4 shadow-sm">
              <div className="flex items-center justify-between border-b border-gray-200 pb-3">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-emerald-600"></span>
                  <h3 className="text-base font-bold text-gray-900 font-mono">POSITIVE WORDS</h3>
                </div>
                <span className="text-xs font-mono px-2.5 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-lg font-bold">
                  {displayedPositive.length} Words
                </span>
              </div>

              <div className="flex flex-wrap gap-2 max-h-[450px] overflow-y-auto pr-1">
                {displayedPositive.map((item) => (
                  <div
                    key={`pos-${item.word}`}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-mono font-medium ${
                      item.isCustom
                        ? 'bg-emerald-50 border-emerald-300 text-emerald-800'
                        : 'bg-gray-50 border-gray-200 text-gray-800'
                    }`}
                  >
                    <span>{item.word}</span>

                    {item.isCustom ? (
                      <span className="text-[9px] uppercase px-1.5 py-0.2 bg-emerald-600 text-white rounded font-bold">
                        User Custom
                      </span>
                    ) : (
                      <span className="text-[9px] uppercase px-1.5 py-0.2 bg-gray-200 text-slate-600 rounded font-bold">
                        Built-in
                      </span>
                    )}

                    {item.isCustom && (
                      <button
                        onClick={() => handleDeleteCustomWord(item.word)}
                        className="ml-1 text-slate-400 hover:text-red-600 transition-colors cursor-pointer"
                        title="Delete custom word"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                ))}
                {displayedPositive.length === 0 && (
                  <div className="text-xs text-slate-400 italic py-4">No positive words matching filter.</div>
                )}
              </div>
            </div>
          )}

          {/* NEGATIVE WORDS COLUMN */}
          {(categoryFilter === 'ALL' || categoryFilter === 'NEGATIVE') && (
            <div className="bg-white border border-gray-200 rounded-2xl p-6 space-y-4 shadow-sm">
              <div className="flex items-center justify-between border-b border-gray-200 pb-3">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-red-600"></span>
                  <h3 className="text-base font-bold text-gray-900 font-mono">NEGATIVE WORDS</h3>
                </div>
                <span className="text-xs font-mono px-2.5 py-1 bg-red-50 text-red-700 border border-red-200 rounded-lg font-bold">
                  {displayedNegative.length} Words
                </span>
              </div>

              <div className="flex flex-wrap gap-2 max-h-[450px] overflow-y-auto pr-1">
                {displayedNegative.map((item) => (
                  <div
                    key={`neg-${item.word}`}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-mono font-medium ${
                      item.isCustom
                        ? 'bg-red-50 border-red-300 text-red-800'
                        : 'bg-gray-50 border-gray-200 text-gray-800'
                    }`}
                  >
                    <span>{item.word}</span>

                    {item.isCustom ? (
                      <span className="text-[9px] uppercase px-1.5 py-0.2 bg-red-600 text-white rounded font-bold">
                        User Custom
                      </span>
                    ) : (
                      <span className="text-[9px] uppercase px-1.5 py-0.2 bg-gray-200 text-slate-600 rounded font-bold">
                        Built-in
                      </span>
                    )}

                    {item.isCustom && (
                      <button
                        onClick={() => handleDeleteCustomWord(item.word)}
                        className="ml-1 text-slate-400 hover:text-red-600 transition-colors cursor-pointer"
                        title="Delete custom word"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                ))}
                {displayedNegative.length === 0 && (
                  <div className="text-xs text-slate-400 italic py-4">No negative words matching filter.</div>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
