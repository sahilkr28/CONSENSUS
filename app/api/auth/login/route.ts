import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { logger } from '@/lib/logger';

export async function POST(request: NextRequest) {
  try {
    const { username, password } = await request.json();

    const expectedUsername = process.env.AUTH_USERNAME;
    const expectedPassword = process.env.AUTH_PASSWORD;

    if (!expectedUsername || !expectedPassword) {
      logger.error('[AUTH_API] Authentication credentials are not defined in env.');
      return NextResponse.json(
        { error: 'Server authentication is misconfigured.' },
        { status: 500 }
      );
    }

    if (username === expectedUsername && password === expectedPassword) {
      // Create a secure hash of the username + password as the session token
      const sessionToken = crypto
        .createHash('sha256')
        .update(`${expectedUsername}:${expectedPassword}`)
        .digest('hex');

      logger.info(`[AUTH_API] User "${username}" successfully logged in.`);

      const response = NextResponse.json({ success: true });
      
      // Set session token cookie (Secure, HttpOnly, SameSite)
      response.cookies.set('session_token', sessionToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        path: '/',
        maxAge: 7 * 24 * 60 * 60, // 7 days in seconds
      });

      return response;
    }

    logger.warn(`[AUTH_API] Failed login attempt for user: "${username}"`);
    return NextResponse.json(
      { error: 'Invalid username or password.' },
      { status: 401 }
    );
  } catch (error: any) {
    logger.error(`[AUTH_API] Login handler error: ${error.message}`, error);
    return NextResponse.json(
      { error: 'Authentication service error.' },
      { status: 500 }
    );
  }
}
