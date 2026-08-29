import { cookies } from 'next/headers';
import { apiFetch } from './api';

export type SessionUser = {
  id: number;
  username: string;
  email: string;
  fullName?: string;
  role: { id: number; name: string } | null;
};

export async function getSession(): Promise<{ token: string; user: SessionUser } | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get('jwt')?.value;

  if (!token) return null;

  try {
    const user = await apiFetch('/api/users/me', { token });
    return { token, user };
  } catch {
    return null;
  }
}