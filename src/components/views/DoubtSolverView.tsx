import React, { useState } from 'react';
import {
  HelpCircle,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  AlertTriangle,
  BookmarkCheck,
  ShieldCheck,
  Copy,
  Check,
  UploadCloud,
  X,
  Loader2,
  BookOpen,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { DoubtSolution, SubjectItem, UserProfile } from '../../types';
import { api } from '../../services/api';
import { storage } from '../../services/storage';
import { AudioPlayerButton } from '../AudioPlayerButton';

interface DoubtSolverViewProps {
  profile: UserProfile;
  activeSubject: SubjectItem;
  initialQuestion?: string;
}

export const DoubtSolverView: React.FC<DoubtSolverViewProps> = ({
  profile,
  activeSubject,
  initialQuestion = '',
}) => {
  const [question, setQuestion] = useState(initialQuestion);
  const [loading, setLoading] = useState(false);
  const [solution, setSolution] = useState<DoubtSolution | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [imageMime, setImageMime] = useState('image/jpeg');
  const [expandedPractice, setExpandedPractice] = useState<number | null>(null);
  const [copiedFormula, setCopiedFormula] = useState<string | null>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImageMime(file.type || 'image/jpeg');
    const reader = new FileReader();
    reader.onload = (event) => {
      setSelectedImage(event.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleSolve = async (queryToUse?: string) => {
    const query = queryToUse !== undefined ? queryToUse : question;
    if (!query.trim() && !selectedImage) return;

    setLoading(true);
    setError(null);

    try {
      const res = await api.solveDoubt({
        question: query,
        subject: activeSubject.name,
        gradeLevel: profile.gradeLevel,
        language: profile.preferredLanguage,
        imageBase64: selectedImage || undefined,
        imageMimeType: imageMime,
      });

      setSolution(res);
      storage.recordActivity(
        'doubt',
        res.problemTitle || query.slice(0, 35),
        `Solved (${res.difficulty})`,
        activeSubject.name
      );
    } catch (err: any) {
      setError(err.message || 'Failed to solve doubt. Please try rephrasing.');
    } finally {
      setLoading(false);
    }
  };

  const copyFormula = (formula: string) => {
    navigator.clipboard.writeText(formula);
    setCopiedFormula(formula);
    setTimeout(() => setCopiedFormula(null), 2000);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-12">
      {/* Header Banner */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 border border-slate-800 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 -mt-4 -mr-4 w-48 h-48 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 mb-2">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Step-by-Step Doubt Resolution Engine</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
              Deconstruct Difficult Academic Problems
            </h1>
            <p className="text-sm text-slate-300 mt-1 max-w-2xl">
              Don&apos;t just memorize the final answer. EduGenie breaks down the underlying theorems,
              step-by-step logic, common pitfalls, and sanity-check verifications.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="px-3 py-1.5 rounded-xl bg-slate-800 border border-slate-700 text-xs font-medium text-slate-300">
              Grade: {profile.gradeLevel.split(' ')[0]}
            </span>
          </div>
        </div>
      </div>

      {/* Input Section */}
      <div className="p-6 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-lg space-y-4">
        <label className="block text-sm font-semibold text-slate-200">
          Enter Academic Question, Equation, or Code Problem
        </label>
        <textarea
          rows={3}
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder={`Type or paste your question here... (e.g. "${activeSubject.sampleQuestions[0]}")`}
          className="w-full p-4 rounded-xl bg-slate-800/80 border border-slate-700 text-white placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-sm font-sans"
        />

        {/* Selected Image Preview */}
        {selectedImage && (
          <div className="relative inline-block border border-slate-700 rounded-xl overflow-hidden">
            <img src={selectedImage} alt="Problem preview" className="max-h-40 rounded-xl object-contain bg-slate-950 p-1" />
            <button
              onClick={() => setSelectedImage(null)}
              className="absolute top-2 right-2 p-1.5 rounded-lg bg-slate-900/80 hover:bg-red-500 text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
          {/* Image Upload Button */}
          <div className="flex items-center gap-2">
            <label className="cursor-pointer inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 text-xs font-medium transition-colors">
              <UploadCloud className="w-4 h-4 text-indigo-400" />
              <span>Attach Diagram / Photo</span>
              <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
            </label>
            <span className="text-xs text-slate-400 hidden sm:inline">
              Supports handwritten notes, textbook figures, circuit diagrams
            </span>
          </div>

          {/* Solve Button */}
          <button
            onClick={() => handleSolve()}
            disabled={(!question.trim() && !selectedImage) || loading}
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-600 hover:from-indigo-500 hover:to-purple-500 disabled:opacity-40 text-white font-semibold text-sm shadow-lg shadow-indigo-600/30 transition-all active:scale-95"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Deconstructing Problem...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>Solve Step-by-Step</span>
              </>
            )}
          </button>
        </div>

        {/* Quick Sample Questions */}
        <div className="pt-3 border-t border-slate-800/80 flex flex-wrap items-center gap-1.5">
          <span className="text-xs font-semibold text-slate-400">Quick Samples:</span>
          {activeSubject.sampleQuestions.map((sq, i) => (
            <button
              key={i}
              onClick={() => {
                setQuestion(sq);
                handleSolve(sq);
              }}
              className="text-xs px-2.5 py-1 rounded-lg bg-slate-800/80 hover:bg-indigo-950/60 text-slate-300 hover:text-indigo-200 border border-slate-700/60 transition-colors text-left"
            >
              {sq}
            </button>
          ))}
        </div>
      </div>

      {/* Error state */}
      {error && (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-sm flex items-center gap-3">
          <AlertTriangle className="w-5 h-5 shrink-0 text-rose-400" />
          <span>{error}</span>
        </div>
      )}

      {/* Solution Display */}
      {solution && (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
          {/* Solution Header Card */}
          <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  {solution.subjectCategory}
                </span>
                <span
                  className={`px-2.5 py-1 rounded-full text-xs font-bold border ${
                    solution.difficulty === 'Beginner'
                      ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-300'
                      : solution.difficulty === 'Intermediate'
                      ? 'bg-amber-500/15 border-amber-500/30 text-amber-300'
                      : 'bg-rose-500/15 border-rose-500/30 text-rose-300'
                  }`}
                >
                  {solution.difficulty}
                </span>
              </div>
              <AudioPlayerButton
                text={`${solution.problemTitle}. Concept: ${solution.conceptOverview}. Final Answer: ${solution.finalAnswer}`}
              />
            </div>

            <h2 className="text-xl sm:text-2xl font-bold text-white">
              {solution.problemTitle}
            </h2>

            {/* Core Concept Overview */}
            <div className="p-4 rounded-xl bg-indigo-950/30 border border-indigo-800/40 text-sm text-indigo-100 leading-relaxed">
              <div className="font-semibold text-indigo-300 flex items-center gap-1.5 mb-1 text-xs uppercase tracking-wider">
                <BookOpen className="w-3.5 h-3.5" /> Core Concept & Foundation
              </div>
              {solution.conceptOverview}
            </div>

            {/* Key Formulas & Rules */}
            {solution.keyFormulas && solution.keyFormulas.length > 0 && (
              <div>
                <div className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
                  Key Formulas & Governing Principles
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {solution.keyFormulas.map((f, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between p-3 rounded-xl bg-slate-800/80 border border-slate-700/80 text-xs font-mono text-emerald-300"
                    >
                      <span className="truncate mr-2">{f}</span>
                      <button
                        onClick={() => copyFormula(f)}
                        className="p-1 hover:text-white text-slate-400 transition-colors"
                        title="Copy formula"
                      >
                        {copiedFormula === f ? (
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Step-by-Step Breakdown Cards */}
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <BookmarkCheck className="w-5 h-5 text-indigo-400" />
              Step-by-Step Pedagogical Derivation
            </h3>

            {solution.steps?.map((step) => (
              <div
                key={step.stepNumber}
                className="p-5 rounded-2xl bg-slate-900 border border-slate-800 hover:border-slate-700 shadow-md space-y-3 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center text-white font-bold text-xs shadow-md">
                    {step.stepNumber}
                  </div>
                  <h4 className="text-base font-semibold text-white">{step.title}</h4>
                </div>

                <p className="text-sm text-slate-300 leading-relaxed pl-11">
                  {step.explanation}
                </p>

                {step.calculationOrCode && (
                  <div className="ml-11 p-3.5 rounded-xl bg-slate-950 border border-slate-800 font-mono text-xs text-amber-200 overflow-x-auto whitespace-pre-wrap">
                    {step.calculationOrCode}
                  </div>
                )}

                {step.tip && (
                  <div className="ml-11 text-xs text-indigo-300/90 bg-indigo-500/10 border border-indigo-500/20 px-3 py-2 rounded-xl flex items-center gap-2">
                    <Sparkles className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                    <span><strong>Pro-Tip:</strong> {step.tip}</span>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Final Answer Banner */}
          <div className="p-6 rounded-2xl bg-gradient-to-r from-emerald-950/40 via-slate-900 to-emerald-950/40 border border-emerald-500/40 shadow-xl space-y-2">
            <div className="flex items-center gap-2 text-emerald-400 font-semibold text-xs uppercase tracking-wider">
              <CheckCircle2 className="w-4 h-4" /> Final Answer & Conclusion
            </div>
            <div className="text-lg sm:text-xl font-bold text-white font-sans">
              {solution.finalAnswer}
            </div>
          </div>

          {/* Pitfalls & Verification Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Common Pitfalls */}
            <div className="p-5 rounded-2xl bg-slate-900 border border-rose-500/30 shadow-md space-y-3">
              <div className="flex items-center gap-2 text-rose-400 font-semibold text-xs uppercase tracking-wider">
                <AlertTriangle className="w-4 h-4" /> Common Traps & Misconceptions
              </div>
              <ul className="space-y-2 text-xs text-slate-300">
                {solution.commonPitfalls?.map((pitfall, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="text-rose-400 font-bold">•</span>
                    <span>{pitfall}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Sanity Check */}
            <div className="p-5 rounded-2xl bg-slate-900 border border-cyan-500/30 shadow-md space-y-3">
              <div className="flex items-center gap-2 text-cyan-400 font-semibold text-xs uppercase tracking-wider">
                <ShieldCheck className="w-4 h-4" /> Sanity Check & Self-Verification
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                {solution.verificationCheck}
              </p>
            </div>
          </div>

          {/* Practice Follow-ups */}
          {solution.practiceQuestions && solution.practiceQuestions.length > 0 && (
            <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-md space-y-4">
              <h4 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-400" />
                Active Recall Practice (Test Yourself)
              </h4>
              <div className="space-y-3">
                {solution.practiceQuestions.map((pq, i) => (
                  <div key={i} className="p-4 rounded-xl bg-slate-800/60 border border-slate-700/60 space-y-2">
                    <div className="text-xs font-semibold text-slate-200">
                      Practice #{i + 1}: {pq.question}
                    </div>
                    <div>
                      <button
                        type="button"
                        onClick={() => setExpandedPractice(expandedPractice === i ? null : i)}
                        className="text-[11px] font-semibold text-indigo-400 hover:text-indigo-300 inline-flex items-center gap-1"
                      >
                        {expandedPractice === i ? (
                          <>
                            <ChevronUp className="w-3.5 h-3.5" /> Hide Hint
                          </>
                        ) : (
                          <>
                            <ChevronDown className="w-3.5 h-3.5" /> Reveal Hint
                          </>
                        )}
                      </button>
                      {expandedPractice === i && (
                        <div className="mt-2 p-2.5 rounded-lg bg-slate-900 border border-slate-700 text-xs text-slate-300 font-sans animate-in fade-in duration-150">
                          💡 <strong>Hint:</strong> {pq.hint}
                        </div>
                      )}
                    </div>
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
