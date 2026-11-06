import React, { useState } from 'react';
import {
  ChevronDown,
  ChevronRight,
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
  Clock,
} from 'lucide-react';
import { ChapterBlueprint } from '../types';
import { STAGE_METADATA } from '../data/presets';

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
  // Stage 1 state
  const [expandedTopics, setExpandedTopics] = useState<Record<string, boolean>>({
    [chapter.topics[0]?.id || 'topic_1']: true,
    [chapter.topics[1]?.id || 'topic_2']: true,
  });

  // Stage 2 state
  const [selectedExpIdx, setSelectedExpIdx] = useState(0);
  const [showTutorDrawer, setShowTutorDrawer] = useState(false);
  const [tutorQuestion, setTutorQuestion] = useState('');
  const [tutorLoading, setTutorLoading] = useState(false);
  const [tutorMessages, setTutorMessages] = useState<
    Array<{ role: 'user' | 'tutor'; text: string; keyTakeaway?: string }>
  >([
    {
      role: 'tutor',
      text: `Hi! I'm Professor Nova. Ask me anything about "${chapter.title}" and I'll break it down with simple examples.`,
    },
  ]);

  // Stage 3 state
  const [activeCardIdx, setActiveCardIdx] = useState(0);
  const [isCardFlipped, setIsCardFlipped] = useState(false);
  const [reviewedCards, setReviewedCards] = useState<Record<string, boolean>>({});

  // Stage 4 state
  const [zoomScale, setZoomScale] = useState(1);
  const [selectedBranchId, setSelectedBranchId] = useState<string | null>(
    chapter.mindMap.branches[0]?.id || null
  );

  // Stage 5 Quiz state
  const [quizIndex, setQuizIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isAnswerSubmitted, setIsAnswerSubmitted] = useState(false);
  const [answersRecord, setAnswersRecord] = useState<
    Record<string, { selected: number; correct: boolean }>
  >({});
  const [retryIncorrectOnly, setRetryIncorrectOnly] = useState(false);
  const [quizFinished, setQuizFinished] = useState(false);
  const [aiCoachReport, setAiCoachReport] = useState<{
    coachHeadline: string;
    weakAreasSummary: string;
    recommendedRevisionSteps: string[];
  } | null>(null);
  const [loadingCoach, setLoadingCoach] = useState(false);

  const stageMeta = STAGE_METADATA[activeStage - 1] || STAGE_METADATA[0];

  // Filter questions if retrying incorrect ones
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
          sourceSummary: chapter.sourceSummary,
          question: userQ,
          history: tutorMessages,
        }),
      });
      const data = await res.json();
      setTutorMessages((prev) => [
        ...prev,
        {
          role: 'tutor',
          text: data.answer || 'Here is a simple way to think about that concept.',
          keyTakeaway: data.keyTakeaway,
        },
      ]);
    } catch {
      setTutorMessages((prev) => [
        ...prev,
        {
          role: 'tutor',
          text: 'Focus on how the core mechanism connects inputs to outputs in this stage.',
        },
      ]);
    } finally {
      setTutorLoading(false);
    }
  };

  const handleSubmitQuizOption = () => {
    if (selectedOption === null || !currentQuestion) return;
    const isCorrect = selectedOption === currentQuestion.correctIndex;
    setAnswersRecord((prev) => ({
      ...prev,
      [currentQuestion.id]: { selected: selectedOption, correct: isCorrect },
    }));
    setIsAnswerSubmitted(true);
  };

  const handleNextQuestion = async () => {
    if (quizIndex + 1 < activeQuestions.length) {
      setQuizIndex((prev) => prev + 1);
      setSelectedOption(null);
      setIsAnswerSubmitted(false);
    } else {
      setQuizFinished(true);
      // Calculate overall score across all chapter questions
      const totalQ = chapter.quizQuestions.length;
      const correctCount = chapter.quizQuestions.filter(
        (q) =>
          (q.id === currentQuestion?.id
            ? selectedOption === currentQuestion.correctIndex
            : answersRecord[q.id]?.correct)
      ).length;
      const finalPct = Math.round((correctCount / Math.max(1, totalQ)) * 100);

      // Request AI Coach Evaluation
      setLoadingCoach(true);
      try {
        const missed = chapter.quizQuestions
          .filter((q) => !answersRecord[q.id]?.correct)
          .map((q) => ({ question: q.question, topic: q.topicTag }));
        const res = await fetch('/api/quiz/evaluate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            chapterTitle: chapter.title,
            score: finalPct,
            wrongQuestions: missed,
          }),
        });
        if (res.ok) {
          const data = await res.json();
          setAiCoachReport(data);
        }
      } catch {
        // Fallback coach report
      } finally {
        setLoadingCoach(false);
      }
    }
  };

  const handleRetryIncorrect = () => {
    setRetryIncorrectOnly(true);
    setQuizIndex(0);
    setSelectedOption(null);
    setIsAnswerSubmitted(false);
    setQuizFinished(false);
  };

  const calculateQuizScorePercent = () => {
    const total = chapter.quizQuestions.length;
    const correct = Object.values(answersRecord).filter((a) => a.correct).length;
    return Math.round((correct / Math.max(1, total)) * 100);
  };

  // PAGE 8: Results & Achievements Celebration Screen
  if (showResultsCelebration) {
    const finalScore =
      Object.keys(answersRecord).length > 0
        ? calculateQuizScorePercent()
        : chapter.testScore;
    return (
      <div className="max-w-4xl mx-auto bg-white rounded-3xl border border-[#6546F5]/20 shadow-xl p-8 sm:p-12 text-center space-y-8">
        <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-[#F36FA5] via-[#6546F5] to-[#398BFF] text-white flex items-center justify-center mx-auto shadow-lg animate-float">
          <Trophy className="w-12 h-12" />
        </div>

        <div className="space-y-2">
          <p className="text-xs font-bold tracking-wider text-[#6546F5] uppercase">
            All 5 Stages Completed
          </p>
          <h1 className="text-3xl sm:text-4xl font-bold text-[#25243A]">
            Chapter Mastered: {chapter.title}
          </h1>
          <p className="text-sm text-[#25243A]/70 max-w-xl mx-auto">
            Congratulations! You completed Topics, Explanation, Revision, Mind Maps, and the Final Test.
          </p>
        </div>

        {/* Verified Chapter Summary */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 tabular-nums">
          <div className="p-5 rounded-2xl bg-[#F6F5FF] space-y-1">
            <p className="text-xs text-[#25243A]/60">Total XP Earned</p>
            <p className="text-2xl font-bold text-[#6546F5]">+{chapter.xpEarned} XP</p>
          </div>
          <div className="p-5 rounded-2xl bg-[#F6F5FF] space-y-1">
            <p className="text-xs text-[#25243A]/60">Test Score</p>
            <p className="text-2xl font-bold text-emerald-600">{finalScore}%</p>
          </div>
          <div className="p-5 rounded-2xl bg-[#F6F5FF] space-y-1">
            <p className="text-xs text-[#25243A]/60">Topics Checked</p>
            <p className="text-2xl font-bold text-[#398BFF]">
              {chapter.understoodTopicIds.length} / {chapter.topics.length}
            </p>
          </div>
          <div className="p-5 rounded-2xl bg-[#F6F5FF] space-y-1">
            <p className="text-xs text-[#25243A]/60">Stages Done</p>
            <p className="text-2xl font-bold text-[#F36FA5]">
              {chapter.completedStages.length} / 5
            </p>
          </div>
        </div>

        {/* Unlocked Chapter Master Badge Showcase */}
        <div className="p-6 rounded-3xl bg-gradient-to-r from-[#6546F5]/10 via-[#398BFF]/10 to-[#48D4DC]/10 border border-[#6546F5]/20 flex flex-col sm:flex-row items-center justify-between gap-6 text-left">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white flex items-center justify-center shrink-0 shadow-md">
              <Award className="w-8 h-8" />
            </div>
            <div>
              <p className="text-xs font-bold text-emerald-700">
                Milestone Achievement Unlocked
              </p>
              <h2 className="text-lg font-bold text-[#25243A]">
                Chapter Master Shield (+100 Bonus XP)
              </h2>
              <p className="text-xs text-[#25243A]/70 mt-0.5">
                Added to your permanent Trophy Room & synced to your Cloud Profile.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={onBackToMap}
              className="px-4 py-3 rounded-xl bg-white hover:bg-slate-50 text-[#25243A] border border-slate-200 text-xs font-semibold cursor-pointer"
            >
              Review Map
            </button>
            <button
              onClick={onStartNextChapter}
              className="px-6 py-3 rounded-xl bg-[#6546F5] hover:bg-[#5235E0] text-white text-xs font-bold shadow-md flex items-center gap-2 cursor-pointer"
            >
              <span>Start Next Chapter</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Top Stage Switcher & Progress Bar */}
      <div className="bg-white rounded-3xl p-4 border border-[#6546F5]/12 shadow-xs flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            onClick={onBackToMap}
            className="p-2 rounded-xl bg-[#F6F5FF] hover:bg-[#6546F5]/10 text-[#25243A] transition-colors cursor-pointer"
            title="Back to Map"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <h1 className="text-lg sm:text-xl font-bold text-[#25243A]">
            Stage {activeStage}: {stageMeta.name}
          </h1>
        </div>

        {/* 5-Stage Segmented Bar */}
        <div className="flex flex-wrap items-center gap-1.5 bg-[#F6F5FF] p-1.5 rounded-2xl">
          {STAGE_METADATA.map((s) => {
            const isDone = chapter.completedStages.includes(s.stage);
            const isUnlocked = isDone || s.stage <= chapter.currentStage;
            const isActive = activeStage === s.stage;
            return (
              <button
                key={s.stage}
                type="button"
                disabled={!isUnlocked}
                onClick={() => isUnlocked && onSelectStage(s.stage)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all whitespace-nowrap shrink-0 ${
                  isActive
                    ? 'bg-[#6546F5] text-white shadow-xs cursor-pointer'
                    : isDone
                      ? 'bg-emerald-500/10 text-emerald-700 hover:bg-emerald-500/20 cursor-pointer'
                      : isUnlocked
                        ? 'text-[#25243A]/80 hover:bg-white cursor-pointer'
                        : 'text-[#25243A]/35 cursor-not-allowed'
                }`}
              >
                <span>{isDone ? '✓' : `0${s.stage}`}</span>
                <span>{s.name}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* STAGE 1: TOPICS INTERFACE */}
      {activeStage === 1 && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-8 space-y-4">
            {chapter.topics.map((topic, idx) => {
              const isExpanded = !!expandedTopics[topic.id];
              const isUnderstood = chapter.understoodTopicIds.includes(topic.id);

              return (
                <div
                  key={topic.id}
                  className={`bg-white rounded-3xl border transition-all overflow-hidden ${
                    isUnderstood
                      ? 'border-emerald-500/40 shadow-xs'
                      : 'border-[#25243A]/10'
                  }`}
                >
                  <div className="p-6 flex items-start justify-between gap-4">
                    <button
                      type="button"
                      onClick={() =>
                        setExpandedTopics((prev) => ({
                          ...prev,
                          [topic.id]: !prev[topic.id],
                        }))
                      }
                      className="flex items-start gap-3.5 text-left flex-1 cursor-pointer"
                    >
                      <div className="w-9 h-9 rounded-xl bg-[#F6F5FF] text-[#6546F5] font-bold text-sm flex items-center justify-center shrink-0 mt-0.5 tabular-nums">
                        0{idx + 1}
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <h2 className="text-base font-bold text-[#25243A]">
                            {topic.title}
                          </h2>
                          {isExpanded ? (
                            <ChevronDown className="w-4 h-4 text-[#25243A]/50" />
                          ) : (
                            <ChevronRight className="w-4 h-4 text-[#25243A]/50" />
                          )}
                        </div>
                        <p className="text-xs text-[#25243A]/65 leading-relaxed">
                          {topic.summary}
                        </p>
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => onToggleTopicUnderstood(topic.id, 10)}
                      className={`px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 shrink-0 transition-all cursor-pointer ${
                        isUnderstood
                          ? 'bg-emerald-500 text-white shadow-xs'
                          : 'bg-[#F6F5FF] hover:bg-[#6546F5]/10 text-[#6546F5]'
                      }`}
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>{isUnderstood ? 'Understood (+10 XP)' : 'Mark Understood (+10 XP)'}</span>
                    </button>
                  </div>

                  {isExpanded && (
                    <div className="px-6 pb-6 pt-2 border-t border-slate-100 bg-[#F6F5FF]/50 space-y-2.5">
                      <p className="text-xs font-semibold text-[#25243A]/60">
                        Extracted Subtopics ({topic.subtopics.length}):
                      </p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                        {topic.subtopics.map((sub, sIdx) => (
                          <div
                            key={sIdx}
                            className="p-3 rounded-xl bg-white border border-slate-200/70 flex items-center gap-2.5 text-xs text-[#25243A]"
                          >
                            <span className="w-5 h-5 rounded-md bg-[#6546F5]/10 text-[#6546F5] font-bold flex items-center justify-center shrink-0 tabular-nums">
                              {idx + 1}.{sIdx + 1}
                            </span>
                            <span>{sub}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Right Stage 1 Summary Card */}
          <div className="lg:col-span-4 space-y-5">
            <div className="bg-white rounded-3xl p-6 border border-[#25243A]/10 space-y-5">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl bg-[#6546F5] text-white flex items-center justify-center">
                  <Compass className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-[#25243A]">
                    Stage 1 Quest Status
                  </h3>
                  <p className="text-xs text-[#25243A]/60 tabular-nums">
                    {chapter.understoodTopicIds.length} of {chapter.topics.length} Topics Checked
                  </p>
                </div>
              </div>

              <div className="w-full h-2.5 rounded-full bg-slate-100 overflow-hidden">
                <div
                  className="h-full bg-[#6546F5] transition-all duration-300"
                  style={{
                    width: `${Math.min(
                      100,
                      Math.round(
                        (chapter.understoodTopicIds.length /
                          Math.max(1, chapter.topics.length)) *
                          100
                      )
                    )}%`,
                  }}
                />
              </div>

              <p className="text-xs text-[#25243A]/70 leading-relaxed">
                Expand each topic to inspect its subtopics, mark topics as understood to earn +10 XP each, then complete Stage 1 to unlock Guided Explanations.
              </p>

              <button
                type="button"
                onClick={() => onCompleteStage(1)}
                className="w-full py-3.5 px-5 rounded-2xl bg-gradient-to-r from-[#6546F5] to-[#398BFF] hover:opacity-95 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer"
              >
                <span>Complete Stage 1 & Claim +50 XP</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* STAGE 2: EXPLANATION INTERFACE */}
      {activeStage === 2 && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Topic Selector List */}
          <div className="lg:col-span-4 space-y-3">
            {chapter.explanations.map((exp, idx) => {
              const isSelected = selectedExpIdx === idx;
              const isUnderstood = chapter.understoodTopicIds.includes(exp.topicId);
              return (
                <button
                  key={exp.topicId || idx}
                  type="button"
                  onClick={() => setSelectedExpIdx(idx)}
                  className={`w-full p-4 rounded-2xl border text-left transition-all flex items-center justify-between gap-3 cursor-pointer ${
                    isSelected
                      ? 'bg-[#6546F5] text-white border-[#6546F5] shadow-md'
                      : 'bg-white text-[#25243A] border-[#25243A]/10 hover:border-[#6546F5]/40'
                  }`}
                >
                  <div className="space-y-0.5">
                    <p
                      className={`text-[11px] font-semibold ${
                        isSelected ? 'text-white/80' : 'text-[#6546F5]'
                      }`}
                    >
                      Concept 0{idx + 1}
                    </p>
                    <p className="text-sm font-bold line-clamp-1">{exp.title}</p>
                  </div>
                  {isUnderstood && (
                    <CheckCircle2
                      className={`w-4 h-4 shrink-0 ${
                        isSelected ? 'text-emerald-300' : 'text-emerald-500'
                      }`}
                    />
                  )}
                </button>
              );
            })}

            <button
              type="button"
              onClick={() => onCompleteStage(2)}
              className="w-full py-3.5 px-5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer mt-4"
            >
              <span>Complete Stage 2 & Unlock Revision (+60 XP)</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          {/* Right Explanation Card + AI Tutor Drawer */}
          <div className="lg:col-span-8 space-y-6">
            {(() => {
              const activeExp =
                chapter.explanations[selectedExpIdx] || chapter.explanations[0];
              if (!activeExp) return null;
              const isUnderstood = chapter.understoodTopicIds.includes(activeExp.topicId);

              return (
                <div className="bg-white rounded-3xl p-7 border border-[#25243A]/10 space-y-6">
                  <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-100">
                    <div>
                      <p className="text-xs font-semibold text-[#398BFF]">
                        Plain-Language Concept Breakdown
                      </p>
                      <h2 className="text-2xl font-bold text-[#25243A] mt-0.5">
                        {activeExp.title}
                      </h2>
                    </div>

                    <div className="flex items-center gap-2.5">
                      <button
                        type="button"
                        onClick={() => setShowTutorDrawer((prev) => !prev)}
                        className="px-4 py-2.5 rounded-xl bg-[#F6F5FF] hover:bg-[#6546F5]/10 text-[#6546F5] text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                      >
                        <MessageSquare className="w-4 h-4" />
                        <span>{showTutorDrawer ? 'Hide AI Tutor' : 'Ask AI Tutor'}</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => onToggleTopicUnderstood(activeExp.topicId, 15)}
                        className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                          isUnderstood
                            ? 'bg-emerald-500 text-white'
                            : 'bg-[#6546F5] hover:bg-[#5235E0] text-white'
                        }`}
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        <span>
                          {isUnderstood ? 'Mastered (+15 XP)' : 'Mark as Understood (+15 XP)'}
                        </span>
                      </button>
                    </div>
                  </div>

                  {/* Core Simple Explanation */}
                  <div className="space-y-2">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-[#25243A]/55">
                      How It Works in Simple Terms
                    </h3>
                    <p className="text-base text-[#25243A] leading-relaxed">
                      {activeExp.simpleExplanation}
                    </p>
                  </div>

                  {/* Key Formula / Principle Highlight */}
                  <div className="p-5 rounded-2xl bg-[#F6F5FF] border border-[#6546F5]/15 space-y-1.5">
                    <p className="text-xs font-bold text-[#6546F5]">
                      Important Concept / Core Rule
                    </p>
                    <p className="text-sm font-mono font-semibold text-[#25243A]">
                      {activeExp.keyConcept}
                    </p>
                  </div>

                  {/* Real-World Example & Visual Analogy Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-5 rounded-2xl bg-sky-50/70 border border-sky-200/60 space-y-2">
                      <p className="text-xs font-bold text-[#398BFF]">
                        Real-World Example
                      </p>
                      <p className="text-sm text-[#25243A]/85 leading-relaxed">
                        {activeExp.realWorldExample}
                      </p>
                    </div>

                    <div className="p-5 rounded-2xl bg-pink-50/70 border border-pink-200/60 space-y-2">
                      <p className="text-xs font-bold text-[#F36FA5]">
                        Visual Mental Analogy
                      </p>
                      <p className="text-sm text-[#25243A]/85 leading-relaxed">
                        {activeExp.visualAnalogy}
                      </p>
                    </div>
                  </div>

                  {/* Inline AI Tutor Drawer */}
                  {showTutorDrawer && (
                    <div className="p-5 rounded-2xl bg-[#25243A] text-white space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Sparkles className="w-4 h-4 text-[#48D4DC]" />
                          <span className="text-xs font-bold">
                            Professor Nova · Live Chapter AI Tutor
                          </span>
                        </div>
                      </div>

                      <div className="max-h-52 overflow-y-auto space-y-3 pr-1">
                        {tutorMessages.map((msg, i) => (
                          <div
                            key={i}
                            className={`p-3 rounded-xl text-xs leading-relaxed ${
                              msg.role === 'user'
                                ? 'bg-[#6546F5] text-white ml-8'
                                : 'bg-white/10 text-white/90 mr-8'
                            }`}
                          >
                            <p>{msg.text}</p>
                            {msg.keyTakeaway && (
                              <p className="mt-1.5 pt-1.5 border-t border-white/15 text-[#48D4DC] font-semibold">
                                Takeaway: {msg.keyTakeaway}
                              </p>
                            )}
                          </div>
                        ))}
                      </div>

                      <form onSubmit={handleAskInlineTutor} className="flex gap-2">
                        <input
                          type="text"
                          value={tutorQuestion}
                          onChange={(e) => setTutorQuestion(e.target.value)}
                          placeholder={`Ask a question about ${activeExp.title}...`}
                          className="flex-1 px-3.5 py-2.5 rounded-xl bg-white/10 border border-white/15 text-xs text-white placeholder:text-white/50 focus:outline-none focus:border-[#48D4DC]"
                        />
                        <button
                          type="submit"
                          disabled={tutorLoading}
                          className="px-4 py-2.5 rounded-xl bg-[#48D4DC] text-[#25243A] font-bold text-xs flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                        >
                          {tutorLoading ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <Send className="w-4 h-4" />
                          )}
                          <span>Ask</span>
                        </button>
                      </form>
                    </div>
                  )}
                </div>
              );
            })()}
          </div>
        </div>
      )}

      {/* STAGE 3: REVISION INTERFACE (Flashcards + Notes) */}
      {activeStage === 3 && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Interactive Flip Flashcards Deck */}
          <div className="lg:col-span-6 space-y-5">
            <div className="bg-white rounded-3xl p-6 border border-[#25243A]/10 space-y-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold text-[#F36FA5]">
                    Interactive Memory Deck
                  </p>
                  <h2 className="text-lg font-bold text-[#25243A]">
                    Concept Flashcards ({activeCardIdx + 1} of {chapter.flashcards.length})
                  </h2>
                </div>
                <span className="text-xs font-semibold text-[#6546F5] tabular-nums">
                  {Object.keys(reviewedCards).length} Reviewed
                </span>
              </div>

              {(() => {
                const card = chapter.flashcards[activeCardIdx] || chapter.flashcards[0];
                if (!card) return null;
                return (
                  <div
                    onClick={() => {
                      setIsCardFlipped((prev) => !prev);
                      setReviewedCards((prev) => ({ ...prev, [card.id]: true }));
                    }}
                    className={`min-h-[240px] p-8 rounded-3xl border-2 transition-all cursor-pointer flex flex-col items-center justify-center text-center select-none ${
                      isCardFlipped
                        ? 'bg-gradient-to-br from-[#6546F5] to-[#398BFF] text-white border-transparent shadow-lg'
                        : 'bg-[#F6F5FF] text-[#25243A] border-[#6546F5]/20 hover:border-[#6546F5]'
                    }`}
                  >
                    <span
                      className={`text-xs font-bold uppercase tracking-wider mb-3 ${
                        isCardFlipped ? 'text-white/80' : 'text-[#6546F5]'
                      }`}
                    >
                      {isCardFlipped
                        ? 'Definition / Answer (Click to Flip)'
                        : `${card.category} · Term (Click to Flip)`}
                    </span>
                    <p
                      className={`font-bold leading-relaxed ${
                        isCardFlipped ? 'text-base' : 'text-2xl'
                      }`}
                    >
                      {isCardFlipped ? card.definition : card.term}
                    </p>
                  </div>
                );
              })()}

              <div className="flex items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setIsCardFlipped(false);
                    setActiveCardIdx((prev) =>
                      prev > 0 ? prev - 1 : chapter.flashcards.length - 1
                    );
                  }}
                  className="px-4 py-2.5 rounded-xl bg-[#F6F5FF] hover:bg-[#6546F5]/10 text-xs font-semibold text-[#25243A] cursor-pointer"
                >
                  ← Previous Card
                </button>

                <button
                  type="button"
                  onClick={() => setIsCardFlipped((prev) => !prev)}
                  className="px-4 py-2.5 rounded-xl bg-[#6546F5]/10 text-[#6546F5] text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Flip Card</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setIsCardFlipped(false);
                    setActiveCardIdx((prev) =>
                      prev + 1 < chapter.flashcards.length ? prev + 1 : 0
                    );
                  }}
                  className="px-4 py-2.5 rounded-xl bg-[#F6F5FF] hover:bg-[#6546F5]/10 text-xs font-semibold text-[#25243A] cursor-pointer"
                >
                  Next Card →
                </button>
              </div>
            </div>

            <button
              type="button"
              onClick={() => onCompleteStage(3)}
              className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-[#F36FA5] to-[#6546F5] hover:opacity-95 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer"
            >
              <span>Complete Stage 3 Revision & Claim +70 XP</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          {/* High-Yield Revision Notes & Key Takeaways */}
          <div className="lg:col-span-6 space-y-5">
            <div className="bg-white rounded-3xl p-6 border border-[#25243A]/10 space-y-4">
              <div>
                <p className="text-xs font-semibold text-[#6546F5]">
                  Rapid Exam Cheat-Sheet
                </p>
                <h2 className="text-lg font-bold text-[#25243A]">
                  High-Yield Revision Notes & Key Takeaways
                </h2>
              </div>

              <ul className="space-y-3">
                {chapter.revisionNotes.map((note, idx) => (
                  <li
                    key={idx}
                    className="p-3.5 rounded-2xl bg-[#F6F5FF] flex items-start gap-3 text-sm text-[#25243A]/85 leading-relaxed"
                  >
                    <span className="w-6 h-6 rounded-lg bg-[#6546F5] text-white text-xs font-bold flex items-center justify-center shrink-0 mt-0.5 tabular-nums">
                      {idx + 1}
                    </span>
                    <span>{note}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* STAGE 4: INTERACTIVE MIND MAP INTERFACE */}
      {activeStage === 4 && (
        <div className="space-y-6">
          <div className="bg-white rounded-3xl border border-[#25243A]/10 overflow-hidden">
            {/* Mind Map Toolbar */}
            <div className="p-5 border-b border-slate-100 flex flex-wrap items-center justify-between gap-4">
              <div>
                <p className="text-xs font-semibold text-[#0E949E]">
                  Stage 4 · Interactive Visual Concept Graph
                </p>
                <h2 className="text-lg font-bold text-[#25243A]">
                  {chapter.mindMap.rootLabel}
                </h2>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setZoomScale((z) => Math.max(0.75, +(z - 0.15).toFixed(2)))}
                  className="p-2 rounded-xl bg-[#F6F5FF] hover:bg-[#6546F5]/10 text-[#25243A] cursor-pointer"
                  title="Zoom Out"
                >
                  <ZoomOut className="w-4 h-4" />
                </button>
                <span className="text-xs font-mono font-semibold px-2 tabular-nums">
                  {Math.round(zoomScale * 100)}%
                </span>
                <button
                  type="button"
                  onClick={() => setZoomScale((z) => Math.min(1.45, +(z + 0.15).toFixed(2)))}
                  className="p-2 rounded-xl bg-[#F6F5FF] hover:bg-[#6546F5]/10 text-[#25243A] cursor-pointer"
                  title="Zoom In"
                >
                  <ZoomIn className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setZoomScale(1)}
                  className="p-2 rounded-xl bg-[#F6F5FF] hover:bg-[#6546F5]/10 text-[#25243A] cursor-pointer"
                  title="Reset Zoom"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Interactive SVG + Node Explorer Mind Map */}
            <div className="p-6 bg-gradient-to-br from-[#F6F5FF] via-white to-[#ECFEFF] overflow-x-auto">
              <div
                style={{
                  transform: `scale(${zoomScale})`,
                  transformOrigin: 'top center',
                }}
                className="transition-transform duration-200 min-w-[780px] py-4 space-y-8"
              >
                {/* Root Concept Node */}
                <div className="flex justify-center">
                  <div className="px-7 py-4 rounded-3xl bg-[#25243A] text-white font-bold text-base shadow-lg border-4 border-white flex items-center gap-2.5">
                    <Network className="w-5 h-5 text-[#48D4DC]" />
                    <span>{chapter.mindMap.rootLabel}</span>
                  </div>
                </div>

                {/* Connected Branches Grid */}
                <div className="grid grid-cols-4 gap-5">
                  {chapter.mindMap.branches.slice(0, 4).map((branch) => {
                    const isSelected = selectedBranchId === branch.id;
                    return (
                      <div key={branch.id} className="flex flex-col items-center space-y-4">
                        <div
                          className="w-1 h-8 rounded-full"
                          style={{ backgroundColor: branch.color }}
                        />
                        <button
                          type="button"
                          onClick={() => setSelectedBranchId(branch.id)}
                          style={{ backgroundColor: branch.color }}
                          className={`w-full p-4 rounded-2xl text-white font-bold text-sm text-center shadow-md transition-transform cursor-pointer ${
                            isSelected ? 'scale-105 ring-4 ring-[#6546F5]/25' : 'hover:scale-102'
                          }`}
                        >
                          {branch.label}
                        </button>

                        {/* Child Leaf Nodes */}
                        <div className="w-full space-y-2.5">
                          {branch.nodes.map((node) => (
                            <div
                              key={node.id}
                              className="p-3.5 rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-1"
                            >
                              <p
                                className="text-xs font-bold"
                                style={{ color: branch.color }}
                              >
                                {node.label}
                              </p>
                              <p className="text-[11px] text-[#25243A]/70 leading-relaxed">
                                {node.detail}
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="p-5 bg-[#F6F5FF] border-t border-slate-100 flex flex-wrap items-center justify-between gap-4">
              <p className="text-xs text-[#25243A]/70">
                Click any branch node or use the zoom controls above to inspect how subtopics interconnect across the chapter.
              </p>
              <button
                type="button"
                onClick={() => onCompleteStage(4)}
                className="px-6 py-3 rounded-2xl bg-gradient-to-r from-[#6546F5] to-[#398BFF] hover:opacity-95 text-white font-bold text-xs flex items-center gap-2 shadow-md transition-all cursor-pointer"
              >
                <span>Complete Stage 4 & Unlock Boss Test (+70 XP)</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* STAGE 5: TEST INTERFACE (Boss Quiz + Diagnostics) */}
      {activeStage === 5 && (
        <div className="max-w-3xl mx-auto">
          {!quizFinished ? (
            <div className="bg-white rounded-3xl p-7 sm:p-8 border border-[#25243A]/10 shadow-sm space-y-6">
              {/* Question Progress Bar */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs font-semibold">
                  <span className="text-[#6546F5]">
                    Question {quizIndex + 1} of {activeQuestions.length} ·{' '}
                    {currentQuestion?.topicTag}
                  </span>
                  <span className="text-[#25243A]/60 tabular-nums">
                    {Math.round(((quizIndex + 1) / Math.max(1, activeQuestions.length)) * 100)}%
                  </span>
                </div>
                <div className="w-full h-2.5 rounded-full bg-slate-100 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-[#6546F5] to-[#398BFF] transition-all duration-300"
                    style={{
                      width: `${Math.round(
                        ((quizIndex + 1) / Math.max(1, activeQuestions.length)) * 100
                      )}%`,
                    }}
                  />
                </div>
              </div>

              {/* Question Prompt */}
              <h2 className="text-xl font-bold text-[#25243A] leading-snug">
                {currentQuestion?.question}
              </h2>

              {/* Multiple Choice Options */}
              <div className="space-y-3">
                {currentQuestion?.options.map((option, idx) => {
                  const isPicked = selectedOption === idx;
                  const isCorrectOption = idx === currentQuestion.correctIndex;

                  let optionStyle =
                    'bg-[#F6F5FF] border-transparent text-[#25243A] hover:border-[#6546F5]/40';
                  if (isAnswerSubmitted) {
                    if (isCorrectOption) {
                      optionStyle =
                        'bg-emerald-50 border-emerald-500 text-emerald-900 font-semibold';
                    } else if (isPicked && !isCorrectOption) {
                      optionStyle = 'bg-rose-50 border-rose-500 text-rose-900';
                    }
                  } else if (isPicked) {
                    optionStyle = 'bg-[#6546F5] text-white border-[#6546F5] shadow-sm';
                  }

                  return (
                    <button
                      key={idx}
                      type="button"
                      disabled={isAnswerSubmitted}
                      onClick={() => setSelectedOption(idx)}
                      className={`w-full p-4 rounded-2xl border-2 text-left text-sm flex items-center justify-between gap-3 transition-all cursor-pointer ${optionStyle}`}
                    >
                      <div className="flex items-center gap-3">
                        <span
                          className={`w-7 h-7 rounded-lg text-xs font-bold flex items-center justify-center shrink-0 ${
                            isPicked && !isAnswerSubmitted
                              ? 'bg-white/20 text-white'
                              : 'bg-white text-[#25243A]'
                          }`}
                        >
                          {String.fromCharCode(65 + idx)}
                        </span>
                        <span>{option}</span>
                      </div>

                      {isAnswerSubmitted && isCorrectOption && (
                        <Check className="w-5 h-5 text-emerald-600 shrink-0" />
                      )}
                      {isAnswerSubmitted && isPicked && !isCorrectOption && (
                        <XCircle className="w-5 h-5 text-rose-600 shrink-0" />
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Explanation Callout After Answering */}
              {isAnswerSubmitted && currentQuestion && (
                <div
                  className={`p-5 rounded-2xl border text-xs space-y-1.5 ${
                    selectedOption === currentQuestion.correctIndex
                      ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                      : 'bg-amber-50 border-amber-200 text-amber-900'
                  }`}
                >
                  <p className="font-bold text-sm">
                    {selectedOption === currentQuestion.correctIndex
                      ? 'Correct! +15 Quiz XP'
                      : 'Not quite — Review Concept Explanation:'}
                  </p>
                  <p className="leading-relaxed">{currentQuestion.explanation}</p>
                </div>
              )}

              {/* Action Footer */}
              <div className="pt-2 flex justify-end">
                {!isAnswerSubmitted ? (
                  <button
                    type="button"
                    disabled={selectedOption === null}
                    onClick={handleSubmitQuizOption}
                    className="px-6 py-3.5 rounded-2xl bg-[#6546F5] hover:bg-[#5235E0] text-white font-bold text-xs cursor-pointer disabled:opacity-40"
                  >
                    Check Answer
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleNextQuestion}
                    className="px-6 py-3.5 rounded-2xl bg-gradient-to-r from-[#6546F5] to-[#398BFF] text-white font-bold text-xs flex items-center gap-2 cursor-pointer"
                  >
                    <span>
                      {quizIndex + 1 < activeQuestions.length
                        ? 'Next Question'
                        : 'Finish Test & See Performance Analysis'}
                    </span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          ) : (
            /* Quiz Summary & AI Weak-Area Diagnostic Card */
            <div className="bg-white rounded-3xl p-8 border border-[#25243A]/10 shadow-sm space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
                <div>
                  <p className="text-xs font-bold text-[#6546F5]">
                    Stage 5 Assessment Results
                  </p>
                  <h2 className="text-2xl font-bold text-[#25243A] mt-0.5">
                    You Scored {calculateQuizScorePercent()}% on {chapter.title}
                  </h2>
                </div>
                <div className="px-4 py-2.5 rounded-2xl bg-emerald-500/10 text-emerald-700 font-bold text-sm tabular-nums">
                  +130 Total Test & Chapter Bonus XP
                </div>
              </div>

              {/* AI Diagnostic Coach Section */}
              <div className="p-6 rounded-2xl bg-[#F6F5FF] space-y-3">
                <div className="flex items-center gap-2 text-xs font-bold text-[#6546F5]">
                  <Sparkles className="w-4 h-4" />
                  <span>AI Performance Diagnostic & Revision Recommendations</span>
                </div>

                {loadingCoach ? (
                  <div className="flex items-center gap-2 text-xs text-[#25243A]/70 py-3">
                    <Loader2 className="w-4 h-4 animate-spin text-[#6546F5]" />
                    <span>Analyzing your answers to identify weak areas...</span>
                  </div>
                ) : (
                  <div className="space-y-3 text-sm text-[#25243A]/85">
                    <p className="font-bold text-[#25243A]">
                      {aiCoachReport?.coachHeadline ||
                        'Strong conceptual grasp across core chapter checkpoints!'}
                    </p>
                    <p className="text-xs leading-relaxed">
                      {aiCoachReport?.weakAreasSummary ||
                        'Review any missed flashcards in Stage 3 to lock in 100% long-term retention.'}
                    </p>
                    {aiCoachReport?.recommendedRevisionSteps && (
                      <ul className="space-y-1.5 text-xs pt-1">
                        {aiCoachReport.recommendedRevisionSteps.map((step, idx) => (
                          <li key={idx} className="flex items-center gap-2">
                            <CheckCircle2 className="w-3.5 h-3.5 text-[#6546F5] shrink-0" />
                            <span>{step}</span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                )}
              </div>

              <div className="flex flex-wrap items-center justify-between gap-4 pt-2">
                {calculateQuizScorePercent() < 100 && (
                  <button
                    type="button"
                    onClick={handleRetryIncorrect}
                    className="px-5 py-3 rounded-xl bg-[#F6F5FF] hover:bg-[#6546F5]/10 text-[#6546F5] font-bold text-xs flex items-center gap-2 cursor-pointer"
                  >
                    <RefreshCw className="w-4 h-4" />
                    <span>Retry Incorrect Questions</span>
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => onCompleteStage(5, calculateQuizScorePercent())}
                  className="px-6 py-3.5 rounded-2xl bg-gradient-to-r from-[#6546F5] to-[#398BFF] hover:opacity-95 text-white font-bold text-xs flex items-center gap-2 shadow-md cursor-pointer ml-auto"
                >
                  <Trophy className="w-4 h-4" />
                  <span>Complete Chapter & Claim Mastery Rewards</span>
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
