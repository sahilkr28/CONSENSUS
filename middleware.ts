import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * Helper to compute SHA-256 in the Next.js Edge Middleware runtime.
 */
async function sha256(message: string): Promise<string> {
  const msgBuffer = new TextEncoder().encode(message);
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
  return hashHex;
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Paths that are excluded from authentication
  const isAuthPage = pathname === '/login';
  const isAuthApi = pathname === '/api/auth/login';

  // Allow static assets and authentication APIs to pass through
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/fonts') ||
    pathname.includes('favicon.ico') ||
    isAuthApi
  ) {
    return NextResponse.next();
  }

  const expectedUsername = process.env.AUTH_USERNAME || 'shane';
  const expectedPassword = process.env.AUTH_PASSWORD || '86077ar';
  
  const expectedToken = await sha256(`${expectedUsername}:${expectedPassword}`);
  const sessionToken = request.cookies.get('session_token')?.value;

  const isAuthenticated = sessionToken === expectedToken;

  // 1. If not authenticated and trying to access a protected page/API
  if (!isAuthenticated) {
    if (isAuthPage) {
      return NextResponse.next();
    }
    
    // Redirect API calls to 401 Unauthorized
    if (pathname.startsWith('/api/')) {
      return new NextResponse(
        JSON.stringify({ error: 'Unauthorized access. Log in first.' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Redirect browser page views to login page
    const loginUrl = new URL('/login', request.url);
    return NextResponse.redirect(loginUrl);
  }

  // 2. If authenticated and trying to access the login page, redirect to home
  if (isAuthenticated && isAuthPage) {
    const dashboardUrl = new URL('/dashboard', request.url);
    return NextResponse.redirect(dashboardUrl);
  }

  return NextResponse.next();
}

export const config = {
  // Apply middleware to all routes except static assets
  matcher: ['/((?!_next/static|_next/image|favicon.ico|fonts).*)'],
};
