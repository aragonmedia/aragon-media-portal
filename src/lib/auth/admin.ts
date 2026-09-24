/**
 * Admin email-code auth + session cookie.
 *
 * Cookie format: `<userId>.<token>.<sig>` where sig = HMAC(userId + "." + token, MIGRATION_SECRET).
 * The userId lets us look up admin_role on each request → RBAC without a session table.
 *
 * Old cookies (`<token>.<sig>`) are treated as invalid so admins re-login once
 * after the 0011 migration ships. That's fine — cookie lifetime is 12 hours.
 */

import crypto from "node:crypto";
import { cookies } from "next/headers";

export const ADMIN_COOKIE = "am_admin";
const COOKIE_MAX_AGE = 60 * 60 * 12; // 12 hours

function sign(payload: string): string {
  const secret = process.env.MIGRATION_SECRET ?? "fallback-not-set";
  return crypto.createHmac("sha256", secret).update(payload).digest("hex");
}

function ctEq(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let m = 0;
  for (let i = 0; i < a.length; i++) m |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return m === 0;
}

export async function getAdminSession(): Promise<{ userId: string } | null> {
  const store = await cookies();
  const cookie = store.get(ADMIN_COOKIE);
  if (!cookie) return null;
  const parts = cookie.value.split(".");
  if (parts.length !== 3) return null;
  const [userId, token, sig] = parts;
  if (!userId || !token || !sig) return null;
  const expected = sign(`${userId}.${token}`);
  return ctEq(sig, expected) ? { userId } : null;
}

/** Backwards-compat boolean check. Prefer getAdminSession() when you need the userId. */
export async function isAdminSession(): Promise<boolean> {
  return (await getAdminSession()) !== null;
}

export async function setAdminCookie(userId: string) {
  const token = crypto.randomBytes(24).toString("hex");
  const sig = sign(`${userId}.${token}`);
  const value = `${userId}.${token}.${sig}`;
  const store = await cookies();
  store.set(ADMIN_COOKIE, value, {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    path: "/",
    maxAge: COOKIE_MAX_AGE,
  });
}

export async function clearAdminCookie() {
  const store = await cookies();
  store.delete(ADMIN_COOKIE);
}
