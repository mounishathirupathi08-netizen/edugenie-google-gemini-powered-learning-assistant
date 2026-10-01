import React from 'react';
import {
  MessageSquare,
  HelpCircle,
  Lightbulb,
  Compass,
  Trophy,
  FileText,
  BookOpen,
  Calendar,
  GraduationCap,
  BarChart3,
} from 'lucide-react';
import { UserRole } from '../types';

export type TabKey =
  | 'chat'
  | 'explain'
  | 'doubt'
  | 'roadmap'
  | 'quiz'
  | 'summary'
  | 'notes'
  | 'planner'
  | 'teacher'
  | 'analytics';

interface NavigationProps {
  activeTab: TabKey;
  onTabChange: (tab: TabKey) => void;
  role: UserRole;
}

export const Navigation: React.FC<NavigationProps> = ({
  activeTab,
  onTabChange,
  role,
}) => {
  const tabs: { key: TabKey; label: string; icon: React.ReactNode; badge?: string }[] = [
    { key: 'chat', label: 'AI Q&A Tutor', icon: <MessageSquare className="w-4 h-4" /> },
    { key: 'explain', label: 'Topic Explainer', icon: <Lightbulb className="w-4 h-4" /> },
    { key: 'doubt', label: 'Doubt Solver', icon: <HelpCircle className="w-4 h-4" /> },
    { key: 'roadmap', label: 'Learning Path', icon: <Compass className="w-4 h-4" /> },
    { key: 'quiz', label: 'Quizzes & Practice', icon: <Trophy className="w-4 h-4" /> },
    { key: 'summary', label: 'Text Summarizer', icon: <FileText className="w-4 h-4" /> },
    { key: 'notes', label: 'Study Notes & Cards', icon: <BookOpen className="w-4 h-4" /> },
    { key: 'planner', label: 'Study Planner', icon: <Calendar className="w-4 h-4" /> },
    {
      key: 'teacher',
      label: 'Teacher Toolkit',
      icon: <GraduationCap className="w-4 h-4" />,
      badge: role === 'teacher' ? 'Active' : undefined,
    },
    { key: 'analytics', label: 'Progress & Mastery', icon: <BarChart3 className="w-4 h-4" /> },
  ];

  return (
    <div className="w-full border-b border-slate-800 bg-slate-900/60 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <nav className="flex items-center gap-1.5 overflow-x-auto py-2.5 scrollbar-none">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.key;
            return (
              <button
                key={tab.key}
                onClick={() => onTabChange(tab.key)}
                className={`relative flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all whitespace-nowrap shrink-0 ${
                  isActive
                    ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-600/25 ring-1 ring-indigo-400/40'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/80'
                }`}
              >
                {tab.icon}
                <span>{tab.label}</span>
                {tab.badge && (
                  <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-amber-400 text-slate-950">
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>
    </div>
  );
};
