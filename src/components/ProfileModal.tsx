import React, { useState } from 'react';
import { X, User, BookOpen, Brain, Globe, Sparkles, Check } from 'lucide-react';
import { GradeLevel, Language, LearningStyle, UserProfile, UserRole } from '../types';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: UserProfile;
  onSave: (updated: UserProfile) => void;
}

const GRADE_LEVELS: GradeLevel[] = [
  'Elementary School (Grades 1-5)',
  'Middle School (Grades 6-8)',
  'High School (Grades 9-12)',
  'College / Undergraduate',
  'Postgraduate / Professional',
];

const LEARNING_STYLES: { id: LearningStyle; title: string; desc: string }[] = [
  {
    id: 'Step-by-Step Rigorous',
    title: 'Step-by-Step Rigorous',
    desc: 'Deep analytical derivations, proofs, and structured logic.',
  },
  {
    id: 'Visual & Analogies',
    title: 'Visual & Real-World Analogies',
    desc: 'Metaphors, mental models, and intuitive scenarios.',
  },
  {
    id: 'Hands-On & Code',
    title: 'Hands-On & Practical Code',
    desc: 'Executable examples, practical applications, and code snippets.',
  },
  {
    id: 'Bullet Points & Fast Summary',
    title: 'Bullet Points & High Yield',
    desc: 'Concise executive summaries, checklists, and key takeaways.',
  },
];

const LANGUAGES: Language[] = [
  'English',
  'Spanish',
  'French',
  'German',
  'Hindi',
  'Mandarin',
  'Japanese',
  'Portuguese',
  'Arabic',
];

export const ProfileModal: React.FC<ProfileModalProps> = ({
  isOpen,
  onClose,
  profile,
  onSave,
}) => {
  const [formData, setFormData] = useState<UserProfile>(profile);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-xl max-h-[90vh] overflow-y-auto rounded-2xl bg-slate-900 border border-slate-700/80 shadow-2xl p-6 text-slate-100">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-6">
          <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center text-white shadow-lg shadow-indigo-500/20">
            <User className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">Learner & Profile Settings</h2>
            <p className="text-xs text-slate-400">
              Personalize EduGenie to match your academic grade, learning style, and language.
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Role Switcher */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
              Primary Role
            </label>
            <div className="grid grid-cols-2 gap-3">
              {(['student', 'teacher'] as UserRole[]).map((role) => (
                <button
                  key={role}
                  type="button"
                  onClick={() => setFormData({ ...formData, role })}
                  className={`flex items-center justify-center gap-2 p-3 rounded-xl border text-sm font-medium transition-all ${
                    formData.role === role
                      ? 'bg-indigo-600/20 border-indigo-500 text-indigo-300 ring-1 ring-indigo-500/40 shadow-inner'
                      : 'bg-slate-800/60 border-slate-700/80 text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  <span className="text-lg">{role === 'student' ? '🎓' : '👩‍🏫'}</span>
                  <span className="capitalize">{role === 'student' ? 'Student / Learner' : 'Teacher / Educator'}</span>
                  {formData.role === role && <Check className="w-4 h-4 ml-auto text-indigo-400" />}
                </button>
              ))}
            </div>
          </div>

          {/* Name & Target Exam */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                Your Name
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800/80 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                Target Exam or Academic Goal
              </label>
              <input
                type="text"
                value={formData.targetExam}
                onChange={(e) => setFormData({ ...formData, targetExam: e.target.value })}
                placeholder="e.g. AP Exams, SAT, Finals, Master Python"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800/80 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-sm"
              />
            </div>
          </div>

          {/* Grade Level */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5 flex items-center gap-1.5">
              <BookOpen className="w-3.5 h-3.5 text-indigo-400" />
              Academic Grade / Level
            </label>
            <select
              value={formData.gradeLevel}
              onChange={(e) => setFormData({ ...formData, gradeLevel: e.target.value as GradeLevel })}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800/80 border border-slate-700 text-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-sm"
            >
              {GRADE_LEVELS.map((level) => (
                <option key={level} value={level} className="bg-slate-900 text-white">
                  {level}
                </option>
              ))}
            </select>
          </div>

          {/* Learning Style */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2 flex items-center gap-1.5">
              <Brain className="w-3.5 h-3.5 text-purple-400" />
              Preferred Learning Style
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {LEARNING_STYLES.map((style) => (
                <button
                  key={style.id}
                  type="button"
                  onClick={() => setFormData({ ...formData, learningStyle: style.id })}
                  className={`text-left p-3 rounded-xl border transition-all ${
                    formData.learningStyle === style.id
                      ? 'bg-purple-600/20 border-purple-500/80 text-white ring-1 ring-purple-500/40'
                      : 'bg-slate-800/50 border-slate-700/60 text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  <div className="font-semibold text-xs text-purple-200 mb-0.5">{style.title}</div>
                  <div className="text-[11px] text-slate-400 leading-tight">{style.desc}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Preferred Language */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5 flex items-center gap-1.5">
              <Globe className="w-3.5 h-3.5 text-emerald-400" />
              Language for Explanations
            </label>
            <select
              value={formData.preferredLanguage}
              onChange={(e) => setFormData({ ...formData, preferredLanguage: e.target.value as Language })}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800/80 border border-slate-700 text-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-sm"
            >
              {LANGUAGES.map((lang) => (
                <option key={lang} value={lang} className="bg-slate-900 text-white">
                  {lang}
                </option>
              ))}
            </select>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="inline-flex items-center gap-2 px-5 py-2 text-xs font-semibold text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 rounded-xl shadow-lg shadow-indigo-600/30 transition-all active:scale-95"
            >
              <Sparkles className="w-3.5 h-3.5" />
              Save Preferences
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
