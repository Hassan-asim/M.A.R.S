import { NextResponse } from 'next/server';

const googleClientId = process.env.GOOGLE_CLIENT_ID || '';
const googleRedirectUri = process.env.GOOGLE_REDIRECT_URI || 'http://localhost:3000/api/auth/google/callback';

export async function GET() {
  if (!googleClientId) {
    return NextResponse.json({ error: 'Google OAuth is not configured.' }, { status: 500 });
  }

  const params = new URLSearchParams({
    client_id: googleClientId,
    redirect_uri: googleRedirectUri,
    response_type: 'code',
    scope: 'openid email profile',
    access_type: 'offline',
    prompt: 'consent',
  });

  return NextResponse.redirect(`https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`);
}
