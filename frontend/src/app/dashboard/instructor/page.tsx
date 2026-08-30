import { getSession } from '@/lib/session';
import { apiFetch } from '@/lib/api';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import type { Course } from '@/types';

export default async function InstructorDashboard() {
  const session = await getSession();
  if (!session) redirect('/login');
  if (session.user.role?.name !== 'Instructor') redirect('/dashboard');

  const coursesRes = await apiFetch('/api/instructor-panel/my-courses', {
    token: session.token,
  });
  const myCourses: Course[] = coursesRes.data;

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-2xl font-semibold text-slate-900 mb-6">My Courses</h1>

      <div className="grid gap-4">
        {myCourses.map((course) => (
          <Link
            key={course.id}
            href={`/dashboard/instructor/courses/${course.documentId}`}
            className="block bg-white border border-slate-200 rounded-lg p-5 hover:border-slate-400 transition-colors"
          >
            <h2 className="font-medium text-slate-900">{course.title}</h2>
            {course.description && (
              <p className="text-sm text-slate-500 mt-1">{course.description}</p>
            )}
          </Link>
        ))}

        {myCourses.length === 0 && (
          <p className="text-slate-500">
            You haven&apos;t been assigned to any courses yet. Contact an Admin or Content Manager.
          </p>
        )}
      </div>
    </div>
  );
}