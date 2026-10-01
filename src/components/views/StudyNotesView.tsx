import React, { useState, useEffect } from 'react';
import {
  BookOpen,
  Sparkles,
  Layers,
  FileText,
  Copy,
  Check,
  Bookmark,
  Trash2,
  ChevronLeft,
  ChevronRight,
  RotateCw,
  Printer,
  Download,
  Loader2,
  CheckCircle2,
} from 'lucide-react';
import { Flashcard, StudyNotePack, SubjectItem, UserProfile } from '../../types';
import { api } from '../../services/api';
import { storage } from '../../services/storage';
import { AudioPlayerButton } from '../AudioPlayerButton';

interface StudyNotesViewProps {
  profile: UserProfile;
  activeSubject: SubjectItem;
}

export const StudyNotesView: React.FC<StudyNotesViewProps> = ({
  profile,
  activeSubject,
}) => {
  const [topic, setTopic] = useState('');
  const [sourceContent, setSourceContent] = useState('');
  const [selectedFormat, setSelectedFormat] = useState('Comprehensive Notes');
  const [loading, setLoading] = useState(false);
  const [notePack, setNotePack] = useState<StudyNotePack | null>(null);
  const [savedPacks, setSavedPacks] = useState<StudyNotePack[]>([]);
  const [copied, setCopied] = useState(false);

  // Flashcard deck states
  const [currentCardIdx, setCurrentCardIdx] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);

  useEffect(() => {
    setSavedPacks(storage.getSavedNotes());
  }, []);

  const handleGenerate = async (presetTopic?: string) => {
    const t = presetTopic || topic;
    if (!t.trim() && !sourceContent.trim()) return;

    setLoading(true);
    try {
      const result = await api.generateNotes({
        topic: t || 'Study Review',
        sourceContent,
        subject: activeSubject.name,
        gradeLevel: profile.gradeLevel,
        format: selectedFormat,
        language: profile.preferredLanguage,
      });

      setNotePack(result);
      setCurrentCardIdx(0);
      setIsFlipped(false);
      storage.recordActivity('notes', result.title, 'Pack Created', activeSubject.name);
    } catch (err: any) {
      alert(err.message || 'Failed to generate study notes');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveToNotebook = () => {
    if (!notePack) return;
    storage.saveNotePack(notePack);
    setSavedPacks(storage.getSavedNotes());
  };

  const handleDeleteSaved = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    storage.deleteNotePack(id);
    setSavedPacks(storage.getSavedNotes());
  };

  const copyAsMarkdown = () => {
    if (!notePack) return;
    let md = `# ${notePack.title}\n\n`;
    md += `**Topic:** ${notePack.topic} | **Grade:** ${profile.gradeLevel}\n\n`;
    md += `## Executive Summary\n${notePack.summary}\n\n`;

    if (notePack.keyConcepts?.length) {
      md += `## Key Concepts\n`;
      notePack.keyConcepts.forEach((c) => {
        md += `- **${c.name}:** ${c.definition}\n  *Analogy:* ${c.exampleOrAnalogy}\n`;
      });
      md += `\n`;
    }

    if (notePack.formulasOrRules?.length) {
      md += `## Formulas & Laws\n`;
      notePack.formulasOrRules.forEach((f) => {
        md += `- **${f.name}:** \`${f.expression}\` (${f.variables})\n`;
      });
      md += `\n`;
    }

    if (notePack.detailedSections?.length) {
      md += `## Detailed Explanations\n`;
      notePack.detailedSections.forEach((s) => {
        md += `### ${s.heading}\n${s.content}\n*Key Takeaway:* ${s.takeaway}\n\n`;
      });
    }

    navigator.clipboard.writeText(md);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const printNotes = () => {
    window.print();
  };

  const isSaved = notePack ? savedPacks.some((p) => p.id === notePack.id) : false;

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-16">
      {/* Header Banner */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-slate-900 via-purple-950/40 to-slate-900 border border-slate-800 shadow-xl relative overflow-hidden">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-purple-500/20 text-purple-300 border border-purple-500/30 mb-2">
              <BookOpen className="w-3.5 h-3.5" />
              <span>AI Study Notes & Active Recall Generator</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
              Curate High-Yield Study Packs & Flashcards
            </h1>
            <p className="text-sm text-slate-300 mt-1 max-w-2xl">
              Turn any topic, chapter, or raw textbook notes into structured revision guides,
              formula cheat sheets, active recall flashcards, and exam checklists.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="px-3 py-1.5 rounded-xl bg-slate-800 border border-slate-700 text-xs font-semibold text-purple-300">
              {savedPacks.length} Saved in Notebook
            </span>
          </div>
        </div>
      </div>

      {/* Input Generator Card */}
      <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-lg space-y-5">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
              Topic or Concept to Master
            </label>
            <input
              type="text"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="e.g. Photosynthesis & Light Reactions, Taylor Series, Cold War..."
              className="w-full px-4 py-2.5 rounded-xl bg-slate-800/90 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 text-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
              Target Study Format
            </label>
            <select
              value={selectedFormat}
              onChange={(e) => setSelectedFormat(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-slate-800/90 border border-slate-700 text-white focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 text-sm"
            >
              <option value="Comprehensive Notes">Comprehensive Notes (In-Depth + Flashcards)</option>
              <option value="Revision Cheat Sheet">Revision Cheat Sheet (High-Yield & Formulas)</option>
              <option value="Flashcards Deck">Flashcards Deck (Active Recall Question & Answers)</option>
              <option value="Mindmap Outline">Hierarchical Conceptual Mindmap Outline</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
            Optional: Paste Lecture Transcript, Textbook Notes, or Syllabi Excerpt
          </label>
          <textarea
            rows={2}
            value={sourceContent}
            onChange={(e) => setSourceContent(e.target.value)}
            placeholder="Paste raw text here if you want EduGenie to condense specific materials..."
            className="w-full p-3 rounded-xl bg-slate-800/70 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 text-xs font-sans"
          />
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
          {/* Quick topic buttons */}
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-xs text-slate-400 font-medium">Suggestions:</span>
            {activeSubject.sampleQuestions.slice(0, 3).map((sq, i) => {
              const shortT = sq.split('?')[0].replace(/^Explain |^What is |^How does /, '');
              return (
                <button
                  key={i}
                  type="button"
                  onClick={() => {
                    setTopic(shortT);
                    handleGenerate(shortT);
                  }}
                  className="text-xs px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-purple-950/60 text-slate-300 hover:text-purple-200 border border-slate-700/60 transition-colors"
                >
                  {shortT.slice(0, 32)}...
                </button>
              );
            })}
          </div>

          <button
            onClick={() => handleGenerate()}
            disabled={(!topic.trim() && !sourceContent.trim()) || loading}
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-600 hover:from-purple-500 hover:to-indigo-500 disabled:opacity-40 text-white font-semibold text-sm shadow-lg shadow-purple-600/30 transition-all active:scale-95"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Crafting Study Pack...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>Generate Study Pack</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Notebook Drawer (Saved Notes) */}
      {savedPacks.length > 0 && (
        <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <Bookmark className="w-3.5 h-3.5 text-purple-400" />
              Saved in My Notebook
            </span>
          </div>
          <div className="flex gap-2.5 overflow-x-auto pb-2">
            {savedPacks.map((pack) => (
              <div
                key={pack.id}
                onClick={() => {
                  setNotePack(pack);
                  setCurrentCardIdx(0);
                  setIsFlipped(false);
                }}
                className={`cursor-pointer p-3 rounded-xl border shrink-0 w-64 transition-all group relative ${
                  notePack?.id === pack.id
                    ? 'bg-purple-900/30 border-purple-500 text-white'
                    : 'bg-slate-800/80 border-slate-700/80 text-slate-300 hover:bg-slate-800'
                }`}
              >
                <div className="font-semibold text-xs truncate mb-1">{pack.title}</div>
                <div className="text-[11px] text-slate-400 line-clamp-1">{pack.topic}</div>
                <button
                  onClick={(e) => handleDeleteSaved(pack.id, e)}
                  className="absolute top-2 right-2 p-1 text-slate-500 hover:text-rose-400 opacity-0 group-hover:opacity-100 transition-opacity"
                  title="Delete saved pack"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Generated Study Pack Content */}
      {notePack && (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
          {/* Action Ribbon */}
          <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-2xl bg-slate-900 border border-slate-800">
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-white truncate max-w-md">{notePack.title}</h2>
              <AudioPlayerButton text={`${notePack.title}. Summary: ${notePack.summary}`} />
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleSaveToNotebook}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
                  isSaved
                    ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300'
                    : 'bg-slate-800 hover:bg-slate-700 border-slate-700 text-slate-200'
                }`}
              >
                <Bookmark className="w-3.5 h-3.5" />
                <span>{isSaved ? 'Saved in Notebook' : 'Save to Notebook'}</span>
              </button>

              <button
                onClick={copyAsMarkdown}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 transition-colors"
                title="Copy as Markdown"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied MD' : 'Copy'}</span>
              </button>

              <button
                onClick={printNotes}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 transition-colors"
                title="Print Notes"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print</span>
              </button>
            </div>
          </div>

          {/* Executive Summary Card */}
          <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-md space-y-3">
            <div className="text-xs font-semibold uppercase tracking-wider text-purple-400 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" /> High-Level Executive Summary
            </div>
            <p className="text-sm text-slate-200 leading-relaxed font-sans">
              {notePack.summary}
            </p>
          </div>

          {/* Interactive Flashcards Carousel (Active Recall) */}
          {notePack.flashcards && notePack.flashcards.length > 0 && (
            <div className="p-6 rounded-2xl bg-gradient-to-b from-slate-900 to-indigo-950/20 border border-indigo-500/30 shadow-xl space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Layers className="w-4 h-4 text-indigo-400" />
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                    Interactive Flashcard Deck ({currentCardIdx + 1} of {notePack.flashcards.length})
                  </h3>
                </div>
                <span className="text-xs text-indigo-300">Click card to flip</span>
              </div>

              {/* The Flippable Card */}
              {notePack.flashcards[currentCardIdx] && (
                <div
                  onClick={() => setIsFlipped(!isFlipped)}
                  className="cursor-pointer min-h-[180px] p-6 rounded-2xl bg-slate-800/90 hover:bg-slate-800 border-2 border-indigo-500/40 shadow-inner flex flex-col justify-between transition-all select-none group"
                >
                  <div className="flex items-center justify-between text-xs text-slate-400">
                    <span className="px-2 py-0.5 rounded-md bg-indigo-500/20 text-indigo-300 font-semibold">
                      {notePack.flashcards[currentCardIdx].category || 'Active Recall'}
                    </span>
                    <span className="flex items-center gap-1 text-slate-400 group-hover:text-indigo-300">
                      <RotateCw className="w-3.5 h-3.5" /> Flip Card
                    </span>
                  </div>

                  <div className="my-auto py-4 text-center">
                    {!isFlipped ? (
                      <div className="text-base sm:text-lg font-semibold text-white">
                        {notePack.flashcards[currentCardIdx].front}
                      </div>
                    ) : (
                      <div className="text-sm sm:text-base font-medium text-emerald-300 animate-in fade-in duration-200">
                        {notePack.flashcards[currentCardIdx].back}
                      </div>
                    )}
                  </div>

                  <div className="text-center text-[11px] text-slate-500">
                    {!isFlipped ? '👉 Prompt (Tap to reveal answer)' : '✅ Answer (Tap to see prompt)'}
                  </div>
                </div>
              )}

              {/* Carousel Controls */}
              <div className="flex items-center justify-between pt-1">
                <button
                  type="button"
                  onClick={() => {
                    setCurrentCardIdx((prev) => Math.max(0, prev - 1));
                    setIsFlipped(false);
                  }}
                  disabled={currentCardIdx === 0}
                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-30 text-xs font-semibold text-slate-200"
                >
                  <ChevronLeft className="w-4 h-4" /> Previous
                </button>

                {/* Dots indicator */}
                <div className="flex items-center gap-1">
                  {notePack.flashcards.map((_, i) => (
                    <button
                      key={i}
                      onClick={() => {
                        setCurrentCardIdx(i);
                        setIsFlipped(false);
                      }}
                      className={`w-2 h-2 rounded-full transition-all ${
                        i === currentCardIdx ? 'w-5 bg-indigo-400' : 'bg-slate-700'
                      }`}
                    />
                  ))}
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setCurrentCardIdx((prev) => Math.min(notePack.flashcards.length - 1, prev + 1));
                    setIsFlipped(false);
                  }}
                  disabled={currentCardIdx === notePack.flashcards.length - 1}
                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-30 text-xs font-semibold text-slate-200"
                >
                  Next <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* Key Concepts Grid */}
          {notePack.keyConcepts && notePack.keyConcepts.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-purple-400" />
                Key Concepts & Real-World Analogies
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {notePack.keyConcepts.map((concept, i) => (
                  <div
                    key={i}
                    className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-md space-y-2.5"
                  >
                    <div className="font-bold text-sm text-purple-300">{concept.name}</div>
                    <p className="text-xs text-slate-300 leading-relaxed">{concept.definition}</p>
                    {concept.exampleOrAnalogy && (
                      <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700/60 text-xs text-amber-200/90">
                        <strong>Analogy:</strong> {concept.exampleOrAnalogy}
                      </div>
                    )}
                    {concept.importance && (
                      <div className="text-[11px] text-slate-400 italic">
                        Why it matters: {concept.importance}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Formulas and Governing Rules */}
          {notePack.formulasOrRules && notePack.formulasOrRules.length > 0 && (
            <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-md space-y-3">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                <FileText className="w-4 h-4 text-emerald-400" />
                Essential Formulas & Theorems
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {notePack.formulasOrRules.map((formula, i) => (
                  <div
                    key={i}
                    className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-xs space-y-1"
                  >
                    <div className="font-semibold text-slate-300">{formula.name}</div>
                    <div className="font-mono text-emerald-400 text-sm">{formula.expression}</div>
                    <div className="text-[11px] text-slate-400">{formula.variables}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Detailed Sections */}
          {notePack.detailedSections && notePack.detailedSections.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                <BookOpen className="w-4 h-4 text-indigo-400" />
                Comprehensive Explanations
              </h3>
              <div className="space-y-4">
                {notePack.detailedSections.map((sec, i) => (
                  <div
                    key={i}
                    className="p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-md space-y-3"
                  >
                    <h4 className="text-base font-bold text-white">{sec.heading}</h4>
                    <div className="text-xs sm:text-sm text-slate-300 leading-relaxed whitespace-pre-wrap">
                      {sec.content}
                    </div>
                    {sec.takeaway && (
                      <div className="pt-2 text-xs font-semibold text-indigo-300 flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-indigo-400" />
                        <span>Takeaway: {sec.takeaway}</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Revision Checklist */}
          {notePack.revisionChecklist && notePack.revisionChecklist.length > 0 && (
            <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-md space-y-3">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                Pre-Exam Revision Checklist
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {notePack.revisionChecklist.map((item, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-2 p-3 rounded-xl bg-slate-800/60 border border-slate-700/60 text-xs text-slate-300"
                  >
                    <input type="checkbox" className="w-4 h-4 rounded text-purple-600 focus:ring-purple-500 cursor-pointer" />
                    <span>{item}</span>
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
