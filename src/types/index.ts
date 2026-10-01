export type UserRole = 'student' | 'teacher';

export type GradeLevel =
  | 'Elementary School (Grades 1-5)'
  | 'Middle School (Grades 6-8)'
  | 'High School (Grades 9-12)'
  | 'College / Undergraduate'
  | 'Postgraduate / Professional';

export type LearningStyle =
  | 'Visual & Analogies'
  | 'Step-by-Step Rigorous'
  | 'Hands-On & Code'
  | 'Bullet Points & Fast Summary';

export type Language =
  | 'English'
  | 'Spanish'
  | 'French'
  | 'German'
  | 'Hindi'
  | 'Mandarin'
  | 'Japanese'
  | 'Portuguese'
  | 'Arabic';

export interface UserProfile {
  name: string;
  role: UserRole;
  gradeLevel: GradeLevel;
  learningStyle: LearningStyle;
  targetExam: string;
  preferredLanguage: Language;
  avatarSeed: string;
  voiceAudioEnabled: boolean;
}

export interface SubjectItem {
  id: string;
  name: string;
  icon: string;
  color: string;
  description: string;
  sampleQuestions: string[];
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
  subject?: string;
  hasAudio?: boolean;
}

export interface DoubtStep {
  stepNumber: number;
  title: string;
  explanation: string;
  calculationOrCode?: string;
  tip?: string;
}

export interface DoubtSolution {
  problemTitle: string;
  subjectCategory: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  conceptOverview: string;
  keyFormulas: string[];
  steps: DoubtStep[];
  finalAnswer: string;
  commonPitfalls: string[];
  verificationCheck: string;
  practiceQuestions: { question: string; hint: string }[];
}

export interface KeyConcept {
  name: string;
  definition: string;
  exampleOrAnalogy: string;
  importance: string;
}

export interface DetailedSection {
  heading: string;
  content: string;
  takeaway: string;
}

export interface FormulaRule {
  name: string;
  expression: string;
  variables: string;
}

export interface Flashcard {
  front: string;
  back: string;
  category: string;
}

export interface StudyNotePack {
  id: string;
  title: string;
  topic: string;
  summary: string;
  keyConcepts: KeyConcept[];
  detailedSections: DetailedSection[];
  formulasOrRules: FormulaRule[];
  flashcards: Flashcard[];
  revisionChecklist: string[];
  createdAt: number;
}

export interface QuizQuestion {
  id: number;
  question: string;
  options: string[];
  correctAnswerIndex: number;
  explanation: string;
  hint: string;
  conceptTested?: string;
}

export interface QuizData {
  quizTitle: string;
  topic: string;
  difficulty: string;
  estimatedMinutes: number;
  questions: QuizQuestion[];
}

export interface QuizResultRecord {
  id: string;
  title: string;
  topic: string;
  subject: string;
  score: number;
  total: number;
  percentage: number;
  completedAt: number;
}

export interface SummaryResult {
  title: string;
  oneSentenceHook: string;
  readTimeMinutes: number;
  keyTakeaways: string[];
  structuredSummary: string;
  glossary: { term: string; definition: string }[];
  potentialExamQuestions: string[];
}

export interface QuestionBankItem {
  id: number;
  type: string;
  question: string;
  marks: number;
  difficulty: string;
  modelAnswer: string;
  keyPointsExpected: string[];
  examinerTip: string;
}

export interface QuestionBankResult {
  topic: string;
  targetExamLevel: string;
  questions: QuestionBankItem[];
}

export interface StudyPlanDay {
  day: number;
  focusSubject: string;
  topics: string[];
  durationHours: number;
  activeRecallActivity: string;
  milestone: string;
  completed?: boolean;
}

export interface StudyPlan {
  planTitle: string;
  goal: string;
  totalStudyHours: number;
  strategyOverview: string;
  phases: { phaseName: string; durationDays: string; focus: string }[];
  dailySchedule: StudyPlanDay[];
  habitsAndTips: string[];
}

export interface TeacherToolkitResult {
  title: string;
  topic: string;
  gradeLevel: string;
  subject: string;
  learningObjectives: string[];
  lessonBreakdown: { stage: string; activity: string; teacherGuidance: string }[];
  differentiatedInstruction: { supportForStruggling: string; extensionForAdvanced: string };
  printableWorksheetQuestions: { questionNumber: number; questionText: string; expectedAnswer: string; pointValue: number }[];
}

export interface TopicExplanation {
  topic: string;
  simplicityLevel: 'eli5' | 'simplified' | 'standard' | 'rigorous';
  oneSentenceSummary: string;
  analogy: string;
  breakdownPoints: { title: string; explanation: string }[];
  whyItMatters: string;
  commonMisconceptions: string[];
  quickCheckQuestion: { question: string; answer: string };
}

export interface LearningPathModule {
  id: string;
  title: string;
  description: string;
  prerequisites: string[];
  keyTopics: string[];
  handsOnTask: string;
  estimatedHours: number;
  completed?: boolean;
}

export interface LearningPathPhase {
  phaseNumber: number;
  phaseTitle: string;
  description: string;
  estimatedWeeks: number;
  modules: LearningPathModule[];
  usefulResources?: { name: string; type: string; description: string }[];
}

export interface LearningPath {
  id: string;
  title: string;
  targetGoal: string;
  totalWeeks: number;
  totalHours: number;
  phases: LearningPathPhase[];
  careerOrAcademicImpact: string;
  mentorAdvice: string;
  recommendedResources?: { title: string; category: string; description: string }[];
  createdAt: number;
}

export interface LearningAnalytics {
  totalQuestionsSolved: number;
  totalQuizzesCompleted: number;
  averageScorePercentage: number;
  streakDays: number;
  studyHoursLogged: number;
  subjectMastery: Record<string, number>; // subject name -> mastery % (0-100)
  recentActivity: {
    id: string;
    type: 'doubt' | 'quiz' | 'notes' | 'summary' | 'plan' | 'roadmap' | 'explain';
    title: string;
    timestamp: number;
    scoreOrBadge?: string;
  }[];
}
