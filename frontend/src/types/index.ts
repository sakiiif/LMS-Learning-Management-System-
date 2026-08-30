export type Course = {
  id: number;
  documentId: string;
  title: string;
  description: string | null;
  instructors?: { id: number; fullName?: string; username: string }[];
  lessons?: Lesson[];
};

export type Lesson = {
  id: number;
  documentId: string;
  title: string;
  content: any | null; // string to any for safe richText
  videoUrl: string | null;
  order: number;
};

export type Enrollment = {
  id: number;
  documentId: string;
  enrolledAt: string;
  course: Course;
};

export type LessonProgress = {
  id: number;
  documentId: string;
  completed: boolean;
  completedAt: string | null;
  lesson: Lesson;
};

export type LessonWithProgress = Lesson & {
  progress: LessonProgress | null;
};

export type Question = {
  id: number;
  documentId: string;
  text: string;
  options: string[];
  // correctAnswer intentionally omitted — backend strips it for Students
};

export type Quiz = {
  id: number;
  documentId: string;
  title: string;
  questions?: Question[];
};

export type QuizResult = {
  id: number;
  documentId: string;
  score: number;
  submittedAt: string;
  answers: Record<string, string>;
  quiz: Quiz;
  totalQuestions?: number;
};

export type CourseWithRelations = Course & {
  instructors?: { id: number; username: string; fullName?: string }[];
};