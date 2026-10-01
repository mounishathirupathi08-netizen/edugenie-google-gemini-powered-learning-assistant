import React from 'react';
import {
  Sparkles,
  Flame,
  Settings,
  GraduationCap,
  Globe,
  HelpCircle,
} from 'lucide-react';
import { Language, SubjectItem, UserProfile } from '../types';
import { SUBJECTS } from '../data/subjects';

interface HeaderProps {
  profile: UserProfile;
  activeSubject: SubjectItem;
  onSelectSubject: (subject: SubjectItem) => void;
  onOpenProfile: () => void;
  streakDays: number;
  onToggleRole: () => void;
  onChangeLanguage: (lang: Language) => void;
}

export const Header: React.FC<HeaderProps> = ({
  profile,
  activeSubject,
  onSelectSubject,
  onOpenProfile,
  streakDays,
  onToggleRole,
  onChangeLanguage,
}) => {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-800/80 bg-slate-900/90 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-3">
          {/* Logo & Brand */}
          <div className="flex items-center gap-3">
            <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-500 via-purple-500 to-pink-500 shadow-md shadow-indigo-500/25">
              <Sparkles className="w-5 h-5 text-white animate-pulse" />
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-400 border-2 border-slate-900 rounded-full" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-lg sm:text-xl tracking-tight bg-gradient-to-r from-white via-indigo-100 to-indigo-300 bg-clip-text text-transparent">
                  EduGenie
                </span>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  <Sparkles className="w-2.5 h-2.5" />
                  Gemini 3.8
                </span>
              </div>
              <p className="text-[11px] text-slate-400 hidden sm:block">
                Google Gemini Powered Learning Assistant
              </p>
            </div>
          </div>

          {/* Center: Subject Dropdown Selector */}
          <div className="hidden md:flex items-center gap-2">
            <label className="text-xs font-medium text-slate-400">Subject:</label>
            <div className="relative">
              <select
                value={activeSubject.id}
                onChange={(e) => {
                  const found = SUBJECTS.find((s) => s.id === e.target.value);
                  if (found) onSelectSubject(found);
                }}
                className="appearance-none pl-3 pr-8 py-1.5 text-xs font-semibold rounded-xl bg-slate-800 border border-slate-700 text-indigo-200 hover:border-slate-600 focus:outline-none focus:ring-1 focus:ring-indigo-500 cursor-pointer"
              >
                {SUBJECTS.map((s) => (
                  <option key={s.id} value={s.id} className="bg-slate-900 text-slate-200">
                    {s.name}
                  </option>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-slate-400">
                <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 20 20">
                  <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
                </svg>
              </div>
            </div>
          </div>

          {/* Right Controls: Role, Language, Streak, Profile */}
          <div className="flex items-center gap-2.5">
            {/* Role Switcher Badge */}
            <button
              onClick={onToggleRole}
              title={`Switch between Student and Teacher Mode (Current: ${profile.role})`}
              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-medium border transition-all ${
                profile.role === 'teacher'
                  ? 'bg-amber-500/15 border-amber-500/40 text-amber-300 hover:bg-amber-500/25'
                  : 'bg-indigo-500/15 border-indigo-500/40 text-indigo-300 hover:bg-indigo-500/25'
              }`}
            >
              <span>{profile.role === 'teacher' ? '👩‍🏫 Teacher' : '🎓 Student'}</span>
            </button>

            {/* Streak Badge */}
            <div
              className="hidden lg:inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-orange-500/10 border border-orange-500/30 text-orange-400 text-xs font-semibold"
              title={`${streakDays} Day Study Streak`}
            >
              <Flame className="w-3.5 h-3.5 fill-orange-400" />
              <span>{streakDays}d streak</span>
            </div>

            {/* Language Selector */}
            <div className="relative hidden sm:flex items-center">
              <Globe className="w-3.5 h-3.5 text-slate-400 absolute left-2 pointer-events-none" />
              <select
                value={profile.preferredLanguage}
                onChange={(e) => onChangeLanguage(e.target.value as Language)}
                className="appearance-none pl-7 pr-7 py-1 text-xs font-medium rounded-xl bg-slate-800/80 border border-slate-700/80 text-slate-300 hover:text-white focus:outline-none cursor-pointer"
              >
                {(['English', 'Spanish', 'French', 'German', 'Hindi', 'Mandarin', 'Japanese', 'Portuguese', 'Arabic'] as Language[]).map(
                  (lang) => (
                    <option key={lang} value={lang} className="bg-slate-900 text-white">
                      {lang}
                    </option>
                  )
                )}
              </select>
            </div>

            {/* Profile Settings Button */}
            <button
              onClick={onOpenProfile}
              className="flex items-center gap-2 p-1.5 pl-2.5 rounded-xl bg-slate-800 hover:bg-slate-700/80 border border-slate-700 text-slate-200 transition-colors"
              title="Learner Profile & Preferences"
            >
              <div className="w-6 h-6 rounded-lg bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center text-white text-xs font-bold">
                {profile.name.charAt(0) || 'A'}
              </div>
              <span className="text-xs font-semibold max-w-[85px] truncate hidden sm:inline-block">
                {profile.name}
              </span>
              <Settings className="w-3.5 h-3.5 text-slate-400" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
