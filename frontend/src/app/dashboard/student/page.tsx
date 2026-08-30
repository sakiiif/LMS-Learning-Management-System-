import { redirect } from 'next/navigation';
import { getSession } from '@/lib/session';

export default async function StudentDashboardPage() {
  const session = await getSession();
  if (session?.user.role?.name !== 'Student') redirect('/dashboard');

  return (
    <div className="p-8">
      <h1 className="text-2xl font-semibold text-slate-900">
        Welcome, {session.user.fullName || session.user.username}
      </h1>
      <p className="text-slate-500 mt-1">Student Dashboard</p>
    </div>
  );
}