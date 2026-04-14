export interface LessonQuestion {
  id: string;
  lessonId: string;
  questionText: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  orderIndex: number;
}

export interface CurriculumItem {
  id: string;
  title: string;
  duration: string;
  readingTime: string;
  isLocked: boolean;
  content?: string;
  orderIndex: number;
  questions?: LessonQuestion[];
}

export interface Course {
  id: string;
  title: string;
  description: string;
  instructor: string;
  duration: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  tags: string[];
  lessons: number;
  lessons_count?: number;
  price: number;
  thumbnail: string;
  curriculum?: CurriculumItem[];
}

export interface StudentProgress {
  courseId: string;
  completedLessons: number;
  totalLessons: number;
  lastAccessed: string;
}

export interface Question {
  id: string;
  text: string;
  options: string[];
  correctOptionIndex: number;
  explanation: string;
  subject: 'Quant' | 'LRDI' | 'VARC';
  difficulty: 'Low' | 'Medium' | 'High';
}

export interface MockTest {
  id: string;
  title: string;
  durationMinutes: number;
  totalQuestions: number;
  questions: Question[];
}

export interface Analytics {
  totalMocksTaken: number;
  averageScorePercentage: number;
  timePerCorrectQuestion: number; // in seconds
  accuracyRate: number; // 0-100
}
