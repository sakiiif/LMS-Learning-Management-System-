import { redirect } from 'next/navigation';
import { getSession } from '@/lib/session';

function dashboardPathForRole(roleName: string | undefined) {
  switch (roleName) {
    case 'Admin':
      return '/dashboard/admin';
    case 'Content Manager':
      return '/dashboard/content-manager';
    case 'Instructor':
      return '/dashboard/instructor';
    case 'Student':
    default:
      return '/dashboard/student';
  }
}

export default async function DashboardIndexPage() {
  const session = await getSession();
  if (!session) {
    redirect('/login');
  }
  redirect(dashboardPathForRole(session.user.role?.name));
}