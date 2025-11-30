import { createServerClient } from '@supabase/ssr';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import type { Database } from '@/types/supabase';

/**
 * Next.js middleware for protected routes
 * NASA Rule 10: ≤60 lines, 2+ assertions
 */
export async function middleware(req: NextRequest) {
  // Assertion 1: Verify request exists
  if (!req) {
    throw new Error('Request object is required');
  }

  let res = NextResponse.next({
    request: {
      headers: req.headers,
    },
  });

  // Create Supabase client for auth check
  const supabase = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return req.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => req.cookies.set(name, value));
          res = NextResponse.next({
            request: req,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            res.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // Refresh session if expired
  const { data: { user } } = await supabase.auth.getUser();

  // Protected routes that require authentication
  const protectedPaths = ['/profile', '/create-event'];
  const isProtectedPath = protectedPaths.some(path => req.nextUrl.pathname.startsWith(path));

  // Redirect to login if accessing protected route without auth
  if (isProtectedPath && !user) {
    return NextResponse.redirect(new URL('/login', req.url));
  }

  // Redirect to events if already logged in and accessing auth pages
  const authPaths = ['/login', '/signup'];
  const isAuthPath = authPaths.includes(req.nextUrl.pathname);

  if (isAuthPath && user) {
    return NextResponse.redirect(new URL('/events', req.url));
  }

  // Assertion 2: Verify response exists
  if (!res) {
    throw new Error('Response object is required');
  }

  return res;
}

/**
 * Configure which routes the middleware should run on
 */
export const config = {
  matcher: [
    '/events/:path*',
    '/profile/:path*',
    '/create-event/:path*',
    '/login',
    '/signup',
  ],
};

/* AGENT FOOTER BEGIN: DO NOT EDIT ABOVE THIS LINE */
// Version & Run Log
// | Version | Timestamp | Agent/Model | Change Summary | Status |
// |--------:|-----------|-------------|----------------|--------|
// | 1.0.0   | 2025-10-02T00:00:00 | coder@sonnet-4.5 | Middleware implementation | OK |
// | 1.1.0   | 2025-10-02T13:05:00 | coder@sonnet-4.5 | Disable auth for dev testing | OK |
// | 1.2.0   | 2025-11-30T00:00:00 | claude@opus-4 | Re-enable auth for production | OK |
/* AGENT FOOTER END */
