import React, { useState } from 'react';
import {
  Trophy,
  Zap,
  Compass,
  BookOpen,
  Layers,
  Network,
  Crown,
  Award,
  Lock,
  CheckCircle2,
  Sparkles,
  Send,
  Loader2,
  User,
  Save,
  Upload,
} from 'lucide-react';
import { ChapterBlueprint, UserProfile } from '../types';
import { LEVELUP_BADGES, calculateLevelFromXp } from '../data/presets';

interface AchievementsViewProps {
  userProfile: UserProfile;
}

export const AchievementsView: React.FC<AchievementsViewProps> = ({ userProfile }) => {
  const [filter, setFilter] = useState<'all' | 'unlocked' | 'locked'>('all');

  const filteredBadges = LEVELUP_BADGES.filter((b) => {
    const isUnlocked = userProfile.unlockedBadges.includes(b.id);
    if (filter === 'unlocked') return isUnlocked;
    if (filter === 'locked') return !isUnlocked;
    return true;
  });

  const renderBadgeIcon = (iconName: string) => {
    switch (iconName) {
      case 'Compass':
        return <Compass className="w-7 h-7" />;
      case 'Zap':
        return <Zap className="w-7 h-7" />;
      case 'BookOpen':
        return <BookOpen className="w-7 h-7" />;
      case 'Layers':
        return <Layers className="w-7 h-7" />;
      case 'Network':
        return <Network className="w-7 h-7" />;
      case 'Trophy':
        return <Trophy className="w-7 h-7" />;
      case 'Crown':
        return <Crown className="w-7 h-7" />;
      default:
        return <Award className="w-7 h-7" />;
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="bg-white rounded-3xl p-6 border border-[#6546F5]/15 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#25243A]">
            Achievements
          </h1>
          <p className="text-sm text-[#25243A]/65">
            Unlock badges as you complete stages and quizzes.
          </p>
        </div>

        <div className="flex items-center gap-3 tabular-nums">
          <div className="p-3.5 rounded-2xl bg-[#F6F5FF] text-center min-w-[100px]">
            <p className="text-xs text-[#25243A]/60">Badges</p>
            <p className="text-lg font-bold text-[#6546F5]">
              {userProfile.unlockedBadges.length} / {LEVELUP_BADGES.length}
            </p>
          </div>
          <div className="p-3.5 rounded-2xl bg-[#F6F5FF] text-center min-w-[100px]">
            <p className="text-xs text-[#25243A]/60">Total XP</p>
            <p className="text-lg font-bold text-[#398BFF]">
              {userProfile.xp.toLocaleString()}
            </p>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5 p-1.5 bg-white rounded-2xl border border-[#25243A]/10">
          {(['all', 'unlocked', 'locked'] as const).map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => setFilter(tab)}
              className={`px-4 py-2 rounded-xl text-xs font-semibold capitalize transition-all cursor-pointer ${
                filter === tab
                  ? 'bg-[#6546F5] text-white shadow-xs'
                  : 'text-[#25243A]/70 hover:text-[#25243A]'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {filteredBadges.map((badge) => {
          const isUnlocked = userProfile.unlockedBadges.includes(badge.id);
          return (
            <div
              key={badge.id}
              className={`rounded-3xl p-5 border transition-all flex flex-col justify-between space-y-4 ${
                isUnlocked
                  ? 'bg-white border-[#6546F5]/20 shadow-xs'
                  : 'bg-white/60 border-slate-200/80 opacity-75'
              }`}
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div
                    className={`w-14 h-14 rounded-2xl flex items-center justify-center text-white shadow-sm ${
                      isUnlocked
                        ? `bg-gradient-to-br ${badge.gradient}`
                        : 'bg-slate-300 text-slate-600'
                    }`}
                  >
                    {isUnlocked ? renderBadgeIcon(badge.iconName) : <Lock className="w-5 h-5" />}
                  </div>
                  <span className="text-xs font-bold text-[#6546F5] tabular-nums">
                    +{badge.xpReward} XP
                  </span>
                </div>

                <div>
                  <h2 className="text-base font-bold text-[#25243A]">{badge.name}</h2>
                  <p className="text-xs text-[#25243A]/65 mt-1">
                    {badge.requirementText}
                  </p>
                </div>
              </div>

              <div className="pt-2.5 border-t border-slate-100 flex items-center justify-between text-xs font-semibold">
                {isUnlocked ? (
                  <span className="text-emerald-600 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Unlocked
                  </span>
                ) : (
                  <span className="text-slate-400">Locked</span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

interface AiTutorPageViewProps {
  chapters: ChapterBlueprint[];
  activeChapter: ChapterBlueprint | undefined;
  onSelectChapter: (chapterId: string) => void;
  onGoToUpload: () => void;
}

export const AiTutorPageView: React.FC<AiTutorPageViewProps> = ({
  chapters,
  activeChapter,
  onSelectChapter,
  onGoToUpload,
}) => {
  const [question, setQuestion] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState<
    Array<{
      role: 'user' | 'tutor';
      text: string;
      keyTakeaway?: string;
      followUpPrompts?: string[];
    }>
  >([
    {
      role: 'tutor',
      text: activeChapter
        ? `Hi! I'm your personal AI Tutor. Ask me anything about "${activeChapter.title}" or any concept you'd like explained.`
        : `Hi! I'm your personal AI Tutor. Ask me any study question, or upload a chapter to study specific material together.`,
    },
  ]);

  const sendQuestion = async (promptText: string) => {
    if (!promptText.trim() || isLoading) return;
    setQuestion('');
    setMessages((prev) => [...prev, { role: 'user', text: promptText }]);
    setIsLoading(true);

    try {
      const res = await fetch('/api/tutor/ask', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chapterTitle: activeChapter?.title || 'Personal Study Session',
          subject: activeChapter?.subject || 'General',
          sourceSummary: activeChapter?.sourceSummary || '',
          question: promptText,
          history: messages,
        }),
      });
      const data = await res.json();
      setMessages((prev) => [
        ...prev,
        {
          role: 'tutor',
          text: data.answer || 'Let us walk through that concept step by step.',
          keyTakeaway: data.keyTakeaway,
          followUpPrompts: data.followUpPrompts,
        },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          role: 'tutor',
          text: 'Let us break that down step by step.',
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-6">
      <div className="lg:col-span-4 space-y-4">
        <div className="bg-white rounded-3xl p-6 border border-[#25243A]/10 space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-[#6546F5] to-[#398BFF] text-white flex items-center justify-center">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-[#25243A]">Personal AI Tutor</h2>
              <p className="text-xs text-[#25243A]/60">Ask anything anytime</p>
            </div>
          </div>

          {chapters.length > 0 && activeChapter ? (
            <>
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-[#25243A]/70">
                  Selected Chapter
                </label>
                <select
                  value={activeChapter.id}
                  onChange={(e) => onSelectChapter(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#F6F5FF] text-xs font-semibold text-[#25243A] border border-[#6546F5]/15 focus:outline-none"
                >
                  {chapters.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.title}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2 pt-1">
                <p className="text-xs font-semibold text-[#25243A]/65">
                  Chapter Topics:
                </p>
                {activeChapter.topics.map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() =>
                      sendQuestion(`Explain "${t.title}" in simple language with a real-life example.`)
                    }
                    className="w-full p-3 rounded-xl bg-[#F6F5FF] hover:bg-[#6546F5]/10 text-left text-xs font-medium text-[#25243A] transition-colors cursor-pointer"
                  >
                    Explain: {t.title}
                  </button>
                ))}
              </div>
            </>
          ) : (
            <div className="p-4 rounded-2xl bg-[#F6F5FF] space-y-3">
              <p className="text-xs text-[#25243A]/70">
                No study material uploaded yet. You can ask general questions now or upload a chapter first.
              </p>
              <button
                type="button"
                onClick={onGoToUpload}
                className="w-full py-2.5 px-3 rounded-xl bg-[#6546F5] text-white text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Upload className="w-3.5 h-3.5" />
                <span>Upload Material</span>
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="lg:col-span-8 bg-white rounded-3xl border border-[#25243A]/10 flex flex-col h-[560px] overflow-hidden">
        <div className="p-5 border-b border-slate-100">
          <h1 className="text-lg font-bold text-[#25243A]">
            {activeChapter ? activeChapter.title : 'AI Tutor Chat'}
          </h1>
        </div>

        <div className="flex-1 p-6 overflow-y-auto space-y-4">
          {messages.map((m, idx) => (
            <div
              key={idx}
              className={`max-w-xl p-4 rounded-2xl text-sm leading-relaxed space-y-2.5 ${
                m.role === 'user'
                  ? 'ml-auto bg-[#6546F5] text-white'
                  : 'bg-[#F6F5FF] text-[#25243A]'
              }`}
            >
              <p className="whitespace-pre-line">{m.text}</p>
              {m.keyTakeaway && (
                <div className="p-3 rounded-xl bg-white border border-[#6546F5]/15 text-xs text-[#6546F5] font-semibold">
                  Key Takeaway: {m.keyTakeaway}
                </div>
              )}
              {m.followUpPrompts && m.followUpPrompts.length > 0 && (
                <div className="flex flex-wrap gap-2 pt-1">
                  {m.followUpPrompts.map((fp, fIdx) => (
                    <button
                      key={fIdx}
                      type="button"
                      onClick={() => sendQuestion(fp)}
                      className="px-3 py-1.5 rounded-lg bg-white hover:bg-[#6546F5] hover:text-white text-xs font-semibold text-[#6546F5] border border-[#6546F5]/20 transition-colors cursor-pointer"
                    >
                      {fp}
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}
          {isLoading && (
            <div className="p-4 rounded-2xl bg-[#F6F5FF] text-xs text-[#25243A]/70 flex items-center gap-2 max-w-xs">
              <Loader2 className="w-4 h-4 animate-spin text-[#6546F5]" />
              <span>Thinking...</span>
            </div>
          )}
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            sendQuestion(question);
          }}
          className="p-4 border-t border-slate-100 flex gap-3 bg-[#F6F5FF]/50"
        >
          <input
            type="text"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="Ask a question..."
            className="flex-1 px-4 py-3 rounded-xl bg-white border border-slate-200 text-sm focus:outline-none focus:border-[#6546F5]"
          />
          <button
            type="submit"
            disabled={isLoading || !question.trim()}
            className="px-5 py-3 rounded-xl bg-[#6546F5] hover:bg-[#5235E0] text-white font-semibold text-sm flex items-center gap-2 cursor-pointer disabled:opacity-50"
          >
            <Send className="w-4 h-4" />
            <span>Ask</span>
          </button>
        </form>
      </div>
    </div>
  );
};

interface ProfileViewProps {
  userProfile: UserProfile;
  chapters: ChapterBlueprint[];
  onUpdateProfile: (displayName: string, avatarUrl: string) => Promise<void>;
}

export const ProfileAndProgressView: React.FC<ProfileViewProps> = ({
  userProfile,
  chapters,
  onUpdateProfile,
}) => {
  const [displayName, setDisplayName] = useState(userProfile.displayName);
  const [avatarPreset, setAvatarPreset] = useState(userProfile.avatarUrl || 'wizard');
  const [savedNotice, setSavedNotice] = useState(false);

  const levelInfo = calculateLevelFromXp(userProfile.xp);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    await onUpdateProfile(displayName.trim() || 'Learner', avatarPreset);
    setSavedNotice(true);
    setTimeout(() => setSavedNotice(false), 2500);
  };

  const completedChaptersCount = chapters.filter((c) => c.status === 'completed').length;

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="bg-white rounded-3xl p-6 border border-[#6546F5]/15 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#6546F5] to-[#398BFF] text-white font-bold text-xl flex items-center justify-center shadow-sm">
            {userProfile.displayName.slice(0, 2).toUpperCase()}
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-[#25243A]">
                {userProfile.displayName}
              </h1>
              <span className="text-xs font-bold text-[#6546F5]">
                · Level {levelInfo.level}
              </span>
            </div>
            <p className="text-xs text-[#25243A]/65 tabular-nums">
              {userProfile.xp.toLocaleString()} XP · {completedChaptersCount} Chapters Completed
            </p>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3 tabular-nums w-full md:w-auto">
          <div className="p-3.5 rounded-2xl bg-[#F6F5FF] text-center">
            <p className="text-[11px] text-[#25243A]/60">Quiz Score</p>
            <p className="text-lg font-bold text-emerald-600">
              {userProfile.totalQuizzesTaken > 0 ? `${userProfile.averageTestScore}%` : '—'}
            </p>
          </div>
          <div className="p-3.5 rounded-2xl bg-[#F6F5FF] text-center">
            <p className="text-[11px] text-[#25243A]/60">Chapters</p>
            <p className="text-lg font-bold text-[#398BFF]">
              {chapters.length}
            </p>
          </div>
          <div className="p-3.5 rounded-2xl bg-[#F6F5FF] text-center">
            <p className="text-[11px] text-[#25243A]/60">Badges</p>
            <p className="text-lg font-bold text-[#F36FA5]">
              {userProfile.unlockedBadges.length}/{LEVELUP_BADGES.length}
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <form
          onSubmit={handleSave}
          className="lg:col-span-5 bg-white rounded-3xl p-6 border border-[#25243A]/10 space-y-5"
        >
          <div className="flex items-center gap-2">
            <User className="w-5 h-5 text-[#6546F5]" />
            <h2 className="text-base font-bold text-[#25243A]">
              Profile Settings
            </h2>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#25243A]/75 mb-1.5">
              Display Name
            </label>
            <input
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              maxLength={80}
              className="w-full px-4 py-3 rounded-xl bg-[#F6F5FF] border border-transparent focus:border-[#6546F5] focus:bg-white text-sm focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#25243A]/75 mb-1.5">
              Avatar Style
            </label>
            <div className="grid grid-cols-3 gap-2">
              {['wizard', 'astronaut', 'scholar'].map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => setAvatarPreset(preset)}
                  className={`py-2.5 px-3 rounded-xl text-xs font-semibold capitalize border cursor-pointer ${
                    avatarPreset === preset
                      ? 'bg-[#6546F5] text-white border-[#6546F5]'
                      : 'bg-[#F6F5FF] text-[#25243A] border-transparent'
                  }`}
                >
                  {preset}
                </button>
              ))}
            </div>
          </div>

          {savedNotice && (
            <p className="text-xs font-semibold text-emerald-600 flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4" />
              Profile saved!
            </p>
          )}

          <button
            type="submit"
            className="w-full py-3.5 px-5 rounded-2xl bg-[#6546F5] hover:bg-[#5235E0] text-white font-semibold text-xs flex items-center justify-center gap-2 cursor-pointer"
          >
            <Save className="w-4 h-4" />
            <span>Save Profile</span>
          </button>
        </form>

        <div className="lg:col-span-7 bg-white rounded-3xl p-6 border border-[#25243A]/10 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-[#25243A]">
              Uploaded Chapters
            </h2>
            <span className="text-xs text-[#25243A]/60 tabular-nums">
              {chapters.length} Total
            </span>
          </div>

          {chapters.length === 0 ? (
            <p className="text-xs text-[#25243A]/60 py-6 text-center">
              No chapters uploaded yet. Upload your study material to start learning.
            </p>
          ) : (
            <div className="space-y-3">
              {chapters.map((chap) => (
                <div
                  key={chap.id}
                  className="p-4 rounded-2xl bg-[#F6F5FF] flex items-center justify-between gap-4"
                >
                  <div className="space-y-0.5">
                    <p className="text-sm font-bold text-[#25243A]">{chap.title}</p>
                    <p className="text-xs text-[#25243A]/60 tabular-nums">
                      {chap.subject} · Stage {chap.currentStage} of 5 · {chap.progressPercent}%
                    </p>
                  </div>
                  <div className="text-right tabular-nums shrink-0">
                    <p className="text-xs font-bold text-[#6546F5]">+{chap.xpEarned} XP</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
