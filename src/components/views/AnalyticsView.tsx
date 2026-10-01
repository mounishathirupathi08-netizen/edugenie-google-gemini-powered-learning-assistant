import React, { useState, useEffect } from 'react';
import {
  TrendingUp,
  Award,
  CheckCircle2,
  Clock,
  Flame,
  HelpCircle,
  Sparkles,
  BookOpen,
  ArrowUpRight,
  ShieldCheck,
  Target,
  BarChart3,
  RotateCcw,
} from 'lucide-react';
import { LearningAnalytics, SubjectItem, UserProfile } from '../../types';
import { storage } from '../../services/storage';
import { SUBJECTS } from '../../data/subjects';

interface AnalyticsViewProps {
  profile: UserProfile;
  onSelectSubjectAndTab?: (subject: SubjectItem, tab: string) => void;
}

export const AnalyticsView: React.FC<AnalyticsViewProps> = ({
  profile,
  onSelectSubjectAndTab,
}) => {
  const [analytics, setAnalytics] = useState<LearningAnalytics>(storage.getAnalytics());

  useEffect(() => {
    setAnalytics(storage.getAnalytics());
  }, []);

  const handleReset = () => {
    if (confirm('Reset your study statistics and start fresh?')) {
      const resetData = {
        totalQuestionsSolved: 0,
        totalQuizzesCompleted: 0,
        averageScorePercentage: 0,
        streakDays: 1,
        studyHoursLogged: 0,
        subjectMastery: {
          Mathematics: 50,
          'Physics & Engineering': 50,
          'Chemistry & Biology': 50,
          'Computer Science & Coding': 50,
          'History & Social Studies': 50,
          'Literature & Languages': 50,
          'Economics & Business': 50,
          'General Academics': 50,
        },
        recentActivity: [],
      };
      storage.saveAnalytics(resetData);
      setAnalytics(resetData);
    }
  };

  // Find lowest mastery subject for personalized recommendation
  const subjectsArray = Object.entries(analytics.subjectMastery || {});
  subjectsArray.sort((a, b) => a[1] - b[1]);
  const weakestSubjectName = subjectsArray[0]?.[0] || 'Chemistry & Biology';
  const weakestScore = subjectsArray[0]?.[1] || 50;

  const targetSubjectObj =
    SUBJECTS.find((s) => s.name === weakestSubjectName) || SUBJECTS[0];

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-16">
      {/* Header Banner */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 border border-slate-800 shadow-xl relative overflow-hidden">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 mb-2">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>Personalized Learning Analytics</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
              Academic Progress & Mastery Dashboard
            </h1>
            <p className="text-sm text-slate-300 mt-1 max-w-2xl">
              Track your growth across subjects, monitor active streaks, review recent problem
              deconstructions, and target weak areas before exams.
            </p>
          </div>
          <button
            onClick={handleReset}
            className="p-2 text-xs text-slate-400 hover:text-white bg-slate-800/80 hover:bg-slate-700 rounded-xl border border-slate-700 transition-colors flex items-center gap-1.5"
            title="Reset Statistics"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Stats</span>
          </button>
        </div>
      </div>

      {/* 4 Core Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Doubts Solved */}
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-md space-y-2">
          <div className="flex items-center justify-between text-indigo-400">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Doubts Solved</span>
            <HelpCircle className="w-5 h-5" />
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-white">
            {analytics.totalQuestionsSolved}
          </div>
          <p className="text-[11px] text-slate-400">Step-by-step deconstructions</p>
        </div>

        {/* Quizzes Completed */}
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-md space-y-2">
          <div className="flex items-center justify-between text-emerald-400">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Quizzes Taken</span>
            <Award className="w-5 h-5" />
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-white">
            {analytics.totalQuizzesCompleted}
          </div>
          <p className="text-[11px] text-emerald-400 font-semibold">
            Avg Score: {analytics.averageScorePercentage}%
          </p>
        </div>

        {/* Study Streak */}
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-md space-y-2">
          <div className="flex items-center justify-between text-orange-400">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Study Streak</span>
            <Flame className="w-5 h-5" />
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-white">
            {analytics.streakDays} Days
          </div>
          <p className="text-[11px] text-orange-300">Consistent learning momentum</p>
        </div>

        {/* Total Hours */}
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-md space-y-2">
          <div className="flex items-center justify-between text-purple-400">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Study Hours</span>
            <Clock className="w-5 h-5" />
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-white">
            {analytics.studyHoursLogged} hrs
          </div>
          <p className="text-[11px] text-slate-400">Active recall sessions</p>
        </div>
      </div>

      {/* Diagnostic & Targeted Recommendation Card */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-indigo-950/40 via-purple-950/30 to-slate-900 border border-indigo-500/30 shadow-xl space-y-3">
        <div className="flex items-center gap-2 text-indigo-400 text-xs font-bold uppercase tracking-wider">
          <Target className="w-4 h-4" /> EduGenie Targeted Recommendation
        </div>
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-lg font-bold text-white">
              Strengthen {weakestSubjectName} (Current Mastery: {weakestScore}%)
            </h3>
            <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-xl">
              Based on your recent practice sessions, spending 15 minutes reviewing core concepts and
              taking a 5-question diagnostic quiz will boost your overall exam readiness.
            </p>
          </div>
          {onSelectSubjectAndTab && (
            <button
              onClick={() => onSelectSubjectAndTab(targetSubjectObj, 'quiz')}
              className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs shadow-lg shadow-indigo-600/30 transition-all shrink-0"
            >
              <span>Practice Now</span>
              <ArrowUpRight className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Subject Mastery Breakdown */}
      <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl space-y-5">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-indigo-400" />
            Subject Mastery Breakdown
          </h3>
          <span className="text-xs text-slate-400">Target: 90%+ Mastery</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Object.entries(analytics.subjectMastery || {}).map(([subName, score]) => (
            <div
              key={subName}
              className="p-4 rounded-xl bg-slate-800/60 border border-slate-700/60 space-y-2"
            >
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-200">{subName}</span>
                <span
                  className={`font-bold font-mono ${
                    score >= 80 ? 'text-emerald-400' : score >= 60 ? 'text-amber-400' : 'text-rose-400'
                  }`}
                >
                  {score}%
                </span>
              </div>
              <div className="w-full bg-slate-700/60 h-2 rounded-full overflow-hidden">
                <div
                  className={`h-2 rounded-full transition-all duration-500 ${
                    score >= 80
                      ? 'bg-gradient-to-r from-emerald-500 to-teal-400'
                      : score >= 60
                      ? 'bg-gradient-to-r from-amber-500 to-orange-400'
                      : 'bg-gradient-to-r from-rose-500 to-pink-500'
                  }`}
                  style={{ width: `${score}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Learning Activity Feed */}
      <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl space-y-4">
        <h3 className="text-base font-bold text-white flex items-center gap-2">
          <Clock className="w-4 h-4 text-purple-400" />
          Recent Learning Sessions
        </h3>

        {analytics.recentActivity && analytics.recentActivity.length > 0 ? (
          <div className="space-y-2.5">
            {analytics.recentActivity.map((act) => (
              <div
                key={act.id}
                className="flex items-center justify-between p-3.5 rounded-xl bg-slate-800/60 border border-slate-700/60 text-xs text-slate-300"
              >
                <div className="flex items-center gap-3">
                  <div className="w-7 h-7 rounded-lg bg-slate-900 border border-slate-700 flex items-center justify-center text-xs">
                    {act.type === 'quiz' && '🎯'}
                    {act.type === 'doubt' && '🔍'}
                    {act.type === 'notes' && '📝'}
                    {act.type === 'summary' && '⚡'}
                    {act.type === 'plan' && '📅'}
                  </div>
                  <div>
                    <div className="font-semibold text-white">{act.title}</div>
                    <div className="text-[11px] text-slate-400">
                      {new Date(act.timestamp).toLocaleDateString()} at{' '}
                      {new Date(act.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                </div>

                {act.scoreOrBadge && (
                  <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-indigo-500/15 border border-indigo-500/30 text-indigo-300">
                    {act.scoreOrBadge}
                  </span>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-xs text-slate-500">
            No activities recorded yet. Start by asking a question or taking a quiz!
          </div>
        )}
      </div>
    </div>
  );
};
