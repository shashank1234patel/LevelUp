import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  ChevronDown,
  CheckCircle2,
  Sparkles,
  BookOpen,
  Layers,
  Network,
  Trophy,
  Compass,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  ArrowLeft,
  ArrowRight,
  Zap,
  MessageSquare,
  Send,
  Loader2,
  Award,
  RefreshCw,
  Check,
  XCircle,
  Lock,
  Star,
  Shield,
  Flame,
  Crown,
} from 'lucide-react';
import { ChapterBlueprint } from '../types';
import { STAGE_METADATA, getSubjectTheme } from '../data/presets';

import stage1Cartoon from '../assets/images/stage1_cartoon_topics_1794410860519.jpg';
import stage2Cartoon from '../assets/images/stage2_cartoon_explanation_1794410861996.jpg';
import stage3Cartoon from '../assets/images/stage3_cartoon_revision_1794410865679.jpg';
import stage4Cartoon from '../assets/images/stage4_cartoon_mindmap_1794410864913.jpg';
import stage5Cartoon from '../assets/images/stage5_cartoon_boss_test_1794410865858.jpg';

interface StageWorkspaceViewProps {
  chapter: ChapterBlueprint;
  activeStage: number;
  showResultsCelebration: boolean;
  onSelectStage: (stageNumber: number) => void;
  onToggleTopicUnderstood: (topicId: string, xpDelta: number) => Promise<void>;
  onCompleteStage: (stageNumber: number, testScore?: number) => Promise<void>;
  onBackToMap: () => void;
  onStartNextChapter: () => void;
}

const STAGE_CARTOON_DATA: Record<
  number,
  {
    image: string;
    levelTitle: string;
    questBadge: string;
    mascotEmoji: string;
    gradient: string;
    borderAccent: string;
  }
> = {
  1: {
    image: stage1Cartoon,
    levelTitle: 'Level 1 • Explorer Camp',
    questBadge: 'Discover the Topic Trails',
    mascotEmoji: '🧭',
    gradient: 'from-[#6546F5] via-[#7C5DFA] to-[#398BFF]',
    borderAccent: 'border-[#6546F5]',
  },
  2: {
    image: stage2Cartoon,
    levelTitle: 'Level 2 • Story Workshop',
    questBadge: 'Unlock Simple Explanations & Examples',
    mascotEmoji: '🔮',
    gradient: 'from-[#398BFF] via-[#48B2FF] to-[#48D4DC]',
    borderAccent: 'border-[#398BFF]',
  },
  3: {
    image: stage3Cartoon,
    levelTitle: 'Level 3 • Memory Arcade',
    questBadge: 'Flip Power Cards & Collect Scrolls',
    mascotEmoji: '⚡',
    gradient: 'from-[#06B6D4] via-[#10B981] to-[#34D399]',
    borderAccent: 'border-emerald-500',
  },
  4: {
    image: stage4Cartoon,
    levelTitle: 'Level 4 • Sky Observatory',
    questBadge: 'Connect the Knowledge Islands',
    mascotEmoji: '🌟',
    gradient: 'from-[#F36FA5] via-[#EC4899] to-[#8B5CF6]',
    borderAccent: 'border-[#F36FA5]',
  },
  5: {
    image: stage5Cartoon,
    levelTitle: 'Level 5 • Boss Trophy Arena',
    questBadge: 'Conquer the Final Challenge & Claim the Chest',
    mascotEmoji: '🏆',
    gradient: 'from-[#F59E0B] via-[#F97316] to-[#EF4444]',
    borderAccent: 'border-amber-500',
  },
};

