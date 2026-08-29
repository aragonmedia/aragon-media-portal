/**
 * HMAC-SHA256 signed magic-link tokens for cross-device chatroom
 * access. The signing key is derived from ACCELERATOR_CREDS_KEY so we
 * don't need a second env var.
 *
 * Token shape:
 *   base64url(payload).base64url(hmac)
 *   payload = JSON.stringify({ tid, em, exp })   // thread id, email, expiry
 *
 * Verification just recomputes the HMAC and checks expiry. No DB
 * lookup required — the token is fully self-contained.
 */

import crypto from "node:crypto";

const VERSION = "v1";
const DEFAULT_TTL_MS = 90 * 24 * 60 * 60 * 1000; // 90 days

function b64u(buf: Buffer): string {
  return buf.toString("base64").replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}
function b64uDecode(s: string): Buffer {
  const pad = s.length % 4 === 2 ? "==" : s.length % 4 === 3 ? "=" : "";
  return Buffer.from(s.replace(/-/g, "+").replace(/_/g, "/") + pad, "base64");
}

function getSigningKey(): Buffer {
  const raw = process.env.ACCELERATOR_CREDS_KEY;
  if (!raw) throw new Error("ACCELERATOR_CREDS_KEY not set");
  const master = Buffer.from(raw, "base64");
  // Derive a dedicated signing key so it isn't literally the same bytes
  // used for AES-GCM ciphertext.
  return crypto.createHmac("sha256", master).update(`chatroom-magic-link-${VERSION}`).digest();
}

export function signToken(opts: {
  threadId: string;
  email: string;
  ttlMs?: number;
}): string {
  const exp = Date.now() + (opts.ttlMs ?? DEFAULT_TTL_MS);
  const payload = JSON.stringify({ tid: opts.threadId, em: opts.email, exp });
  const payloadB64 = b64u(Buffer.from(payload, "utf8"));
  const sig = crypto.createHmac("sha256", getSigningKey()).update(payloadB64).digest();
  return `${payloadB64}.${b64u(sig)}`;
}

export type VerifiedToken = { threadId: string; email: string; exp: number };

export function verifyToken(token: string): VerifiedToken | null {
  if (typeof token !== "string" || !token.includes(".")) return null;
  const [payloadB64, sigB64] = token.split(".", 2);
  if (!payloadB64 || !sigB64) return null;

  // Constant-time HMAC compare
  let want: Buffer;
  try {
    want = crypto.createHmac("sha256", getSigningKey()).update(payloadB64).digest();
  } catch { return null; }
  const got = b64uDecode(sigB64);
  if (want.length !== got.length || !crypto.timingSafeEqual(want, got)) return null;

  // Decode + expiry check
  try {
    const obj = JSON.parse(b64uDecode(payloadB64).toString("utf8"));
    if (typeof obj?.tid !== "string" || typeof obj?.em !== "string" || typeof obj?.exp !== "number") return null;
    if (Date.now() > obj.exp) return null;
    return { threadId: obj.tid, email: obj.em, exp: obj.exp };
  } catch {
    return null;
  }
}

export const TOKEN_COOKIE = "am_chatroom_token";
export function tokenCookieHeader(value: string, maxAgeMs: number = DEFAULT_TTL_MS): string {
  const maxAge = Math.floor(maxAgeMs / 1000);
  return `${TOKEN_COOKIE}=${value}; Path=/; Max-Age=${maxAge}; SameSite=Lax; HttpOnly; Secure`;
}
export function clearTokenCookieHeader(): string {
  return `${TOKEN_COOKIE}=; Path=/; Max-Age=0; SameSite=Lax; HttpOnly; Secure`;
}
