import React, { useState, useEffect } from 'react';
import {
  Calendar,
  Sparkles,
  Clock,
  CheckCircle2,
  BookmarkCheck,
  Target,
  Zap,
  Loader2,
  CalendarDays,
  ShieldAlert,
  Flame,
} from 'lucide-react';
import { StudyPlan, SubjectItem, UserProfile } from '../../types';
import { api } from '../../services/api';
import { storage } from '../../services/storage';

interface StudyPlannerViewProps {
  profile: UserProfile;
  activeSubject: SubjectItem;
}

export const StudyPlannerView: React.FC<StudyPlannerViewProps> = ({
  profile,
  activeSubject,
}) => {
  const [goal, setGoal] = useState(profile.targetExam || 'Ace Finals and AP Exams');
  const [daysAvailable, setDaysAvailable] = useState(14);
  const [hoursPerDay, setHoursPerDay] = useState(2);
  const [currentLevel, setCurrentLevel] = useState('Intermediate');
  const [examDate, setExamDate] = useState('');
  const [loading, setLoading] = useState(false);
  const [plan, setPlan] = useState<StudyPlan | null>(null);
  const [completedDays, setCompletedDays] = useState<Record<number, boolean>>({});

  useEffect(() => {
    const saved = storage.getSavedPlan();
    if (saved) {
      setPlan(saved);
      const checks: Record<number, boolean> = {};
      saved.dailySchedule?.forEach((d) => {
        if (d.completed) checks[d.day] = true;
      });
      setCompletedDays(checks);
    }
  }, []);

  const handleGeneratePlan = async () => {
    if (!goal.trim()) return;
    setLoading(true);

    try {
      const res = await api.generateStudyPlan({
        goal,
        subjects: [activeSubject.name, 'Core Mathematics', 'Science Review'],
        daysAvailable,
        hoursPerDay,
        currentLevel,
        examDate,
        language: profile.preferredLanguage,
      });

      setPlan(res);
      setCompletedDays({});
      storage.savePlan(res);
      storage.recordActivity('plan', res.planTitle, `${daysAvailable} Days Plan`, activeSubject.name);
    } catch (err: any) {
      alert(err.message || 'Failed to generate study plan');
    } finally {
      setLoading(false);
    }
  };

  const toggleDayCompletion = (dayNum: number) => {
    const updated = { ...completedDays, [dayNum]: !completedDays[dayNum] };
    setCompletedDays(updated);

    if (plan) {
      const updatedPlan: StudyPlan = {
        ...plan,
        dailySchedule: plan.dailySchedule.map((d) =>
          d.day === dayNum ? { ...d, completed: updated[dayNum] } : d
        ),
      };
      setPlan(updatedPlan);
      storage.savePlan(updatedPlan);
    }
  };

  const totalDays = plan?.dailySchedule?.length || 0;
  const completedCount = Object.values(completedDays).filter(Boolean).length;
  const progressPercent = totalDays > 0 ? Math.round((completedCount / totalDays) * 100) : 0;

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-16">
      {/* Header Banner */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 border border-slate-800 shadow-xl relative overflow-hidden">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 mb-2">
              <Calendar className="w-3.5 h-3.5" />
              <span>Science-Backed Academic Study Planner</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
              Personalized Timetable & Spaced Repetition
            </h1>
            <p className="text-sm text-slate-300 mt-1 max-w-2xl">
              Turn overwhelm into consistent momentum. EduGenie builds realistic daily schedules
              structured around cognitive science: active recall intervals, phase-based mastery,
              and daily milestones.
            </p>
          </div>
          {plan && (
            <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-800/90 border border-slate-700">
              <div className="text-right">
                <div className="text-xs text-slate-400">Roadmap Progress</div>
                <div className="text-base font-bold text-emerald-400">{progressPercent}% Completed</div>
              </div>
              <div className="w-10 h-10 rounded-full border-2 border-emerald-500 flex items-center justify-center font-bold text-xs text-white">
                {completedCount}/{totalDays}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Generator Form */}
      <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-lg space-y-5">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
              Goal or Exam Title
            </label>
            <input
              type="text"
              value={goal}
              onChange={(e) => setGoal(e.target.value)}
              placeholder="e.g. AP Calculus & Physics Exam, SAT Prep, College Finals..."
              className="w-full px-4 py-2.5 rounded-xl bg-slate-800/90 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
              Target Exam Date (Optional)
            </label>
            <input
              type="date"
              value={examDate}
              onChange={(e) => setExamDate(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-slate-800/90 border border-slate-700 text-white focus:outline-none focus:border-indigo-500 text-sm"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
              Days Available
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[7, 14, 30].map((d) => (
                <button
                  key={d}
                  type="button"
                  onClick={() => setDaysAvailable(d)}
                  className={`py-2 text-xs font-semibold rounded-xl border transition-all ${
                    daysAvailable === d
                      ? 'bg-indigo-500/20 border-indigo-500 text-indigo-300'
                      : 'bg-slate-800 border-slate-700 text-slate-300'
                  }`}
                >
                  {d} Days
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
              Daily Study Budget
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[1, 2, 4].map((h) => (
                <button
                  key={h}
                  type="button"
                  onClick={() => setHoursPerDay(h)}
                  className={`py-2 text-xs font-semibold rounded-xl border transition-all ${
                    hoursPerDay === h
                      ? 'bg-indigo-500/20 border-indigo-500 text-indigo-300'
                      : 'bg-slate-800 border-slate-700 text-slate-300'
                  }`}
                >
                  {h} hr/day
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
              Current Readiness
            </label>
            <select
              value={currentLevel}
              onChange={(e) => setCurrentLevel(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs focus:outline-none"
            >
              <option value="Beginner (Starting from scratch)">Beginner (Starting from scratch)</option>
              <option value="Intermediate (Covered theory, need practice)">Intermediate (Need practice)</option>
              <option value="Advanced (Final polish & mock exams)">Advanced (Final polish & mocks)</option>
            </select>
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <button
            onClick={handleGeneratePlan}
            disabled={!goal.trim() || loading}
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-600 hover:from-indigo-500 hover:to-purple-500 disabled:opacity-40 text-white font-semibold text-xs shadow-lg shadow-indigo-600/30 transition-all active:scale-95"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Designing Custom Schedule...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>Generate Study Plan</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Plan Output */}
      {plan && (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
          {/* Header Card */}
          <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                {plan.totalStudyHours} Total Hours Budgeted
              </span>
              <span className="text-xs text-slate-400">Target: {plan.goal}</span>
            </div>

            <h2 className="text-xl sm:text-2xl font-bold text-white">
              {plan.planTitle}
            </h2>

            <p className="text-sm text-slate-300 leading-relaxed font-sans">
              {plan.strategyOverview}
            </p>

            {/* Strategic Phases */}
            {plan.phases?.length > 0 && (
              <div className="pt-2">
                <div className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
                  Preparation Phases
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {plan.phases.map((ph, i) => (
                    <div
                      key={i}
                      className="p-4 rounded-xl bg-slate-800/70 border border-slate-700/80 space-y-1.5"
                    >
                      <div className="font-bold text-xs text-indigo-300">{ph.phaseName}</div>
                      <div className="text-[11px] text-slate-400 font-mono">{ph.durationDays}</div>
                      <p className="text-xs text-slate-300">{ph.focus}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Daily Schedule Timeline */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <CalendarDays className="w-4 h-4 text-indigo-400" />
                Day-by-Day Milestone Roadmap
              </h3>
              <span className="text-xs text-slate-400">Check off items as you finish</span>
            </div>

            <div className="space-y-3">
              {plan.dailySchedule?.map((day) => {
                const isDone = !!completedDays[day.day];
                return (
                  <div
                    key={day.day}
                    onClick={() => toggleDayCompletion(day.day)}
                    className={`cursor-pointer p-5 rounded-2xl border transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 ${
                      isDone
                        ? 'bg-emerald-950/20 border-emerald-500/40 text-slate-300'
                        : 'bg-slate-900 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-start gap-4">
                      {/* Checkbox circle */}
                      <button
                        type="button"
                        className={`w-6 h-6 rounded-lg border flex items-center justify-center shrink-0 mt-0.5 transition-colors ${
                          isDone
                            ? 'bg-emerald-500 border-emerald-500 text-slate-950'
                            : 'border-slate-600 bg-slate-800 hover:border-indigo-400'
                        }`}
                      >
                        {isDone && <CheckCircle2 className="w-4 h-4" />}
                      </button>

                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-sm text-white">Day {day.day}:</span>
                          <span className="text-xs px-2 py-0.5 rounded-md bg-indigo-500/15 text-indigo-300 font-semibold border border-indigo-500/30">
                            {day.focusSubject}
                          </span>
                          <span className="text-xs text-slate-400">• {day.durationHours} hrs</span>
                        </div>

                        <div className="text-xs text-slate-300 font-sans">
                          <strong>Topics:</strong> {day.topics?.join(', ')}
                        </div>

                        <div className="text-xs text-amber-300/90 flex items-center gap-1.5 pt-0.5">
                          <Zap className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                          <span><strong>Active Recall:</strong> {day.activeRecallActivity}</span>
                        </div>
                      </div>
                    </div>

                    <div className="text-right sm:shrink-0 text-xs text-slate-400 font-mono">
                      Milestone: {day.milestone}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Science-Backed Habits & Tips */}
          {plan.habitsAndTips?.length > 0 && (
            <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-md space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <Flame className="w-4 h-4 text-orange-400" />
                Cognitive Science Study Habits
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {plan.habitsAndTips.map((tip, i) => (
                  <div
                    key={i}
                    className="p-3.5 rounded-xl bg-slate-800/60 border border-slate-700/60 text-xs text-slate-300"
                  >
                    💡 {tip}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
