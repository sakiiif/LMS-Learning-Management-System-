import { getSession } from '@/lib/session';
import { apiFetch } from '@/lib/api';
import { redirect, notFound } from 'next/navigation';
import Link from 'next/link';
import QuizTaker from '@/components/QuizTaker';
import type { Quiz, QuizResult } from '@/types';

export default async function QuizPage({
  params,
}: {
  params: Promise<{ documentId: string; quizDocumentId: string }>;
}) {
  const { documentId, quizDocumentId } = await params;
  const session = await getSession();
  if (!session) redirect('/login');

  const quizRes = await apiFetch(
    `/api/quizzes/${quizDocumentId}?populate=questions`,
    { token: session.token }
  );
  const quiz: Quiz = quizRes.data;

  if (!quiz) notFound();

  // Check if the student already has a result for this quiz
  const resultsRes = await apiFetch('/api/quiz-results', { token: session.token });
  const allResults: QuizResult[] = resultsRes.data;
  const existingResult = allResults.find((r) => r.quiz?.id === quiz.id) || null;

  return (
    <div className="p-8 max-w-2xl mx-auto">
      <Link
        href={`/dashboard/student/my-courses/${documentId}`}
        className="text-sm text-slate-500 hover:text-slate-900 mb-4 inline-block"
      >
        ← Back to course
      </Link>

      <h1 className="text-2xl font-semibold text-slate-900 mb-6">{quiz.title}</h1>

      <QuizTaker
        quiz={quiz}
        courseDocumentId={documentId}
        existingResult={existingResult}
      />
    </div>
  );
}