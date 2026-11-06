import React from 'react';
import {
  Sparkles,
  Upload,
  Map,
  ArrowRight,
  Zap,
  Compass,
  Brain,
  Crown,
  GraduationCap,
  Lock,
  BookOpen,
} from 'lucide-react';
import { STAGE_METADATA, LEVELUP_BADGES } from '../data/presets';
import jungleMapBg from '../assets/images/jungle_learning_map_bg_1793938971041.jpg';

interface LandingPageProps {
  onStartLearning: () => void;
  onExploreHowItWorks: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  onStartLearning,
  onExploreHowItWorks,
}) => {
  return (
    <div className="min-h-screen bg-[#F3F5F9] text-[#1E293B]">
      {/* Top Bar matching reference pic style */}
      <header className="sticky top-0 z-30 bg-[#F3F5F9]/90 backdrop-blur-md">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-6 px-6 py-4">
          <a
            href="#top"
            className="px-5 py-2.5 rounded-full bg-white shadow-xs flex items-center gap-2.5 text-lg font-bold tracking-tight text-[#1E293B] font-display whitespace-nowrap shrink-0"
          >
            <div className="w-7 h-7 rounded-lg bg-[#2563EB] text-white flex items-center justify-center">
              <GraduationCap className="w-4 h-4" />
            </div>
            <span>LevelUp</span>
          </a>

          <nav className="hidden md:flex items-center gap-8 px-7 py-3 rounded-full bg-white shadow-xs text-sm font-semibold text-[#64748B]">
            <a
              href="#how-it-works"
              className="text-[#2563EB] transition-colors whitespace-nowrap shrink-0"
            >
              How It Works
            </a>
            <a
              href="#stages"
              className="hover:text-[#2563EB] transition-colors whitespace-nowrap shrink-0"
            >
              Learning Stages
            </a>
            <a
              href="#gamification"
              className="hover:text-[#2563EB] transition-colors whitespace-nowrap shrink-0"
            >
              Rewards
            </a>
          </nav>

          <div className="flex items-center shrink-0">
            <button
              onClick={onStartLearning}
              className="px-5 py-2.5 text-sm font-semibold text-white bg-[#2563EB] hover:bg-[#1D4ED8] rounded-full shadow-sm transition-all cursor-pointer whitespace-nowrap shrink-0"
            >
              Start Learning
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section id="top" className="relative pt-10 pb-16 px-6 overflow-hidden">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          <div className="lg:col-span-5 space-y-5">
            <p className="text-sm font-bold text-[#2563EB]">
              Upload. Learn. Level Up.
            </p>
            <h1
              className="text-4xl sm:text-5xl font-bold tracking-tight text-[#1E293B] leading-[1.12]"
              style={{ textWrap: 'balance' }}
            >
              Stop Just Studying. Start Leveling Up.
            </h1>
            <p className="text-base text-[#64748B] leading-relaxed max-w-lg">
              Upload any PDF, chapter, or notes. AI turns your material into an interactive 5-stage learning journey with flashcards, mind maps, and quizzes.
            </p>
            <div className="flex flex-wrap items-center gap-4 pt-1">
              <button
                onClick={onStartLearning}
                className="px-6 py-3.5 text-base font-semibold text-white bg-[#2563EB] hover:bg-[#1D4ED8] rounded-full shadow-md flex items-center gap-2.5 transition-all cursor-pointer whitespace-nowrap shrink-0"
              >
                <span>Start Learning</span>
                <ArrowRight className="w-4 h-4" />
              </button>
              <button
                onClick={onExploreHowItWorks}
                className="px-6 py-3.5 text-base font-semibold text-[#1E293B] bg-white hover:bg-slate-50 border border-slate-200 rounded-full transition-all cursor-pointer whitespace-nowrap shrink-0"
              >
                Explore How It Works
              </button>
            </div>
          </div>

          {/* Interactive Jungle Learning Journey Preview Card */}
          <div className="lg:col-span-7">
            <div className="bg-white rounded-3xl shadow-md p-5 space-y-4 border border-slate-100">
              <div className="flex items-center justify-between">
                <h2 className="text-base font-bold text-[#1E293B]">
                  Learning Journey Map
                </h2>
                <span className="text-xs font-semibold text-[#64748B]">
                  5 Interactive Stages
                </span>
              </div>

              <div
                onClick={onStartLearning}
                className="relative h-[300px] sm:h-[340px] rounded-2xl overflow-hidden cursor-pointer border border-slate-200/60"
              >
                <img
                  src={jungleMapBg}
                  alt="Jungle Learning Journey Preview"
                  className="absolute inset-0 w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black/10" />

                {/* Preview Checkpoints */}
                <div className="absolute left-[16%] top-[34%] -translate-x-1/2 -translate-y-1/2 flex flex-col items-center">
                  <div className="w-16 h-16 rounded-full bg-white border-4 border-[#2563EB] shadow-lg flex flex-col items-center justify-center">
                    <Compass className="w-5 h-5 text-amber-500" />
                    <span className="text-[10px] font-bold text-[#1E293B]">Topics</span>
                  </div>
                  <div className="w-10 h-3 bg-stone-300 rounded-b-lg -mt-1" />
                </div>

                <div className="absolute left-[24%] top-[74%] -translate-x-1/2 -translate-y-1/2 flex flex-col items-center">
                  <div className="mb-1 px-2.5 py-0.5 rounded bg-white text-emerald-600 font-bold text-[10px] shadow">
                    Start
                  </div>
                  <div className="w-16 h-16 rounded-full bg-white border-4 border-[#2563EB] shadow-lg flex flex-col items-center justify-center">
                    <BookOpen className="w-5 h-5 text-[#2563EB]" />
                    <span className="text-[10px] font-bold text-[#1E293B]">Explain</span>
                  </div>
                  <div className="w-12 h-4 bg-stone-400 rounded-b-lg -mt-1" />
                </div>

                <div className="absolute left-[46%] top-[46%] -translate-x-1/2 -translate-y-1/2 flex flex-col items-center">
                  <div className="w-16 h-16 rounded-full bg-[#64748B]/90 border-2 border-white shadow-lg flex flex-col items-center justify-center">
                    <Lock className="w-4 h-4 text-slate-900" />
                    <span className="text-[10px] font-bold text-slate-900 mt-0.5">Revision</span>
                  </div>
                  <div className="w-10 h-3 bg-stone-300 rounded-b-lg -mt-1" />
                </div>

                <div className="absolute left-[66%] top-[68%] -translate-x-1/2 -translate-y-1/2 flex flex-col items-center">
                  <div className="w-16 h-16 rounded-full bg-[#64748B]/90 border-2 border-white shadow-lg flex flex-col items-center justify-center">
                    <Lock className="w-4 h-4 text-slate-900" />
                    <span className="text-[10px] font-bold text-slate-900 mt-0.5">Mind Map</span>
                  </div>
                  <div className="w-10 h-3 bg-stone-300 rounded-b-lg -mt-1" />
                </div>

                <div className="absolute left-[80%] top-[42%] -translate-x-1/2 -translate-y-1/2 flex flex-col items-center">
                  <div className="w-16 h-16 rounded-full bg-[#64748B]/90 border-2 border-white shadow-lg flex flex-col items-center justify-center">
                    <Lock className="w-4 h-4 text-slate-900" />
                    <span className="text-[10px] font-bold text-slate-900 mt-0.5">Test</span>
                  </div>
                  <div className="w-10 h-3 bg-stone-300 rounded-b-lg -mt-1" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-16 px-6 bg-white">
        <div className="max-w-7xl mx-auto space-y-10">
          <h2 className="text-2xl sm:text-3xl font-bold text-[#1E293B]">
            How It Works
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 rounded-3xl bg-[#F3F5F9] space-y-3">
              <div className="w-11 h-11 rounded-2xl bg-[#2563EB] text-white flex items-center justify-center">
                <Upload className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-[#1E293B]">
                1. Upload Study Material
              </h3>
              <p className="text-sm text-[#64748B]">
                Upload a PDF, notes, or type any topic you want to learn.
              </p>
            </div>

            <div className="p-6 rounded-3xl bg-[#F3F5F9] space-y-3">
              <div className="w-11 h-11 rounded-2xl bg-[#3B82F6] text-white flex items-center justify-center">
                <Sparkles className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-[#1E293B]">
                2. Get Your AI Blueprint
              </h3>
              <p className="text-sm text-[#64748B]">
                AI organizes your chapter into topics, explanations, notes, mind maps, and quizzes.
              </p>
            </div>

            <div className="p-6 rounded-3xl bg-[#F3F5F9] space-y-3">
              <div className="w-11 h-11 rounded-2xl bg-emerald-600 text-white flex items-center justify-center">
                <Map className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-[#1E293B]">
                3. Complete Levels & Master It
              </h3>
              <p className="text-sm text-[#64748B]">
                Clear each stage on your learning journey map to earn XP and unlock badges.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Five Learning Stages Overview */}
      <section id="stages" className="py-16 px-6">
        <div className="max-w-7xl mx-auto space-y-10">
          <h2 className="text-2xl sm:text-3xl font-bold text-[#1E293B]">
            5 Learning Stages
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            {STAGE_METADATA.map((stage) => (
              <div
                key={stage.stage}
                className="bg-white rounded-3xl p-5 border border-slate-100 shadow-xs space-y-3"
              >
                <div className="flex items-center justify-between">
                  <span className="w-9 h-9 rounded-full border-2 border-[#2563EB] bg-blue-50 text-[#2563EB] flex items-center justify-center font-bold text-xs">
                    {stage.stage}
                  </span>
                  <span className="text-xs font-semibold text-[#64748B] tabular-nums">
                    +{stage.xpReward} XP
                  </span>
                </div>
                <h3 className="text-base font-bold text-[#1E293B]">{stage.name}</h3>
                <p className="text-xs text-[#64748B] leading-relaxed">
                  {stage.subtitle}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Gamification & Achievements Showcase */}
      <section id="gamification" className="py-16 px-6 bg-white">
        <div className="max-w-7xl mx-auto space-y-8">
          <h2 className="text-2xl sm:text-3xl font-bold text-[#1E293B]">
            Earn XP & Unlock Badges
          </h2>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {LEVELUP_BADGES.map((badge, idx) => (
              <div
                key={badge.id}
                className="p-5 rounded-3xl bg-[#F3F5F9] flex flex-col items-center text-center space-y-2"
              >
                <div
                  className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${badge.gradient} text-white flex items-center justify-center shadow-sm`}
                >
                  {idx % 4 === 0 ? (
                    <Compass className="w-6 h-6" />
                  ) : idx % 4 === 1 ? (
                    <Zap className="w-6 h-6" />
                  ) : idx % 4 === 2 ? (
                    <Brain className="w-6 h-6" />
                  ) : (
                    <Crown className="w-6 h-6" />
                  )}
                </div>
                <h3 className="text-sm font-bold text-[#1E293B]">{badge.name}</h3>
                <span className="text-xs font-semibold text-[#2563EB] tabular-nums">
                  +{badge.xpReward} XP
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-6 bg-[#F3F5F9] border-t border-slate-200/80">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#64748B]">
          <div>
            <span className="font-bold text-[#1E293B] font-display">LevelUp</span> · Upload. Learn. Level Up.
          </div>
          <div className="flex items-center gap-6">
            <button onClick={onStartLearning} className="hover:text-[#2563EB] cursor-pointer">
              Dashboard
            </button>
            <button onClick={onStartLearning} className="hover:text-[#2563EB] cursor-pointer">
              Upload
            </button>
            <button onClick={onStartLearning} className="hover:text-[#2563EB] cursor-pointer">
              Achievements
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
};
