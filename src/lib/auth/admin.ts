/**
 * Admin email-code auth.
 *
 * - The single shared ADMIN_PASSWORD env-var gate has been removed.
 * - To sign in as admin: enter your email on /admin → if the matching
 *   row in `users` has is_admin=true, a 6-digit code is emailed → enter
 *   the code → we set the `am_admin` cookie.
 * - The cookie value is a random opaque token (NOT a password hash) so
 *   rotating any single secret can't invalidate all admin sessions —
 *   we manage them through expiry instead.
 *
 * 12-hour cookie lifetime; admins re-authenticate twice a day at most.
 */

import crypto from "node:crypto";
import { cookies } from "next/headers";

export const ADMIN_COOKIE = "am_admin";
const COOKIE_MAX_AGE = 60 * 60 * 12; // 12 hours

/** Stable HMAC of the cookie token using a server secret (so a stolen DB
 *  dump alone can't forge admin sessions — they'd also need MIGRATION_SECRET).
 */
function sign(token: string): string {
  const secret = process.env.MIGRATION_SECRET ?? "fallback-not-set";
  return crypto.createHmac("sha256", secret).update(token).digest("hex");
}

export async function isAdminSession(): Promise<boolean> {
  const store = await cookies();
  const cookie = store.get(ADMIN_COOKIE);
  if (!cookie || !cookie.value.includes(".")) return false;
  const [token, sig] = cookie.value.split(".", 2);
  if (!token || !sig) return false;
  const expected = sign(token);
  // Constant-time compare
  if (sig.length !== expected.length) return false;
  let mismatch = 0;
  for (let i = 0; i < sig.length; i++) {
    mismatch |= sig.charCodeAt(i) ^ expected.charCodeAt(i);
  }
  return mismatch === 0;
}

export async function setAdminCookie() {
  const token = crypto.randomBytes(24).toString("hex");
  const value = `${token}.${sign(token)}`;
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
