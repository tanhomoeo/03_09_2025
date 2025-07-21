
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// This function can be marked `async` if using `await` inside
export function middleware(_request: NextRequest) {
  // This is a minimal middleware that does nothing but continue the request chain.
  // Its presence ensures that Next.js generates the necessary middleware manifest files during build.
  return NextResponse.next();
}

// This config prevents the middleware from running on static assets,
// API routes, and other paths where it's not needed.
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public (public files)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|public|.*\\..*).*)',
  ],
};
