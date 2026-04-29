/**
 * 6-digit verification code helpers.
 *
 * - Codes are random 0..999999, zero-padded to 6 chars.
 * - We persist only the SHA-256 hash of the code (column verification_codes.code_hash),
 *   never the plaintext.
 * - Codes expire 15 minutes after creation; expiry is enforced at the verify step.
 */

import crypto from "node:crypto";

export const CODE_TTL_MINUTES = 15;
export const CODE_LENGTH = 6;
export const MAX_CODE_ATTEMPTS = 6;

export function generateCode(): string {
  // crypto.randomInt is uniform; lib upper bound is exclusive
  return crypto.randomInt(0, 1_000_000).toString().padStart(CODE_LENGTH, "0");
}

export function hashCode(code: string): string {
  return crypto.createHash("sha256").update(code).digest("hex");
}

export function codeExpiry(): Date {
  return new Date(Date.now() + CODE_TTL_MINUTES * 60 * 1000);
}

export function isExpired(expiresAt: Date | string): boolean {
  const t = typeof expiresAt === "string" ? new Date(expiresAt) : expiresAt;
  return t.getTime() <= Date.now();
}
