import React, { useState } from 'react';
import {
  FileText,
  Sparkles,
  HelpCircle,
  Copy,
  Check,
  Clock,
  BookOpen,
  Award,
  Loader2,
  ListOrdered,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { QuestionBankResult, SubjectItem, SummaryResult, UserProfile } from '../../types';
import { api } from '../../services/api';
import { storage } from '../../services/storage';
import { AudioPlayerButton } from '../AudioPlayerButton';

interface SummarizerViewProps {
  profile: UserProfile;
  activeSubject: SubjectItem;
}

export const SummarizerView: React.FC<SummarizerViewProps> = ({
  profile,
  activeSubject,
}) => {
  const [activeTab, setActiveTab] = useState<'summarize' | 'questions'>('summarize');

  // Summarizer states
  const [content, setContent] = useState('');
  const [summaryMode, setSummaryMode] = useState('Balanced');
  const [loadingSummary, setLoadingSummary] = useState(false);
  const [summaryResult, setSummaryResult] = useState<SummaryResult | null>(null);

  // Question generator states
  const [questionTopic, setQuestionTopic] = useState('');
  const [questionType, setQuestionType] = useState('Mixed Exam & Conceptual');
  const [questionCount, setQuestionCount] = useState(5);
  const [loadingQuestions, setLoadingQuestions] = useState(false);
  const [questionBankResult, setQuestionBankResult] = useState<QuestionBankResult | null>(null);
  const [expandedAnswer, setExpandedAnswer] = useState<number | null>(null);

  const [copied, setCopied] = useState(false);

  const sampleTextbookExcerpts: { title: string; text: string }[] = [
    {
      title: 'Mitochondria & Cellular Respiration',
      text: `Mitochondria are membrane-bound cell organelles that generate most of the chemical energy needed to power the cell's biochemical reactions. Chemical energy produced by the mitochondria is stored in a small molecule called adenosine triphosphate (ATP). Cellular respiration consists of glycolysis in the cytoplasm, followed by the citric acid cycle (Krebs cycle) in the mitochondrial matrix, and oxidative phosphorylation along the inner mitochondrial cristae. Oxygen functions as the terminal electron acceptor in the electron transport chain, binding with protons to yield water. When oxygen is deficient, cells undergo anaerobic fermentation instead.`,
    },
    {
      title: 'Newtonian Gravitation & Orbital Motion',
      text: `Every particle of matter in the universe attracts every other particle with a force directly proportional to the product of their masses and inversely proportional to the square of the distance between their centers. The formula is F = G * (m1 * m2) / r^2, where G is the universal gravitational constant (6.674e-11 N*m^2/kg^2). In uniform circular orbital motion, gravity provides the necessary centripetal force: F_grav = m * v^2 / r. Equating the two yields orbital velocity v = sqrt(G * M / r). Consequently, satellites in higher orbits travel with lower orbital speed and greater orbital period, in accordance with Kepler's Third Law.`,
    },
    {
      title: 'Algorithmic Big-O & Divide-and-Conquer',
      text: `The Divide-and-Conquer paradigm breaks a complex problem down into two or more smaller subproblems of the same or related type, solves each subproblem recursively, and combines the results. Merge Sort divides an unsorted array of size n into two halves of size n/2, recursively sorts both halves, and merges the two sorted sequences in O(n) linear time. By the Master Theorem, the recurrence relation T(n) = 2T(n/2) + O(n) resolves to O(n log n) time complexity in all cases (worst, average, and best), making it asymptotically optimal for comparison-based sorting, though it requires O(n) auxiliary memory.`,
    },
  ];

  const handleSummarize = async () => {
    if (!content.trim() || content.trim().length < 20) return;
    setLoadingSummary(true);

    try {
      const res = await api.summarizeText({
        content,
        mode: summaryMode,
        gradeLevel: profile.gradeLevel,
        language: profile.preferredLanguage,
      });

      setSummaryResult(res);
      storage.recordActivity('summary', res.title, `${res.readTimeMinutes}m read`, activeSubject.name);
    } catch (err: any) {
      alert(err.message || 'Failed to summarize text');
    } finally {
      setLoadingSummary(false);
    }
  };

  const handleGenerateQuestions = async () => {
    if (!questionTopic.trim()) return;
    setLoadingQuestions(true);

    try {
      const res = await api.generateQuestions({
        topic: questionTopic,
        subject: activeSubject.name,
        gradeLevel: profile.gradeLevel,
        questionType,
        count: questionCount,
        language: profile.preferredLanguage,
      });

      setQuestionBankResult(res);
      storage.recordActivity('doubt', `Questions on ${res.topic}`, `${res.questions.length} Qs`, activeSubject.name);
    } catch (err: any) {
      alert(err.message || 'Failed to generate question bank');
    } finally {
      setLoadingQuestions(false);
    }
  };

  const copySummary = () => {
    if (!summaryResult) return;
    const text = `# ${summaryResult.title}\n\n**Synopsis:** ${summaryResult.oneSentenceHook}\n\n## Key Takeaways\n${summaryResult.keyTakeaways.map((t) => `- ${t}`).join('\n')}\n\n## Full Summary\n${summaryResult.structuredSummary}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-16">
      {/* Header Banner */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-slate-900 via-cyan-950/40 to-slate-900 border border-slate-800 shadow-xl relative overflow-hidden">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 mb-2">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Text Summarizer & High-Yield Exam Questions</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
              Condense Content & Generate Exam Questions
            </h1>
            <p className="text-sm text-slate-300 mt-1 max-w-2xl">
              Paste extensive textbook passages or research articles to distill core takeaways,
              glossary terms, and practice questions.
            </p>
          </div>

          {/* Sub-tab switcher */}
          <div className="flex p-1 bg-slate-800/90 rounded-xl border border-slate-700">
            <button
              onClick={() => setActiveTab('summarize')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'summarize'
                  ? 'bg-cyan-500 text-slate-950 shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Text Summarizer
            </button>
            <button
              onClick={() => setActiveTab('questions')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'questions'
                  ? 'bg-cyan-500 text-slate-950 shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Question Generator
            </button>
          </div>
        </div>
      </div>

      {/* Mode 1: Text Summarizer */}
      {activeTab === 'summarize' && (
        <div className="space-y-6">
          <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-lg space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-300">
                Paste Study Content, Chapter, or Lecture Transcript
              </label>

              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-400">Summarization Style:</span>
                <select
                  value={summaryMode}
                  onChange={(e) => setSummaryMode(e.target.value)}
                  className="px-2.5 py-1 text-xs font-medium rounded-lg bg-slate-800 border border-slate-700 text-cyan-200 focus:outline-none"
                >
                  <option value="Balanced">Balanced & High-Yield</option>
                  <option value="Quick Highlights">Quick 30-Second Highlights</option>
                  <option value="Deep Academic">Deep Academic & Analytical</option>
                  <option value="Bullet Notes">Bullet Points & Formula Sheet</option>
                </select>
              </div>
            </div>

            <textarea
              rows={6}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Paste article, textbook paragraph, or study material here (minimum 20 characters)..."
              className="w-full p-4 rounded-xl bg-slate-800/80 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 text-xs sm:text-sm font-sans"
            />

            <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
              {/* Sample Excerpt Chips */}
              <div className="flex flex-wrap items-center gap-1.5">
                <span className="text-xs text-slate-400 font-medium">Try Sample Excerpt:</span>
                {sampleTextbookExcerpts.map((sample, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setContent(sample.text)}
                    className="text-xs px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-colors"
                  >
                    {sample.title}
                  </button>
                ))}
              </div>

              <button
                onClick={handleSummarize}
                disabled={content.trim().length < 20 || loadingSummary}
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 disabled:opacity-40 text-white font-semibold text-xs shadow-lg shadow-cyan-600/30 transition-all active:scale-95"
              >
                {loadingSummary ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Distilling Key Insights...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>Summarize Text</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Summarizer Result */}
          {summaryResult && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
              <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" /> ~{summaryResult.readTimeMinutes} min read
                    </span>
                    <AudioPlayerButton text={`${summaryResult.title}. ${summaryResult.oneSentenceHook}`} />
                  </div>

                  <button
                    onClick={copySummary}
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copied ? 'Copied' : 'Copy Summary'}</span>
                  </button>
                </div>

                <h2 className="text-xl sm:text-2xl font-bold text-white">
                  {summaryResult.title}
                </h2>

                {/* One sentence hook */}
                <div className="p-4 rounded-xl bg-cyan-950/30 border border-cyan-800/40 text-sm font-medium text-cyan-200">
                  ⚡ <strong>The Core Takeaway:</strong> {summaryResult.oneSentenceHook}
                </div>

                {/* Bullet Key Takeaways */}
                {summaryResult.keyTakeaways?.length > 0 && (
                  <div className="space-y-2 pt-2">
                    <div className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                      Essential Takeaways
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                      {summaryResult.keyTakeaways.map((point, i) => (
                        <div
                          key={i}
                          className="flex items-start gap-2.5 p-3 rounded-xl bg-slate-800/60 border border-slate-700/60 text-xs text-slate-200"
                        >
                          <span className="w-5 h-5 rounded-full bg-cyan-500/20 text-cyan-300 flex items-center justify-center font-bold text-[11px] shrink-0">
                            {i + 1}
                          </span>
                          <span>{point}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Full structured markdown summary */}
                <div className="pt-3 border-t border-slate-800 space-y-2">
                  <div className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                    Structured Summary
                  </div>
                  <div className="p-5 rounded-xl bg-slate-950/60 border border-slate-800 text-xs sm:text-sm text-slate-300 leading-relaxed whitespace-pre-wrap font-sans">
                    {summaryResult.structuredSummary}
                  </div>
                </div>

                {/* Extracted Glossary */}
                {summaryResult.glossary?.length > 0 && (
                  <div className="pt-3 border-t border-slate-800 space-y-3">
                    <div className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                      <BookOpen className="w-3.5 h-3.5 text-cyan-400" />
                      Key Terminology & Glossary
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {summaryResult.glossary.map((item, i) => (
                        <div key={i} className="p-3.5 rounded-xl bg-slate-800/60 border border-slate-700/60 text-xs">
                          <span className="font-bold text-cyan-300 block mb-1">{item.term}</span>
                          <span className="text-slate-300">{item.definition}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Potential Exam Questions Drawn from Text */}
                {summaryResult.potentialExamQuestions?.length > 0 && (
                  <div className="pt-3 border-t border-slate-800 space-y-3">
                    <div className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                      <Award className="w-3.5 h-3.5 text-amber-400" />
                      Anticipated Exam Questions from this Text
                    </div>
                    <div className="space-y-2">
                      {summaryResult.potentialExamQuestions.map((q, i) => (
                        <div
                          key={i}
                          className="flex items-center gap-2 p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-200"
                        >
                          <span className="font-bold">Q{i + 1}:</span>
                          <span>{q}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Mode 2: Question Generator */}
      {activeTab === 'questions' && (
        <div className="space-y-6">
          <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-lg space-y-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                Topic for Question Bank
              </label>
              <input
                type="text"
                value={questionTopic}
                onChange={(e) => setQuestionTopic(e.target.value)}
                placeholder="e.g. Thermodynamics Laws, Binary Search Trees, French Revolution..."
                className="w-full px-4 py-2.5 rounded-xl bg-slate-800/90 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 text-sm"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                  Question Category
                </label>
                <select
                  value={questionType}
                  onChange={(e) => setQuestionType(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs focus:outline-none"
                >
                  <option value="Mixed Exam & Conceptual">Mixed (High-Yield + Analytical)</option>
                  <option value="Exam High-Yield">Board / Finals High-Yield Questions</option>
                  <option value="Conceptual & Deep Thinking">Conceptual & Deep Thinking</option>
                  <option value="Viva & Oral Exam">Viva Voce & Interview Questions</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                  Number of Questions
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[4, 6, 8].map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setQuestionCount(c)}
                      className={`py-2 text-xs font-semibold rounded-xl border transition-all ${
                        questionCount === c
                          ? 'bg-cyan-500/20 border-cyan-500 text-cyan-300'
                          : 'bg-slate-800 border-slate-700 text-slate-300'
                      }`}
                    >
                      {c} Questions
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={handleGenerateQuestions}
                disabled={!questionTopic.trim() || loadingQuestions}
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 disabled:opacity-40 text-white font-semibold text-xs shadow-lg shadow-cyan-600/30 transition-all active:scale-95"
              >
                {loadingQuestions ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Curating Question Bank...</span>
                  </>
                ) : (
                  <>
                    <ListOrdered className="w-4 h-4" />
                    <span>Generate Question Bank</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Question Bank Display */}
          {questionBankResult && (
            <div className="space-y-4 animate-in fade-in duration-200">
              <div className="flex items-center justify-between p-4 rounded-xl bg-slate-900 border border-slate-800">
                <span className="text-sm font-bold text-white">
                  Topic: {questionBankResult.topic} ({questionBankResult.questions.length} Questions)
                </span>
                <span className="text-xs text-slate-400">Level: {profile.gradeLevel}</span>
              </div>

              <div className="space-y-3">
                {questionBankResult.questions.map((q) => (
                  <div
                    key={q.id}
                    className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-md space-y-3"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="w-6 h-6 rounded-lg bg-cyan-500/20 text-cyan-300 font-bold text-xs flex items-center justify-center">
                          {q.id}
                        </span>
                        <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-slate-800 text-slate-300 border border-slate-700">
                          {q.type}
                        </span>
                        <span
                          className={`text-xs px-2 py-0.5 rounded-md border ${
                            q.difficulty === 'Easy'
                              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                              : q.difficulty === 'Medium'
                              ? 'bg-amber-500/10 border-amber-500/30 text-amber-300'
                              : 'bg-rose-500/10 border-rose-500/30 text-rose-300'
                          }`}
                        >
                          {q.difficulty}
                        </span>
                      </div>
                      <span className="text-xs font-mono text-cyan-400">{q.marks} Marks</span>
                    </div>

                    <div className="text-sm font-semibold text-white leading-relaxed">
                      {q.question}
                    </div>

                    {/* Model Answer Accordion */}
                    <div className="pt-2">
                      <button
                        type="button"
                        onClick={() =>
                          setExpandedAnswer(expandedAnswer === q.id ? null : q.id)
                        }
                        className="inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-400 hover:text-indigo-300"
                      >
                        {expandedAnswer === q.id ? (
                          <>
                            <ChevronUp className="w-3.5 h-3.5" /> Hide Model Answer & Rubric
                          </>
                        ) : (
                          <>
                            <ChevronDown className="w-3.5 h-3.5" /> View Model Answer & Rubric
                          </>
                        )}
                      </button>

                      {expandedAnswer === q.id && (
                        <div className="mt-3 p-4 rounded-xl bg-slate-800/80 border border-slate-700 space-y-3 text-xs animate-in fade-in duration-150">
                          <div>
                            <span className="text-emerald-400 font-bold block mb-1">
                              Model Solution:
                            </span>
                            <p className="text-slate-200 leading-relaxed font-sans">
                              {q.modelAnswer}
                            </p>
                          </div>

                          {q.keyPointsExpected?.length > 0 && (
                            <div>
                              <span className="text-indigo-300 font-semibold block mb-1">
                                Points Expected by Examiner:
                              </span>
                              <ul className="list-disc pl-4 space-y-1 text-slate-300">
                                {q.keyPointsExpected.map((pt, idx) => (
                                  <li key={idx}>{pt}</li>
                                ))}
                              </ul>
                            </div>
                          )}

                          {q.examinerTip && (
                            <div className="p-2.5 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-200">
                              💡 <strong>Examiner Tip:</strong> {q.examinerTip}
                            </div>
                          )}
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
