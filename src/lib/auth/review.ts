/**
 * Reviewer (demo) session cookie.
 *
 * SEPARATE from am_session (real creator) and am_admin (AM staff).
 * A demo user hits /login, we verify email + password against
 * users.password_hash (users must have is_demo=true), and set am_review.
 *
 * Cookie value format matches the admin cookie: `<token>.<hmac>`,
 * with a random opaque token so a stolen DB dump alone cannot forge
 * sessions (also requires MIGRATION_SECRET).
 *
 * 12-hour lifetime.
 */

import crypto from "node:crypto";
import { cookies } from "next/headers";

export const REVIEW_COOKIE = "am_review";
const COOKIE_MAX_AGE = 60 * 60 * 12;

function sign(token: string): string {
  const secret = process.env.MIGRATION_SECRET ?? "fallback-not-set";
  return crypto.createHmac("sha256", secret).update(token).digest("hex");
}

export function makeReviewCookieValue(userId: string): string {
  // Embed the userId inside the token so we can resolve the demo user
  // without a separate sessions row (demo accounts don't need audit trails).
  const nonce = crypto.randomBytes(16).toString("hex");
  const token = `${userId}:${nonce}`;
  return `${token}.${sign(token)}`;
}

export function verifyReviewCookieValue(value: string | undefined): string | null {
  if (!value || !value.includes(".")) return null;
  const dot = value.lastIndexOf(".");
  const token = value.slice(0, dot);
  const sig = value.slice(dot + 1);
  if (!token || !sig) return null;
  const expected = sign(token);
  if (sig.length !== expected.length) return null;
  let mismatch = 0;
  for (let i = 0; i < sig.length; i++) mismatch |= sig.charCodeAt(i) ^ expected.charCodeAt(i);
  if (mismatch !== 0) return null;
  const [userId] = token.split(":", 1);
  if (!userId || !/^[0-9a-f-]{36}$/i.test(userId)) return null;
  return userId;
}

export async function setReviewCookie(userId: string) {
  const store = await cookies();
  store.set(REVIEW_COOKIE, makeReviewCookieValue(userId), {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    path: "/",
    maxAge: COOKIE_MAX_AGE,
  });
}

export async function clearReviewCookie() {
  const store = await cookies();
  store.delete(REVIEW_COOKIE);
}

export async function getReviewUserId(): Promise<string | null> {
  const store = await cookies();
  return verifyReviewCookieValue(store.get(REVIEW_COOKIE)?.value);
}
