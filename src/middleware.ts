
import { NextRequest, NextResponse } from 'next/server';
import { rateLimiter } from './lib/rate-limiter';

export async function middleware(req: NextRequest) {
  if (req.nextUrl.pathname.startsWith('/api')) {
    return await rateLimiter(req);
  }
  return NextResponse.next();
}
