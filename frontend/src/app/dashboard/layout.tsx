
import { redirect } from 'next/navigation';
import { getSession } from '@/lib/session';
import LogoutButton from '@/components/LogoutButton';
import Link from 'next/link';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();
  if (!session) redirect('/login');

  const role = session.user.role?.name;

  return (
    <div className="min-h-screen bg-slate-50">
      <nav className="bg-white border-b border-slate-200 px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <span className="font-semibold text-slate-900">LMS</span>
          {role === 'Student' && ( // student
            <div className="flex gap-4 text-sm">
              <Link href="/dashboard/student" className="text-slate-600 hover:text-slate-900">
                Dashboard
              </Link>
              <Link href="/dashboard/student/courses" className="text-slate-600 hover:text-slate-900">
                Browse Courses
              </Link>
              <Link href="/dashboard/student/my-courses" className="text-slate-600 hover:text-slate-900">
                My Courses
              </Link>
            </div>
          )}
          {role === 'Instructor' && ( // instructor
            <div className="flex gap-4 text-sm">
              <Link href="/dashboard/instructor" className="text-slate-600 hover:text-slate-900">
                My Courses
              </Link>
            </div>
          )}
          {role === 'Admin' && (
            <div className="flex gap-4 text-sm">
              <Link href="/dashboard/admin" className="text-slate-600 hover:text-slate-900">
                Admin Panel
              </Link>
            </div>
          )}
        </div>
        <div className="flex items-center gap-4 text-sm">
          <span className="text-slate-500">
            {session.user.fullName || session.user.username} · {role}
          </span>
          <LogoutButton />
        </div>
      </nav>
      <main>{children}</main>
    </div>
  );
}