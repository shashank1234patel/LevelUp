import React from 'react';
import {
  Compass,
  BookOpen,
  Layers,
  Network,
  Trophy,
  Clock,
  Zap,
  CheckCircle2,
  Lock,
  ArrowRight,
  Map,
  Sparkles,
} from 'lucide-react';
import { ChapterBlueprint } from '../types';
import { STAGE_METADATA } from '../data/presets';

interface BlueprintViewProps {
  chapter: ChapterBlueprint;
  onOpenStage: (stageNumber: number) => void;
  onOpenWorldMap: () => void;
}

export const BlueprintView: React.FC<BlueprintViewProps> = ({
  chapter,
  onOpenStage,
  onOpenWorldMap,
}) => {
  const totalSubtopics = chapter.topics.reduce(
    (acc, t) => acc + (t.subtopics?.length || 0),
    0
  );

  const getStageIcon = (stageNum: number) => {
    switch (stageNum) {
      case 1:
        return <Compass className="w-6 h-6" />;
      case 2:
        return <BookOpen className="w-6 h-6" />;
      case 3:
        return <Layers className="w-6 h-6" />;
      case 4:
        return <Network className="w-6 h-6" />;
      default:
        return <Trophy className="w-6 h-6" />;
    }
  };

  const getStageSummaryCount = (stageNum: number) => {
    switch (stageNum) {
      case 1:
        return `${chapter.topics.length} Topics · ${totalSubtopics} Subtopics`;
      case 2:
        return `${chapter.explanations.length} Guided Breakdowns & Analogies`;
      case 3:
        return `${chapter.revisionNotes.length} Key Notes · ${chapter.flashcards.length} Flashcards`;
      case 4:
        return `${chapter.mindMap.branches.length} Concept Branches · Interactive Graph`;
      default:
        return `${chapter.quizQuestions.length} Assessment Questions`;
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Blueprint Header */}
      <div className="bg-white rounded-3xl p-6 border border-[#6546F5]/15 shadow-xs space-y-5">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1 max-w-2xl">
            <h1 className="text-2xl sm:text-3xl font-bold text-[#25243A]">
              {chapter.title}
            </h1>
            <p className="text-sm text-[#25243A]/70">
              {chapter.sourceSummary}
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={onOpenWorldMap}
              className="px-4 py-2.5 rounded-xl bg-[#F6F5FF] hover:bg-[#6546F5]/10 text-[#6546F5] font-semibold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Map className="w-4 h-4" />
              <span>World Map</span>
            </button>
            <button
              onClick={() => onOpenStage(chapter.currentStage)}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#6546F5] to-[#398BFF] hover:opacity-95 text-white font-semibold text-xs flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
            >
              <span>Start Stage {chapter.currentStage}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3 border-t border-slate-100 tabular-nums">
          <div className="p-3.5 rounded-2xl bg-[#F6F5FF]">
            <p className="text-xs text-[#25243A]/60">Topics</p>
            <p className="text-lg font-bold text-[#25243A]">{chapter.topics.length}</p>
          </div>
          <div className="p-3.5 rounded-2xl bg-[#F6F5FF]">
            <p className="text-xs text-[#25243A]/60">Subtopics</p>
            <p className="text-lg font-bold text-[#6546F5]">{totalSubtopics}</p>
          </div>
          <div className="p-3.5 rounded-2xl bg-[#F6F5FF]">
            <p className="text-xs text-[#25243A]/60">Difficulty</p>
            <p className="text-lg font-bold text-[#F36FA5]">{chapter.difficulty}</p>
          </div>
          <div className="p-3.5 rounded-2xl bg-[#F6F5FF]">
            <p className="text-xs text-[#25243A]/60">Progress</p>
            <p className="text-lg font-bold text-emerald-600">{chapter.progressPercent}%</p>
          </div>
        </div>
      </div>

      {/* 5 Stage Cards */}
      <div className="grid grid-cols-1 gap-4">
        {STAGE_METADATA.map((stage) => {
          const isCompleted = chapter.completedStages.includes(stage.stage);
          const isCurrent = !isCompleted && chapter.currentStage === stage.stage;
          const isUnlocked = true;

          return (
            <div
              key={stage.stage}
              className={`bg-white rounded-3xl p-5 border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                isCurrent
                  ? 'border-[#6546F5] shadow-sm'
                  : 'border-[#25243A]/10'
              }`}
            >
              <div className="flex items-center gap-4">
                <div
                  className="w-12 h-12 rounded-2xl text-white flex items-center justify-center shrink-0"
                  style={{
                    backgroundColor: isUnlocked ? stage.color : '#94A3B8',
                  }}
                >
                  {getStageIcon(stage.stage)}
                </div>

                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-base font-bold text-[#25243A]">
                      Stage {stage.stage}: {stage.name}
                    </h2>
                    <span className="text-xs text-[#25243A]/55 tabular-nums">
                      · {getStageSummaryCount(stage.stage)}
                    </span>
                  </div>
                  <p className="text-xs text-[#25243A]/70 mt-0.5">
                    {stage.description}
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between sm:justify-end gap-4 shrink-0">
                <span className="text-xs font-bold text-amber-600 tabular-nums">
                  +{stage.xpReward} XP
                </span>

                {isCompleted ? (
                  <button
                    onClick={() => onOpenStage(stage.stage)}
                    className="px-4 py-2 rounded-xl bg-emerald-500/10 text-emerald-700 font-semibold text-xs flex items-center gap-1.5 cursor-pointer"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Review</span>
                  </button>
                ) : isUnlocked ? (
                  <button
                    onClick={() => onOpenStage(stage.stage)}
                    className="px-5 py-2 rounded-xl bg-[#6546F5] hover:bg-[#5235E0] text-white font-semibold text-xs flex items-center gap-1.5 cursor-pointer"
                  >
                    <span>Start</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                ) : (
                  <div className="px-4 py-2 rounded-xl bg-slate-100 text-slate-500 font-semibold text-xs flex items-center gap-1.5">
                    <Lock className="w-3.5 h-3.5" />
                    <span>Locked</span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
