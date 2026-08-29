import { NextRequest, NextResponse } from 'next/server';
import { apiFetch } from '@/lib/api';

export async function POST(req: NextRequest) {
  const { username, email, password, fullName } = await req.json();

  try {
    const data = await apiFetch('/api/auth/local/register', {
      method: 'POST',
      body: { username, email, password, fullName },
    });

    const response = NextResponse.json({ user: data.user });
    response.cookies.set('jwt', data.jwt, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7,
    });

    return response;
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}