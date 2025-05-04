// middleware/verifyToken.ts
import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';

const protectedRoutes = ['/dashboard', '/api/protected'];

export function middleware(req: NextRequest) {
  const token = req.cookies.get('token')?.value;
  const isProtected = protectedRoutes.some((path) => req.nextUrl.pathname.startsWith(path));

  if (!isProtected) return NextResponse.next();

  const decoded = token ? verifyToken(token) : null;

  if (!decoded) {
    return NextResponse.redirect(new URL('/auth/sign-in', req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/:path*', '/api/protected/:path*'],
};
