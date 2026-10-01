import React from 'react';
import {
  MessageSquare,
  Lightbulb,
  Trophy,
  FileText,
  Compass,
  HelpCircle,
} from 'lucide-react';
import { TabKey } from './Navigation';

interface TaskSelectorBarProps {
  activeTab: TabKey;
  onSelectTask: (tab: TabKey) => void;
}

export const TaskSelectorBar: React.FC<TaskSelectorBarProps> = ({
  activeTab,
  onSelectTask,
}) => {
  const tasks = [
    {
      id: 'chat' as TabKey,
      title: 'AI Question & Answer',
      subtitle: 'Smart & concise academic answers',
      icon: <MessageSquare className="w-4 h-4 text-indigo-400" />,
      color: 'hover:border-indigo-500/80',
    },
    {
      id: 'explain' as TabKey,
      title: 'Simple Concept Explanation',
      subtitle: 'Complex ideas made easy (ELI5)',
      icon: <Lightbulb className="w-4 h-4 text-teal-400" />,
      color: 'hover:border-teal-500/80',
    },
    {
      id: 'quiz' as TabKey,
      title: 'Quiz & Corrections',
      subtitle: 'MCQs with wrong-answer feedback',
      icon: <Trophy className="w-4 h-4 text-emerald-400" />,
      color: 'hover:border-emerald-500/80',
    },
    {
      id: 'summary' as TabKey,
      title: 'Text Summarization',
      subtitle: 'Convert lengthy content into takeaways',
      icon: <FileText className="w-4 h-4 text-cyan-400" />,
      color: 'hover:border-cyan-500/80',
    },
    {
      id: 'roadmap' as TabKey,
      title: 'Personalized Learning Path',
      subtitle: 'Beginner to advanced with resources',
      icon: <Compass className="w-4 h-4 text-blue-400" />,
      color: 'hover:border-blue-500/80',
    },
    {
      id: 'doubt' as TabKey,
      title: 'Step-by-Step Solver',
      subtitle: 'Rigorous derivations & sanity checks',
      icon: <HelpCircle className="w-4 h-4 text-purple-400" />,
      color: 'hover:border-purple-500/80',
    },
  ];

  return (
    <div className="mb-6">
      <div className="flex items-center justify-between mb-2.5">
        <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
          <span>⚡ Select Educational Task:</span>
        </span>
        <span className="text-[11px] text-slate-400 hidden sm:inline">
          Fast, lightweight, real-time Gemini AI results
        </span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
        {tasks.map((task) => {
          const isActive = activeTab === task.id;
          return (
            <button
              key={task.id}
              type="button"
              onClick={() => onSelectTask(task.id)}
              className={`p-3 rounded-xl border text-left transition-all flex flex-col justify-between ${
                isActive
                  ? 'bg-slate-800 border-indigo-500 shadow-md ring-1 ring-indigo-500/40'
                  : 'bg-slate-900/80 border-slate-800/80 hover:bg-slate-850 ' + task.color
              }`}
            >
              <div className="flex items-center gap-2 mb-1.5">
                <div className="p-1 rounded-lg bg-slate-950/80 border border-slate-800 shrink-0">
                  {task.icon}
                </div>
                <span
                  className={`text-xs font-bold leading-tight truncate ${
                    isActive ? 'text-white' : 'text-slate-200'
                  }`}
                >
                  {task.title}
                </span>
              </div>
              <p className="text-[10.5px] text-slate-400 line-clamp-1 leading-snug">
                {task.subtitle}
              </p>
            </button>
          );
        })}
      </div>
    </div>
  );
};
