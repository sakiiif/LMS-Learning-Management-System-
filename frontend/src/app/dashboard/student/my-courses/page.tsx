import { getSession } from '@/lib/session';
import { apiFetch } from '@/lib/api';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import type { Enrollment } from '@/types';

export default async function MyCoursesPage() {
  const session = await getSession();
  if (!session) redirect('/login');

  const enrollmentsRes = await apiFetch('/api/enrollments', { token: session.token });
  const enrollments: Enrollment[] = enrollmentsRes.data;

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-2xl font-semibold text-slate-900 mb-6">My Courses</h1>

      <div className="grid gap-4">
        {enrollments.map((enrollment) => (
          <Link
            key={enrollment.id}
            href={`/dashboard/student/my-courses/${enrollment.course.documentId}`}
            className="block bg-white border border-slate-200 rounded-lg p-5 hover:border-slate-400 transition-colors"
          >
            <h2 className="font-medium text-slate-900">{enrollment.course.title}</h2>
            {enrollment.course.description && (
              <p className="text-sm text-slate-500 mt-1">{enrollment.course.description}</p>
            )}
          </Link>
        ))}

        {enrollments.length === 0 && (
          <div className="text-center py-12">
            <p className="text-slate-500 mb-4">You haven&apos;t enrolled in any courses yet.</p>
            <Link
              href="/dashboard/student/courses"
              className="text-slate-900 font-medium underline text-sm"
            >
              Browse courses
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}