export const StageWorkspaceView: React.FC<StageWorkspaceViewProps> = ({
  chapter,
  activeStage,
  showResultsCelebration,
  onSelectStage,
  onToggleTopicUnderstood,
  onCompleteStage,
  onBackToMap,
  onStartNextChapter,
}) => {
  const safeStage = Math.min(5, Math.max(1, activeStage));
  const stageMeta = STAGE_METADATA[safeStage - 1] || STAGE_METADATA[0];
  const stageCartoon = STAGE_CARTOON_DATA[safeStage] || STAGE_CARTOON_DATA[1];
  const subjectTheme = getSubjectTheme(chapter.subject);

  const [stageDirection, setStageDirection] = useState<number>(1);
  const [lockedHint, setLockedHint] = useState<string | null>(null);
  const [unlockedStagesLocal, setUnlockedStagesLocal] = useState<number[]>([1]);

  // Progressive Game Level Unlocking:
  // Level 1 is always unlocked. Next levels unlock as you complete each level!
  const isStageUnlocked = (stageNum: number) =>
    stageNum === 1 ||
    chapter.completedStages.includes(stageNum) ||
    chapter.completedStages.includes(stageNum - 1) ||
    stageNum <= chapter.currentStage ||
    unlockedStagesLocal.includes(stageNum);

  const handleSwitchStage = (targetStage: number) => {
    if (targetStage < 1 || targetStage > 5) return;
    if (!isStageUnlocked(targetStage)) {
      setLockedHint(
        `Complete Level ${targetStage - 1} (${STAGE_METADATA[targetStage - 2]?.name}) to unlock Level ${targetStage}!`
      );
      setTimeout(() => setLockedHint(null), 3500);
      return;
    }
    setLockedHint(null);
    setStageDirection(targetStage > safeStage ? 1 : -1);
    onSelectStage(targetStage);
  };

  const handleCompleteAndUnlockNext = async (stageNum: number, score?: number) => {
    const nextStage = Math.min(5, stageNum + 1);
    setUnlockedStagesLocal((prev) => Array.from(new Set([...prev, stageNum, nextStage])));
    setStageDirection(1);
    await onCompleteStage(stageNum, score);
  };

  // Stage 1 state (Topics)
  const [expandedTopics, setExpandedTopics] = useState<Record<string, boolean>>({
    [chapter.topics[0]?.id || 'topic_1']: true,
  });

  // Stage 2 state (Explanation)
  const [selectedExpIdx, setSelectedExpIdx] = useState(0);
  const [showTutorDrawer, setShowTutorDrawer] = useState(false);
  const [tutorQuestion, setTutorQuestion] = useState('');
  const [tutorLoading, setTutorLoading] = useState(false);
  const [tutorMessages, setTutorMessages] = useState<
    Array<{ role: 'user' | 'tutor'; text: string; keyTakeaway?: string }>
  >([
    {
      role: 'tutor',
      text: `Welcome to Level 2! Ask me anything about "${chapter.title}" and I'll explain it with fun examples.`,
    },
  ]);

  // Stage 3 state (Revision)
  const [activeCardIdx, setActiveCardIdx] = useState(0);
  const [isCardFlipped, setIsCardFlipped] = useState(false);
  const [reviewedCards, setReviewedCards] = useState<Record<string, boolean>>({});

  // Stage 4 state (Mind Maps)
  const [zoomScale, setZoomScale] = useState(1);
  const [selectedBranchId, setSelectedBranchId] = useState<string | null>(
    chapter.mindMap.branches[0]?.id || null
  );

  // Stage 5 state (Test)
  const [quizIndex, setQuizIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isAnswerSubmitted, setIsAnswerSubmitted] = useState(false);
  const [answersRecord, setAnswersRecord] = useState<
    Record<string, { selected: number; correct: boolean }>
  >({});
  const [retryIncorrectOnly, setRetryIncorrectOnly] = useState(false);
  const [quizFinished, setQuizFinished] = useState(false);

  const activeQuestions = retryIncorrectOnly
    ? chapter.quizQuestions.filter((q) => answersRecord[q.id] && !answersRecord[q.id].correct)
    : chapter.quizQuestions;

  const currentQuestion = activeQuestions[quizIndex] || chapter.quizQuestions[0];

  const handleAskInlineTutor = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tutorQuestion.trim() || tutorLoading) return;
    const userQ = tutorQuestion.trim();
    setTutorQuestion('');
    setTutorMessages((prev) => [...prev, { role: 'user', text: userQ }]);
    setTutorLoading(true);
    try {
      const res = await fetch('/api/tutor/ask', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chapterTitle: chapter.title,
          subject: chapter.subject,
          question: userQ,
          contextNotes: chapter.explanations
            .map((ex) => `${ex.title}: ${ex.simpleExplanation}`)
            .join('\n'),
        }),
      });
      const data = await res.json();
      setTutorMessages((prev) => [
        ...prev,
        {
          role: 'tutor',
          text:
            data.reply ||
            'Break this idea into small parts and focus on how each step connects to the next.',
          keyTakeaway: data.keyTakeaway,
        },
      ]);
    } catch {
      setTutorMessages((prev) => [
        ...prev,
        {
          role: 'tutor',
          text: 'Try linking this concept to the real-world example on this card.',
        },
      ]);
    } finally {
      setTutorLoading(false);
    }
  };

  const handleSelectQuizOption = (idx: number) => {
    if (isAnswerSubmitted) return;
    setSelectedOption(idx);
  };

  const handleSubmitAnswer = () => {
    if (selectedOption === null || !currentQuestion) return;
    const isCorrect = selectedOption === currentQuestion.correctIndex;
    setIsAnswerSubmitted(true);
    setAnswersRecord((prev) => ({
      ...prev,
      [currentQuestion.id]: { selected: selectedOption, correct: isCorrect },
    }));
  };

  const handleNextQuestion = async () => {
    if (quizIndex + 1 < activeQuestions.length) {
      setQuizIndex((prev) => prev + 1);
      setSelectedOption(null);
      setIsAnswerSubmitted(false);
    } else {
      const totalQ = chapter.quizQuestions.length || 1;
      const correctCount = Object.values(answersRecord).filter((a) => a.correct).length;
      const finalPercentage = Math.round((correctCount / totalQ) * 100);
      setQuizFinished(true);
      await handleCompleteAndUnlockNext(5, finalPercentage);
    }
  };

  const handleRetryWrongQuestions = () => {
    setRetryIncorrectOnly(true);
    setQuizIndex(0);
    setSelectedOption(null);
    setIsAnswerSubmitted(false);
    setQuizFinished(false);
  };

  const handleResetFullQuiz = () => {
    setRetryIncorrectOnly(false);
    setAnswersRecord({});
    setQuizIndex(0);
    setSelectedOption(null);
    setIsAnswerSubmitted(false);
    setQuizFinished(false);
  };

  const getStageIcon = (num: number) => {
    switch (num) {
      case 1:
        return <Compass className="w-4 h-4" />;
      case 2:
        return <BookOpen className="w-4 h-4" />;
      case 3:
        return <Layers className="w-4 h-4" />;
      case 4:
        return <Network className="w-4 h-4" />;
      case 5:
        return <Trophy className="w-4 h-4" />;
      default:
        return <Compass className="w-4 h-4" />;
    }
  };

  const totalQuestions = chapter.quizQuestions.length || 1;
  const correctAnswersCount = Object.values(answersRecord).filter((a) => a.correct).length;
  const computedScore =
    Object.keys(answersRecord).length > 0
      ? Math.round((correctAnswersCount / totalQuestions) * 100)
      : chapter.testScore || 0;

  const questCardImages = [
    stage1Cartoon,
    subjectTheme.image,
    stage2Cartoon,
    stage3Cartoon,
    stage4Cartoon,
  ];

  return (
    <div className="space-y-6 pb-12">
      {/* =====================================================================
          GAME LEVEL PROGRESSION & STAGE UNLOCK BAR (LEVEL 1 -> LEVEL 5)
      ===================================================================== */}
      <div className="bg-white rounded-3xl p-4 sm:p-6 border-2 border-[#E6E4FA] shadow-sm space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <button
              onClick={onBackToMap}
              className="w-11 h-11 rounded-2xl bg-[#F6F5FF] hover:bg-[#ECE9FE] text-[#25243A] flex items-center justify-center transition-colors shrink-0 border border-[#E6E4FA] cursor-pointer"
              title="Back to World Map"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#6546F5]/10 text-[#6546F5] text-xs font-extrabold">
                  <Crown className="w-3.5 h-3.5" /> {subjectTheme.emoji} {chapter.subject} Quest
                </span>
                <span className="text-xs font-bold text-[#686687] truncate max-w-[200px] sm:max-w-xs">
                  {chapter.title}
                </span>
              </div>
              <h1 className="text-lg sm:text-xl font-extrabold font-display text-[#25243A] mt-0.5">
                Complete Each Level to Unlock the Next Stage!
              </h1>
            </div>
          </div>

          {/* Total Chapter Progress Pill */}
          <div className="flex items-center gap-3 bg-[#F6F5FF] px-4 py-2.5 rounded-2xl border border-[#E6E4FA] self-start sm:self-auto">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 text-white flex items-center justify-center shadow-xs">
              <Star className="w-5 h-5 fill-white" />
            </div>
            <div>
              <div className="text-[11px] font-bold text-[#686687] uppercase tracking-wider">
                Levels Cleared
              </div>
              <div className="text-sm font-extrabold text-[#25243A]">
                {chapter.completedStages.length} / 5 Levels ({chapter.progressPercent}%)
              </div>
            </div>
          </div>
        </div>

        {/* Locked Stage Hint Banner */}
        <AnimatePresence>
          {lockedHint && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="px-4 py-3 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs font-bold flex items-center justify-between gap-2"
            >
              <div className="flex items-center gap-2">
                <Lock className="w-4 h-4 text-amber-600 shrink-0" />
                <span>{lockedHint}</span>
              </div>
              <span className="text-[11px] font-extrabold text-amber-700">
                Finish current level below ↓
              </span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* 5 Cartoon Game Level Cards Track */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 relative">
          {STAGE_METADATA.slice(0, 5).map((s) => {
            const isCompleted = chapter.completedStages.includes(s.stage);
            const isUnlocked = isStageUnlocked(s.stage);
            const isCurrent = safeStage === s.stage;
            const cData = STAGE_CARTOON_DATA[s.stage] || STAGE_CARTOON_DATA[1];

            return (
              <motion.button
                key={s.stage}
                type="button"
                whileHover={{ y: -3, scale: 1.02 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => handleSwitchStage(s.stage)}
                className={`group relative rounded-2xl p-2.5 text-left border-2 transition-all overflow-hidden cursor-pointer flex flex-col justify-between ${
                  isCurrent
                    ? 'border-[#6546F5] bg-[#F6F5FF] shadow-md ring-2 ring-[#6546F5]/20'
                    : isCompleted
                    ? 'border-emerald-400 bg-emerald-50/40 hover:bg-emerald-50'
                    : isUnlocked
                    ? 'border-[#E6E4FA] bg-white hover:border-[#6546F5]/50'
                    : 'border-slate-200 bg-slate-100/80 opacity-80'
                }`}
              >
                {/* Mini Cartoon Level Thumbnail */}
                <div className="relative h-16 w-full rounded-xl overflow-hidden mb-2">
                  <img
                    src={cData.image}
                    alt={s.name}
                    className={`w-full h-full object-cover transition-transform duration-300 group-hover:scale-105 ${
                      !isUnlocked ? 'grayscale contrast-75' : ''
                    }`}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/10 to-transparent" />

                  {/* Top-left Level Badge */}
                  <span
                    className={`absolute top-1.5 left-1.5 px-2 py-0.5 rounded-md text-[10px] font-extrabold uppercase tracking-wider ${
                      isCompleted
                        ? 'bg-emerald-500 text-white'
                        : isCurrent
                        ? 'bg-[#6546F5] text-white'
                        : isUnlocked
                        ? 'bg-white/95 text-[#25243A]'
                        : 'bg-slate-800/90 text-white'
                    }`}
                  >
                    LVL {s.stage}
                  </span>

                  {/* Top-right Status Icon */}
                  <span className="absolute top-1.5 right-1.5">
                    {isCompleted ? (
                      <span className="w-5 h-5 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow-xs">
                        <Check className="w-3 h-3 stroke-[3]" />
                      </span>
                    ) : !isUnlocked ? (
                      <span className="w-5 h-5 rounded-full bg-slate-900/80 text-amber-300 flex items-center justify-center">
                        <Lock className="w-3 h-3" />
                      </span>
                    ) : (
                      <span className="w-5 h-5 rounded-full bg-amber-400 text-[#25243A] flex items-center justify-center text-[10px] font-bold">
                        ★
                      </span>
                    )}
                  </span>

                  <span className="absolute bottom-1 left-2 text-[11px] font-extrabold text-white drop-shadow">
                    {s.name}
                  </span>
                </div>

                {/* Bottom Status & XP */}
                <div className="flex items-center justify-between px-0.5 text-[11px]">
                  <span
                    className={`font-extrabold ${
                      isCompleted
                        ? 'text-emerald-700'
                        : isCurrent
                        ? 'text-[#6546F5]'
                        : isUnlocked
                        ? 'text-[#25243A]'
                        : 'text-slate-500'
                    }`}
                  >
                    {isCompleted
                      ? 'Cleared ✓'
                      : isCurrent
                      ? 'Playing Now'
                      : isUnlocked
                      ? 'Unlocked'
                      : 'Locked 🔒'}
                  </span>
                  <span className="font-extrabold text-amber-600">+{s.xpReward} XP</span>
                </div>
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* =====================================================================
          ACTIVE STAGE GAME ARENA (STAGES 1, 2, 3, 4, 5)
      ===================================================================== */}
      <div className="relative rounded-3xl">
        <AnimatePresence mode="wait" custom={stageDirection}>
          <motion.div
            key={`stage-page-${safeStage}`}
            custom={stageDirection}
            initial={{ opacity: 0, x: stageDirection * 40, scale: 0.98 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: stageDirection * -40, scale: 0.98 }}
            transition={{ type: 'spring', stiffness: 260, damping: 26 }}
            className="space-y-6"
          >
            {/* CARTOON GAME HERO BANNER FOR CURRENT LEVEL */}
            <div className="relative rounded-3xl overflow-hidden border-2 border-[#E6E4FA] shadow-md bg-[#25243A]">
              <div className="grid grid-cols-1 lg:grid-cols-12 items-center">
                {/* Left Quest Info */}
                <div className="lg:col-span-7 p-6 sm:p-8 text-white space-y-4 z-10">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="px-3 py-1 rounded-full bg-amber-400 text-[#25243A] font-extrabold text-xs uppercase tracking-wider flex items-center gap-1.5 shadow-xs">
                      <span>{stageCartoon.mascotEmoji}</span>
                      <span>{stageCartoon.levelTitle}</span>
                    </span>
                    <span className="px-3 py-1 rounded-full bg-white/15 backdrop-blur-xs text-white font-bold text-xs flex items-center gap-1">
                      <Zap className="w-3.5 h-3.5 text-amber-300" /> Reward: +{stageMeta.xpReward} XP
                    </span>
                  </div>

                  <div>
                    <h2 className="text-2xl sm:text-3xl font-extrabold font-display leading-tight">
                      {stageMeta.name}: {stageCartoon.questBadge}
                    </h2>
                    <p className="text-sm text-white/85 mt-1 max-w-xl">
                      {stageMeta.description} — complete this level to unlock the next stage on your adventure!
                    </p>
                  </div>

                  {/* Mini Game Badges Row */}
                  <div className="flex flex-wrap items-center gap-3 pt-1">
                    <div className="px-3.5 py-2 rounded-2xl bg-white/10 border border-white/15 flex items-center gap-2 text-xs font-bold">
                      <Shield className="w-4 h-4 text-cyan-300" />
                      <span>World: {subjectTheme.themeName}</span>
                    </div>
                    <div className="px-3.5 py-2 rounded-2xl bg-white/10 border border-white/15 flex items-center gap-2 text-xs font-bold">
                      <Flame className="w-4 h-4 text-orange-400" />
                      <span>
                        Next Unlock:{' '}
                        {safeStage < 5
                          ? `Level ${safeStage + 1} (${STAGE_METADATA[safeStage]?.name})`
                          : 'Chapter Mastery Trophy'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Right Cartoon Illustration Preview */}
                <div className="lg:col-span-5 relative h-52 sm:h-64 lg:h-full min-h-[220px] overflow-hidden">
                  <img
                    src={stageCartoon.image}
                    alt={stageCartoon.levelTitle}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-r from-[#25243A] via-[#25243A]/30 to-transparent lg:block hidden" />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#25243A] via-transparent to-transparent lg:hidden block" />
                  <motion.div
                    animate={{ y: [0, -6, 0] }}
                    transition={{ duration: 2.5, repeat: Infinity }}
                    className="absolute bottom-4 right-4 px-3.5 py-2 rounded-2xl bg-white/95 text-[#25243A] font-extrabold text-xs shadow-lg flex items-center gap-1.5"
                  >
                    {getStageIcon(safeStage)}
                    <span>Stage {safeStage} of 5</span>
                  </motion.div>
                </div>
              </div>
            </div>

            {/* =========================================================
                STAGE 1: TOPICS (Cartoon Explorer Quest Cards)
            ========================================================= */}
            {safeStage === 1 && (
              <div className="bg-white rounded-3xl p-6 sm:p-8 border-2 border-[#E6E4FA] shadow-sm space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#F0EEFF]">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-[#F6F5FF] border border-[#E6E4FA] flex items-center justify-center text-2xl">
                      🗺️
                    </div>
                    <div>
                      <h3 className="text-lg sm:text-xl font-extrabold font-display text-[#25243A]">
                        Explorer Topic Quests
                      </h3>
                      <p className="text-xs sm:text-sm text-[#686687]">
                        Open each quest card, explore its checkpoints, and claim +10 XP!
                      </p>
                    </div>
                  </div>

                  <div className="bg-[#F6F5FF] px-4 py-3 rounded-2xl border border-[#E6E4FA] flex items-center gap-3 shrink-0">
                    <div className="w-10 h-10 rounded-xl bg-[#6546F5] text-white flex items-center justify-center font-extrabold text-sm">
                      {chapter.understoodTopicIds.length}/{chapter.topics.length}
                    </div>
                    <div>
                      <div className="text-xs font-bold text-[#686687]">Quests Cleared</div>
                      <div className="text-xs font-extrabold text-[#6546F5]">+10 XP per quest</div>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-5">
                  {chapter.topics.map((topic, index) => {
                    const isExpanded = !!expandedTopics[topic.id];
                    const isUnderstood = chapter.understoodTopicIds.includes(topic.id);
                    const cardImg = questCardImages[index % questCardImages.length];

                    return (
                      <motion.div
                        key={topic.id}
                        initial={{ opacity: 0, y: 16 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.06 }}
                        whileHover={{ y: -2 }}
                        className={`rounded-3xl border-2 p-4 sm:p-5 transition-all ${
                          isUnderstood
                            ? 'bg-emerald-50/40 border-emerald-300 shadow-xs'
                            : 'bg-[#F6F5FF]/60 border-[#E6E4FA] hover:border-[#6546F5]/50'
                        }`}
                      >
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                          <div
                            onClick={() =>
                              setExpandedTopics((prev) => ({
                                ...prev,
                                [topic.id]: !prev[topic.id],
                              }))
                            }
                            className="flex flex-col sm:flex-row sm:items-center gap-4 text-left flex-1 cursor-pointer"
                          >
                            {/* Cartoon Thumbnail on Every Topic Card */}
                            <div className="relative w-full sm:w-36 h-24 rounded-2xl overflow-hidden shrink-0 border border-white shadow-xs">
                              <img
                                src={cardImg}
                                alt={topic.title}
                                className="w-full h-full object-cover"
                              />
                              <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
                              <span className="absolute top-2 left-2 px-2 py-0.5 rounded-md bg-[#6546F5] text-white font-extrabold text-[10px]">
                                QUEST 1.{index + 1}
                              </span>
                              <span className="absolute bottom-1.5 right-2 text-xs">
                                {isUnderstood ? '✅' : '⭐'}
                              </span>
                            </div>

                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                <h4 className="text-base sm:text-lg font-extrabold text-[#25243A]">
                                  {topic.title}
                                </h4>
                                <motion.span
                                  animate={{ rotate: isExpanded ? 180 : 0 }}
                                  className="text-[#6546F5]"
                                >
                                  <ChevronDown className="w-4 h-4" />
                                </motion.span>
                              </div>
                              <p className="text-sm text-[#686687] mt-1">{topic.summary}</p>
                              <div className="flex items-center gap-2 mt-2">
                                <span className="text-[11px] font-bold text-[#6546F5] bg-white px-2.5 py-0.5 rounded-lg border border-[#E6E4FA]">
                                  {topic.subtopics.length} Checkpoints Inside
                                </span>
                              </div>
                            </div>
                          </div>

                          <motion.button
                            whileHover={{ scale: 1.03 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => onToggleTopicUnderstood(topic.id, 10)}
                            className={`px-4 py-3 rounded-2xl font-extrabold text-xs flex items-center justify-center gap-1.5 shrink-0 transition-all cursor-pointer ${
                              isUnderstood
                                ? 'bg-emerald-500 text-white shadow-sm'
                                : 'bg-[#6546F5] hover:bg-[#5235E0] text-white shadow-sm'
                            }`}
                          >
                            <CheckCircle2 className="w-4 h-4" />
                            {isUnderstood ? 'Quest Cleared (+10 XP)' : 'Claim +10 XP'}
                          </motion.button>
                        </div>

                        <AnimatePresence initial={false}>
                          {isExpanded && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: 'auto', opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              transition={{ duration: 0.22 }}
                              className="overflow-hidden"
                            >
                              <div className="pt-4 mt-4 border-t border-[#E6E4FA] grid grid-cols-1 sm:grid-cols-2 gap-3">
                                {topic.subtopics.map((sub, sIdx) => {
                                  const subIcons = ['🧭', '🔮', '⚡', '🛡️', '🌟'];
                                  return (
                                    <motion.div
                                      key={sIdx}
                                      initial={{ opacity: 0, x: -8 }}
                                      animate={{ opacity: 1, x: 0 }}
                                      transition={{ delay: sIdx * 0.04 }}
                                      className="bg-white rounded-2xl p-3.5 border border-[#E6E4FA] flex items-center gap-3 shadow-2xs"
                                    >
                                      <span className="w-8 h-8 rounded-xl bg-[#F6F5FF] text-base flex items-center justify-center shrink-0 border border-[#E6E4FA]">
                                        {subIcons[sIdx % subIcons.length]}
                                      </span>
                                      <div>
                                        <div className="text-[10px] font-extrabold uppercase tracking-wider text-[#6546F5]">
                                          Checkpoint {sIdx + 1}
                                        </div>
                                        <div className="text-sm font-bold text-[#25243A]">
                                          {sub}
                                        </div>
                                      </div>
                                    </motion.div>
                                  );
                                })}
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </motion.div>
                    );
                  })}
                </div>

                {/* Unlock Level 2 Game Footer */}
                <div className="pt-5 border-t border-[#F0EEFF] flex flex-col sm:flex-row items-center justify-between gap-4 bg-gradient-to-r from-[#F6F5FF] to-blue-50/60 p-4 rounded-2xl border">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">🔓</span>
                    <div>
                      <div className="text-xs font-extrabold uppercase tracking-wider text-[#6546F5]">
                        Ready to Level Up?
                      </div>
                      <div className="text-sm font-bold text-[#25243A]">
                        Complete Level 1 to unlock Level 2: Story Workshop!
                      </div>
                    </div>
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => handleCompleteAndUnlockNext(1)}
                    className="w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-gradient-to-r from-[#6546F5] to-[#398BFF] text-white font-extrabold text-sm shadow-md flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Sparkles className="w-4 h-4" />
                    <span>Complete Level 1 & Unlock Level 2 (+50 XP)</span>
                    <ArrowRight className="w-4 h-4" />
                  </motion.button>
                </div>
              </div>
            )}

            {/* =========================================================
                STAGE 2: EXPLANATION (Cartoon Story & Concept Cards)
            ========================================================= */}
            {safeStage === 2 && (
              <div className="bg-white rounded-3xl p-6 sm:p-8 border-2 border-[#E6E4FA] shadow-sm space-y-6">
                {(() => {
                  const exp =
                    chapter.explanations[selectedExpIdx] || chapter.explanations[0];
                  if (!exp) return null;
                  const isTopicUnderstood = chapter.understoodTopicIds.includes(exp.topicId);

                  return (
                    <>
                      {/* Header + Concept Level Stepper */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#F0EEFF]">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-2xl bg-blue-50 border border-blue-200 flex items-center justify-center text-2xl">
                            🧙‍♂️
                          </div>
                          <div>
                            <span className="text-xs font-extrabold uppercase tracking-wider text-[#398BFF]">
                              Story Concept {selectedExpIdx + 1} of {chapter.explanations.length}
                            </span>
                            <h3 className="text-xl sm:text-2xl font-extrabold font-display text-[#25243A]">
                              {exp.title}
                            </h3>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => setShowTutorDrawer((prev) => !prev)}
                            className="px-4 py-2.5 rounded-xl bg-[#F6F5FF] hover:bg-[#ECE9FE] text-[#6546F5] font-extrabold text-xs flex items-center gap-1.5 border border-[#E6E4FA] cursor-pointer"
                          >
                            <MessageSquare className="w-4 h-4" />
                            {showTutorDrawer ? 'Hide AI Guide' : 'Ask Cartoon Guide'}
                          </button>

                          <button
                            type="button"
                            onClick={() => onToggleTopicUnderstood(exp.topicId, 10)}
                            className={`px-4 py-2.5 rounded-xl font-extrabold text-xs flex items-center gap-1.5 transition-all cursor-pointer ${
                              isTopicUnderstood
                                ? 'bg-emerald-500 text-white'
                                : 'bg-[#398BFF] hover:bg-blue-600 text-white'
                            }`}
                          >
                            <CheckCircle2 className="w-4 h-4" />
                            {isTopicUnderstood ? 'Mastered (+10 XP)' : 'Claim +10 XP'}
                          </button>
                        </div>
                      </div>

                      {/* Concept Level Pills */}
                      <div className="flex items-center gap-2 overflow-x-auto pb-1">
                        {chapter.explanations.map((item, idx) => (
                          <button
                            key={item.topicId || idx}
                            onClick={() => setSelectedExpIdx(idx)}
                            className={`px-4 py-2.5 rounded-2xl text-xs font-extrabold whitespace-nowrap transition-all flex items-center gap-2 cursor-pointer ${
                              selectedExpIdx === idx
                                ? 'bg-[#398BFF] text-white shadow-sm'
                                : 'bg-[#F6F5FF] text-[#686687] hover:text-[#25243A] border border-[#E6E4FA]'
                            }`}
                          >
                            <span>🔮</span>
                            <span>
                              Part {idx + 1}: {item.title}
                            </span>
                          </button>
                        ))}
                      </div>

                      {/* Animated Cartoon Concept Cards */}
                      <AnimatePresence mode="wait">
                        <motion.div
                          key={exp.topicId || selectedExpIdx}
                          initial={{ opacity: 0, y: 14 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -14 }}
                          transition={{ duration: 0.22 }}
                          className="space-y-4"
                        >
                          {/* Card 1: Simple Story Explanation with Cartoon Scene */}
                          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 bg-[#F6F5FF] rounded-3xl p-4 sm:p-5 border-2 border-[#E6E4FA] items-center">
                            <div className="lg:col-span-4 h-44 rounded-2xl overflow-hidden relative border border-white shadow-xs">
                              <img
                                src={stage2Cartoon}
                                alt={exp.title}
                                className="w-full h-full object-cover"
                              />
                              <span className="absolute bottom-2 left-2 px-2.5 py-1 rounded-lg bg-black/70 text-white text-[10px] font-extrabold">
                                💡 Idea Workshop
                              </span>
                            </div>
                            <div className="lg:col-span-8 space-y-2 p-2">
                              <div className="inline-flex items-center gap-1.5 text-xs font-extrabold uppercase tracking-wider text-[#6546F5] bg-white px-3 py-1 rounded-xl border border-[#E6E4FA]">
                                <span>✨ 1. In Simple Words</span>
                              </div>
                              <p className="text-[#25243A] text-base sm:text-lg leading-relaxed font-semibold">
                                {exp.simpleExplanation}
                              </p>
                            </div>
                          </div>

                          {/* Two Cartoon Illustrated Cards: Real-Life Example + Visual Analogy */}
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="bg-cyan-50/70 rounded-3xl p-5 border-2 border-cyan-200 space-y-3">
                              <div className="flex items-center gap-3">
                                <img
                                  src={subjectTheme.image}
                                  alt="Real-life example"
                                  className="w-16 h-16 rounded-2xl object-cover border-2 border-white shadow-xs shrink-0"
                                />
                                <div>
                                  <span className="text-xs font-extrabold uppercase tracking-wider text-cyan-800 bg-white px-2.5 py-1 rounded-lg">
                                    🌍 2. Real-Life Example
                                  </span>
                                  <h4 className="text-sm font-extrabold text-[#25243A] mt-1">
                                    How It Works in Action
                                  </h4>
                                </div>
                              </div>
                              <p className="text-sm text-[#25243A] leading-relaxed font-medium">
                                {exp.realWorldExample}
                              </p>
                            </div>

                            <div className="bg-pink-50/70 rounded-3xl p-5 border-2 border-pink-200 space-y-3">
                              <div className="flex items-center gap-3">
                                <img
                                  src={stage1Cartoon}
                                  alt="Visual analogy"
                                  className="w-16 h-16 rounded-2xl object-cover border-2 border-white shadow-xs shrink-0"
                                />
                                <div>
                                  <span className="text-xs font-extrabold uppercase tracking-wider text-pink-800 bg-white px-2.5 py-1 rounded-lg">
                                    🎨 3. Cartoon Mental Picture
                                  </span>
                                  <h4 className="text-sm font-extrabold text-[#25243A] mt-1">
                                    Imagine This Scene
                                  </h4>
                                </div>
                              </div>
                              <p className="text-sm text-[#25243A] leading-relaxed font-medium">
                                {exp.visualAnalogy}
                              </p>
                            </div>
                          </div>

                          {/* Golden Power-Up Key Takeaway */}
                          <div className="bg-gradient-to-r from-[#6546F5] to-[#398BFF] rounded-2xl p-4 sm:p-5 text-white flex items-center gap-3.5 shadow-sm">
                            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center text-xl shrink-0">
                              ⚡
                            </div>
                            <div>
                              <div className="text-[10px] font-extrabold uppercase tracking-widest text-amber-300">
                                Power-Up Secret to Remember
                              </div>
                              <p className="text-sm sm:text-base font-bold">{exp.keyConcept}</p>
                            </div>
                          </div>
                        </motion.div>
                      </AnimatePresence>

                      {/* Optional Cartoon AI Guide Box */}
                      <AnimatePresence>
                        {showTutorDrawer && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="overflow-hidden"
                          >
                            <div className="bg-[#F6F5FF] rounded-2xl p-4 border-2 border-[#E6E4FA] space-y-3">
                              <div className="max-h-48 overflow-y-auto space-y-2 pr-1">
                                {tutorMessages.map((msg, i) => (
                                  <div
                                    key={i}
                                    className={`p-3 rounded-xl text-xs leading-relaxed ${
                                      msg.role === 'user'
                                        ? 'bg-[#6546F5] text-white ml-auto max-w-[80%]'
                                        : 'bg-white text-[#25243A] border border-[#E6E4FA] max-w-[90%]'
                                    }`}
                                  >
                                    {msg.text}
                                  </div>
                                ))}
                                {tutorLoading && (
                                  <div className="flex items-center gap-2 text-xs text-[#686687] p-2">
                                    <Loader2 className="w-4 h-4 animate-spin text-[#6546F5]" />
                                    Thinking...
                                  </div>
                                )}
                              </div>
                              <form onSubmit={handleAskInlineTutor} className="flex gap-2">
                                <input
                                  type="text"
                                  value={tutorQuestion}
                                  onChange={(e) => setTutorQuestion(e.target.value)}
                                  placeholder="Ask a quick question about this topic..."
                                  className="flex-1 px-3.5 py-2.5 rounded-xl bg-white border border-[#D5D1F8] text-xs text-[#25243A] focus:outline-none focus:border-[#6546F5]"
                                />
                                <button
                                  type="submit"
                                  disabled={tutorLoading || !tutorQuestion.trim()}
                                  className="px-4 py-2.5 rounded-xl bg-[#6546F5] text-white text-xs font-bold disabled:opacity-50 flex items-center gap-1 cursor-pointer"
                                >
                                  <Send className="w-3.5 h-3.5" /> Ask
                                </button>
                              </form>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>

                      {/* Bottom Navigation & Unlock Level 3 */}
                      <div className="pt-4 border-t border-[#F0EEFF] flex flex-wrap items-center justify-between gap-3">
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            disabled={selectedExpIdx === 0}
                            onClick={() => setSelectedExpIdx((prev) => Math.max(0, prev - 1))}
                            className="px-4 py-2.5 rounded-xl bg-[#F6F5FF] text-[#25243A] font-bold text-xs disabled:opacity-40 flex items-center gap-1 cursor-pointer"
                          >
                            <ArrowLeft className="w-4 h-4" /> Previous Part
                          </button>
                          <button
                            type="button"
                            disabled={selectedExpIdx >= chapter.explanations.length - 1}
                            onClick={() =>
                              setSelectedExpIdx((prev) =>
                                Math.min(chapter.explanations.length - 1, prev + 1)
                              )
                            }
                            className="px-4 py-2.5 rounded-xl bg-[#F6F5FF] text-[#25243A] font-bold text-xs disabled:opacity-40 flex items-center gap-1 cursor-pointer"
                          >
                            Next Part <ArrowRight className="w-4 h-4" />
                          </button>
                        </div>

                        <motion.button
                          whileHover={{ scale: 1.03 }}
                          whileTap={{ scale: 0.97 }}
                          onClick={() => handleCompleteAndUnlockNext(2)}
                          className="px-6 py-3.5 rounded-2xl bg-gradient-to-r from-[#398BFF] to-[#48D4DC] text-white font-extrabold text-sm shadow-md flex items-center gap-2 cursor-pointer"
                        >
                          <Sparkles className="w-4 h-4" />
                          <span>Complete Level 2 & Unlock Level 3 (+60 XP)</span>
                          <ArrowRight className="w-4 h-4" />
                        </motion.button>
                      </div>
                    </>
                  );
                })()}
              </div>
            )}

            {/* =========================================================
                STAGE 3: REVISION (Cartoon Memory Arcade Cards + Scrolls)
            ========================================================= */}
            {safeStage === 3 && (
              <div className="bg-white rounded-3xl p-6 sm:p-8 border-2 border-[#E6E4FA] shadow-sm space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#F0EEFF]">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-2xl">
                      🃏
                    </div>
                    <div>
                      <h3 className="text-xl sm:text-2xl font-extrabold font-display text-[#25243A]">
                        Memory Arcade & Power Scrolls
                      </h3>
                      <p className="text-xs sm:text-sm text-[#686687]">
                        Tap the cartoon arcade card to flip it and collect your revision scrolls!
                      </p>
                    </div>
                  </div>
                  <div className="text-xs font-extrabold text-emerald-800 bg-emerald-50 px-4 py-2.5 rounded-2xl border border-emerald-200">
                    🃏 Card {activeCardIdx + 1} of {chapter.flashcards.length} •{' '}
                    {Object.keys(reviewedCards).length} Flipped
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                  {/* 3D Animated Cartoon Flashcard */}
                  <div className="lg:col-span-6 space-y-4">
                    {(() => {
                      const currentCard =
                        chapter.flashcards[activeCardIdx] || chapter.flashcards[0];
                      if (!currentCard) return null;

                      return (
                        <>
                          <div
                            onClick={() => {
                              setIsCardFlipped((prev) => !prev);
                              setReviewedCards((prev) => ({ ...prev, [currentCard.id]: true }));
                            }}
                            className="cursor-pointer select-none"
                            style={{ perspective: '1000px' }}
                          >
                            <motion.div
                              animate={{ rotateY: isCardFlipped ? 180 : 0 }}
                              transition={{ type: 'spring', stiffness: 220, damping: 22 }}
                              style={{ transformStyle: 'preserve-3d' }}
                              className="relative min-h-[320px] w-full rounded-3xl"
                            >
                              {/* Front of Cartoon Card */}
                              <div
                                style={{ backfaceVisibility: 'hidden' }}
                                className="absolute inset-0 rounded-3xl overflow-hidden bg-gradient-to-br from-[#6546F5] via-[#5868F8] to-[#398BFF] text-white shadow-lg flex flex-col justify-between border-2 border-white/20"
                              >
                                <div className="relative h-32 w-full overflow-hidden">
                                  <img
                                    src={stage3Cartoon}
                                    alt={currentCard.category}
                                    className="w-full h-full object-cover"
                                  />
                                  <div className="absolute inset-0 bg-gradient-to-t from-[#6546F5] via-black/20 to-transparent" />
                                  <div className="absolute top-3 left-3 right-3 flex items-center justify-between text-xs font-extrabold">
                                    <span className="px-3 py-1 rounded-xl bg-black/60 backdrop-blur-xs text-amber-300">
                                      ⭐ {currentCard.category}
                                    </span>
                                    <span className="px-3 py-1 rounded-xl bg-white/90 text-[#25243A] flex items-center gap-1">
                                      <RefreshCw className="w-3.5 h-3.5" /> Tap to Flip
                                    </span>
                                  </div>
                                </div>

                                <div className="p-6 text-center my-auto">
                                  <div className="text-[11px] uppercase tracking-widest text-amber-200 font-extrabold mb-1">
                                    Mystery Question Card
                                  </div>
                                  <h4 className="text-xl sm:text-2xl font-extrabold font-display leading-snug">
                                    {currentCard.term}
                                  </h4>
                                </div>

                                <div className="pb-4 text-center text-xs text-white/80 font-bold">
                                  👆 Tap anywhere on card to reveal secret answer
                                </div>
                              </div>

                              {/* Back of Cartoon Card */}
                              <div
                                style={{
                                  backfaceVisibility: 'hidden',
                                  transform: 'rotateY(180deg)',
                                }}
                                className="absolute inset-0 rounded-3xl overflow-hidden bg-gradient-to-br from-[#1E293B] to-[#334155] text-white shadow-lg flex flex-col justify-between border-2 border-emerald-400"
                              >
                                <div className="relative h-28 w-full overflow-hidden">
                                  <img
                                    src={subjectTheme.image}
                                    alt="Answer Revealed"
                                    className="w-full h-full object-cover"
                                  />
                                  <div className="absolute inset-0 bg-gradient-to-t from-[#1E293B] via-black/30 to-transparent" />
                                  <div className="absolute top-3 left-3 right-3 flex items-center justify-between text-xs font-extrabold">
                                    <span className="px-3 py-1 rounded-xl bg-emerald-500 text-white">
                                      ✓ Answer Unlocked!
                                    </span>
                                    <span className="px-2.5 py-1 rounded-xl bg-black/60 text-white">
                                      Tap to flip back
                                    </span>
                                  </div>
                                </div>

                                <div className="p-6 text-center my-auto">
                                  <p className="text-base sm:text-lg font-bold leading-relaxed text-white">
                                    {currentCard.definition}
                                  </p>
                                </div>

                                <div className="pb-4 text-center text-xs text-emerald-300 font-extrabold">
                                  🌟 +1 Memory Star Collected!
                                </div>
                              </div>
                            </motion.div>
                          </div>

                          <div className="flex items-center justify-between gap-2">
                            <button
                              type="button"
                              onClick={() => {
                                setIsCardFlipped(false);
                                setActiveCardIdx((prev) =>
                                  prev > 0 ? prev - 1 : chapter.flashcards.length - 1
                                );
                              }}
                              className="px-4 py-2.5 rounded-xl bg-[#F6F5FF] hover:bg-[#ECE9FE] text-[#25243A] font-extrabold text-xs flex items-center gap-1.5 border border-[#E6E4FA] cursor-pointer"
                            >
                              <ArrowLeft className="w-4 h-4" /> Prev Card
                            </button>

                            <button
                              type="button"
                              onClick={() => {
                                setIsCardFlipped(false);
                                setActiveCardIdx((prev) =>
                                  prev + 1 < chapter.flashcards.length ? prev + 1 : 0
                                );
                              }}
                              className="px-4 py-2.5 rounded-xl bg-[#6546F5] hover:bg-[#5235E0] text-white font-extrabold text-xs flex items-center gap-1.5 cursor-pointer"
                            >
                              Next Card <ArrowRight className="w-4 h-4" />
                            </button>
                          </div>
                        </>
                      );
                    })()}
                  </div>

                  {/* Cartoon Power Scrolls List */}
                  <div className="lg:col-span-6 space-y-3">
                    <div className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-wider text-[#6546F5]">
                      <span>📜 Golden Revision Scrolls</span>
                    </div>
                    {chapter.revisionNotes.map((note, idx) => (
                      <motion.div
                        key={idx}
                        initial={{ opacity: 0, x: 12 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.05 }}
                        className="bg-[#F6F5FF] rounded-2xl p-4 border-2 border-[#E6E4FA] flex items-start gap-3.5"
                      >
                        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 text-white font-extrabold text-xs flex items-center justify-center shrink-0 shadow-xs">
                          #{idx + 1}
                        </div>
                        <p className="text-sm text-[#25243A] font-semibold leading-relaxed">
                          {note}
                        </p>
                      </motion.div>
                    ))}
                  </div>
                </div>

                {/* Unlock Level 4 Footer */}
                <div className="pt-5 border-t border-[#F0EEFF] flex flex-col sm:flex-row items-center justify-between gap-4 bg-gradient-to-r from-emerald-50 to-cyan-50 p-4 rounded-2xl border border-emerald-200">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">🌟</span>
                    <div>
                      <div className="text-xs font-extrabold uppercase tracking-wider text-emerald-700">
                        Memory Arcade Complete!
                      </div>
                      <div className="text-sm font-bold text-[#25243A]">
                        Unlock Level 4: Sky Observatory Mind Map!
                      </div>
                    </div>
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => handleCompleteAndUnlockNext(3)}
                    className="w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-gradient-to-r from-emerald-500 to-[#398BFF] text-white font-extrabold text-sm shadow-md flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Sparkles className="w-4 h-4" />
                    <span>Complete Level 3 & Unlock Level 4 (+70 XP)</span>
                    <ArrowRight className="w-4 h-4" />
                  </motion.button>
                </div>
              </div>
            )}

            {/* =========================================================
                STAGE 4: MIND MAPS (Cartoon Floating Islands & Constellation Map)
            ========================================================= */}
            {safeStage === 4 && (
              <div className="bg-white rounded-3xl p-6 sm:p-8 border-2 border-[#E6E4FA] shadow-sm space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#F0EEFF]">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-pink-50 border border-pink-200 flex items-center justify-center text-2xl">
                      🌌
                    </div>
                    <div>
                      <h3 className="text-xl sm:text-2xl font-extrabold font-display text-[#25243A]">
                        Knowledge Islands Mind Map
                      </h3>
                      <p className="text-xs sm:text-sm text-[#686687]">
                        Click any island branch to light up its connected concepts!
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 bg-[#F6F5FF] p-1.5 rounded-xl border border-[#E6E4FA]">
                    <button
                      type="button"
                      onClick={() => setZoomScale((z) => Math.max(0.85, +(z - 0.1).toFixed(2)))}
                      className="p-2 rounded-lg hover:bg-white text-[#25243A] cursor-pointer"
                      title="Zoom Out"
                    >
                      <ZoomOut className="w-4 h-4" />
                    </button>
                    <span className="text-xs font-bold text-[#686687] px-2">
                      {Math.round(zoomScale * 100)}%
                    </span>
                    <button
                      type="button"
                      onClick={() => setZoomScale((z) => Math.min(1.15, +(z + 0.1).toFixed(2)))}
                      className="p-2 rounded-lg hover:bg-white text-[#25243A] cursor-pointer"
                      title="Zoom In"
                    >
                      <ZoomIn className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setZoomScale(1)}
                      className="p-2 rounded-lg hover:bg-white text-[#25243A] cursor-pointer"
                      title="Reset"
                    >
                      <RotateCcw className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Cartoon Mind Map Arena */}
                <div className="relative rounded-3xl p-5 sm:p-7 border-2 border-[#E6E4FA] overflow-hidden bg-gradient-to-b from-[#1E1B4B] via-[#312E81] to-[#F6F5FF]">
                  {/* Subtle Cartoon Sky Backdrop */}
                  <img
                    src={stage4Cartoon}
                    alt="Mind Map Sky"
                    className="absolute inset-0 w-full h-56 object-cover opacity-35 pointer-events-none"
                  />

                  <motion.div
                    animate={{ scale: zoomScale }}
                    transition={{ type: 'spring', stiffness: 200, damping: 22 }}
                    className="relative z-10 space-y-6 origin-top"
                  >
                    {/* Central Cartoon Hub Island */}
                    <div className="flex justify-center">
                      <div className="bg-white rounded-3xl p-3 pr-6 shadow-xl border-4 border-amber-400 flex items-center gap-4 max-w-md">
                        <img
                          src={stage4Cartoon}
                          alt={chapter.mindMap.rootLabel}
                          className="w-16 h-16 rounded-2xl object-cover shrink-0 border border-slate-200"
                        />
                        <div>
                          <div className="text-[10px] font-extrabold uppercase tracking-widest text-[#6546F5]">
                            🌟 Central Kingdom Hub
                          </div>
                          <div className="text-base sm:text-lg font-extrabold font-display text-[#25243A]">
                            {chapter.mindMap.rootLabel}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Connected Island Branches Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {chapter.mindMap.branches.map((branch, bIdx) => {
                        const isSelected = selectedBranchId === branch.id;
                        const branchImg = questCardImages[(bIdx + 1) % questCardImages.length];

                        return (
                          <motion.div
                            key={branch.id}
                            initial={{ opacity: 0, y: 16 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: bIdx * 0.07 }}
                            whileHover={{ y: -3 }}
                            onClick={() => setSelectedBranchId(branch.id)}
                            className={`cursor-pointer bg-white rounded-3xl p-5 border-3 transition-all ${
                              isSelected ? 'shadow-xl ring-4 ring-white/50' : 'border-[#E6E4FA]'
                            }`}
                            style={{
                              borderColor: isSelected ? branch.color : undefined,
                            }}
                          >
                            <div className="flex items-center gap-3 mb-3">
                              <img
                                src={branchImg}
                                alt={branch.label}
                                className="w-12 h-12 rounded-2xl object-cover border border-slate-200 shrink-0"
                              />
                              <div>
                                <span
                                  className="inline-block px-2 py-0.5 rounded-md text-[10px] font-extrabold text-white mb-0.5"
                                  style={{ backgroundColor: branch.color }}
                                >
                                  ISLAND {bIdx + 1}
                                </span>
                                <h4 className="font-extrabold font-display text-[#25243A] text-base">
                                  {branch.label}
                                </h4>
                              </div>
                            </div>

                            <div className="space-y-2">
                              {branch.nodes.map((node) => (
                                <div
                                  key={node.id}
                                  className="p-3 rounded-2xl bg-[#F6F5FF] border border-[#E6E4FA] flex items-start gap-2.5"
                                >
                                  <span className="text-sm mt-0.5">✨</span>
                                  <div>
                                    <div className="text-xs font-extrabold text-[#25243A]">
                                      {node.label}
                                    </div>
                                    <div className="text-xs text-[#686687] mt-0.5">
                                      {node.detail}
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </motion.div>
                        );
                      })}
                    </div>
                  </motion.div>
                </div>

                {/* Unlock Level 5 Boss Arena Footer */}
                <div className="pt-5 border-t border-[#F0EEFF] flex flex-col sm:flex-row items-center justify-between gap-4 bg-gradient-to-r from-pink-50 to-amber-50 p-4 rounded-2xl border border-pink-200">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">🏆</span>
                    <div>
                      <div className="text-xs font-extrabold uppercase tracking-wider text-pink-700">
                        Final Boss Level Awaits!
                      </div>
                      <div className="text-sm font-bold text-[#25243A]">
                        Complete Level 4 to unlock Level 5: Boss Trophy Quiz!
                      </div>
                    </div>
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => handleCompleteAndUnlockNext(4)}
                    className="w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-gradient-to-r from-[#F36FA5] to-[#6546F5] text-white font-extrabold text-sm shadow-md flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Sparkles className="w-4 h-4" />
                    <span>Complete Level 4 & Unlock Level 5 (+70 XP)</span>
                    <ArrowRight className="w-4 h-4" />
                  </motion.button>
                </div>
              </div>
            )}

            {/* =========================================================
                STAGE 5: TEST (Cartoon Boss Challenge Arena + Victory Chest)
            ========================================================= */}
            {safeStage === 5 && (
              <div className="bg-white rounded-3xl p-6 sm:p-8 border-2 border-[#E6E4FA] shadow-sm">
                {!quizFinished && !showResultsCelebration && currentQuestion ? (
                  <div className="max-w-2xl mx-auto space-y-6">
                    {/* Cartoon Boss Challenge Header Card */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl bg-gradient-to-r from-amber-50 via-orange-50 to-rose-50 border-2 border-amber-200">
                      <div className="flex items-center gap-3.5">
                        <img
                          src={stage5Cartoon}
                          alt="Boss Arena"
                          className="w-16 h-16 rounded-2xl object-cover border-2 border-white shadow-xs shrink-0"
                        />
                        <div>
                          <span className="inline-flex items-center gap-1 text-xs font-extrabold uppercase tracking-wider text-amber-700">
                            <Trophy className="w-3.5 h-3.5" /> Boss Challenge {quizIndex + 1} of{' '}
                            {activeQuestions.length}
                          </span>
                          <h3 className="text-base sm:text-lg font-extrabold font-display text-[#25243A]">
                            Topic: {currentQuestion.topicTag}
                          </h3>
                        </div>
                      </div>
                      <div className="px-3.5 py-2 rounded-xl bg-white border border-amber-200 text-xs font-extrabold text-amber-700 self-start sm:self-center">
                        🎁 Win +130 XP Chest
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="w-full h-3 bg-[#F6F5FF] rounded-full overflow-hidden p-0.5 border border-[#E6E4FA]">
                      <motion.div
                        animate={{
                          width: `${Math.round(((quizIndex + 1) / activeQuestions.length) * 100)}%`,
                        }}
                        className="h-full bg-gradient-to-r from-amber-400 via-orange-500 to-rose-500 rounded-full"
                      />
                    </div>

                    {/* Animated Question Card */}
                    <AnimatePresence mode="wait">
                      <motion.div
                        key={currentQuestion.id}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.2 }}
                        className="space-y-4"
                      >
                        <h4 className="text-lg sm:text-xl font-extrabold text-[#25243A] leading-snug">
                          {currentQuestion.question}
                        </h4>

                        <div className="space-y-3">
                          {currentQuestion.options.map((option, idx) => {
                            const isSelected = selectedOption === idx;
                            const isCorrectOption = idx === currentQuestion.correctIndex;

                            let cardStyle =
                              'bg-[#F6F5FF]/70 border-[#E6E4FA] text-[#25243A] hover:border-[#6546F5]';
                            if (isAnswerSubmitted) {
                              if (isCorrectOption) {
                                cardStyle = 'bg-emerald-50 border-emerald-400 text-emerald-950';
                              } else if (isSelected && !isCorrectOption) {
                                cardStyle = 'bg-rose-50 border-rose-400 text-rose-950';
                              }
                            } else if (isSelected) {
                              cardStyle = 'bg-[#6546F5]/10 border-[#6546F5] text-[#25243A]';
                            }

                            return (
                              <motion.button
                                key={idx}
                                type="button"
                                whileTap={!isAnswerSubmitted ? { scale: 0.99 } : undefined}
                                disabled={isAnswerSubmitted}
                                onClick={() => handleSelectQuizOption(idx)}
                                className={`w-full text-left p-4 rounded-2xl border-2 transition-all flex items-center gap-3.5 cursor-pointer ${cardStyle}`}
                              >
                                <span
                                  className={`w-9 h-9 rounded-xl font-extrabold text-xs flex items-center justify-center shrink-0 ${
                                    isAnswerSubmitted && isCorrectOption
                                      ? 'bg-emerald-500 text-white'
                                      : isAnswerSubmitted && isSelected && !isCorrectOption
                                      ? 'bg-rose-500 text-white'
                                      : isSelected
                                      ? 'bg-[#6546F5] text-white'
                                      : 'bg-white text-[#686687] border border-[#E6E4FA]'
                                  }`}
                                >
                                  {String.fromCharCode(65 + idx)}
                                </span>
                                <span className="font-bold text-sm flex-1">{option}</span>
                                {isAnswerSubmitted && isCorrectOption && (
                                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                                )}
                                {isAnswerSubmitted && isSelected && !isCorrectOption && (
                                  <XCircle className="w-5 h-5 text-rose-500 shrink-0" />
                                )}
                              </motion.button>
                            );
                          })}
                        </div>

                        {isAnswerSubmitted && (
                          <motion.div
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="p-4 rounded-2xl bg-[#F6F5FF] border-2 border-[#E6E4FA] text-sm text-[#25243A]"
                          >
                            <span className="font-extrabold text-[#6546F5] block mb-1">
                              💡 Power Explanation:
                            </span>
                            {currentQuestion.explanation}
                          </motion.div>
                        )}
                      </motion.div>
                    </AnimatePresence>

                    <div className="pt-4 border-t border-[#F0EEFF] flex justify-end">
                      {!isAnswerSubmitted ? (
                        <button
                          type="button"
                          disabled={selectedOption === null}
                          onClick={handleSubmitAnswer}
                          className="px-6 py-3.5 rounded-2xl bg-[#6546F5] text-white font-extrabold text-sm disabled:opacity-40 cursor-pointer"
                        >
                          Lock In Answer ⚡
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={handleNextQuestion}
                          className="px-6 py-3.5 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 text-white font-extrabold text-sm flex items-center gap-2 shadow-md cursor-pointer"
                        >
                          <span>
                            {quizIndex + 1 < activeQuestions.length
                              ? 'Next Challenge'
                              : 'Open Victory Treasure Chest 🏆'}
                          </span>
                          <ArrowRight className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                ) : (
                  /* Cartoon Trophy Victory Celebration Card */
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="max-w-xl mx-auto text-center py-4 space-y-6"
                  >
                    <div className="relative h-52 rounded-3xl overflow-hidden border-4 border-amber-400 shadow-xl">
                      <img
                        src={stage5Cartoon}
                        alt="Victory Trophy Chest"
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent flex flex-col items-center justify-end p-5 text-white">
                        <span className="px-3 py-1 rounded-full bg-amber-400 text-[#25243A] font-extrabold text-xs uppercase">
                          🏆 All 5 Levels Conquered!
                        </span>
                        <h3 className="text-2xl sm:text-3xl font-extrabold font-display mt-1">
                          Victory Score: {computedScore}%!
                        </h3>
                      </div>
                    </div>

                    <p className="text-sm font-bold text-[#686687]">
                      You answered {correctAnswersCount} of {totalQuestions} boss challenges
                      correctly and unlocked the Chapter Treasure Chest!
                    </p>

                    <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                      {Object.values(answersRecord).some((a) => !a.correct) && (
                        <button
                          type="button"
                          onClick={handleRetryWrongQuestions}
                          className="px-5 py-3 rounded-2xl bg-amber-50 text-amber-800 font-extrabold text-xs border border-amber-200 flex items-center gap-1.5 cursor-pointer"
                        >
                          <RefreshCw className="w-4 h-4" /> Retry Missed Questions
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={handleResetFullQuiz}
                        className="px-5 py-3 rounded-2xl bg-[#F6F5FF] text-[#25243A] font-extrabold text-xs cursor-pointer"
                      >
                        Replay Boss Quiz
                      </button>
                      <button
                        type="button"
                        onClick={onStartNextChapter}
                        className="px-6 py-3 rounded-2xl bg-gradient-to-r from-[#6546F5] to-[#398BFF] text-white font-extrabold text-xs shadow-md flex items-center gap-1.5 cursor-pointer"
                      >
                        <Award className="w-4 h-4" />
                        <span>Start Next Adventure</span>
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    </div>
                  </motion.div>
                )}
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};
