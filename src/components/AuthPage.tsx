import React, { useState } from 'react';
import {
  Compass,
  Sparkles,
  Mail,
  Lock,
  User,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  Trophy,
  Zap,
  ArrowLeft,
} from 'lucide-react';

interface AuthPageProps {
  onGoogleSignIn: () => Promise<void>;
  onDemoSignIn: (displayName: string, goalSubject: string) => void;
  onBackToLanding: () => void;
  authError: string | null;
  isSigningIn: boolean;
}

export const AuthPage: React.FC<AuthPageProps> = ({
  onGoogleSignIn,
  onDemoSignIn,
  onBackToLanding,
  authError,
  isSigningIn,
}) => {
  const [mode, setMode] = useState<'login' | 'signup' | 'forgot' | 'onboarding'>('signup');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('Science');
  const [resetSent, setResetSent] = useState(false);

  const handleEmailSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (mode === 'forgot') {
      setResetSent(true);
      return;
    }
    setMode('onboarding');
  };

  return (
    <div className="min-h-screen bg-[#F6F5FF] text-[#25243A] flex flex-col justify-between p-6">
      {/* Top Bar */}
      <div className="max-w-6xl w-full mx-auto flex items-center justify-between py-2">
        <button
          onClick={onBackToLanding}
          className="flex items-center gap-2 text-sm font-semibold text-[#25243A]/75 hover:text-[#6546F5] transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Home</span>
        </button>
        <span className="text-lg font-bold font-display text-[#25243A]">LevelUp</span>
      </div>

      {/* Main Split Card */}
      <div className="max-w-5xl w-full mx-auto my-auto grid grid-cols-1 lg:grid-cols-12 bg-white rounded-3xl border border-[#6546F5]/15 shadow-xl overflow-hidden">
        {/* Left Panel */}
        <div className="lg:col-span-5 bg-gradient-to-br from-[#6546F5] via-[#4F68F8] to-[#398BFF] text-white p-8 sm:p-10 flex flex-col justify-between">
          <div className="space-y-6">
            <div className="w-12 h-12 rounded-2xl bg-white/15 backdrop-blur-sm flex items-center justify-center">
              <Compass className="w-6 h-6 text-white" />
            </div>
            <div className="space-y-3">
              <p className="text-xs font-semibold tracking-wider text-[#48D4DC]">
                Upload. Learn. Level Up.
              </p>
              <h1 className="text-2xl sm:text-3xl font-bold leading-tight">
                Your Personal AI Learning Platform.
              </h1>
              <p className="text-sm text-white/85 leading-relaxed">
                Sign in with Google to save your uploaded study blueprints, XP progress, and unlocked badges.
              </p>
            </div>
          </div>

          <div className="my-8 p-5 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15">
            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="p-2.5 rounded-xl bg-white/10">
                <Zap className="w-5 h-5 mx-auto text-amber-300 mb-1" />
                <p className="text-[11px] font-semibold">5 Stages</p>
              </div>
              <div className="p-2.5 rounded-xl bg-white/10">
                <Sparkles className="w-5 h-5 mx-auto text-cyan-300 mb-1" />
                <p className="text-[11px] font-semibold">AI Tutor</p>
              </div>
              <div className="p-2.5 rounded-xl bg-white/10">
                <Trophy className="w-5 h-5 mx-auto text-pink-300 mb-1" />
                <p className="text-[11px] font-semibold">Badges</p>
              </div>
            </div>
          </div>

          <p className="text-xs text-white/75">
            AI blueprints · Mind maps · Practice quizzes
          </p>
        </div>

        {/* Right Form & Onboarding Panel */}
        <div className="lg:col-span-7 p-8 sm:p-10 flex flex-col justify-center">
          {mode === 'onboarding' ? (
            <div className="space-y-6">
              <div className="space-y-2">
                <h2 className="text-2xl font-bold text-[#25243A]">
                  Welcome{name.trim() ? `, ${name.trim()}` : ''}!
                </h2>
                <p className="text-sm text-[#25243A]/70">
                  Set your display name and preferred subject to open your workspace.
                </p>
              </div>

              <div className="space-y-2">
                <label className="block text-xs font-semibold text-[#25243A]/75">
                  Display Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter your name"
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-[#6546F5]"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-xs font-semibold text-[#25243A]/75">
                  Preferred Subject
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                  {['Science', 'Computer Science', 'Mathematics', 'Economics', 'History', 'Literature'].map(
                    (subj) => (
                      <button
                        key={subj}
                        type="button"
                        onClick={() => setSelectedSubject(subj)}
                        className={`px-3.5 py-2.5 rounded-xl text-xs font-semibold border text-left transition-all cursor-pointer ${
                          selectedSubject === subj
                            ? 'bg-[#6546F5] text-white border-[#6546F5]'
                            : 'bg-[#F6F5FF] text-[#25243A] border-transparent hover:border-[#6546F5]/30'
                        }`}
                      >
                        {subj}
                      </button>
                    )
                  )}
                </div>
              </div>

              <div className="pt-2 space-y-3">
                <button
                  type="button"
                  onClick={onGoogleSignIn}
                  disabled={isSigningIn}
                  className="w-full py-3.5 px-5 rounded-xl bg-[#6546F5] hover:bg-[#5234E0] text-white font-semibold text-sm flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer disabled:opacity-60"
                >
                  <span>Connect Google Account</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => onDemoSignIn(name.trim() || 'Learner', selectedSubject)}
                  className="w-full py-3 px-5 rounded-xl bg-[#F6F5FF] hover:bg-[#6546F5]/10 text-[#6546F5] font-semibold text-sm transition-colors cursor-pointer"
                >
                  Continue to Dashboard
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-[#25243A]">
                  {mode === 'signup'
                    ? 'Create Account'
                    : mode === 'login'
                      ? 'Welcome Back'
                      : 'Reset Password'}
                </h2>
              </div>

              {authError && (
                <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-start gap-2.5">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{authError}</span>
                </div>
              )}

              {mode !== 'forgot' && (
                <div className="space-y-3">
                  <button
                    type="button"
                    onClick={onGoogleSignIn}
                    disabled={isSigningIn}
                    className="w-full py-3.5 px-5 rounded-2xl bg-white hover:bg-slate-50 text-[#25243A] border border-slate-200 shadow-sm font-semibold text-sm flex items-center justify-center gap-3 transition-all cursor-pointer disabled:opacity-50"
                  >
                    <svg className="w-5 h-5" viewBox="0 0 24 24">
                      <path
                        fill="#4285F4"
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      />
                      <path
                        fill="#34A853"
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      />
                      <path
                        fill="#FBBC05"
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                      />
                      <path
                        fill="#EA4335"
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                      />
                    </svg>
                    <span>
                      {isSigningIn ? 'Connecting with Google...' : 'Continue with Google'}
                    </span>
                  </button>

                  <div className="flex items-center gap-3 text-xs text-[#25243A]/45">
                    <div className="h-px bg-slate-200 flex-1" />
                    <span>or continue with email</span>
                    <div className="h-px bg-slate-200 flex-1" />
                  </div>
                </div>
              )}

              <form onSubmit={handleEmailSubmit} className="space-y-4">
                {mode === 'signup' && (
                  <div>
                    <label className="block text-xs font-semibold text-[#25243A]/75 mb-1.5">
                      Name
                    </label>
                    <div className="relative">
                      <User className="w-4 h-4 text-[#25243A]/40 absolute left-3.5 top-3.5" />
                      <input
                        type="text"
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Enter your name"
                        className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-[#6546F5]"
                      />
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-xs font-semibold text-[#25243A]/75 mb-1.5">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-[#25243A]/40 absolute left-3.5 top-3.5" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@example.com"
                      className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-[#6546F5]"
                    />
                  </div>
                </div>

                {mode !== 'forgot' && (
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="block text-xs font-semibold text-[#25243A]/75">
                        Password
                      </label>
                      <button
                        type="button"
                        onClick={() => {
                          setMode('forgot');
                          setResetSent(false);
                        }}
                        className="text-xs font-medium text-[#6546F5] hover:underline cursor-pointer"
                      >
                        Forgot password?
                      </button>
                    </div>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-[#25243A]/40 absolute left-3.5 top-3.5" />
                      <input
                        type="password"
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-[#6546F5]"
                      />
                    </div>
                  </div>
                )}

                {mode === 'forgot' && resetSent && (
                  <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 shrink-0" />
                    <span>
                      Recovery instructions prepared for {email || 'your account'}.
                    </span>
                  </div>
                )}

                <button
                  type="submit"
                  className="w-full py-3.5 px-5 rounded-2xl bg-gradient-to-r from-[#6546F5] to-[#398BFF] hover:opacity-95 text-white font-semibold text-sm flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer"
                >
                  <span>
                    {mode === 'signup'
                      ? 'Continue'
                      : mode === 'login'
                        ? 'Sign In'
                        : 'Send Reset Link'}
                  </span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>

              <div className="pt-2 flex items-center justify-between text-xs text-[#25243A]/70 border-t border-slate-100">
                {mode === 'signup' ? (
                  <span>
                    Already have an account?{' '}
                    <button
                      type="button"
                      onClick={() => setMode('login')}
                      className="font-semibold text-[#6546F5] hover:underline cursor-pointer"
                    >
                      Log In
                    </button>
                  </span>
                ) : (
                  <span>
                    New to LevelUp?{' '}
                    <button
                      type="button"
                      onClick={() => setMode('signup')}
                      className="font-semibold text-[#6546F5] hover:underline cursor-pointer"
                    >
                      Sign Up
                    </button>
                  </span>
                )}

                <button
                  type="button"
                  onClick={() => onDemoSignIn(name.trim() || 'Learner', selectedSubject)}
                  className="font-semibold text-[#398BFF] hover:underline cursor-pointer"
                >
                  Continue as Guest →
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="text-center text-xs text-[#25243A]/50">
        LevelUp · Upload. Learn. Level Up.
      </div>
    </div>
  );
};
