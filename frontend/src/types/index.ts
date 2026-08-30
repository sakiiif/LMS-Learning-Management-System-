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
