import React, { useState } from 'react';
import {
  GraduationCap,
  Sparkles,
  Printer,
  Copy,
  Check,
  BookOpen,
  Users,
  Award,
  Layers,
  Loader2,
  FileCheck,
  Target,
} from 'lucide-react';
import { SubjectItem, TeacherToolkitResult, UserProfile } from '../../types';
import { api } from '../../services/api';

interface TeacherToolkitViewProps {
  profile: UserProfile;
  activeSubject: SubjectItem;
}

export const TeacherToolkitView: React.FC<TeacherToolkitViewProps> = ({
  profile,
  activeSubject,
}) => {
  const [topic, setTopic] = useState('Newton Laws of Motion & Momentum');
  const [toolType, setToolType] = useState('Lesson Plan');
  const [durationMinutes, setDurationMinutes] = useState(45);
  const [gradeLevel, setGradeLevel] = useState(profile.gradeLevel);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<TeacherToolkitResult | null>(null);
  const [copied, setCopied] = useState(false);

  const handleGenerate = async () => {
    if (!topic.trim()) return;
    setLoading(true);

    try {
      const res = await api.generateTeacherToolkit({
        topic,
        gradeLevel,
        subject: activeSubject.name,
        toolType,
        durationMinutes,
        language: profile.preferredLanguage,
      });

      setResult(res);
    } catch (err: any) {
      alert(err.message || 'Failed to generate teacher materials');
    } finally {
      setLoading(false);
    }
  };

  const copyAsMarkdown = () => {
    if (!result) return;
    let md = `# ${result.title}\n\n`;
    md += `**Topic:** ${result.topic} | **Grade:** ${result.gradeLevel} | **Subject:** ${result.subject}\n\n`;
    md += `## Learning Objectives (SWBAT)\n`;
    result.learningObjectives?.forEach((obj) => (md += `- ${obj}\n`));
    md += `\n## Lesson Breakdown\n`;
    result.lessonBreakdown?.forEach((stage) => {
      md += `### ${stage.stage}\n- **Activity:** ${stage.activity}\n- **Teacher Guidance:** ${stage.teacherGuidance}\n\n`;
    });
    navigator.clipboard.writeText(md);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-16">
      {/* Header Banner */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-slate-900 via-amber-950/40 to-slate-900 border border-slate-800 shadow-xl relative overflow-hidden">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-500/20 text-amber-300 border border-amber-500/30 mb-2">
              <GraduationCap className="w-3.5 h-3.5" />
              <span>Teacher & Educator Co-Pilot</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
              Curriculum, Worksheets & Differentiated Instruction
            </h1>
            <p className="text-sm text-slate-300 mt-1 max-w-2xl">
              Save hours of prep time. Generate standards-aligned lesson plans, tiered assignments,
              formative exit tickets, and printable worksheets in seconds.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="px-3 py-1.5 rounded-xl bg-slate-800 border border-slate-700 text-xs font-semibold text-amber-300">
              👩‍🏫 Educator Mode
            </span>
          </div>
        </div>
      </div>

      {/* Input Generator */}
      <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-lg space-y-5">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
              Curriculum Unit or Topic
            </label>
            <input
              type="text"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="e.g. Mendelian Genetics, Quadratic Systems, The Great Depression..."
              className="w-full px-4 py-2.5 rounded-xl bg-slate-800/90 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 text-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
              Deliverable Type
            </label>
            <select
              value={toolType}
              onChange={(e) => setToolType(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl bg-slate-800/90 border border-slate-700 text-white focus:outline-none focus:border-amber-500 text-sm"
            >
              <option value="Lesson Plan">Full 4-Stage Lesson Plan & Exit Ticket</option>
              <option value="Worksheet & Assignment">Differentiated Student Worksheet & Answer Key</option>
              <option value="Assessment Rubric">Grading Rubric & Standards Breakdown</option>
              <option value="Class Discussion Prompts">Socratic Classroom Discussion Prompts</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
              Target Grade Level
            </label>
            <input
              type="text"
              value={gradeLevel}
              onChange={(e) => setGradeLevel(e.target.value as any)}
              className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
              Class Period Duration
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[30, 45, 60].map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => setDurationMinutes(m)}
                  className={`py-2 text-xs font-semibold rounded-xl border transition-all ${
                    durationMinutes === m
                      ? 'bg-amber-500/20 border-amber-500 text-amber-300'
                      : 'bg-slate-800 border-slate-700 text-slate-300'
                  }`}
                >
                  {m} Minutes
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <button
            onClick={handleGenerate}
            disabled={!topic.trim() || loading}
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-600 via-orange-600 to-amber-600 hover:from-amber-500 hover:to-orange-500 disabled:opacity-40 text-white font-semibold text-xs shadow-lg shadow-amber-600/30 transition-all active:scale-95"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Designing Educator Materials...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>Generate Teaching Pack</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Generated Results */}
      {result && (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
          <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-2xl bg-slate-900 border border-slate-800">
            <h2 className="text-lg font-bold text-white truncate max-w-lg">{result.title}</h2>
            <div className="flex items-center gap-2">
              <button
                onClick={copyAsMarkdown}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied' : 'Copy Plan'}</span>
              </button>
              <button
                onClick={() => window.print()}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print Handout</span>
              </button>
            </div>
          </div>

          {/* Objectives Card */}
          {result.learningObjectives?.length > 0 && (
            <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-md space-y-3">
              <div className="text-xs font-semibold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                <Target className="w-4 h-4" /> Learning Objectives (SWBAT)
              </div>
              <ul className="space-y-2">
                {result.learningObjectives.map((obj, i) => (
                  <li key={i} className="flex items-start gap-2 text-xs sm:text-sm text-slate-200">
                    <span className="text-amber-400 font-bold">•</span>
                    <span>{obj}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* 4-Stage Lesson Plan Breakdown */}
          {result.lessonBreakdown?.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <Layers className="w-4 h-4 text-amber-400" />
                Structured Lesson Breakdown ({durationMinutes} mins)
              </h3>
              <div className="space-y-3">
                {result.lessonBreakdown.map((stage, i) => (
                  <div
                    key={i}
                    className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-md space-y-2"
                  >
                    <div className="font-bold text-sm text-amber-300">{stage.stage}</div>
                    <p className="text-xs sm:text-sm text-slate-200 font-sans leading-relaxed">
                      {stage.activity}
                    </p>
                    {stage.teacherGuidance && (
                      <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700/60 text-xs text-slate-300">
                        👨‍🏫 <strong>Teacher Guidance:</strong> {stage.teacherGuidance}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Differentiated Instruction */}
          {result.differentiatedInstruction && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
                <div className="text-xs font-semibold uppercase tracking-wider text-cyan-400 flex items-center gap-1.5">
                  <Users className="w-4 h-4" /> Scaffolding Support (Struggling Learners)
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  {result.differentiatedInstruction.supportForStruggling}
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
                <div className="text-xs font-semibold uppercase tracking-wider text-purple-400 flex items-center gap-1.5">
                  <Award className="w-4 h-4" /> Higher-Order Challenge (Advanced Learners)
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  {result.differentiatedInstruction.extensionForAdvanced}
                </p>
              </div>
            </div>
          )}

          {/* Printable Student Worksheet Questions */}
          {result.printableWorksheetQuestions?.length > 0 && (
            <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                  <FileCheck className="w-4 h-4 text-emerald-400" />
                  Printable Assignment Worksheet & Key
                </h3>
                <span className="text-xs text-slate-400">Includes Grading Rubric</span>
              </div>

              <div className="space-y-4">
                {result.printableWorksheetQuestions.map((q) => (
                  <div
                    key={q.questionNumber}
                    className="p-4 rounded-xl bg-slate-800/60 border border-slate-700/60 space-y-2 text-xs"
                  >
                    <div className="flex items-center justify-between font-bold text-white">
                      <span>Problem #{q.questionNumber}: {q.questionText}</span>
                      <span className="text-amber-400">{q.pointValue} pts</span>
                    </div>
                    <div className="p-3 rounded-lg bg-slate-900/80 border border-slate-800 text-slate-300">
                      <strong className="text-emerald-400">Teacher Solution / Rubric:</strong>{' '}
                      {q.expectedAnswer}
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
