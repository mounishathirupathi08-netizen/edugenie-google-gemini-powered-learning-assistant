import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import {
  HelpCircle,
  Sparkles,
  Trophy,
  CheckCircle2,
  XCircle,
  RotateCcw,
  Loader2,
  Lightbulb,
  ArrowRight,
  Target,
  Clock,
  Award,
} from 'lucide-react';
import { QuizData, QuizQuestion, SubjectItem, UserProfile } from '../../types';
import { api } from '../../services/api';
import { storage } from '../../services/storage';

interface QuizViewProps {
  profile: UserProfile;
  activeSubject: SubjectItem;
}

export const QuizView: React.FC<QuizViewProps> = ({ profile, activeSubject }) => {
  const [topic, setTopic] = useState('');
  const [difficulty, setDifficulty] = useState('Medium');
  const [numQuestions, setNumQuestions] = useState(5);
  const [loading, setLoading] = useState(false);
  const [quizData, setQuizData] = useState<QuizData | null>(null);

  // Active quiz state
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({});
  const [showHint, setShowHint] = useState<Record<number, boolean>>({});
  const [isCompleted, setIsCompleted] = useState(false);
  const [instantFeedbackMode, setInstantFeedbackMode] = useState(true);

  const handleGenerateQuiz = async (presetTopic?: string) => {
    const t = presetTopic || topic;
    if (!t.trim()) return;

    setLoading(true);
    setQuizData(null);
    setCurrentIdx(0);
    setSelectedAnswers({});
    setShowHint({});
    setIsCompleted(false);

    try {
      const data = await api.generateQuiz({
        topic: t,
        subject: activeSubject.name,
        gradeLevel: profile.gradeLevel,
        difficulty,
        numQuestions,
        language: profile.preferredLanguage,
      });

      setQuizData(data);
    } catch (err: any) {
      alert(err.message || 'Failed to generate quiz');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectOption = (questionId: number, optionIdx: number) => {
    // If already answered in instant feedback mode, don't allow changing
    if (instantFeedbackMode && selectedAnswers[questionId] !== undefined) return;

    setSelectedAnswers((prev) => ({
      ...prev,
      [questionId]: optionIdx,
    }));
  };

  const calculateScore = () => {
    if (!quizData) return { score: 0, total: 0, percentage: 0 };
    let score = 0;
    quizData.questions.forEach((q) => {
      if (selectedAnswers[q.id] === q.correctAnswerIndex) {
        score += 1;
      }
    });
    const total = quizData.questions.length;
    const percentage = Math.round((score / total) * 100);
    return { score, total, percentage };
  };

  const handleFinishQuiz = () => {
    if (!quizData) return;
    const { score, total, percentage } = calculateScore();
    setIsCompleted(true);

    if (percentage >= 70) {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
      });
    }

    storage.recordQuizResult({
      id: 'quiz_' + Date.now(),
      title: quizData.quizTitle,
      topic: quizData.topic,
      subject: activeSubject.name,
      score,
      total,
      percentage,
      completedAt: Date.now(),
    });

    storage.recordActivity(
      'quiz',
      quizData.quizTitle,
      `${percentage}% (${score}/${total})`,
      activeSubject.name
    );
  };

  const currentQ = quizData ? quizData.questions[currentIdx] : null;
  const isCurrentAnswered = currentQ ? selectedAnswers[currentQ.id] !== undefined : false;
  const isLastQuestion = quizData ? currentIdx === quizData.questions.length - 1 : false;

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-16">
      {/* Header Banner */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-slate-900 via-emerald-950/40 to-slate-900 border border-slate-800 shadow-xl relative overflow-hidden">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 mb-2">
              <Trophy className="w-3.5 h-3.5" />
              <span>Interactive Assessment & Instant Feedback</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
              Adaptive Practice & Quizzes
            </h1>
            <p className="text-sm text-slate-300 mt-1 max-w-2xl">
              Test your understanding with curriculum-aligned questions. Receive immediate
              explanations for every option to turn mistakes into learning breakthroughs.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="px-3 py-1.5 rounded-xl bg-slate-800 border border-slate-700 text-xs font-semibold text-emerald-300">
              {activeSubject.name}
            </span>
          </div>
        </div>
      </div>

      {/* Quiz Generator Input Card */}
      {!quizData && (
        <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-lg space-y-5">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
              Enter Quiz Topic or Subconcept
            </label>
            <input
              type="text"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="e.g. Newton Laws of Motion, Quadratic Equations, Cellular Respiration..."
              className="w-full px-4 py-3 rounded-xl bg-slate-800/90 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 text-sm"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                Difficulty Level
              </label>
              <div className="grid grid-cols-3 gap-2">
                {['Easy', 'Medium', 'Hard'].map((d) => (
                  <button
                    key={d}
                    type="button"
                    onClick={() => setDifficulty(d)}
                    className={`py-2 text-xs font-semibold rounded-xl border transition-all ${
                      difficulty === d
                        ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300 shadow-sm'
                        : 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700'
                    }`}
                  >
                    {d}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                Number of Questions
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[3, 5, 8].map((n) => (
                  <button
                    key={n}
                    type="button"
                    onClick={() => setNumQuestions(n)}
                    className={`py-2 text-xs font-semibold rounded-xl border transition-all ${
                      numQuestions === n
                        ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300 shadow-sm'
                        : 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700'
                    }`}
                  >
                    {n} Questions
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="text-xs text-slate-400 font-medium">Quick Topics:</span>
              {activeSubject.sampleQuestions.slice(0, 3).map((sq, i) => {
                const shortT = sq.split('?')[0].replace(/^Explain |^What is |^How does /, '');
                return (
                  <button
                    key={i}
                    type="button"
                    onClick={() => {
                      setTopic(shortT);
                      handleGenerateQuiz(shortT);
                    }}
                    className="text-xs px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-emerald-950/60 text-slate-300 hover:text-emerald-200 border border-slate-700/60 transition-colors"
                  >
                    {shortT.slice(0, 30)}...
                  </button>
                );
              })}
            </div>

            <button
              onClick={() => handleGenerateQuiz()}
              disabled={!topic.trim() || loading}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 disabled:opacity-40 text-white font-semibold text-sm shadow-lg shadow-emerald-600/30 transition-all active:scale-95"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Generating Assessment...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Start Quiz</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* Active Quiz Card */}
      {quizData && !isCompleted && currentQ && (
        <div className="p-6 sm:p-8 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl space-y-6 animate-in fade-in duration-200">
          {/* Progress Header */}
          <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-800">
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  {quizData.topic}
                </span>
                <span className="text-xs text-slate-400">
                  Difficulty: {quizData.difficulty}
                </span>
              </div>
              <h2 className="text-base font-bold text-white mt-1">
                Question {currentIdx + 1} of {quizData.questions.length}
              </h2>
            </div>

            <div className="flex items-center gap-3">
              {/* Feedback mode toggle */}
              <button
                type="button"
                onClick={() => setInstantFeedbackMode(!instantFeedbackMode)}
                className={`text-xs px-2.5 py-1 rounded-lg border transition-colors ${
                  instantFeedbackMode
                    ? 'bg-indigo-500/15 border-indigo-500/30 text-indigo-300'
                    : 'bg-slate-800 border-slate-700 text-slate-400'
                }`}
              >
                Instant Feedback: <strong>{instantFeedbackMode ? 'ON' : 'OFF'}</strong>
              </button>

              <button
                type="button"
                onClick={() => setQuizData(null)}
                className="text-xs text-slate-400 hover:text-white"
              >
                Exit
              </button>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
            <div
              className="bg-gradient-to-r from-emerald-500 to-teal-400 h-2 transition-all duration-300"
              style={{
                width: `${((currentIdx + 1) / quizData.questions.length) * 100}%`,
              }}
            />
          </div>

          {/* Question Text */}
          <div className="space-y-2">
            <div className="text-lg sm:text-xl font-bold text-white leading-relaxed">
              {currentQ.question}
            </div>
            {currentQ.conceptTested && (
              <span className="inline-block text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                Concept tested: {currentQ.conceptTested}
              </span>
            )}
          </div>

          {/* Hint reveal button */}
          {currentQ.hint && (
            <div>
              <button
                type="button"
                onClick={() =>
                  setShowHint((prev) => ({ ...prev, [currentQ.id]: !prev[currentQ.id] }))
                }
                className="inline-flex items-center gap-1.5 text-xs text-amber-400 hover:text-amber-300 font-medium"
              >
                <Lightbulb className="w-3.5 h-3.5" />
                <span>{showHint[currentQ.id] ? 'Hide Hint' : 'Need a Clue? Reveal Hint'}</span>
              </button>
              {showHint[currentQ.id] && (
                <div className="mt-2 p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-200">
                  💡 {currentQ.hint}
                </div>
              )}
            </div>
          )}

          {/* Options */}
          <div className="space-y-3">
            {currentQ.options.map((option, idx) => {
              const isSelected = selectedAnswers[currentQ.id] === idx;
              const isCorrect = idx === currentQ.correctAnswerIndex;
              const hasAnswered = selectedAnswers[currentQ.id] !== undefined;

              let optionStyle =
                'bg-slate-800/80 hover:bg-slate-800 border-slate-700 text-slate-200 hover:border-slate-600';

              if (hasAnswered && instantFeedbackMode) {
                if (isCorrect) {
                  optionStyle =
                    'bg-emerald-500/20 border-emerald-500 text-emerald-200 shadow-sm ring-1 ring-emerald-500/50';
                } else if (isSelected && !isCorrect) {
                  optionStyle =
                    'bg-rose-500/20 border-rose-500 text-rose-200 ring-1 ring-rose-500/50';
                } else {
                  optionStyle = 'bg-slate-800/40 border-slate-800 text-slate-500';
                }
              } else if (isSelected) {
                optionStyle = 'bg-indigo-600/30 border-indigo-500 text-white ring-1 ring-indigo-500';
              }

              return (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleSelectOption(currentQ.id, idx)}
                  disabled={hasAnswered && instantFeedbackMode}
                  className={`w-full p-4 rounded-xl border text-left text-sm font-medium transition-all flex items-center justify-between ${optionStyle}`}
                >
                  <div className="flex items-center gap-3">
                    <span className="w-7 h-7 rounded-lg bg-slate-900/60 border border-slate-700/80 flex items-center justify-center text-xs font-bold shrink-0">
                      {String.fromCharCode(65 + idx)}
                    </span>
                    <span>{option}</span>
                  </div>

                  {hasAnswered && instantFeedbackMode && (
                    <div>
                      {isCorrect && <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />}
                      {isSelected && !isCorrect && (
                        <XCircle className="w-5 h-5 text-rose-400 shrink-0" />
                      )}
                    </div>
                  )}
                </button>
              );
            })}
          </div>

          {/* Instant Feedback Explanation Box */}
          {isCurrentAnswered && instantFeedbackMode && (
            <div className="p-4 rounded-xl bg-slate-800 border border-slate-700/80 space-y-2 animate-in fade-in duration-200">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-emerald-400">
                <Sparkles className="w-4 h-4" /> EduGenie Explanation
              </div>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-sans">
                {currentQ.explanation}
              </p>
            </div>
          )}

          {/* Bottom Navigation */}
          <div className="flex items-center justify-between pt-4 border-t border-slate-800">
            <button
              type="button"
              onClick={() => setCurrentIdx((prev) => Math.max(0, prev - 1))}
              disabled={currentIdx === 0}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-30 text-xs font-semibold text-slate-300 transition-colors"
            >
              Previous
            </button>

            {isLastQuestion ? (
              <button
                type="button"
                onClick={handleFinishQuiz}
                disabled={!isCurrentAnswered}
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 disabled:opacity-40 text-white font-semibold text-xs shadow-lg shadow-emerald-600/30 transition-all"
              >
                <span>Submit Quiz & View Results</span>
                <Trophy className="w-4 h-4" />
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setCurrentIdx((prev) => prev + 1)}
                disabled={!isCurrentAnswered}
                className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-30 text-white font-semibold text-xs transition-colors"
              >
                <span>Next Question</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      )}

      {/* Completion Scorecard */}
      {isCompleted && quizData && (
        <div className="p-8 rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl text-center space-y-6 animate-in zoom-in-95 duration-200">
          {(() => {
            const { score, total, percentage } = calculateScore();
            const passed = percentage >= 70;
            return (
              <>
                <div className="inline-flex p-4 rounded-2xl bg-gradient-to-tr from-emerald-500/20 to-teal-500/20 border border-emerald-500/40 text-emerald-400 mb-2">
                  <Award className="w-12 h-12" />
                </div>

                <div className="space-y-1">
                  <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
                    {passed ? 'Outstanding Work!' : 'Good Effort! Keep Practicing'}
                  </h2>
                  <p className="text-sm text-slate-400">
                    You scored <strong className="text-emerald-400 font-bold">{score} out of {total}</strong> ({percentage}%) on <em>{quizData.quizTitle}</em>
                  </p>
                </div>

                {/* Score breakdown metrics */}
                <div className="grid grid-cols-3 gap-3 max-w-md mx-auto py-2">
                  <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700">
                    <div className="text-xs text-slate-400">Accuracy</div>
                    <div className="text-lg font-bold text-emerald-400">{percentage}%</div>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700">
                    <div className="text-xs text-slate-400">Correct</div>
                    <div className="text-lg font-bold text-white">{score}/{total}</div>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700">
                    <div className="text-xs text-slate-400">Difficulty</div>
                    <div className="text-lg font-bold text-amber-400">{quizData.difficulty}</div>
                  </div>
                </div>

                {/* Detailed Review of Each Question */}
                <div className="text-left space-y-4 pt-4 border-t border-slate-800">
                  <h3 className="text-sm font-bold uppercase tracking-wider text-slate-300">
                    Review Questions & Explanations:
                  </h3>
                  {quizData.questions.map((q, idx) => {
                    const userAns = selectedAnswers[q.id];
                    const isRight = userAns === q.correctAnswerIndex;
                    return (
                      <div
                        key={q.id}
                        className={`p-4 rounded-xl border space-y-2 text-xs ${
                          isRight
                            ? 'bg-emerald-950/20 border-emerald-500/30'
                            : 'bg-rose-950/20 border-rose-500/30'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="font-semibold text-white">
                            #{idx + 1}: {q.question}
                          </div>
                          {isRight ? (
                            <span className="text-emerald-400 font-bold shrink-0">Correct (+1)</span>
                          ) : (
                            <span className="text-rose-400 font-bold shrink-0">Review Needed</span>
                          )}
                        </div>
                        <div className="text-slate-300">
                          <strong>Correct Answer:</strong> {q.options[q.correctAnswerIndex]}
                        </div>
                        <div className="text-slate-400 leading-relaxed font-sans">
                          {q.explanation}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Restart Buttons */}
                <div className="flex flex-wrap items-center justify-center gap-3 pt-4">
                  <button
                    onClick={() => {
                      setCurrentIdx(0);
                      setSelectedAnswers({});
                      setShowHint({});
                      setIsCompleted(false);
                    }}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs transition-colors"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Retake This Quiz</span>
                  </button>

                  <button
                    onClick={() => setQuizData(null)}
                    className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 text-white font-semibold text-xs shadow-lg shadow-emerald-600/30 transition-all"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Generate New Quiz Topic</span>
                  </button>
                </div>
              </>
            );
          })()}
        </div>
      )}
    </div>
  );
};
