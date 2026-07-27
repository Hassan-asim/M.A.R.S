import { NextRequest, NextResponse } from 'next/server';
import { AUTH_COOKIE_NAME } from '@/lib/auth';

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const code = url.searchParams.get('code');

  if (!code) {
    return NextResponse.redirect(new URL('/?auth=failed', req.url));
  }

  try {
    const response = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code,
        client_id: process.env.GOOGLE_CLIENT_ID || '',
        client_secret: process.env.GOOGLE_CLIENT_SECRET || '',
        redirect_uri: process.env.GOOGLE_REDIRECT_URI || 'http://localhost:3000/api/auth/google/callback',
        grant_type: 'authorization_code',
      }),
    });

    const tokenPayload = await response.json();
    if (!response.ok || !tokenPayload.access_token) {
      throw new Error(tokenPayload.error_description || 'Unable to exchange Google code.');
    }

    const profileResponse = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
      headers: { Authorization: `Bearer ${tokenPayload.access_token}` },
    });

    const profile = await profileResponse.json();
    if (!profile.email) {
      throw new Error('Google profile was missing an email address.');
    }

    const user = {
      id: profile.sub || profile.email,
      name: profile.name || profile.given_name || 'Google User',
      email: profile.email,
      provider: 'google' as const,
      signedInAt: new Date().toISOString(),
    };

    const redirectResponse = NextResponse.redirect(new URL('/?auth=success', req.url));
    redirectResponse.cookies.set(AUTH_COOKIE_NAME, JSON.stringify(user), {
      path: '/',
      expires: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30),
      sameSite: 'lax',
      httpOnly: true,
    });

    return redirectResponse;
  } catch (error) {
    console.error('Google auth callback failed:', error);
    return NextResponse.redirect(new URL('/?auth=failed', req.url));
  }
}
