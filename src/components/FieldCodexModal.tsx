import React, { useState } from 'react';
import { FIELD_CODEX_ENTRIES } from '../data/codex';
import { CodexEntry } from '../types';
import { X, BookOpen, Search, Compass, Flame, Droplet, Shirt, Cross, Shield, CheckCircle, AlertTriangle } from 'lucide-react';

interface FieldCodexModalProps {
  onClose: () => void;
  lang: 'en' | 'tr';
}

export const FieldCodexModal: React.FC<FieldCodexModalProps> = ({ onClose, lang }) => {
  const [selectedEntry, setSelectedEntry] = useState<CodexEntry>(FIELD_CODEX_ENTRIES[0]);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<string>('all');

  const filteredEntries = FIELD_CODEX_ENTRIES.filter((entry) => {
    const matchesCat = activeCategory === 'all' || entry.category === activeCategory;
    const query = searchQuery.toLowerCase();
    const matchesSearch = 
      entry.title.toLowerCase().includes(query) ||
      entry.titleTr.toLowerCase().includes(query) ||
      entry.summary.toLowerCase().includes(query) ||
      entry.summaryTr.toLowerCase().includes(query);
    return matchesCat && matchesSearch;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/80 backdrop-blur-md">
      <div className="relative w-full max-w-5xl h-[92vh] bg-stone-900 border border-stone-700/80 rounded-2xl shadow-2xl flex flex-col overflow-hidden text-stone-200 font-sans">
        {/* Header Bar */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-stone-800 bg-stone-950/80">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-sky-950/50 border border-sky-600/40 text-sky-400">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-serif font-bold text-lg text-stone-100 tracking-wide">
                {lang === 'tr' ? 'Yaban Hayatı Saha Kılavuzu & Dağcılık Doktrini' : 'Wilderness Field Guide & Outdoor Doctrine'}
              </h2>
              <p className="text-xs text-stone-400 font-mono">
                {lang === 'tr' ? 'Doğada Hayatta Kalma ve Dağcılık Bilgi Bankası' : 'Authentic Survival Knowledge & Campcraft Manual'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-stone-800 text-stone-400 hover:text-stone-100 transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search & Filter Bar */}
        <div className="px-5 py-3 bg-stone-950/60 border-b border-stone-800 flex flex-wrap items-center justify-between gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={lang === 'tr' ? 'Kılavuzda terim veya teknik ara...' : 'Search manual entries...'}
              className="w-full bg-stone-900 border border-stone-700 rounded-xl pl-9 pr-4 py-1.5 text-xs text-stone-200 placeholder-stone-500 focus:outline-none focus:border-amber-500 font-mono"
            />
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto text-xs">
            <button
              onClick={() => setActiveCategory('all')}
              className={`px-3 py-1 rounded-lg transition-all ${activeCategory === 'all' ? 'bg-amber-600 text-white font-semibold' : 'bg-stone-850 text-stone-300 hover:bg-stone-800'}`}
            >
              {lang === 'tr' ? 'Tümü' : 'All'}
            </button>
            <button
              onClick={() => setActiveCategory('navigation')}
              className={`px-3 py-1 rounded-lg transition-all ${activeCategory === 'navigation' ? 'bg-amber-600 text-white font-semibold' : 'bg-stone-850 text-stone-300 hover:bg-stone-800'}`}
            >
              {lang === 'tr' ? 'Navigasyon' : 'Navigation'}
            </button>
            <button
              onClick={() => setActiveCategory('campcraft')}
              className={`px-3 py-1 rounded-lg transition-all ${activeCategory === 'campcraft' ? 'bg-amber-600 text-white font-semibold' : 'bg-stone-850 text-stone-300 hover:bg-stone-800'}`}
            >
              {lang === 'tr' ? 'Kampçılık' : 'Campcraft'}
            </button>
            <button
              onClick={() => setActiveCategory('firecraft')}
              className={`px-3 py-1 rounded-lg transition-all ${activeCategory === 'firecraft' ? 'bg-amber-600 text-white font-semibold' : 'bg-stone-850 text-stone-300 hover:bg-stone-800'}`}
            >
              {lang === 'tr' ? 'Ateş' : 'Fire'}
            </button>
            <button
              onClick={() => setActiveCategory('first_aid')}
              className={`px-3 py-1 rounded-lg transition-all ${activeCategory === 'first_aid' ? 'bg-amber-600 text-white font-semibold' : 'bg-stone-850 text-stone-300 hover:bg-stone-800'}`}
            >
              {lang === 'tr' ? 'İlk Yardım' : 'First Aid'}
            </button>
          </div>
        </div>

        {/* Content Body: Entry list on left, Rich handbook reader on right */}
        <div className="flex-1 grid grid-cols-1 md:grid-cols-3 overflow-hidden">
          {/* Left Col: Entry List */}
          <div className="p-4 border-b md:border-b-0 md:border-r border-stone-800 overflow-y-auto space-y-2">
            {filteredEntries.map((entry) => {
              const isSelected = selectedEntry.id === entry.id;
              return (
                <div
                  key={entry.id}
                  onClick={() => setSelectedEntry(entry)}
                  className={`p-3 rounded-xl border cursor-pointer transition-all ${isSelected ? 'bg-stone-800 border-amber-500 shadow-md ring-2 ring-amber-500/20' : 'bg-stone-950/70 hover:bg-stone-850 border-stone-800'}`}
                >
                  <span className="text-[10px] font-mono text-amber-500 uppercase">
                    {entry.category}
                  </span>
                  <h4 className="font-bold text-xs text-stone-100 mt-0.5 line-clamp-1">
                    {lang === 'tr' ? entry.titleTr : entry.title}
                  </h4>
                  <p className="text-[11px] text-stone-400 mt-1 line-clamp-2">
                    {lang === 'tr' ? entry.summaryTr : entry.summary}
                  </p>
                </div>
              );
            })}
          </div>

          {/* Right 2 Cols: Handbook Reading Pane */}
          <div className="md:col-span-2 p-6 overflow-y-auto bg-stone-950/40">
            <div className="max-w-2xl mx-auto space-y-6">
              <div>
                <span className="text-xs font-mono text-amber-500 uppercase tracking-widest bg-amber-950/40 px-2 py-0.5 rounded border border-amber-800/40">
                  {selectedEntry.category.toUpperCase()}
                </span>
                <h3 className="font-serif font-bold text-xl text-stone-100 mt-2">
                  {lang === 'tr' ? selectedEntry.titleTr : selectedEntry.title}
                </h3>
                <p className="text-xs text-stone-300 mt-2 leading-relaxed italic border-l-2 border-amber-500 pl-3">
                  {lang === 'tr' ? selectedEntry.summaryTr : selectedEntry.summary}
                </p>
              </div>

              {/* Practical Outdoor Concepts */}
              <div className="space-y-3">
                <h4 className="flex items-center gap-2 font-bold text-xs text-emerald-400 uppercase tracking-wider">
                  <CheckCircle className="w-4 h-4" />
                  {lang === 'tr' ? 'Uygulamalı Saha Bilgileri & Kurallar' : 'Practical Field Rules & Protocols'}
                </h4>
                <div className="space-y-2">
                  {(lang === 'tr' ? selectedEntry.practicalTipsTr : selectedEntry.practicalTips).map((tip, idx) => (
                    <div key={idx} className="p-3 rounded-xl bg-stone-900 border border-stone-800 text-xs text-stone-200 leading-relaxed">
                      {tip}
                    </div>
                  ))}
                </div>
              </div>

              {/* Common Mistakes to Avoid */}
              <div className="space-y-3">
                <h4 className="flex items-center gap-2 font-bold text-xs text-rose-400 uppercase tracking-wider">
                  <AlertTriangle className="w-4 h-4" />
                  {lang === 'tr' ? 'Yapılan Ölümcül Hatalar' : 'Critical Mistakes to Avoid'}
                </h4>
                <div className="space-y-2">
                  {(lang === 'tr' ? selectedEntry.commonMistakesTr : selectedEntry.commonMistakes).map((mistake, idx) => (
                    <div key={idx} className="p-3 rounded-xl bg-rose-950/30 border border-rose-900/50 text-xs text-rose-200 leading-relaxed">
                      {mistake}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
