import { NextRequest, NextResponse } from 'next/server';

/**
 * In-memory rate limiter for the admin login endpoint.
 *
 * Limits: 10 POST attempts per IP per 15-minute window.
 * Exceeding the limit returns HTTP 429 with a Retry-After header.
 *
 * NOTE: This is a single-process in-memory store.
 * In a multi-instance / serverless deployment, replace with a shared
 * store such as Redis (e.g. @upstash/ratelimit).
 */

interface RateLimitEntry {
  count: number;
  resetAt: number; // Unix timestamp (ms)
}

const loginAttempts = new Map<string, RateLimitEntry>();

const MAX_ATTEMPTS = 10;
const WINDOW_MS = 15 * 60 * 1000; // 15 minutes

/** Periodic cleanup — remove expired entries to prevent unbounded memory growth. */
function cleanupExpired() {
  const now = Date.now();
  for (const [key, entry] of loginAttempts) {
    if (now > entry.resetAt) {
      loginAttempts.delete(key);
    }
  }
}

let requestsSinceCleanup = 0;
const CLEANUP_EVERY = 200; // run cleanup every 200 requests

export function proxy(request: NextRequest) {
  // Only rate-limit POST requests to the login endpoint.
  if (request.method !== 'POST') {
    return NextResponse.next();
  }

  // Periodic cleanup
  requestsSinceCleanup++;
  if (requestsSinceCleanup >= CLEANUP_EVERY) {
    requestsSinceCleanup = 0;
    cleanupExpired();
  }

  const ip =
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    request.headers.get('x-real-ip') ||
    'unknown';

  const now = Date.now();
  const entry = loginAttempts.get(ip);

  if (!entry || now > entry.resetAt) {
    // First request in a fresh window
    loginAttempts.set(ip, { count: 1, resetAt: now + WINDOW_MS });
    return NextResponse.next();
  }

  if (entry.count >= MAX_ATTEMPTS) {
    const retryAfterSeconds = Math.ceil((entry.resetAt - now) / 1000);
    return new NextResponse(
      JSON.stringify({
        error: `Too many login attempts. Please try again in ${Math.ceil(retryAfterSeconds / 60)} minute(s).`,
      }),
      {
        status: 429,
        headers: {
          'Content-Type': 'application/json',
          'Retry-After': String(retryAfterSeconds),
        },
      }
    );
  }

  // Increment count
  entry.count++;
  return NextResponse.next();
}

export const config = {
  matcher: '/api/admin/auth/login',
};
