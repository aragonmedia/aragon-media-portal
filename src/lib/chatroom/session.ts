/**
 * Browser-cookie session for public chatroom threads.
 *
 * We don't require login. Instead, threads persist per (email, browser)
 * pair. This helper reads/writes the 'am_chatroom_browser' cookie —
 * a stable random ID that identifies "this browser". Combined with the
 * email the user enters, it forms the composite key for the thread.
 *
 * Cookie is HttpOnly:false so the client component can also read it
 * to display which thread will be resumed on load. Not sensitive —
 * it's just an anonymous browser correlator.
 */

import { cookies } from "next/headers";
import crypto from "node:crypto";

export const BROWSER_COOKIE = "am_chatroom_browser";

export async function getOrCreateBrowserKey(): Promise<{ key: string; setCookie: string | null }> {
  const jar = await cookies();
  const existing = jar.get(BROWSER_COOKIE)?.value;
  if (existing && /^[a-f0-9]{40}$/.test(existing)) {
    return { key: existing, setCookie: null };
  }
  const fresh = crypto.randomBytes(20).toString("hex"); // 40 hex chars
  return { key: fresh, setCookie: fresh };
}

export function browserCookieHeader(value: string): string {
  // 180-day expiry, root path, lax so it survives OAuth-style redirects
  return `${BROWSER_COOKIE}=${value}; Path=/; Max-Age=15552000; SameSite=Lax`;
}


/**
 * Read the magic-link token cookie set by /chatroom?t=... (server-side
 * only — cookie is HttpOnly).
 */
import { TOKEN_COOKIE, verifyToken } from "./magic-link";
export async function getMagicLinkThreadId(): Promise<string | null> {
  const jar = await cookies();
  const raw = jar.get(TOKEN_COOKIE)?.value;
  if (!raw) return null;
  const verified = verifyToken(raw);
  return verified?.threadId ?? null;
}
