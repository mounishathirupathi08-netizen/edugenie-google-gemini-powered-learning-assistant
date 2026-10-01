import {
  DoubtSolution,
  GradeLevel,
  Language,
  LearningPath,
  LearningStyle,
  QuizData,
  QuestionBankResult,
  StudyNotePack,
  StudyPlan,
  SummaryResult,
  TeacherToolkitResult,
  TopicExplanation,
} from '../types';

export interface ChatPayload {
  message?: string;
  history?: { role: 'user' | 'assistant'; content: string }[];
  subject?: string;
  gradeLevel?: GradeLevel;
  learningStyle?: LearningStyle;
  socraticMode?: boolean;
  conciseMode?: boolean;
  language?: Language;
  imageBase64?: string;
  imageMimeType?: string;
}

export interface DoubtPayload {
  question?: string;
  subject?: string;
  gradeLevel?: GradeLevel;
  language?: Language;
  imageBase64?: string;
  imageMimeType?: string;
}

export interface NotePayload {
  topic: string;
  sourceContent?: string;
  subject?: string;
  gradeLevel?: GradeLevel;
  format?: string;
  language?: Language;
}

export interface QuizPayload {
  topic: string;
  subject?: string;
  gradeLevel?: GradeLevel;
  difficulty?: string;
  numQuestions?: number;
  language?: Language;
}

export interface SummarizePayload {
  content: string;
  mode?: string;
  gradeLevel?: GradeLevel;
  language?: Language;
}

export interface QuestionBankPayload {
  topic: string;
  subject?: string;
  gradeLevel?: GradeLevel;
  questionType?: string;
  count?: number;
  language?: Language;
}

export interface ExplainTopicPayload {
  topic: string;
  simplicityLevel?: 'eli5' | 'simplified' | 'standard' | 'rigorous';
  subject?: string;
  gradeLevel?: GradeLevel;
  language?: Language;
}

export interface LearningRoadmapPayload {
  goal: string;
  subject?: string;
  currentLevel?: string;
  durationWeeks?: number;
  hoursPerWeek?: number;
  language?: Language;
}

export interface StudyPlanPayload {
  goal: string;
  subjects?: string[];
  daysAvailable?: number;
  hoursPerDay?: number;
  currentLevel?: string;
  examDate?: string;
  language?: Language;
}

export interface TeacherToolkitPayload {
  topic: string;
  gradeLevel?: string;
  subject?: string;
  toolType?: string;
  durationMinutes?: number;
  language?: Language;
}

export const api = {
  async sendChat(payload: ChatPayload): Promise<string> {
    const res = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: 'Request failed' }));
      throw new Error(err.error || `HTTP error ${res.status}`);
    }
    const data = await res.json();
    return data.reply;
  },

  async solveDoubt(payload: DoubtPayload): Promise<DoubtSolution> {
    const res = await fetch('/api/solve-doubt', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: 'Request failed' }));
      throw new Error(err.error || `HTTP error ${res.status}`);
    }
    return res.json();
  },

  async generateNotes(payload: NotePayload): Promise<StudyNotePack> {
    const res = await fetch('/api/generate-notes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: 'Request failed' }));
      throw new Error(err.error || `HTTP error ${res.status}`);
    }
    const data = await res.json();
    return {
      ...data,
      id: 'notes_' + Date.now(),
      createdAt: Date.now(),
    };
  },

  async generateQuiz(payload: QuizPayload): Promise<QuizData> {
    const res = await fetch('/api/generate-quiz', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: 'Request failed' }));
      throw new Error(err.error || `HTTP error ${res.status}`);
    }
    return res.json();
  },

  async summarizeText(payload: SummarizePayload): Promise<SummaryResult> {
    const res = await fetch('/api/summarize', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: 'Request failed' }));
      throw new Error(err.error || `HTTP error ${res.status}`);
    }
    return res.json();
  },

  async generateQuestions(payload: QuestionBankPayload): Promise<QuestionBankResult> {
    const res = await fetch('/api/generate-questions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: 'Request failed' }));
      throw new Error(err.error || `HTTP error ${res.status}`);
    }
    return res.json();
  },

  async generateStudyPlan(payload: StudyPlanPayload): Promise<StudyPlan> {
    const res = await fetch('/api/study-plan', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: 'Request failed' }));
      throw new Error(err.error || `HTTP error ${res.status}`);
    }
    return res.json();
  },

  async generateTeacherToolkit(payload: TeacherToolkitPayload): Promise<TeacherToolkitResult> {
    const res = await fetch('/api/teacher-toolkit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: 'Request failed' }));
      throw new Error(err.error || `HTTP error ${res.status}`);
    }
    return res.json();
  },

  async explainTopic(payload: ExplainTopicPayload): Promise<TopicExplanation> {
    const res = await fetch('/api/explain-topic', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: 'Request failed' }));
      throw new Error(err.error || `HTTP error ${res.status}`);
    }
    return res.json();
  },

  async generateLearningPath(payload: LearningRoadmapPayload): Promise<LearningPath> {
    const res = await fetch('/api/learning-path', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: 'Request failed' }));
      throw new Error(err.error || `HTTP error ${res.status}`);
    }
    const data = await res.json();
    return {
      ...data,
      id: data.id || 'path_' + Date.now(),
      createdAt: data.createdAt || Date.now(),
    };
  },

  async generateSpeech(text: string, voice = 'Kore'): Promise<string> {
    const res = await fetch('/api/tts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text, voice }),
    });
    if (!res.ok) {
      throw new Error('TTS failed');
    }
    const data = await res.json();
    return `data:audio/wav;base64,${data.audioBase64}`;
  },
};
