import { renderBlocks } from '@/lib/renderBlocks';
import { getSession } from '@/lib/session';
import { apiFetch } from '@/lib/api';
import { redirect, notFound } from 'next/navigation';
import Link from 'next/link';
import MarkCompleteButton from '@/components/MarkCompleteButton';
import type { Lesson, LessonProgress } from '@/types';

export default async function LessonPage({
  params,
}: {
  params: Promise<{ documentId: string; lessonDocumentId: string }>;
}) {
  const { documentId, lessonDocumentId } = await params;
  const session = await getSession();
  if (!session) redirect('/login');

  const lessonRes = await apiFetch(`/api/lessons/${lessonDocumentId}`, {
    token: session.token,
  });
  const lesson: Lesson = lessonRes.data;

  if (!lesson) notFound();

  const progressRes = await apiFetch('/api/lesson-progresses', { token: session.token });
  const progressRecords: LessonProgress[] = progressRes.data;
  const existingProgress = progressRecords.find((p) => p.lesson?.id === lesson.id) || null;

  return (
    <div className="p-8 max-w-3xl mx-auto">
      <Link
        href={`/dashboard/student/my-courses/${documentId}`}
        className="text-sm text-slate-500 hover:text-slate-900 mb-4 inline-block"
      >
        ← Back to course
      </Link>

      <h1 className="text-2xl font-semibold text-slate-900 mb-4">{lesson.title}</h1>

      {lesson.videoUrl && (
        <div className="mb-6">
            <a href={lesson.videoUrl} target="_blank" rel="noopener noreferrer" className="text-sm text-slate-600 underline" > 
              Click to Watch Video Lesson. 
            </a>       
        </div>
      )}

      {lesson.content && (
        <div className="prose prose-slate max-w-none mb-8">
            {renderBlocks(lesson.content as any)}
        </div>
      )}

      <MarkCompleteButton
        lessonDocumentId={lesson.documentId}
        progressDocumentId={existingProgress?.documentId || null}
        alreadyCompleted={existingProgress?.completed || false}
      />
    </div>
  );
}