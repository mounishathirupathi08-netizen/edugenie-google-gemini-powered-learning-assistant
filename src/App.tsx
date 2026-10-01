/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { Navigation, TabKey } from './components/Navigation';
import { TaskSelectorBar } from './components/TaskSelectorBar';
import { ProfileModal } from './components/ProfileModal';
import { TutorChatView } from './components/views/TutorChatView';
import { TopicExplainerView } from './components/views/TopicExplainerView';
import { DoubtSolverView } from './components/views/DoubtSolverView';
import { LearningPathView } from './components/views/LearningPathView';
import { StudyNotesView } from './components/views/StudyNotesView';
import { QuizView } from './components/views/QuizView';
import { SummarizerView } from './components/views/SummarizerView';
import { StudyPlannerView } from './components/views/StudyPlannerView';
import { TeacherToolkitView } from './components/views/TeacherToolkitView';
import { AnalyticsView } from './components/views/AnalyticsView';
import { Language, SubjectItem, UserProfile } from './types';
import { SUBJECTS } from './data/subjects';
import { storage } from './services/storage';

export default function App() {
  const [profile, setProfile] = useState<UserProfile>(storage.getProfile());
  const [activeSubject, setActiveSubject] = useState<SubjectItem>(SUBJECTS[0]);
  const [activeTab, setActiveTab] = useState<TabKey>('chat');
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [initialDoubtQuestion, setInitialDoubtQuestion] = useState('');

  // Synchronize role change
  const handleToggleRole = () => {
    const updated: UserProfile = {
      ...profile,
      role: profile.role === 'student' ? 'teacher' : 'student',
    };
    setProfile(updated);
    storage.saveProfile(updated);
    if (updated.role === 'teacher') {
      setActiveTab('teacher');
    } else {
      setActiveTab('chat');
    }
  };

  const handleSaveProfile = (updated: UserProfile) => {
    setProfile(updated);
    storage.saveProfile(updated);
  };

  const handleChangeLanguage = (lang: Language) => {
    const updated: UserProfile = { ...profile, preferredLanguage: lang };
    setProfile(updated);
    storage.saveProfile(updated);
  };

  const handleSolveDoubtRedirect = (q: string) => {
    setInitialDoubtQuestion(q);
    setActiveTab('doubt');
  };

  const handleSelectSubjectAndTab = (sub: SubjectItem, tab: string) => {
    setActiveSubject(sub);
    setActiveTab(tab as TabKey);
  };

  const analytics = storage.getAnalytics();

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-['Plus_Jakarta_Sans',sans-serif]">
      {/* Header */}
      <Header
        profile={profile}
        activeSubject={activeSubject}
        onSelectSubject={setActiveSubject}
        onOpenProfile={() => setIsProfileOpen(true)}
        streakDays={analytics.streakDays}
        onToggleRole={handleToggleRole}
        onChangeLanguage={handleChangeLanguage}
      />

      {/* Primary Navigation Tabs */}
      <Navigation
        activeTab={activeTab}
        onTabChange={(tab) => {
          setActiveTab(tab);
          if (tab !== 'doubt') setInitialDoubtQuestion('');
        }}
        role={profile.role}
      />

      {/* Main View Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <TaskSelectorBar activeTab={activeTab} onSelectTask={setActiveTab} />

        {activeTab === 'chat' && (
          <TutorChatView
            profile={profile}
            activeSubject={activeSubject}
            onSolveDoubtRedirect={handleSolveDoubtRedirect}
          />
        )}

        {activeTab === 'explain' && (
          <TopicExplainerView
            profile={profile}
            activeSubject={activeSubject}
            onNavigateToQuiz={() => setActiveTab('quiz')}
            onNavigateToDoubt={(q) => {
              setInitialDoubtQuestion(q);
              setActiveTab('doubt');
            }}
          />
        )}

        {activeTab === 'doubt' && (
          <DoubtSolverView
            profile={profile}
            activeSubject={activeSubject}
            initialQuestion={initialDoubtQuestion}
          />
        )}

        {activeTab === 'roadmap' && (
          <LearningPathView
            profile={profile}
            activeSubject={activeSubject}
            onStartModuleStudy={(moduleTitle) => {
              setInitialDoubtQuestion(`Explain and guide me through: ${moduleTitle}`);
              setActiveTab('chat');
            }}
          />
        )}

        {activeTab === 'quiz' && (
          <QuizView profile={profile} activeSubject={activeSubject} />
        )}

        {activeTab === 'summary' && (
          <SummarizerView profile={profile} activeSubject={activeSubject} />
        )}

        {activeTab === 'notes' && (
          <StudyNotesView profile={profile} activeSubject={activeSubject} />
        )}

        {activeTab === 'planner' && (
          <StudyPlannerView profile={profile} activeSubject={activeSubject} />
        )}

        {activeTab === 'teacher' && (
          <TeacherToolkitView profile={profile} activeSubject={activeSubject} />
        )}

        {activeTab === 'analytics' && (
          <AnalyticsView
            profile={profile}
            onSelectSubjectAndTab={handleSelectSubjectAndTab}
          />
        )}
      </main>

      {/* Profile Settings Modal */}
      <ProfileModal
        isOpen={isProfileOpen}
        onClose={() => setIsProfileOpen(false)}
        profile={profile}
        onSave={handleSaveProfile}
      />

      {/* Footer */}
      <footer className="border-t border-slate-800/80 bg-slate-900/60 py-4 mt-auto">
        <div className="max-w-7xl mx-auto px-4 text-center text-xs text-slate-500 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div>
            <strong>EduGenie</strong> — Google Gemini Powered Learning Assistant
          </div>
          <div className="flex items-center gap-4 text-slate-400">
            <span>Level: {profile.gradeLevel}</span>
            <span>•</span>
            <span>Language: {profile.preferredLanguage}</span>
            <span>•</span>
            <button
              onClick={() => setIsProfileOpen(true)}
              className="text-indigo-400 hover:underline"
            >
              Configure Profile
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}
