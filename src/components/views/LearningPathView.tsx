import React, { useState, useEffect } from 'react';
import {
  Map,
  Sparkles,
  CheckCircle2,
  Clock,
  ArrowRight,
  BookOpen,
  Trophy,
  Loader2,
  Calendar,
  Layers,
  ChevronRight,
  Compass,
} from 'lucide-react';
import { LearningPath, SubjectItem, UserProfile } from '../../types';
import { api } from '../../services/api';
import { storage } from '../../services/storage';

interface LearningPathViewProps {
  profile: UserProfile;
  activeSubject: SubjectItem;
  onStartModuleStudy?: (topic: string) => void;
}

const STORAGE_ROADMAP_KEY = 'edugenie_saved_roadmap';

export const LearningPathView: React.FC<LearningPathViewProps> = ({
  profile,
  activeSubject,
  onStartModuleStudy,
}) => {
  const [goal, setGoal] = useState(
    profile.targetExam ? `Master ${profile.targetExam}` : `Complete ${activeSubject.name} Curriculum`
  );
  const [currentLevel, setCurrentLevel] = useState('Beginner');
  const [durationWeeks, setDurationWeeks] = useState(6);
  const [hoursPerWeek, setHoursPerWeek] = useState(5);
  const [loading, setLoading] = useState(false);
  const [roadmap, setRoadmap] = useState<LearningPath | null>(null);
  const [completedModules, setCompletedModules] = useState<Record<string, boolean>>({});

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_ROADMAP_KEY);
      if (saved) {
        const parsed: LearningPath = JSON.parse(saved);
        setRoadmap(parsed);
        const checks: Record<string, boolean> = {};
        parsed.phases.forEach((p) => {
          p.modules.forEach((m) => {
            if (m.completed) checks[m.id] = true;
          });
        });
        setCompletedModules(checks);
      }
    } catch (e) {
      console.error(e);
    }
  }, []);

  const handleGenerateRoadmap = async () => {
    if (!goal.trim()) return;
    setLoading(true);

    try {
      const res = await api.generateLearningPath({
        goal,
        subject: activeSubject.name,
        currentLevel,
        durationWeeks,
        hoursPerWeek,
        language: profile.preferredLanguage,
      });

      setRoadmap(res);
      setCompletedModules({});
      localStorage.setItem(STORAGE_ROADMAP_KEY, JSON.stringify(res));
      storage.recordActivity('roadmap', res.title, `${res.totalWeeks} Weeks`, activeSubject.name);
    } catch (err: any) {
      alert(err.message || 'Failed to generate learning roadmap');
    } finally {
      setLoading(false);
    }
  };

  const toggleModuleCompletion = (modId: string) => {
    const updated = { ...completedModules, [modId]: !completedModules[modId] };
    setCompletedModules(updated);

    if (roadmap) {
      const updatedRoadmap: LearningPath = {
        ...roadmap,
        phases: roadmap.phases.map((ph) => ({
          ...ph,
          modules: ph.modules.map((m) =>
            m.id === modId ? { ...m, completed: updated[modId] } : m
          ),
        })),
      };
      setRoadmap(updatedRoadmap);
      localStorage.setItem(STORAGE_ROADMAP_KEY, JSON.stringify(updatedRoadmap));
    }
  };

  // Calculate statistics
  let totalModules = 0;
  let finishedModules = 0;
  roadmap?.phases.forEach((p) => {
    p.modules.forEach((m) => {
      totalModules += 1;
      if (completedModules[m.id]) finishedModules += 1;
    });
  });
  const progressPercent = totalModules > 0 ? Math.round((finishedModules / totalModules) * 100) : 0;

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-16">
      {/* Header Banner */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-slate-900 via-blue-950/40 to-slate-900 border border-slate-800 shadow-xl relative overflow-hidden">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-blue-500/20 text-blue-300 border border-blue-500/30 mb-2">
              <Compass className="w-3.5 h-3.5" />
              <span>Personalized Learning Path & Topic Roadmap</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
              Structured Curriculum & Topic Organizer
            </h1>
            <p className="text-sm text-slate-300 mt-1 max-w-2xl">
              Organize complex subjects into a progressive, stage-by-stage learning roadmap.
              Track prerequisites, complete hands-on milestones, and master topics step-by-step.
            </p>
          </div>

          {roadmap && (
            <div className="flex items-center gap-3 p-3.5 rounded-xl bg-slate-800/90 border border-slate-700">
              <div className="text-right">
                <div className="text-xs text-slate-400">Roadmap Progress</div>
                <div className="text-base font-bold text-blue-400">{progressPercent}% Mastered</div>
              </div>
              <div className="w-10 h-10 rounded-full border-2 border-blue-500 flex items-center justify-center font-bold text-xs text-white">
                {finishedModules}/{totalModules}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Generator Card */}
      <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-lg space-y-5">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
              Target Goal or Subject Curriculum
            </label>
            <input
              type="text"
              value={goal}
              onChange={(e) => setGoal(e.target.value)}
              placeholder="e.g. Master Calculus from Scratch, Full Stack Web Dev, Organic Chemistry..."
              className="w-full px-4 py-2.5 rounded-xl bg-slate-800/90 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
              Current Knowledge Level
            </label>
            <select
              value={currentLevel}
              onChange={(e) => setCurrentLevel(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl bg-slate-800/90 border border-slate-700 text-white text-xs focus:outline-none"
            >
              <option value="Complete Beginner">Complete Beginner (Zero background)</option>
              <option value="Intermediate">Intermediate (Know fundamentals, need structure)</option>
              <option value="Advanced / Exam Sprint">Advanced / Exam Sprint (High-yield focus)</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
              Target Duration
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[4, 6, 12].map((w) => (
                <button
                  key={w}
                  type="button"
                  onClick={() => setDurationWeeks(w)}
                  className={`py-2 text-xs font-semibold rounded-xl border transition-all ${
                    durationWeeks === w
                      ? 'bg-blue-500/20 border-blue-500 text-blue-300'
                      : 'bg-slate-800 border-slate-700 text-slate-300'
                  }`}
                >
                  {w} Weeks
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
              Weekly Study Budget
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[3, 5, 10].map((h) => (
                <button
                  key={h}
                  type="button"
                  onClick={() => setHoursPerWeek(h)}
                  className={`py-2 text-xs font-semibold rounded-xl border transition-all ${
                    hoursPerWeek === h
                      ? 'bg-blue-500/20 border-blue-500 text-blue-300'
                      : 'bg-slate-800 border-slate-700 text-slate-300'
                  }`}
                >
                  {h} hrs/week
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <button
            onClick={handleGenerateRoadmap}
            disabled={!goal.trim() || loading}
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-600 hover:from-blue-500 hover:to-indigo-500 disabled:opacity-40 text-white font-semibold text-xs shadow-lg shadow-blue-600/30 transition-all active:scale-95"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Architecting Learning Roadmap...</span>
              </>
            ) : (
              <>
                <Map className="w-4 h-4" />
                <span>Generate Learning Path</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Generated Roadmap Display */}
      {roadmap && (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
          {/* Overview Card */}
          <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-blue-500/20 text-blue-300 border border-blue-500/30">
                {roadmap.totalWeeks} Weeks • ~{roadmap.totalHours} Hours Total
              </span>
              <span className="text-xs text-slate-400">Target: {roadmap.targetGoal}</span>
            </div>

            <h2 className="text-xl sm:text-2xl font-bold text-white">{roadmap.title}</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              <div className="p-4 rounded-xl bg-slate-800/60 border border-slate-700/60 text-xs text-slate-300 space-y-1">
                <span className="font-bold text-blue-300 block">🚀 Career & Academic Impact:</span>
                <p>{roadmap.careerOrAcademicImpact}</p>
              </div>

              <div className="p-4 rounded-xl bg-slate-800/60 border border-slate-700/60 text-xs text-slate-300 space-y-1">
                <span className="font-bold text-amber-300 block">💡 Mentor Strategy:</span>
                <p>{roadmap.mentorAdvice}</p>
              </div>
            </div>
          </div>

          {/* Sequential Phases & Modules */}
          <div className="space-y-6">
            {roadmap.phases.map((phase) => (
              <div
                key={phase.phaseNumber}
                className="p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-md space-y-4"
              >
                {/* Phase Header */}
                <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-800">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-blue-600/20 text-blue-400 border border-blue-500/40 flex items-center justify-center font-bold text-xs">
                      P{phase.phaseNumber}
                    </div>
                    <div>
                      <h3 className="font-bold text-base text-white">{phase.phaseTitle}</h3>
                      <p className="text-xs text-slate-400">{phase.description}</p>
                    </div>
                  </div>
                  <span className="text-xs font-mono text-slate-400">
                    Est. {phase.estimatedWeeks} Weeks
                  </span>
                </div>

                {/* Useful Phase Resources */}
                {phase.usefulResources && phase.usefulResources.length > 0 && (
                  <div className="p-3.5 rounded-xl bg-blue-950/30 border border-blue-800/40 text-xs space-y-2">
                    <span className="font-semibold text-blue-300 uppercase tracking-wider text-[11px] block">
                      📚 Curated Learning Resources for this Phase:
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {phase.usefulResources.map((res, idx) => (
                        <div key={idx} className="p-2.5 rounded-lg bg-slate-900/80 border border-slate-800">
                          <div className="flex items-center justify-between font-semibold text-white mb-0.5">
                            <span>{res.name}</span>
                            <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-300">
                              {res.type}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-300">{res.description}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Modules Grid */}
                <div className="space-y-3">
                  {phase.modules.map((mod) => {
                    const isCompleted = !!completedModules[mod.id];
                    return (
                      <div
                        key={mod.id}
                        className={`p-4 rounded-xl border transition-all ${
                          isCompleted
                            ? 'bg-emerald-950/20 border-emerald-500/40'
                            : 'bg-slate-800/70 border-slate-700 hover:border-slate-600'
                        }`}
                      >
                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                          <div className="flex items-start gap-3">
                            <button
                              type="button"
                              onClick={() => toggleModuleCompletion(mod.id)}
                              className={`w-5 h-5 rounded-md border flex items-center justify-center shrink-0 mt-0.5 transition-colors ${
                                isCompleted
                                  ? 'bg-emerald-500 border-emerald-500 text-slate-950'
                                  : 'border-slate-600 bg-slate-900 hover:border-blue-400'
                              }`}
                            >
                              {isCompleted && <CheckCircle2 className="w-3.5 h-3.5" />}
                            </button>

                            <div>
                              <div className="flex items-center gap-2">
                                <h4
                                  className={`font-bold text-sm ${
                                    isCompleted ? 'line-through text-slate-400' : 'text-white'
                                  }`}
                                >
                                  {mod.title}
                                </h4>
                                <span className="text-[11px] text-slate-400">
                                  (~{mod.estimatedHours} hrs)
                                </span>
                              </div>
                              <p className="text-xs text-slate-300 mt-0.5 font-sans">
                                {mod.description}
                              </p>
                            </div>
                          </div>

                          {/* Action Button */}
                          {onStartModuleStudy && (
                            <button
                              type="button"
                              onClick={() => onStartModuleStudy(mod.title)}
                              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 border border-blue-500/30 text-xs font-semibold transition-colors shrink-0"
                            >
                              <span>Study with AI</span>
                              <ArrowRight className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>

                        {/* Topics and Hands-on Task */}
                        <div className="mt-3 pt-3 border-t border-slate-700/60 grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                          <div>
                            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                              Key Topics:
                            </span>
                            <div className="flex flex-wrap gap-1">
                              {mod.keyTopics.map((kt, idx) => (
                                <span
                                  key={idx}
                                  className="px-2 py-0.5 rounded bg-slate-900 border border-slate-700 text-slate-300 text-[11px]"
                                >
                                  {kt}
                                </span>
                              ))}
                            </div>
                          </div>

                          <div>
                            <span className="text-[11px] font-semibold text-emerald-400 uppercase tracking-wider block mb-1">
                              Hands-On Task:
                            </span>
                            <p className="text-slate-300 text-xs font-sans">{mod.handsOnTask}</p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          {/* Overarching Recommended Resources & Study Tools */}
          {roadmap.recommendedResources && roadmap.recommendedResources.length > 0 && (
            <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-md space-y-4">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-blue-400" />
                Curated Learning Tools & Recommended Materials
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {roadmap.recommendedResources.map((item, idx) => (
                  <div
                    key={idx}
                    className="p-4 rounded-xl bg-slate-800/60 border border-slate-700/60 space-y-1.5"
                  >
                    <span className="text-[10px] font-bold uppercase tracking-wider text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded-full inline-block">
                      {item.category}
                    </span>
                    <h4 className="font-bold text-xs text-white">{item.title}</h4>
                    <p className="text-xs text-slate-300 font-sans leading-relaxed">
                      {item.description}
                    </p>
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
