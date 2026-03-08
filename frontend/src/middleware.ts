import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * Route protection middleware.
 * Token validation happens client-side (Zustand persist).
 * This middleware adds a lightweight server-side cookie check
 * so direct URL access is also protected.
 */
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Admin routes (skip the login page itself)
  if (pathname.startsWith('/admin') && pathname !== '/admin/login') {
    const token = request.cookies.get('Zawjia_token')?.value;
    if (!token) {
      return NextResponse.redirect(new URL('/admin/login', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match:
     *  - /admin and sub-paths
     *  - All /(app) routes are protected client-side via layout.tsx
     */
    '/admin/:path*',
  ],
};
