export interface AuthUser {
  id: string;
  name: string;
  email: string;
  provider: 'google';
  signedInAt: string;
}

export const AUTH_COOKIE_NAME = 'mars_auth_session';

function getCookieValue(name: string): string | null {
  if (typeof document === 'undefined') return null;

  const match = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`));
  return match ? decodeURIComponent(match[1]) : null;
}

export function saveAuthSession(user: AuthUser): void {
  if (typeof document === 'undefined') return;

  const expires = new Date(Date.now() + 1000 * 60 * 60 * 24 * 30).toUTCString();
  document.cookie = `${AUTH_COOKIE_NAME}=${encodeURIComponent(JSON.stringify(user))}; path=/; expires=${expires}; SameSite=Lax`;
}

export function readAuthSession(): AuthUser | null {
  const raw = getCookieValue(AUTH_COOKIE_NAME);
  if (!raw) return null;

  try {
    const parsed = JSON.parse(raw) as AuthUser;
    if (!parsed?.email || !parsed?.name) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function clearAuthSession(): void {
  if (typeof document === 'undefined') return;
  document.cookie = `${AUTH_COOKIE_NAME}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax`;
}

export function getInitials(name: string): string {
  return name
    .split(' ')
    .slice(0, 2)
    .map((segment) => segment[0]?.toUpperCase() ?? '')
    .join('');
}
