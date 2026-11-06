import React from 'react';
import {
  Check,
  Lock,
  Trophy,
  BookOpen,
  Layers,
  Network,
  Compass,
  Sparkles,
} from 'lucide-react';
import { ChapterBlueprint } from '../types';
import { STAGE_METADATA, getSubjectTheme } from '../data/presets';

interface WorldMapCanvasProps {
  chapter: ChapterBlueprint;
  chapters: ChapterBlueprint[];
  onSelectChapter: (chapterId: string) => void;
  onOpenStage: (stageNumber: number) => void;
  onViewBlueprint: () => void;
  overrideSubjectTheme?: string;
  compact?: boolean;
}

export const WorldMapCanvas: React.FC<WorldMapCanvasProps> = ({
  chapter,
  chapters,
  onSelectChapter,
  onOpenStage,
  onViewBlueprint,
  overrideSubjectTheme,
  compact = false,
}) => {
  const activeSubject =
    overrideSubjectTheme && overrideSubjectTheme !== 'All'
      ? overrideSubjectTheme
      : chapter.subject;

  const theme = getSubjectTheme(activeSubject);

  const getStageIcon = (stageNum: number, unlocked: boolean) => {
    if (!unlocked) {
      return <Lock className="w-5 h-5 text-slate-800" />;
    }
    switch (stageNum) {
      case 1:
        return (
          <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-600 flex items-center justify-center">
            <Compass className="w-5 h-5" />
          </div>
        );
      case 2:
        return (
          <div className="w-8 h-8 rounded-lg bg-sky-100 text-sky-600 flex items-center justify-center">
            <BookOpen className="w-5 h-5" />
          </div>
        );
      case 3:
        return (
          <div className="w-8 h-8 rounded-lg bg-orange-100 text-orange-600 flex items-center justify-center">
            <Layers className="w-5 h-5" />
          </div>
        );
      case 4:
        return (
          <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-600 flex items-center justify-center">
            <Network className="w-5 h-5" />
          </div>
        );
      default:
        return (
          <div className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-600 flex items-center justify-center">
            <Trophy className="w-5 h-5" />
          </div>
        );
    }
  };

  return (
    <div className="bg-white rounded-3xl p-5 sm:p-6 shadow-xs border border-slate-100 space-y-4">
      {/* Header Row */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-3">
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-[#1E293B]">
              {chapter.title}
            </h2>
            <p className="text-xs text-[#64748B]">
              {theme.emoji} {theme.subject} · {theme.themeName}
            </p>
          </div>
          {chapters.length > 1 && (
            <select
              value={chapter.id}
              onChange={(e) => onSelectChapter(e.target.value)}
              aria-label="Select Chapter"
              className="px-3 py-1.5 rounded-full bg-[#F3F5F9] text-xs font-semibold text-[#1E293B] border border-slate-200 focus:outline-none"
            >
              {chapters.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.title} ({c.subject})
                </option>
              ))}
            </select>
          )}
        </div>

        <button
          type="button"
          onClick={onViewBlueprint}
          className="text-xs font-semibold text-[#64748B] hover:text-[#2563EB] transition-colors cursor-pointer"
        >
          View Blueprint
        </button>
      </div>

      {/* Subject-Themed Adventure Map Canvas */}
      <div
        className={`relative w-full ${
          compact ? 'h-[340px] sm:h-[390px]' : 'h-[400px] sm:h-[450px]'
        } rounded-3xl overflow-hidden select-none shadow-inner border border-slate-200/70`}
      >
        <img
          src={theme.image}
          alt={theme.themeName}
          className="absolute inset-0 w-full h-full object-cover transition-all duration-500"
        />

        <div className="absolute inset-0 bg-gradient-to-t from-black/15 via-transparent to-black/5 pointer-events-none" />

        {/* Winding Trail Connector */}
        <svg
          viewBox="0 0 1000 450"
          preserveAspectRatio="none"
          className="absolute inset-0 w-full h-full pointer-events-none"
        >
          <path
            d={theme.svgPath}
            fill="none"
            stroke="#FFFBEB"
            strokeWidth="5"
            strokeDasharray="10 10"
            strokeLinecap="round"
            opacity="0.8"
          />
        </svg>

        {/* 5 Learning Stage Checkpoints on Stone Pedestals */}
        {STAGE_METADATA.map((stageMeta, index) => {
          const coord = theme.checkpointCoords[index] || { x: 20 + index * 15, y: 50 };
          const isCompleted = chapter.completedStages.includes(stageMeta.stage);
          const isCurrent =
            !isCompleted && chapter.currentStage === stageMeta.stage;
          const isUnlocked =
            isCompleted || stageMeta.stage <= chapter.currentStage;

          return (
            <div
              key={stageMeta.stage}
              style={{ left: `${coord.x}%`, top: `${coord.y}%` }}
              className="absolute -translate-x-1/2 -translate-y-1/2 flex flex-col items-center z-10 transition-all duration-300"
            >
              {isCurrent && (
                <div className="mb-1 px-3 py-0.5 rounded-md bg-white text-emerald-600 font-bold text-[11px] shadow-md border border-emerald-100 whitespace-nowrap animate-bounce">
                  Start
                </div>
              )}

              <button
                type="button"
                onClick={() => {
                  if (isUnlocked) {
                    onOpenStage(stageMeta.stage);
                  }
                }}
                disabled={!isUnlocked}
                style={
                  isUnlocked
                    ? {
                        borderColor: theme.accentHex,
                        boxShadow: theme.ringShadow,
                      }
                    : undefined
                }
                className={`relative w-[76px] h-[76px] sm:w-[86px] sm:h-[86px] rounded-full flex flex-col items-center justify-center transition-transform duration-200 ${
                  isUnlocked
                    ? 'bg-white border-[5px] hover:scale-105 cursor-pointer'
                    : 'bg-[#64748B]/90 backdrop-blur-xs border-[3px] border-white/85 shadow-[0_8px_18px_rgba(0,0,0,0.3)] cursor-not-allowed'
                }`}
              >
                {isCompleted && (
                  <span className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-emerald-500 text-white border-2 border-white flex items-center justify-center shadow-sm">
                    <Check className="w-3.5 h-3.5 stroke-[3]" />
                  </span>
                )}

                {getStageIcon(stageMeta.stage, isUnlocked)}

                <span
                  className={`mt-1 text-[10px] sm:text-[11px] font-bold leading-tight px-1 truncate max-w-[72px] ${
                    isUnlocked ? 'text-[#1E293B]' : 'text-slate-900'
                  }`}
                >
                  {stageMeta.name}
                </span>
              </button>

              <div
                className={`-mt-2 rounded-b-xl border-t-2 shadow-md ${
                  isCurrent
                    ? 'w-14 h-6 bg-gradient-to-b from-[#D6D3D1] via-[#A8A29E] to-[#78716C] border-[#F5F5F4]'
                    : 'w-11 h-4 bg-gradient-to-b from-[#D6D3D1] to-[#A8A29E] border-[#E7E5E4]'
                }`}
              />
            </div>
          );
        })}
      </div>

      {/* Bottom Action Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-1 text-xs">
        <div className="flex items-center gap-4 text-[#64748B] font-medium">
          <span className="flex items-center gap-1.5">
            <span
              className="w-3 h-3 rounded-full inline-block"
              style={{ backgroundColor: theme.accentHex }}
            />
            <span>Unlocked / Current</span>
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-emerald-500 inline-block" />
            <span>Completed</span>
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-[#64748B] inline-block" />
            <span>Locked</span>
          </span>
        </div>

        <button
          type="button"
          onClick={() => onOpenStage(chapter.currentStage)}
          style={{ backgroundColor: theme.accentHex }}
          className="px-4 py-2 rounded-full hover:opacity-95 text-white font-semibold flex items-center gap-1.5 shadow-xs transition-all cursor-pointer whitespace-nowrap shrink-0"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>
            Start Stage {chapter.currentStage}:{' '}
            {STAGE_METADATA[chapter.currentStage - 1]?.name}
          </span>
        </button>
      </div>
    </div>
  );
};
