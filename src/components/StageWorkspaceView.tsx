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
  Award,
  RefreshCw,
  Check,
  XCircle,
  Lock,
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
    mascotEmoji: string;
  }
> = {
  1: {
    image: stage1Cartoon,
    levelTitle: 'Level 1 • Topics',
    mascotEmoji: '🧭',
  },
  2: {
    image: stage2Cartoon,
    levelTitle: 'Level 2 • Brief Explanation',
    mascotEmoji: '💡',
  },
  3: {
    image: stage3Cartoon,
    levelTitle: 'Level 3 • Quick Revision',
    mascotEmoji: '⚡',
  },
  4: {
    image: stage4Cartoon,
    levelTitle: 'Level 4 • Mind Map',
    mascotEmoji: '🌟',
  },
  5: {
    image: stage5Cartoon,
    levelTitle: 'Level 5 • Quiz',
    mascotEmoji: '🏆',
  },
};

// Helper to keep explanations brief and easy to read (max 1-2 short sentences)
const toBrief = (text: string, maxChars = 130): string => {
  if (!text) return '';
  const clean = text.trim();
  const firstSentenceMatch = clean.match(/^[^.!?]+[.!?]/);
  if (firstSentenceMatch && firstSentenceMatch[0].length <= maxChars) {
    return firstSentenceMatch[0].trim();
  }
  if (clean.length <= maxChars) return clean;
  return `${clean.slice(0, maxChars).trim()}...`;
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
  const [unlockedStagesLocal, setUnlockedStagesLocal] = useState<number[]>([1]);

  const isStageUnlocked = (stageNum: number) =>
    stageNum === 1 ||
    chapter.completedStages.includes(stageNum) ||
    chapter.completedStages.includes(stageNum - 1) ||
    stageNum <= chapter.currentStage ||
    unlockedStagesLocal.includes(stageNum);

  const handleSwitchStage = (targetStage: number) => {
    if (targetStage < 1 || targetStage > 5) return;
    if (!isStageUnlocked(targetStage)) {
      setUnlockedStagesLocal((prev) =>
        Array.from(new Set([...prev, targetStage]))
      );
    }
    setStageDirection(targetStage > safeStage ? 1 : -1);
    onSelectStage(targetStage);
  };

  const handleCompleteAndUnlockNext = async (stageNum: number, score?: number) => {
    const nextStage = Math.min(5, stageNum + 1);
    setUnlockedStagesLocal((prev) => Array.from(new Set([...prev, stageNum, nextStage])));
    setStageDirection(1);
    await onCompleteStage(stageNum, score);
  };

  // Stage 1 state
  const [expandedTopics, setExpandedTopics] = useState<Record<string, boolean>>({
    [chapter.topics[0]?.id || 'topic_1']: true,
  });

  // Stage 2 state
  const [selectedExpIdx, setSelectedExpIdx] = useState(0);

  // Stage 3 state
  const [activeCardIdx, setActiveCardIdx] = useState(0);
  const [isCardFlipped, setIsCardFlipped] = useState(false);

  // Stage 4 state
  const [zoomScale, setZoomScale] = useState(1);
  const [selectedBranchId, setSelectedBranchId] = useState<string | null>(
    chapter.mindMap.branches[0]?.id || null
  );

  // Stage 5 state
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
    <div className="max-w-5xl mx-auto space-y-5 pb-12">
      {/* =====================================================================
          SIMPLE TOP LEVEL BAR (LEVEL 1 -> LEVEL 5) WITH CARTOON THUMBNAILS
      ===================================================================== */}
      <div className="bg-white rounded-3xl p-4 sm:p-5 border border-[#E6E4FA] shadow-xs space-y-4">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <button
              onClick={onBackToMap}
              className="w-10 h-10 rounded-xl bg-[#F6F5FF] hover:bg-[#ECE9FE] text-[#25243A] flex items-center justify-center transition-colors shrink-0 cursor-pointer"
              title="Back to Map"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-base sm:text-lg font-extrabold font-display text-[#25243A]">
                {chapter.title}
              </h1>
              <p className="text-xs text-[#686687]">
                Level {safeStage} of 5 • {chapter.completedStages.length}/5 Cleared
              </p>
            </div>
          </div>

          <span className="px-3 py-1.5 rounded-xl bg-[#F6F5FF] text-[#6546F5] font-extrabold text-xs">
            +{stageMeta.xpReward} XP
          </span>
        </div>

        {/* 5 Simple Cartoon Level Cards */}
        <div className="grid grid-cols-5 gap-2 sm:gap-3">
          {STAGE_METADATA.slice(0, 5).map((s) => {
            const isCompleted = chapter.completedStages.includes(s.stage);
            const isUnlocked = isStageUnlocked(s.stage);
            const isCurrent = safeStage === s.stage;
            const cData = STAGE_CARTOON_DATA[s.stage] || STAGE_CARTOON_DATA[1];

            return (
              <motion.button
                key={s.stage}
                type="button"
                whileHover={{ y: -2, scale: 1.02 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => handleSwitchStage(s.stage)}
                className={`group relative rounded-2xl p-2 text-left border-2 transition-all overflow-hidden cursor-pointer ${
                  isCurrent
                    ? 'border-[#6546F5] bg-[#F6F5FF] shadow-xs'
                    : isCompleted
                    ? 'border-emerald-400 bg-emerald-50/40'
                    : isUnlocked
                    ? 'border-[#E6E4FA] bg-white'
                    : 'border-slate-200 bg-slate-100/70 opacity-75'
                }`}
              >
                <div className="relative h-12 sm:h-14 w-full rounded-xl overflow-hidden mb-1.5">
                  <img
                    src={cData.image}
                    alt={s.name}
                    className={`w-full h-full object-cover transition-transform duration-300 group-hover:scale-105 ${
                      !isUnlocked ? 'grayscale' : ''
                    }`}
                  />
                  <div className="absolute inset-0 bg-black/25" />
                  <span className="absolute top-1 left-1.5 px-1.5 py-0.5 rounded bg-black/65 text-white text-[10px] font-extrabold">
                    L{s.stage}
                  </span>
                  <span className="absolute top-1 right-1.5">
                    {isCompleted ? (
                      <span className="w-4 h-4 rounded-full bg-emerald-500 text-white flex items-center justify-center">
                        <Check className="w-2.5 h-2.5 stroke-[3]" />
                      </span>
                    ) : !isUnlocked ? (
                      <span className="w-4 h-4 rounded-full bg-slate-900/80 text-amber-300 flex items-center justify-center">
                        <Lock className="w-2.5 h-2.5" />
                      </span>
                    ) : null}
                  </span>
                </div>
                <div className="text-[11px] font-extrabold text-[#25243A] truncate px-0.5">
                  {s.name}
                </div>
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* =====================================================================
          ACTIVE STAGE CONTENT (SIMPLE LAYOUT + CARTOON IMAGES + ANIMATIONS)
      ===================================================================== */}
      <AnimatePresence mode="wait" custom={stageDirection}>
        <motion.div
          key={`stage-page-${safeStage}`}
          custom={stageDirection}
          initial={{ opacity: 0, x: stageDirection * 40, scale: 0.98 }}
          animate={{ opacity: 1, x: 0, scale: 1 }}
          exit={{ opacity: 0, x: stageDirection * -40, scale: 0.98 }}
          transition={{ type: 'spring', stiffness: 260, damping: 26 }}
          className="space-y-5"
        >
          {/* CLEAN CARTOON BANNER */}
          <div className="relative h-44 sm:h-52 rounded-3xl overflow-hidden border border-[#E6E4FA] shadow-xs">
            <img
              src={stageCartoon.image}
              alt={stageCartoon.levelTitle}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-[#25243A]/85 via-[#25243A]/45 to-transparent flex flex-col justify-center p-6 sm:p-8 text-white">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-400 text-[#25243A] font-extrabold text-xs w-fit mb-2">
                <span>{stageCartoon.mascotEmoji}</span>
                <span>{stageCartoon.levelTitle}</span>
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold font-display">
                {stageMeta.name}
              </h2>
              <p className="text-xs sm:text-sm text-white/85 mt-1 max-w-md">
                {stageMeta.description}
              </p>
            </div>

            <motion.div
              animate={{ y: [0, -5, 0] }}
              transition={{ duration: 2.4, repeat: Infinity }}
              className="absolute bottom-4 right-4 px-3.5 py-2 rounded-2xl bg-white/95 text-[#25243A] font-extrabold text-xs shadow-md flex items-center gap-1.5"
            >
              {getStageIcon(safeStage)}
              <span>Level {safeStage}</span>
            </motion.div>
          </div>

          {/* =========================================================
              STAGE 1: TOPICS (Simple Animated Topic Cards)
          ========================================================= */}
          {safeStage === 1 && (
            <div className="bg-white rounded-3xl p-5 sm:p-7 border border-[#E6E4FA] shadow-xs space-y-4">
              <div className="space-y-3">
                {chapter.topics.map((topic, index) => {
                  const isExpanded = !!expandedTopics[topic.id];
                  const isUnderstood = chapter.understoodTopicIds.includes(topic.id);
                  const cardImg = questCardImages[index % questCardImages.length];

                  return (
                    <motion.div
                      key={topic.id}
                      initial={{ opacity: 0, y: 14 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      whileHover={{ y: -2 }}
                      className={`rounded-2xl border p-4 transition-all ${
                        isUnderstood
                          ? 'bg-emerald-50/40 border-emerald-300'
                          : 'bg-[#F6F5FF]/60 border-[#E6E4FA]'
                      }`}
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div
                          onClick={() =>
                            setExpandedTopics((prev) => ({
                              ...prev,
                              [topic.id]: !prev[topic.id],
                            }))
                          }
                          className="flex items-center gap-3.5 flex-1 cursor-pointer"
                        >
                          <img
                            src={cardImg}
                            alt={topic.title}
                            className="w-16 h-16 rounded-2xl object-cover shrink-0 border border-white shadow-2xs"
                          />
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <h3 className="text-base font-extrabold text-[#25243A]">
                                {index + 1}. {topic.title}
                              </h3>
                              <motion.span
                                animate={{ rotate: isExpanded ? 180 : 0 }}
                                className="text-[#6546F5]"
                              >
                                <ChevronDown className="w-4 h-4" />
                              </motion.span>
                            </div>
                            <p className="text-xs sm:text-sm text-[#686687] mt-0.5">
                              {toBrief(topic.summary, 110)}
                            </p>
                          </div>
                        </div>

                        <motion.button
                          whileHover={{ scale: 1.03 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => onToggleTopicUnderstood(topic.id, 10)}
                          className={`px-4 py-2.5 rounded-xl font-extrabold text-xs flex items-center justify-center gap-1.5 shrink-0 cursor-pointer ${
                            isUnderstood
                              ? 'bg-emerald-500 text-white'
                              : 'bg-[#6546F5] text-white'
                          }`}
                        >
                          <CheckCircle2 className="w-4 h-4" />
                          {isUnderstood ? 'Done (+10 XP)' : 'Got It (+10 XP)'}
                        </motion.button>
                      </div>

                      <AnimatePresence initial={false}>
                        {isExpanded && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            className="overflow-hidden"
                          >
                            <div className="pt-3 mt-3 border-t border-[#E6E4FA] flex flex-wrap gap-2">
                              {topic.subtopics.map((sub, sIdx) => (
                                <span
                                  key={sIdx}
                                  className="px-3 py-1.5 rounded-xl bg-white border border-[#E6E4FA] text-xs font-bold text-[#25243A]"
                                >
                                  • {sub}
                                </span>
                              ))}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.div>
                  );
                })}
              </div>

              <div className="pt-3 flex justify-end">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => handleCompleteAndUnlockNext(1)}
                  className="px-6 py-3 rounded-2xl bg-gradient-to-r from-[#6546F5] to-[#398BFF] text-white font-extrabold text-xs sm:text-sm shadow-sm flex items-center gap-2 cursor-pointer"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Unlock Level 2 (+50 XP)</span>
                  <ArrowRight className="w-4 h-4" />
                </motion.button>
              </div>
            </div>
          )}

          {/* =========================================================
              STAGE 2: EXPLANATION (Brief, Simple & Visual)
          ========================================================= */}
          {safeStage === 2 && (
            <div className="bg-white rounded-3xl p-5 sm:p-7 border border-[#E6E4FA] shadow-xs space-y-5">
              {(() => {
                const exp =
                  chapter.explanations[selectedExpIdx] || chapter.explanations[0];
                if (!exp) return null;

                return (
                  <>
                    {/* Topic Selector Pills */}
                    <div className="flex items-center gap-2 overflow-x-auto pb-1">
                      {chapter.explanations.map((item, idx) => (
                        <button
                          key={item.topicId || idx}
                          onClick={() => setSelectedExpIdx(idx)}
                          className={`px-3.5 py-2 rounded-xl text-xs font-extrabold whitespace-nowrap transition-all cursor-pointer ${
                            selectedExpIdx === idx
                              ? 'bg-[#398BFF] text-white shadow-2xs'
                              : 'bg-[#F6F5FF] text-[#686687] hover:text-[#25243A]'
                          }`}
                        >
                          {idx + 1}. {item.title}
                        </button>
                      ))}
                    </div>

                    {/* Brief Animated Explanation Card */}
                    <AnimatePresence mode="wait">
                      <motion.div
                        key={exp.topicId || selectedExpIdx}
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -12 }}
                        transition={{ duration: 0.2 }}
                        className="space-y-4"
                      >
                        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 bg-[#F6F5FF] rounded-2xl p-4 sm:p-5 border border-[#E6E4FA] items-center">
                          <div className="md:col-span-4 h-36 sm:h-40 rounded-2xl overflow-hidden border border-white shadow-2xs">
                            <img
                              src={stage2Cartoon}
                              alt={exp.title}
                              className="w-full h-full object-cover"
                            />
                          </div>

                          <div className="md:col-span-8 space-y-3">
                            <h3 className="text-lg font-extrabold font-display text-[#25243A]">
                              {exp.title}
                            </h3>

                            {/* Brief Idea (1 short sentence) */}
                            <p className="text-sm text-[#25243A] leading-relaxed font-medium">
                              <strong className="text-[#6546F5]">In Brief: </strong>
                              {toBrief(exp.simpleExplanation, 140)}
                            </p>

                            {/* Brief Example (1 short sentence) */}
                            <p className="text-sm text-[#25243A] leading-relaxed font-medium bg-white p-3 rounded-xl border border-[#E6E4FA]">
                              <strong className="text-[#398BFF]">Example: </strong>
                              {toBrief(exp.realWorldExample, 125)}
                            </p>
                          </div>
                        </div>

                        {/* Short 1-Line Key Point */}
                        <div className="bg-gradient-to-r from-[#6546F5] to-[#398BFF] rounded-2xl px-4 py-3 text-white flex items-center gap-2.5 text-xs sm:text-sm font-bold">
                          <Zap className="w-4 h-4 text-amber-300 shrink-0" />
                          <span>{toBrief(exp.keyConcept, 110)}</span>
                        </div>
                      </motion.div>
                    </AnimatePresence>

                    {/* Simple Footer Navigation */}
                    <div className="pt-2 flex flex-wrap items-center justify-between gap-3">
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          disabled={selectedExpIdx === 0}
                          onClick={() => setSelectedExpIdx((prev) => Math.max(0, prev - 1))}
                          className="px-3.5 py-2 rounded-xl bg-[#F6F5FF] text-[#25243A] font-bold text-xs disabled:opacity-40 cursor-pointer"
                        >
                          ← Prev
                        </button>
                        <button
                          type="button"
                          disabled={selectedExpIdx >= chapter.explanations.length - 1}
                          onClick={() =>
                            setSelectedExpIdx((prev) =>
                              Math.min(chapter.explanations.length - 1, prev + 1)
                            )
                          }
                          className="px-3.5 py-2 rounded-xl bg-[#F6F5FF] text-[#25243A] font-bold text-xs disabled:opacity-40 cursor-pointer"
                        >
                          Next →
                        </button>
                      </div>

                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.97 }}
                        onClick={() => handleCompleteAndUnlockNext(2)}
                        className="px-6 py-3 rounded-2xl bg-gradient-to-r from-[#398BFF] to-[#48D4DC] text-white font-extrabold text-xs sm:text-sm shadow-sm flex items-center gap-2 cursor-pointer"
                      >
                        <Sparkles className="w-4 h-4" />
                        <span>Unlock Level 3 (+60 XP)</span>
                        <ArrowRight className="w-4 h-4" />
                      </motion.button>
                    </div>
                  </>
                );
              })()}
            </div>
          )}

          {/* =========================================================
              STAGE 3: REVISION (3D Animated Cartoon Flip Card + Short Notes)
          ========================================================= */}
          {safeStage === 3 && (
            <div className="bg-white rounded-3xl p-5 sm:p-7 border border-[#E6E4FA] shadow-xs space-y-5">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
                {/* 3D Animated Cartoon Flashcard */}
                <div className="lg:col-span-6 space-y-3">
                  {(() => {
                    const currentCard =
                      chapter.flashcards[activeCardIdx] || chapter.flashcards[0];
                    if (!currentCard) return null;

                    return (
                      <>
                        <div
                          onClick={() => setIsCardFlipped((prev) => !prev)}
                          className="cursor-pointer select-none"
                          style={{ perspective: '1000px' }}
                        >
                          <motion.div
                            animate={{ rotateY: isCardFlipped ? 180 : 0 }}
                            transition={{ type: 'spring', stiffness: 220, damping: 22 }}
                            style={{ transformStyle: 'preserve-3d' }}
                            className="relative min-h-[260px] w-full rounded-3xl"
                          >
                            {/* Front */}
                            <div
                              style={{ backfaceVisibility: 'hidden' }}
                              className="absolute inset-0 rounded-3xl overflow-hidden bg-gradient-to-br from-[#6546F5] to-[#398BFF] text-white shadow-md flex flex-col justify-between"
                            >
                              <div className="relative h-24 w-full overflow-hidden">
                                <img
                                  src={stage3Cartoon}
                                  alt={currentCard.category}
                                  className="w-full h-full object-cover"
                                />
                                <div className="absolute inset-0 bg-black/25 flex items-center justify-between px-4 text-xs font-extrabold">
                                  <span>
                                    Card {activeCardIdx + 1}/{chapter.flashcards.length}
                                  </span>
                                  <span className="flex items-center gap-1 bg-white/90 text-[#25243A] px-2.5 py-1 rounded-lg">
                                    <RefreshCw className="w-3 h-3" /> Flip
                                  </span>
                                </div>
                              </div>

                              <div className="p-5 text-center my-auto">
                                <h4 className="text-lg sm:text-xl font-extrabold font-display">
                                  {currentCard.term}
                                </h4>
                              </div>

                              <div className="pb-3 text-center text-[11px] text-white/80 font-bold">
                                Tap card to see answer
                              </div>
                            </div>

                            {/* Back */}
                            <div
                              style={{
                                backfaceVisibility: 'hidden',
                                transform: 'rotateY(180deg)',
                              }}
                              className="absolute inset-0 rounded-3xl overflow-hidden bg-[#25243A] text-white shadow-md flex flex-col justify-between p-6 text-center"
                            >
                              <span className="text-xs font-extrabold text-emerald-300">
                                Answer
                              </span>
                              <p className="text-sm sm:text-base font-bold leading-relaxed my-auto">
                                {toBrief(currentCard.definition, 140)}
                              </p>
                              <span className="text-[11px] text-white/60">
                                Tap to flip back
                              </span>
                            </div>
                          </motion.div>
                        </div>

                        <div className="flex items-center justify-between">
                          <button
                            type="button"
                            onClick={() => {
                              setIsCardFlipped(false);
                              setActiveCardIdx((prev) =>
                                prev > 0 ? prev - 1 : chapter.flashcards.length - 1
                              );
                            }}
                            className="px-3.5 py-2 rounded-xl bg-[#F6F5FF] text-[#25243A] font-bold text-xs cursor-pointer"
                          >
                            ← Prev Card
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setIsCardFlipped(false);
                              setActiveCardIdx((prev) =>
                                prev + 1 < chapter.flashcards.length ? prev + 1 : 0
                              );
                            }}
                            className="px-3.5 py-2 rounded-xl bg-[#6546F5] text-white font-bold text-xs cursor-pointer"
                          >
                            Next Card →
                          </button>
                        </div>
                      </>
                    );
                  })()}
                </div>

                {/* Simple Key Notes */}
                <div className="lg:col-span-6 space-y-2.5">
                  <div className="text-xs font-extrabold uppercase tracking-wider text-[#6546F5]">
                    Key Points
                  </div>
                  {chapter.revisionNotes.map((note, idx) => (
                    <motion.div
                      key={idx}
                      initial={{ opacity: 0, x: 10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.05 }}
                      className="bg-[#F6F5FF] rounded-2xl p-3.5 border border-[#E6E4FA] flex items-start gap-3"
                    >
                      <span className="w-6 h-6 rounded-lg bg-[#6546F5] text-white font-extrabold text-xs flex items-center justify-center shrink-0">
                        {idx + 1}
                      </span>
                      <p className="text-xs sm:text-sm text-[#25243A] font-semibold">
                        {toBrief(note, 110)}
                      </p>
                    </motion.div>
                  ))}
                </div>
              </div>

              <div className="pt-2 flex justify-end">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => handleCompleteAndUnlockNext(3)}
                  className="px-6 py-3 rounded-2xl bg-gradient-to-r from-emerald-500 to-[#398BFF] text-white font-extrabold text-xs sm:text-sm shadow-sm flex items-center gap-2 cursor-pointer"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Unlock Level 4 (+70 XP)</span>
                  <ArrowRight className="w-4 h-4" />
                </motion.button>
              </div>
            </div>
          )}

          {/* =========================================================
              STAGE 4: MIND MAPS (Simple Animated Visual Mind Map)
          ========================================================= */}
          {safeStage === 4 && (
            <div className="bg-white rounded-3xl p-5 sm:p-7 border border-[#E6E4FA] shadow-xs space-y-5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-extrabold uppercase tracking-wider text-[#6546F5]">
                  Topic Connections
                </span>
                <div className="flex items-center gap-1 bg-[#F6F5FF] p-1 rounded-xl border border-[#E6E4FA]">
                  <button
                    type="button"
                    onClick={() => setZoomScale((z) => Math.max(0.85, +(z - 0.1).toFixed(2)))}
                    className="p-1.5 rounded-lg hover:bg-white text-[#25243A] cursor-pointer"
                  >
                    <ZoomOut className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setZoomScale((z) => Math.min(1.15, +(z + 0.1).toFixed(2)))}
                    className="p-1.5 rounded-lg hover:bg-white text-[#25243A] cursor-pointer"
                  >
                    <ZoomIn className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setZoomScale(1)}
                    className="p-1.5 rounded-lg hover:bg-white text-[#25243A] cursor-pointer"
                  >
                    <RotateCcw className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="relative rounded-3xl p-5 border border-[#E6E4FA] overflow-hidden bg-[#F6F5FF]">
                <motion.div
                  animate={{ scale: zoomScale }}
                  transition={{ type: 'spring', stiffness: 200, damping: 22 }}
                  className="space-y-5 origin-top"
                >
                  {/* Root Node */}
                  <div className="flex justify-center">
                    <div className="bg-white rounded-2xl p-3 pr-5 shadow-sm border-2 border-[#6546F5] flex items-center gap-3">
                      <img
                        src={stage4Cartoon}
                        alt={chapter.mindMap.rootLabel}
                        className="w-12 h-12 rounded-xl object-cover shrink-0"
                      />
                      <span className="text-base font-extrabold font-display text-[#25243A]">
                        {chapter.mindMap.rootLabel}
                      </span>
                    </div>
                  </div>

                  {/* Simple Branch Cards */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {chapter.mindMap.branches.map((branch, bIdx) => {
                      const isSelected = selectedBranchId === branch.id;
                      const branchImg = questCardImages[(bIdx + 1) % questCardImages.length];

                      return (
                        <motion.div
                          key={branch.id}
                          initial={{ opacity: 0, y: 14 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: bIdx * 0.06 }}
                          whileHover={{ y: -2 }}
                          onClick={() => setSelectedBranchId(branch.id)}
                          className="cursor-pointer bg-white rounded-2xl p-4 border-2 transition-all"
                          style={{
                            borderColor: isSelected ? branch.color : '#E6E4FA',
                          }}
                        >
                          <div className="flex items-center gap-3 mb-2.5">
                            <img
                              src={branchImg}
                              alt={branch.label}
                              className="w-10 h-10 rounded-xl object-cover shrink-0"
                            />
                            <h4 className="font-extrabold font-display text-[#25243A] text-sm sm:text-base">
                              {branch.label}
                            </h4>
                          </div>

                          <div className="flex flex-wrap gap-2">
                            {branch.nodes.map((node) => (
                              <span
                                key={node.id}
                                className="px-3 py-1.5 rounded-xl bg-[#F6F5FF] border border-[#E6E4FA] text-xs font-bold text-[#25243A]"
                              >
                                • {node.label}
                              </span>
                            ))}
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                </motion.div>
              </div>

              <div className="pt-2 flex justify-end">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => handleCompleteAndUnlockNext(4)}
                  className="px-6 py-3 rounded-2xl bg-gradient-to-r from-[#F36FA5] to-[#6546F5] text-white font-extrabold text-xs sm:text-sm shadow-sm flex items-center gap-2 cursor-pointer"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Unlock Level 5 Quiz (+70 XP)</span>
                  <ArrowRight className="w-4 h-4" />
                </motion.button>
              </div>
            </div>
          )}

          {/* =========================================================
              STAGE 5: TEST (Simple Animated Quiz + Victory Card)
          ========================================================= */}
          {safeStage === 5 && (
            <div className="bg-white rounded-3xl p-5 sm:p-7 border border-[#E6E4FA] shadow-xs">
              {!quizFinished && !showResultsCelebration && currentQuestion ? (
                <div className="max-w-2xl mx-auto space-y-5">
                  <div className="flex items-center justify-between text-xs font-extrabold text-[#6546F5]">
                    <span>
                      Question {quizIndex + 1} of {activeQuestions.length}
                    </span>
                    <span>{currentQuestion.topicTag}</span>
                  </div>

                  <div className="w-full h-2.5 bg-[#F6F5FF] rounded-full overflow-hidden">
                    <motion.div
                      animate={{
                        width: `${Math.round(((quizIndex + 1) / activeQuestions.length) * 100)}%`,
                      }}
                      className="h-full bg-gradient-to-r from-amber-400 to-orange-500 rounded-full"
                    />
                  </div>

                  <AnimatePresence mode="wait">
                    <motion.div
                      key={currentQuestion.id}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{ duration: 0.2 }}
                      className="space-y-3.5"
                    >
                      <h3 className="text-base sm:text-lg font-extrabold text-[#25243A]">
                        {currentQuestion.question}
                      </h3>

                      <div className="space-y-2.5">
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
                              className={`w-full text-left p-3.5 rounded-2xl border-2 transition-all flex items-center gap-3 cursor-pointer ${cardStyle}`}
                            >
                              <span
                                className={`w-8 h-8 rounded-xl font-extrabold text-xs flex items-center justify-center shrink-0 ${
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
                          initial={{ opacity: 0, y: 6 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="p-3.5 rounded-2xl bg-[#F6F5FF] border border-[#E6E4FA] text-xs sm:text-sm text-[#25243A]"
                        >
                          <strong className="text-[#6546F5]">Note: </strong>
                          {toBrief(currentQuestion.explanation, 130)}
                        </motion.div>
                      )}
                    </motion.div>
                  </AnimatePresence>

                  <div className="pt-2 flex justify-end">
                    {!isAnswerSubmitted ? (
                      <button
                        type="button"
                        disabled={selectedOption === null}
                        onClick={handleSubmitAnswer}
                        className="px-6 py-3 rounded-2xl bg-[#6546F5] text-white font-extrabold text-xs sm:text-sm disabled:opacity-40 cursor-pointer"
                      >
                        Check Answer
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={handleNextQuestion}
                        className="px-6 py-3 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 text-white font-extrabold text-xs sm:text-sm flex items-center gap-2 cursor-pointer"
                      >
                        <span>
                          {quizIndex + 1 < activeQuestions.length ? 'Next' : 'Finish Quiz 🏆'}
                        </span>
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              ) : (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="max-w-lg mx-auto text-center py-4 space-y-5"
                >
                  <div className="relative h-48 rounded-3xl overflow-hidden border-2 border-amber-400 shadow-md">
                    <img
                      src={stage5Cartoon}
                      alt="Victory Trophy Chest"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent flex flex-col items-center justify-end p-4 text-white">
                      <h3 className="text-2xl font-extrabold font-display">
                        Score: {computedScore}%!
                      </h3>
                      <p className="text-xs text-white/90">
                        {correctAnswersCount} of {totalQuestions} correct
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center justify-center gap-3">
                    {Object.values(answersRecord).some((a) => !a.correct) && (
                      <button
                        type="button"
                        onClick={handleRetryWrongQuestions}
                        className="px-4 py-2.5 rounded-xl bg-amber-50 text-amber-800 font-bold text-xs border border-amber-200 flex items-center gap-1.5 cursor-pointer"
                      >
                        <RefreshCw className="w-3.5 h-3.5" /> Retry Missed
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={handleResetFullQuiz}
                      className="px-4 py-2.5 rounded-xl bg-[#F6F5FF] text-[#25243A] font-bold text-xs cursor-pointer"
                    >
                      Replay Quiz
                    </button>
                    <button
                      type="button"
                      onClick={onStartNextChapter}
                      className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#6546F5] to-[#398BFF] text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer"
                    >
                      <Award className="w-4 h-4" />
                      <span>Next Chapter</span>
                    </button>
                  </div>
                </motion.div>
              )}
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};
