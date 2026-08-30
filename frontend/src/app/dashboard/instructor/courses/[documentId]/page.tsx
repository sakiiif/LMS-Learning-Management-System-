import { getSession } from '@/lib/session';
import { apiFetch } from '@/lib/api';
import { redirect, notFound } from 'next/navigation';
import Link from 'next/link';
import LessonManager from '@/components/LessonManager';
import QuizManager from '@/components/QuizManager';
import type { Course, Quiz } from '@/types';

export default async function InstructorCourseManagePage({
  params,
}: {
  params: Promise<{ documentId: string }>;
}) {
  const { documentId } = await params;
  const session = await getSession();
  if (!session) redirect('/login');
  if (session.user.role?.name !== 'Instructor') redirect('/dashboard');

  const courseRes = await apiFetch(`/api/courses/${documentId}?populate=lessons`, {
    token: session.token,
  });
  const course: Course = courseRes.data;
  if (!course) notFound();

  const quizzesRes = await apiFetch(
    `/api/quizzes?filters[course][documentId][$eq]=${documentId}&populate=questions`,
    { token: session.token }
  );
  const quizzes: Quiz[] = quizzesRes.data;

  return (
    <div className="p-8 max-w-3xl mx-auto">
      <Link href="/dashboard/instructor" className="text-sm text-slate-500 hover:text-slate-900 mb-4 inline-block">
        ← My Courses
      </Link>
      <h1 className="text-2xl font-semibold text-slate-900 mb-8">{course.title}</h1>

      <LessonManager
        courseDocumentId={documentId}
        lessons={(course.lessons || []).sort((a, b) => a.order - b.order)}
      />

      <div className="mt-10">
        <QuizManager courseDocumentId={documentId} quizzes={quizzes} />
      </div>
    </div>
  );
}