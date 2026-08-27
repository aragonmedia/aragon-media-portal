/**
 * AES-256-GCM encryption for chatroom TikTok credentials at rest.
 *
 * Key: ACCELERATOR_CREDS_KEY env var, 32 bytes base64-encoded.
 * Per-record IV (12 bytes, random). Auth tag stored alongside so we
 * can detect tampering on decrypt.
 *
 * We only encrypt the sensitive payload — thread metadata (email,
 * name, browser_key) stays in the clear so we can query it. Only the
 * credentials themselves (username, email, password, backup code)
 * are encrypted.
 */

import crypto from "node:crypto";

const ALGO = "aes-256-gcm";

function getKey(): Buffer {
  const raw = process.env.ACCELERATOR_CREDS_KEY;
  if (!raw) throw new Error("ACCELERATOR_CREDS_KEY not set");
  const key = Buffer.from(raw, "base64");
  if (key.length !== 32) {
    throw new Error(
      `ACCELERATOR_CREDS_KEY must be 32 bytes base64-encoded (got ${key.length})`
    );
  }
  return key;
}

export type EncryptedPayload = {
  ciphertext: string; // base64
  iv: string;         // base64
  authTag: string;    // base64
};

export function encryptJSON(payload: unknown): EncryptedPayload {
  const plaintext = Buffer.from(JSON.stringify(payload), "utf8");
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv(ALGO, getKey(), iv);
  const ciphertext = Buffer.concat([cipher.update(plaintext), cipher.final()]);
  const authTag = cipher.getAuthTag();
  return {
    ciphertext: ciphertext.toString("base64"),
    iv: iv.toString("base64"),
    authTag: authTag.toString("base64"),
  };
}

export function decryptJSON<T = unknown>(enc: EncryptedPayload): T {
  const iv = Buffer.from(enc.iv, "base64");
  const authTag = Buffer.from(enc.authTag, "base64");
  const decipher = crypto.createDecipheriv(ALGO, getKey(), iv);
  decipher.setAuthTag(authTag);
  const plaintext = Buffer.concat([
    decipher.update(Buffer.from(enc.ciphertext, "base64")),
    decipher.final(),
  ]);
  return JSON.parse(plaintext.toString("utf8")) as T;
}
