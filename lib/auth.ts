import { SignJWT, jwtVerify } from 'jose';
import bcrypt from 'bcryptjs';
import { cookies } from 'next/headers';

// Fail fast at startup if JWT_SECRET is not configured — never silently fall back to a weak key.
if (!process.env.JWT_SECRET) {
  throw new Error(
    'JWT_SECRET environment variable is not set. ' +
    'Generate one with: openssl rand -hex 32'
  );
}

const SECRET_KEY = new TextEncoder().encode(process.env.JWT_SECRET);

const COOKIE_NAME = 'admin_session';

export interface AdminPayload {
  id: string;
  username: string;
}

export async function hashPassword(password: string): Promise<string> {
  return await bcrypt.hash(password, 10);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return await bcrypt.compare(password, hash);
}

export async function createSessionToken(payload: AdminPayload): Promise<string> {
  return await new SignJWT({ ...payload })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('1d')
    .sign(SECRET_KEY);
}

export async function verifySessionToken(token: string): Promise<AdminPayload | null> {
  try {
    const { payload } = await jwtVerify(token, SECRET_KEY);
    return {
      id: payload.id as string,
      username: payload.username as string,
    };
  } catch {
    return null;
  }
}

export async function getAdminSession(): Promise<AdminPayload | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  if (!token) return null;
  return await verifySessionToken(token);
}

export async function setSessionCookie(token: string) {
  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    // Always secure in production; can be overridden for local HTTPS dev with COOKIE_SECURE=true
    secure: process.env.NODE_ENV === 'production' || process.env.COOKIE_SECURE === 'true',
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24, // 1 day
  });
}

export async function clearSessionCookie() {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
}
