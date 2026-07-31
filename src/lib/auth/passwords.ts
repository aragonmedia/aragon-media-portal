/**
 * Password hashing for reviewer/demo accounts.
 *
 * Uses Node's built-in scrypt (no external deps). Format:
 *   scrypt$<N>$<r>$<p>$<saltHex>$<hashHex>
 *
 * Only demo accounts have password_hash — real users authenticate via
 * email-code (see src/lib/auth/codes.ts). See middleware.ts + /api/login.
 */

import { scrypt as scryptCb, randomBytes, timingSafeEqual, type ScryptOptions } from "node:crypto";

type ScryptFn = (
  password: string | Buffer,
  salt: string | Buffer,
  keylen: number,
  options: ScryptOptions
) => Promise<Buffer>;

const scryptAsync: ScryptFn = (password, salt, keylen, options) =>
  new Promise((resolve, reject) => {
    scryptCb(password, salt, keylen, options, (err, derived) => {
      if (err) reject(err);
      else resolve(derived);
    });
  });

const N = 16384;      // CPU/memory cost
const r = 8;          // block size
const p = 1;          // parallelization
const KEY_LEN = 64;   // bytes
const SALT_LEN = 16;  // bytes

export async function hashPassword(plain: string): Promise<string> {
  const salt = randomBytes(SALT_LEN);
  const derived = await scryptAsync(plain, salt, KEY_LEN, { N, r, p });
  return `scrypt$${N}$${r}$${p}$${salt.toString("hex")}$${derived.toString("hex")}`;
}

export async function verifyPassword(plain: string, stored: string): Promise<boolean> {
  try {
    const parts = stored.split("$");
    if (parts.length !== 6 || parts[0] !== "scrypt") return false;
    const nParam = parseInt(parts[1], 10);
    const rParam = parseInt(parts[2], 10);
    const pParam = parseInt(parts[3], 10);
    const salt = Buffer.from(parts[4], "hex");
    const expected = Buffer.from(parts[5], "hex");
    const derived = await scryptAsync(plain, salt, expected.length, {
      N: nParam,
      r: rParam,
      p: pParam,
    });
    if (derived.length !== expected.length) return false;
    return timingSafeEqual(derived, expected);
  } catch {
    return false;
  }
}
