import {
  LearningAnalytics,
  QuizResultRecord,
  StudyNotePack,
  StudyPlan,
  UserProfile,
} from '../types';

const PROFILE_KEY = 'edugenie_user_profile';
const ANALYTICS_KEY = 'edugenie_analytics';
const SAVED_NOTES_KEY = 'edugenie_saved_notes';
const QUIZ_HISTORY_KEY = 'edugenie_quiz_history';
const SAVED_PLAN_KEY = 'edugenie_saved_plan';

export const DEFAULT_PROFILE: UserProfile = {
  name: 'Alex Johnson',
  role: 'student',
  gradeLevel: 'High School (Grades 9-12)',
  learningStyle: 'Step-by-Step Rigorous',
  targetExam: 'College Board AP / Finals',
  preferredLanguage: 'English',
  avatarSeed: 'Felix',
  voiceAudioEnabled: true,
};

export const DEFAULT_ANALYTICS: LearningAnalytics = {
  totalQuestionsSolved: 14,
  totalQuizzesCompleted: 3,
  averageScorePercentage: 88,
  streakDays: 4,
  studyHoursLogged: 12.5,
  subjectMastery: {
    Mathematics: 85,
    'Physics & Engineering': 78,
    'Chemistry & Biology': 65,
    'Computer Science & Coding': 92,
    'History & Social Studies': 70,
    'Literature & Languages': 80,
    'Economics & Business': 60,
    'General Academics': 90,
  },
  recentActivity: [
    {
      id: 'act_1',
      type: 'quiz',
      title: 'Calculus Derivatives & Chain Rule',
      timestamp: Date.now() - 3600000 * 4,
      scoreOrBadge: '100% (5/5)',
    },
    {
      id: 'act_2',
      type: 'doubt',
      title: 'SN1 vs SN2 Reaction Mechanisms',
      timestamp: Date.now() - 3600000 * 20,
      scoreOrBadge: 'Solved in 5 steps',
    },
    {
      id: 'act_3',
      type: 'notes',
      title: 'Quantum Mechanics Dual Nature of Light',
      timestamp: Date.now() - 3600000 * 48,
      scoreOrBadge: 'Study Pack Created',
    },
  ],
};

export const storage = {
  getProfile(): UserProfile {
    try {
      const data = localStorage.getItem(PROFILE_KEY);
      if (data) return JSON.parse(data);
    } catch (e) {
      console.error(e);
    }
    return DEFAULT_PROFILE;
  },

  saveProfile(profile: UserProfile): void {
    try {
      localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
    } catch (e) {
      console.error(e);
    }
  },

  getAnalytics(): LearningAnalytics {
    try {
      const data = localStorage.getItem(ANALYTICS_KEY);
      if (data) return JSON.parse(data);
    } catch (e) {
      console.error(e);
    }
    return DEFAULT_ANALYTICS;
  },

  saveAnalytics(analytics: LearningAnalytics): void {
    try {
      localStorage.setItem(ANALYTICS_KEY, JSON.stringify(analytics));
    } catch (e) {
      console.error(e);
    }
  },

  recordActivity(
    type: 'doubt' | 'quiz' | 'notes' | 'summary' | 'plan' | 'roadmap' | 'explain',
    title: string,
    scoreOrBadge?: string,
    subjectName?: string
  ): void {
    const current = this.getAnalytics();
    const newActivity = {
      id: 'act_' + Date.now(),
      type,
      title,
      timestamp: Date.now(),
      scoreOrBadge,
    };

    let updatedQuestions = current.totalQuestionsSolved;
    let updatedQuizzes = current.totalQuizzesCompleted;
    if (type === 'doubt') updatedQuestions += 1;
    if (type === 'quiz') updatedQuizzes += 1;

    const updatedMastery = { ...current.subjectMastery };
    if (subjectName && updatedMastery[subjectName] !== undefined) {
      updatedMastery[subjectName] = Math.min(100, updatedMastery[subjectName] + 3);
    }

    const updated: LearningAnalytics = {
      ...current,
      totalQuestionsSolved: updatedQuestions,
      totalQuizzesCompleted: updatedQuizzes,
      studyHoursLogged: Number((current.studyHoursLogged + 0.25).toFixed(1)),
      subjectMastery: updatedMastery,
      recentActivity: [newActivity, ...current.recentActivity.slice(0, 19)],
    };
    this.saveAnalytics(updated);
  },

  recordQuizResult(result: QuizResultRecord): void {
    try {
      const history = this.getQuizHistory();
      const updated = [result, ...history.slice(0, 29)];
      localStorage.setItem(QUIZ_HISTORY_KEY, JSON.stringify(updated));

      // Update analytics average
      const current = this.getAnalytics();
      const allPercentages = updated.map((q) => q.percentage);
      const avg = Math.round(allPercentages.reduce((a, b) => a + b, 0) / allPercentages.length);
      const updatedAnalytics: LearningAnalytics = {
        ...current,
        totalQuizzesCompleted: current.totalQuizzesCompleted + 1,
        averageScorePercentage: avg,
      };
      this.saveAnalytics(updatedAnalytics);
    } catch (e) {
      console.error(e);
    }
  },

  getQuizHistory(): QuizResultRecord[] {
    try {
      const data = localStorage.getItem(QUIZ_HISTORY_KEY);
      if (data) return JSON.parse(data);
    } catch (e) {
      console.error(e);
    }
    return [];
  },

  getSavedNotes(): StudyNotePack[] {
    try {
      const data = localStorage.getItem(SAVED_NOTES_KEY);
      if (data) return JSON.parse(data);
    } catch (e) {
      console.error(e);
    }
    return [];
  },

  saveNotePack(pack: StudyNotePack): void {
    try {
      const notes = this.getSavedNotes();
      const existingIdx = notes.findIndex((n) => n.id === pack.id);
      let updated: StudyNotePack[];
      if (existingIdx >= 0) {
        updated = [...notes];
        updated[existingIdx] = pack;
      } else {
        updated = [pack, ...notes];
      }
      localStorage.setItem(SAVED_NOTES_KEY, JSON.stringify(updated));
    } catch (e) {
      console.error(e);
    }
  },

  deleteNotePack(id: string): void {
    try {
      const notes = this.getSavedNotes().filter((n) => n.id !== id);
      localStorage.setItem(SAVED_NOTES_KEY, JSON.stringify(notes));
    } catch (e) {
      console.error(e);
    }
  },

  getSavedPlan(): StudyPlan | null {
    try {
      const data = localStorage.getItem(SAVED_PLAN_KEY);
      if (data) return JSON.parse(data);
    } catch (e) {
      console.error(e);
    }
    return null;
  },

  savePlan(plan: StudyPlan): void {
    try {
      localStorage.setItem(SAVED_PLAN_KEY, JSON.stringify(plan));
    } catch (e) {
      console.error(e);
    }
  },
};
