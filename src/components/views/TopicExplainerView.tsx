import React, { useState } from 'react';
import {
  Sparkles,
  HelpCircle,
  Lightbulb,
  BookOpen,
  ArrowRight,
  AlertTriangle,
  CheckCircle2,
  Loader2,
  Smile,
  GraduationCap,
  Microscope,
  Baby,
  Trophy,
} from 'lucide-react';
import { SubjectItem, TopicExplanation, UserProfile } from '../../types';
import { api } from '../../services/api';
import { storage } from '../../services/storage';
import { AudioPlayerButton } from '../AudioPlayerButton';

interface TopicExplainerViewProps {
  profile: UserProfile;
  activeSubject: SubjectItem;
  onNavigateToQuiz?: (topic: string) => void;
  onNavigateToDoubt?: (question: string) => void;
}

export const TopicExplainerView: React.FC<TopicExplainerViewProps> = ({
  profile,
  activeSubject,
  onNavigateToQuiz,
  onNavigateToDoubt,
}) => {
  const [topic, setTopic] = useState('');
  const [simplicityLevel, setSimplicityLevel] = useState<
    'eli5' | 'simplified' | 'standard' | 'rigorous'
  >('simplified');
  const [loading, setLoading] = useState(false);
  const [explanation, setExplanation] = useState<TopicExplanation | null>(null);
  const [showAnswer, setShowAnswer] = useState(false);

  const simplicityLevels = [
    {
      id: 'eli5',
      label: "Explain Like I'm 5",
      icon: <Baby className="w-4 h-4" />,
      desc: 'Playground analogies, everyday stories, zero jargon',
      color: 'from-amber-500 to-orange-500',
    },
    {
      id: 'simplified',
      label: 'Simple & Intuitive',
      icon: <Smile className="w-4 h-4" />,
      desc: 'Clear mental models, student-friendly clarity',
      color: 'from-emerald-500 to-teal-500',
    },
    {
      id: 'standard',
      label: 'Curriculum & Exam Ready',
      icon: <GraduationCap className="w-4 h-4" />,
      desc: 'Standard definitions, equations, and test focus',
      color: 'from-indigo-500 to-purple-500',
    },
    {
      id: 'rigorous',
      label: 'Deep & Rigorous',
      icon: <Microscope className="w-4 h-4" />,
      desc: 'First-principles proofs, math formulations, edge cases',
      color: 'from-fuchsia-500 to-rose-500',
    },
  ];

  const handleExplain = async (customTopic?: string) => {
    const t = customTopic || topic;
    if (!t.trim()) return;

    setLoading(true);
    setShowAnswer(false);

    try {
      const res = await api.explainTopic({
        topic: t,
        simplicityLevel,
        subject: activeSubject.name,
        gradeLevel: profile.gradeLevel,
        language: profile.preferredLanguage,
      });

      setExplanation(res);
      storage.recordActivity(
        'explain',
        `Explained: ${res.topic}`,
        simplicityLevel.toUpperCase(),
        activeSubject.name
      );
    } catch (err: any) {
      alert(err.message || 'Failed to explain topic');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-16">
      {/* Header Banner */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-slate-900 via-teal-950/40 to-slate-900 border border-slate-800 shadow-xl relative overflow-hidden">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-teal-500/20 text-teal-300 border border-teal-500/30 mb-2">
              <Lightbulb className="w-3.5 h-3.5" />
              <span>Smart Topic Simplifier & Explainer</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
              Demystify Any Complex Academic Concept
            </h1>
            <p className="text-sm text-slate-300 mt-1 max-w-2xl">
              From &quot;Explain Like I&apos;m 5&quot; intuitive analogies to rigorous mathematical proofs—select
              how deeply you want EduGenie to explain any difficult concept.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="px-3 py-1.5 rounded-xl bg-slate-800 border border-slate-700 text-xs font-semibold text-teal-300">
              {activeSubject.name}
            </span>
          </div>
        </div>
      </div>

      {/* Input Generator */}
      <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-lg space-y-5">
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
            What concept or topic would you like explained?
          </label>
          <input
            type="text"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder="e.g. Quantum Entanglement, Bayes Theorem, CRISPR, Derivatives, Blockchain..."
            className="w-full px-4 py-3 rounded-xl bg-slate-800/90 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 text-sm font-sans"
          />
        </div>

        {/* Simplicity Level Selector */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
            Select Explanation Depth & Simplicity:
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {simplicityLevels.map((lvl) => {
              const isSelected = simplicityLevel === lvl.id;
              return (
                <button
                  key={lvl.id}
                  type="button"
                  onClick={() => setSimplicityLevel(lvl.id as any)}
                  className={`p-3.5 rounded-xl border text-left transition-all ${
                    isSelected
                      ? 'bg-teal-500/20 border-teal-500 text-white ring-1 ring-teal-500/50 shadow-md'
                      : 'bg-slate-800/60 border-slate-700/80 text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <span className={isSelected ? 'text-teal-400' : 'text-slate-400'}>
                      {lvl.icon}
                    </span>
                    <span className="font-bold text-xs">{lvl.label}</span>
                  </div>
                  <p className="text-[11px] text-slate-400 leading-tight">{lvl.desc}</p>
                </button>
              );
            })}
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
          {/* Quick Concept Suggestions */}
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-xs text-slate-400 font-medium">Try Sample:</span>
            {activeSubject.sampleQuestions.slice(0, 3).map((sq, i) => {
              const shortT = sq.split('?')[0].replace(/^Explain |^What is |^How does /, '');
              return (
                <button
                  key={i}
                  type="button"
                  onClick={() => {
                    setTopic(shortT);
                    handleExplain(shortT);
                  }}
                  className="text-xs px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-teal-950/60 text-slate-300 hover:text-teal-200 border border-slate-700/60 transition-colors"
                >
                  {shortT.slice(0, 30)}...
                </button>
              );
            })}
          </div>

          <button
            onClick={() => handleExplain()}
            disabled={!topic.trim() || loading}
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-teal-600 via-emerald-600 to-teal-600 hover:from-teal-500 hover:to-emerald-500 disabled:opacity-40 text-white font-semibold text-xs shadow-lg shadow-teal-600/30 transition-all active:scale-95"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Simplifying Concept...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>Explain Topic</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Explanation Results */}
      {explanation && (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
          {/* Top Title & Audio Card */}
          <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-teal-500/20 text-teal-300 border border-teal-500/30 capitalize">
                  {explanation.simplicityLevel.toUpperCase()} Mode
                </span>
                <span className="text-xs text-slate-400">Subject: {activeSubject.name}</span>
              </div>
              <AudioPlayerButton
                text={`${explanation.topic}. ${explanation.oneSentenceSummary}. Analogy: ${explanation.analogy}`}
              />
            </div>

            <h2 className="text-xl sm:text-2xl font-bold text-white">
              {explanation.topic}
            </h2>

            {/* 1-Sentence Definition */}
            <div className="p-4 rounded-xl bg-teal-950/30 border border-teal-800/40 text-sm font-medium text-teal-200 leading-relaxed">
              💡 <strong>The Core Idea:</strong> {explanation.oneSentenceSummary}
            </div>

            {/* Real World Analogy Card */}
            {explanation.analogy && (
              <div className="p-5 rounded-xl bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 border border-amber-500/30 space-y-2">
                <div className="text-xs font-semibold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" /> Intuitive Real-World Analogy
                </div>
                <p className="text-xs sm:text-sm text-slate-200 leading-relaxed font-sans">
                  {explanation.analogy}
                </p>
              </div>
            )}
          </div>

          {/* Breakdown Points */}
          {explanation.breakdownPoints?.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                <BookOpen className="w-4 h-4 text-teal-400" />
                How It Works Step-by-Step
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {explanation.breakdownPoints.map((pt, i) => (
                  <div
                    key={i}
                    className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-md space-y-2"
                  >
                    <div className="flex items-center gap-2">
                      <span className="w-6 h-6 rounded-lg bg-teal-500/20 text-teal-300 font-bold text-xs flex items-center justify-center">
                        {i + 1}
                      </span>
                      <h4 className="font-bold text-xs text-white">{pt.title}</h4>
                    </div>
                    <p className="text-xs text-slate-300 leading-relaxed font-sans">
                      {pt.explanation}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Why It Matters & Misconceptions Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Why it matters */}
            <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
              <div className="text-xs font-semibold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4" /> Why It Matters in Real Life
              </div>
              <p className="text-xs text-slate-300 leading-relaxed font-sans">
                {explanation.whyItMatters}
              </p>
            </div>

            {/* Common Misconceptions */}
            <div className="p-5 rounded-2xl bg-slate-900 border border-rose-500/30 space-y-2">
              <div className="text-xs font-semibold uppercase tracking-wider text-rose-400 flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4" /> Common Mental Traps
              </div>
              <ul className="space-y-1.5 text-xs text-slate-300 font-sans">
                {explanation.commonMisconceptions?.map((m, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="text-rose-400 font-bold">•</span>
                    <span>{m}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Quick Check Question (Active Recall) */}
          {explanation.quickCheckQuestion && (
            <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl space-y-3">
              <div className="text-xs font-semibold uppercase tracking-wider text-indigo-400 flex items-center gap-1.5">
                <HelpCircle className="w-4 h-4" /> Check Your Understanding
              </div>
              <div className="text-sm font-semibold text-white">
                {explanation.quickCheckQuestion.question}
              </div>

              <div>
                <button
                  type="button"
                  onClick={() => setShowAnswer(!showAnswer)}
                  className="text-xs font-semibold text-teal-400 hover:text-teal-300 inline-flex items-center gap-1"
                >
                  <span>{showAnswer ? 'Hide Answer' : 'Reveal Answer'}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>

                {showAnswer && (
                  <div className="mt-2 p-3.5 rounded-xl bg-slate-800/80 border border-slate-700 text-xs text-slate-200 leading-relaxed animate-in fade-in duration-150">
                    ✅ {explanation.quickCheckQuestion.answer}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* 1-Click Bridge Actions */}
          <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 flex flex-wrap items-center justify-between gap-3">
            <span className="text-xs text-slate-400">Ready to test what you learned?</span>
            <div className="flex items-center gap-2.5">
              {onNavigateToQuiz && (
                <button
                  type="button"
                  onClick={() => onNavigateToQuiz(explanation.topic)}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs transition-colors shadow-sm"
                >
                  <Trophy className="w-3.5 h-3.5" />
                  <span>Generate Quiz on this Topic</span>
                </button>
              )}
              {onNavigateToDoubt && (
                <button
                  type="button"
                  onClick={() => onNavigateToDoubt(`Explain step-by-step problem solving for ${explanation.topic}`)}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs transition-colors shadow-sm"
                >
                  <ArrowRight className="w-3.5 h-3.5" />
                  <span>Solve a Problem</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
