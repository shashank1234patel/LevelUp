import { Timestamp } from 'firebase/firestore';

export type SubjectCategory =
  | 'Science'
  | 'Mathematics'
  | 'Computer Science'
  | 'History'
  | 'Literature'
  | 'Economics'
  | 'General';

export type DifficultyLevel = 'Beginner' | 'Intermediate' | 'Advanced';

export interface TopicItem {
  id: string;
  title: string;
  summary: string;
  estimatedMinutes: number;
  subtopics: string[];
}

export interface ExplanationItem {
  topicId: string;
  title: string;
  simpleExplanation: string;
  realWorldExample: string;
  keyConcept: string;
  visualAnalogy: string;
}

export interface FlashcardItem {
  id: string;
  term: string;
  definition: string;
  category: string;
}

export interface MindMapNode {
  id: string;
  label: string;
  detail: string;
}

export interface MindMapBranch {
  id: string;
  label: string;
  color: string;
  nodes: MindMapNode[];
}

export interface MindMapStructure {
  rootLabel: string;
  branches: MindMapBranch[];
}

export interface QuizQuestion {
  id: string;
  type: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  topicTag: string;
}

export interface ChapterBlueprint {
  id: string;
  userId: string;
  title: string;
  subject: SubjectCategory;
  difficulty: DifficultyLevel;
  estimatedMinutes: number;
  sourceSummary: string;
  currentStage: number; // 1 = Topics, 2 = Explanation, 3 = Revision, 4 = Mind Maps, 5 = Test
  completedStages: number[];
  understoodTopicIds: string[];
  progressPercent: number;
  testScore: number;
  xpEarned: number;
  status: 'in_progress' | 'completed';
  topics: TopicItem[];
  explanations: ExplanationItem[];
  revisionNotes: string[];
  flashcards: FlashcardItem[];
  mindMap: MindMapStructure;
  quizQuestions: QuizQuestion[];
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
}

export interface UserProfile {
  userId: string;
  displayName: string;
  avatarUrl: string;
  level: number;
  xp: number;
  streak: number;
  chaptersCompleted: number;
  totalStudyMinutes: number;
  totalQuizzesTaken: number;
  averageTestScore: number;
  dailyChallengeCompletedDate: string;
  unlockedBadges: string[];
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
}

export interface BadgeDefinition {
  id: string;
  name: string;
  description: string;
  xpReward: number;
  iconName: string;
  gradient: string;
  requirementText: string;
}

export type ActivePage =
  | 'landing'
  | 'auth'
  | 'dashboard'
  | 'my-learning'
  | 'upload'
  | 'blueprint'
  | 'journey'
  | 'stage'
  | 'results'
  | 'achievements'
  | 'ai-tutor'
  | 'profile'
  | 'settings';
