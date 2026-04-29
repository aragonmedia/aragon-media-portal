/**
 * Session token helpers.
 *
 * - 32-byte random token, returned to the browser as an httpOnly cookie
 *   "am_session". DB stores only the SHA-256 hash (sessions.token_hash).
 * - Sessions expire after 30 days by default (renewed on use later).
 */

import crypto from "node:crypto";
import { cookies } from "next/headers";

export const SESSION_COOKIE = "am_session";
export const SESSION_TTL_DAYS = 30;

export function generateSessionToken(): string {
  return crypto.randomBytes(32).toString("base64url");
}

export function hashSessionToken(token: string): string {
  return crypto.createHash("sha256").update(token).digest("hex");
}

export function sessionExpiry(): Date {
  return new Date(Date.now() + SESSION_TTL_DAYS * 24 * 60 * 60 * 1000);
}

export async function setSessionCookie(token: string, expiresAt: Date) {
  const store = await cookies();
  store.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    path: "/",
    expires: expiresAt,
  });
}

export async function clearSessionCookie() {
  const store = await cookies();
  store.delete(SESSION_COOKIE);
}
