import { getSession } from '@/lib/session';
import { apiFetch } from '@/lib/api';
import { redirect, notFound } from 'next/navigation';
import Link from 'next/link';
import type { Course, LessonProgress, LessonWithProgress } from '@/types';

export default async function CourseDetailPage({
  params,
}: {
  params: Promise<{ documentId: string }>;
}) {
  const { documentId } = await params;
  const session = await getSession();
  if (!session) redirect('/login');

  // Fetch the course with its lessons populated
  const courseRes = await apiFetch(
    `/api/courses/${documentId}?populate=lessons`,
    { token: session.token }
  );
  const course: Course = courseRes.data;

  if (!course) notFound();

  // Fetch this student's progress records to know which lessons are done
  const progressRes = await apiFetch('/api/lesson-progresses', { token: session.token });
  const progressRecords: LessonProgress[] = progressRes.data;

  const lessons = (course.lessons || []).sort((a, b) => a.order - b.order);

  const lessonsWithProgress: LessonWithProgress[] = lessons.map((lesson) => ({
    ...lesson,
    progress: progressRecords.find((p) => p.lesson?.id === lesson.id) || null,
  }));

  const completedCount = lessonsWithProgress.filter((l) => l.progress?.completed).length;
  const progressPercent =
    lessons.length > 0 ? Math.round((completedCount / lessons.length) * 100) : 0;

  return (
    <div className="p-8 max-w-3xl mx-auto">
      <Link
        href="/dashboard/student/my-courses"
        className="text-sm text-slate-500 hover:text-slate-900 mb-4 inline-block"
      >
        ← My Courses
      </Link>

      <h1 className="text-2xl font-semibold text-slate-900">{course.title}</h1>
      {course.description && (
        <p className="text-slate-500 mt-1">{course.description}</p>
      )}

      <div className="mt-6 mb-8">
        <div className="flex justify-between text-sm text-slate-600 mb-1">
          <span>Progress</span>
          <span>
            {completedCount} of {lessons.length} lessons · {progressPercent}%
          </span>
        </div>
        <div className="w-full bg-slate-200 rounded-full h-2">
          <div
            className="bg-slate-900 h-2 rounded-full transition-all"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      <h2 className="text-sm font-medium text-slate-500 uppercase tracking-wide mb-3">
        Lessons
      </h2>
      <div className="space-y-2">
        {lessonsWithProgress.map((lesson, index) => (
          <Link
            key={lesson.id}
            href={`/dashboard/student/my-courses/${documentId}/lessons/${lesson.documentId}`}
            className="flex items-center justify-between bg-white border border-slate-200 rounded-lg px-4 py-3 hover:border-slate-400 transition-colors"
          >
            <div className="flex items-center gap-3">
              <span className="text-sm text-slate-400 w-6">{index + 1}.</span>
              <span className="text-slate-900">{lesson.title}</span>
            </div>
            {lesson.progress?.completed ? (
              <span className="text-xs text-green-700 bg-green-50 px-2 py-1 rounded-md font-medium">
                Completed
              </span>
            ) : (
              <span className="text-xs text-slate-400">Not started</span>
            )}
          </Link>
        ))}

        {lessons.length === 0 && (
          <p className="text-slate-500 text-sm">No lessons available in this course yet.</p>
        )}
      </div>
    </div>
  );
}