/*
import { getSession } from '@/lib/session';
import { apiFetch } from '@/lib/api';
import { redirect } from 'next/navigation';
import UserManager from '@/components/UserManager';

export default async function AdminDashboard() {
  const session = await getSession();
  if (!session) redirect('/login');
  if (session.user.role?.name !== 'Admin') redirect('/dashboard');

  const [statsRes, usersRes] = await Promise.all([
    apiFetch('/api/admin-panel/stats', { token: session.token }),
    apiFetch('/api/admin-panel/users', { token: session.token }),
  ]);

  const stats = statsRes.data;
  const users = usersRes.data;

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <h1 className="text-2xl font-semibold text-slate-900 mb-6">Admin Panel</h1>

      <div className="grid grid-cols-4 gap-4 mb-8">
        <StatCard label="Total Users" value={stats.totalUsers} />
        <StatCard label="Total Courses" value={stats.totalCourses} />
        <StatCard label="Total Enrollments" value={stats.totalEnrollments} />
        <StatCard
          label="By Role"
          value={Object.entries(stats.usersPerRole || {})
            .map(([role, count]) => `${role}: ${count}`)
            .join(', ')}
          small
        />
      </div>

      <UserManager initialUsers={users} currentUserId={session.user.id} />
    </div>
  );
}

function StatCard({ label, value, small }: { label: string; value: any; small?: boolean }) {
  return (
    <div className="bg-white border border-slate-200 rounded-lg p-4">
      <p className="text-xs text-slate-500 uppercase tracking-wide mb-1">{label}</p>
      <p className={small ? 'text-xs text-slate-700' : 'text-2xl font-semibold text-slate-900'}>
        {value}
      </p>
    </div>
  );
}
*/

import { getSession } from '@/lib/session';
import { apiFetch } from '@/lib/api';
import { redirect } from 'next/navigation';
import UserManager from '@/components/UserManager';
import CourseManager from '@/components/CourseManager';

export default async function AdminDashboard() {
  const session = await getSession();
  if (!session) redirect('/login');
  if (session.user.role?.name !== 'Admin') redirect('/dashboard');

  const [statsRes, usersRes, coursesRes] = await Promise.all([
    apiFetch('/api/admin-panel/stats', { token: session.token }),
    apiFetch('/api/admin-panel/users', { token: session.token }),
    apiFetch('/api/admin-panel/courses-with-instructors', { token: session.token }),
  ]);

  const stats = statsRes.data;
  const users = usersRes.data;
  const courses = coursesRes.data;
  const instructorOptions = users
    .filter((u: any) => u.role?.name === 'Instructor')
    .map((u: any) => ({ id: u.id, username: u.username, fullName: u.fullName }));

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-10">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900 mb-6">Admin Panel</h1>

        <div className="grid grid-cols-4 gap-4 mb-8">
          <StatCard label="Total Users" value={stats.totalUsers} />
          <StatCard label="Total Courses" value={stats.totalCourses} />
          <StatCard label="Total Enrollments" value={stats.totalEnrollments} />
          <StatCard
            label="By Role"
            value={Object.entries(stats.usersPerRole || {})
              .map(([role, count]) => `${role}: ${count}`)
              .join(', ')}
            small
          />
        </div>

        <UserManager initialUsers={users} currentUserId={session.user.id} />
      </div>

      <CourseManager courses={courses} instructorOptions={instructorOptions} />
    </div>
  );
}

function StatCard({ label, value, small }: { label: string; value: any; small?: boolean }) {
  return (
    <div className="bg-white border border-slate-200 rounded-lg p-4">
      <p className="text-xs text-slate-500 uppercase tracking-wide mb-1">{label}</p>
      <p className={small ? 'text-xs text-slate-700' : 'text-2xl font-semibold text-slate-900'}>
        {value}
      </p>
    </div>
  );
}