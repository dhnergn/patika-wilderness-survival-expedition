import React from 'react';
import { STORY_CHAPTERS } from '../data/story';
import { GameState } from '../game/simulation';
import { X, BookOpen, CheckCircle, Circle, Award } from 'lucide-react';

interface StoryModalProps {
  gameState: GameState;
  onClose: () => void;
  lang: 'en' | 'tr';
}

export const StoryModal: React.FC<StoryModalProps> = ({ gameState, onClose, lang }) => {
  const currentChapter = STORY_CHAPTERS.find((c) => c.id === gameState.currentChapterId) || STORY_CHAPTERS[0];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/80 backdrop-blur-md">
      <div className="relative w-full max-w-3xl h-[85vh] bg-stone-900 border border-stone-700/80 rounded-2xl shadow-2xl flex flex-col overflow-hidden text-stone-200 font-sans">
        {/* Header Bar */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-stone-800 bg-stone-950/80">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-amber-950/50 border border-amber-600/40 text-amber-500">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-serif font-bold text-lg text-stone-100 tracking-wide">
                {lang === 'tr' ? 'Sefer Günlüğü & Bölüm Hedefleri' : 'Expedition Journal & Chapter Missions'}
              </h2>
              <p className="text-xs text-stone-400 font-mono">
                {lang === 'tr' ? 'Kuzey Sırtı Keşif Raporu' : 'The Northern Ridge Expedition Narrative'}
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

        {/* Content Body */}
        <div className="flex-1 p-6 overflow-y-auto space-y-6">
          {/* Chapter Header */}
          <div className="border-b border-stone-800 pb-4">
            <span className="text-xs font-mono text-amber-500 uppercase tracking-widest bg-amber-950/40 px-2 py-0.5 rounded border border-amber-800/40">
              {lang === 'tr' ? `BÖLÜM ${currentChapter.id}` : `CHAPTER ${currentChapter.id}`}
            </span>
            <h3 className="font-serif font-bold text-xl text-stone-100 mt-2">
              {lang === 'tr' ? currentChapter.titleTr : currentChapter.title}
            </h3>
            <p className="text-xs text-stone-300 mt-2 leading-relaxed">
              {lang === 'tr' ? currentChapter.briefTr : currentChapter.brief}
            </p>
          </div>

          {/* Objectives Checklist */}
          <div className="space-y-3">
            <h4 className="font-bold text-xs text-stone-400 uppercase tracking-wider">
              {lang === 'tr' ? 'Bölüm Hedefleri' : 'Mission Objectives'}
            </h4>
            <div className="space-y-2">
              {currentChapter.objectives.map((obj) => {
                const isCompleted = gameState.completedObjectives.includes(obj.id);
                return (
                  <div
                    key={obj.id}
                    className={`p-3.5 rounded-xl border flex items-center gap-3 transition-all ${isCompleted ? 'bg-emerald-950/30 border-emerald-800 text-emerald-300' : 'bg-stone-950 border-stone-800 text-stone-200'}`}
                  >
                    {isCompleted ? (
                      <CheckCircle className="w-5 h-5 text-emerald-400 flex-shrink-0" />
                    ) : (
                      <Circle className="w-5 h-5 text-stone-500 flex-shrink-0" />
                    )}
                    <span className="text-xs font-medium">
                      {lang === 'tr' ? obj.textTr : obj.text}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Expedition Field Journal Entry */}
          <div className="p-4 rounded-xl bg-stone-950 border border-stone-850 space-y-2">
            <div className="flex items-center gap-2 text-xs font-mono text-amber-500">
              <BookOpen className="w-4 h-4" />
              <span>{lang === 'tr' ? 'Saha Günlüğü Notu' : 'Field Diary Excerpt'}</span>
            </div>
            <p className="text-xs text-stone-300 italic leading-relaxed font-serif">
              "{lang === 'tr' ? currentChapter.journalEntryTr : currentChapter.journalEntry}"
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
