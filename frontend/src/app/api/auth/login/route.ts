import { NextRequest, NextResponse } from 'next/server';
import { apiFetch } from '@/lib/api';

export async function POST(req: NextRequest) {
  const { identifier, password } = await req.json();

  try {
    const data = await apiFetch('/api/auth/local', {
      method: 'POST',
      body: { identifier, password },
    });

    // /api/auth/local doesn't return a populated role — fetch the full
    // profile (which our backend override does populate) so the
    // frontend can redirect based on role right away.
    const fullUser = await apiFetch('/api/users/me', { token: data.jwt });

    const response = NextResponse.json({ user: fullUser });
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