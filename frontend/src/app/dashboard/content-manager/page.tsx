import { getSession } from '@/lib/session';
import { apiFetch } from '@/lib/api';
import { redirect } from 'next/navigation';
import CourseManager from '@/components/CourseManager';
import BlogManager from '@/components/BlogManager';

export default async function ContentManagerDashboard() {
  const session = await getSession();
  if (!session) redirect('/login');
  if (session.user.role?.name !== 'Content Manager') redirect('/dashboard');

  const [coursesRes, usersRes, blogRes] = await Promise.all([
    apiFetch('/api/admin-panel/courses-with-instructors', { token: session.token }),
    apiFetch('/api/admin-panel/users', { token: session.token }),
    apiFetch('/api/blog-panel/posts', { token: session.token }),
  ]);

  const courses = coursesRes.data;
  const instructorOptions = usersRes.data
    .filter((u: any) => u.role?.name === 'Instructor')
    .map((u: any) => ({ id: u.id, username: u.username, fullName: u.fullName }));
  const blogPosts = blogRes.data;

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-10">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900 mb-6">Content Manager Dashboard</h1>
        <CourseManager courses={courses} instructorOptions={instructorOptions} />
      </div>
      <BlogManager posts={blogPosts} />
    </div>
  );
}