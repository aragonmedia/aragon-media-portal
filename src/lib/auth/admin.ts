/**
 * Admin password gate.
 *
 * - ADMIN_PASSWORD env var = the single shared password for the AM team.
 * - On successful POST to /api/admin/login we set an httpOnly cookie
 *   `am_admin` containing sha256(ADMIN_PASSWORD). On every admin request we
 *   recompute the hash from the env var and compare. Rotating the env var
 *   invalidates all admin sessions automatically.
 */

import crypto from "node:crypto";
import { cookies } from "next/headers";

export const ADMIN_COOKIE = "am_admin";

export function expectedHash(): string | null {
  const pwd = process.env.ADMIN_PASSWORD;
  if (!pwd) return null;
  return crypto.createHash("sha256").update(pwd).digest("hex");
}

export async function isAdminSession(): Promise<boolean> {
  const expected = expectedHash();
  if (!expected) return false;
  const store = await cookies();
  const cookie = store.get(ADMIN_COOKIE);
  return !!cookie && cookie.value === expected;
}

export async function setAdminCookie() {
  const expected = expectedHash();
  if (!expected) throw new Error("ADMIN_PASSWORD not set");
  const store = await cookies();
  store.set(ADMIN_COOKIE, expected, {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 12, // 12 hours
  });
}

export async function clearAdminCookie() {
  const store = await cookies();
  store.delete(ADMIN_COOKIE);
}
