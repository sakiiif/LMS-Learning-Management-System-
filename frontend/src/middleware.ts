import { NextRequest, NextResponse } from 'next/server';

export function middleware(req: NextRequest) {
  const jwt = req.cookies.get('jwt')?.value;
  const { pathname } = req.nextUrl;

  const isProtected = pathname.startsWith('/dashboard');
  const isAuthPage = pathname === '/login' || pathname === '/signup';

  if (isProtected && !jwt) {
    return NextResponse.redirect(new URL('/login', req.url));
  }

  if (isAuthPage && jwt) {
    return NextResponse.redirect(new URL('/dashboard', req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/:path*', '/login', '/signup'],
};