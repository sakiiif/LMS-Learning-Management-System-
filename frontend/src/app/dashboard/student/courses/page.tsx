import { getSession } from '@/lib/session';
import { apiFetch } from '@/lib/api';
import { redirect } from 'next/navigation';
import EnrollButton from '@/components/EnrollButton';
import type { Course, Enrollment } from '@/types';

export default async function BrowseCoursesPage() {
  const session = await getSession();
  if (!session) redirect('/login');

  const [coursesRes, enrollmentsRes] = await Promise.all([
    apiFetch('/api/courses', { token: session.token }),
    apiFetch('/api/enrollments', { token: session.token }),
  ]);

  const courses: Course[] = coursesRes.data;
  const enrollments: Enrollment[] = enrollmentsRes.data;
  const enrolledCourseDocIds = new Set(enrollments.map((e) => e.course?.documentId)); // must be documentid

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-2xl font-semibold text-slate-900 mb-6">Browse Courses</h1>

      <div className="grid gap-4">
        {courses.map((course) => (
          <div
            key={course.id}
            className="bg-white border border-slate-200 rounded-lg p-5 flex items-center justify-between"
          >
            <div>
              <h2 className="font-medium text-slate-900">{course.title}</h2>
              {course.description && (
                <p className="text-sm text-slate-500 mt-1">{course.description}</p>
              )}
            </div>
            {enrolledCourseDocIds.has(course.documentId) ? ( // docId
              <span className="text-sm text-green-700 bg-green-50 px-3 py-1.5 rounded-md font-medium">
                Enrolled
              </span>
            ) : (
              <EnrollButton courseDocumentId={course.documentId} />
            )}
          </div>
        ))}

        {courses.length === 0 && (
          <p className="text-slate-500">No courses available yet.</p>
        )}
      </div>
    </div>
  );
}