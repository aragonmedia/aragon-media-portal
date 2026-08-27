/**
 * POST /api/admin/chatroom/decrypt
 *
 * Admin-only: given a credentials row id, decrypt and return the
 * plaintext payload. Records viewed_by_admin_at timestamp so we know
 * when the admin last opened it. Never logs the plaintext.
 */

import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { chatroomCredentials } from "@/db/schema";
import { isAdminSession } from "@/lib/auth/admin";
import { decryptJSON } from "@/lib/chatroom/encryption";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  if (!(await isAdminSession())) {
    return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  }

  let body: { id?: unknown };
  try { body = await req.json(); }
  catch { return NextResponse.json({ ok: false, error: "invalid json" }, { status: 400 }); }

  const id = typeof body.id === "string" ? body.id : "";
  if (!id) return NextResponse.json({ ok: false, error: "id required" }, { status: 400 });

  const rows = await db.select().from(chatroomCredentials).where(eq(chatroomCredentials.id, id)).limit(1);
  const cred = rows[0];
  if (!cred) return NextResponse.json({ ok: false, error: "not found" }, { status: 404 });

  try {
    const plaintext = decryptJSON<{
      tiktokUsername: string;
      tiktokEmail: string;
      password: string;
      backupCode: string;
      notes: string;
    }>({
      ciphertext: cred.ciphertext,
      iv: cred.iv,
      authTag: cred.authTag,
    });
    await db
      .update(chatroomCredentials)
      .set({ viewedByAdminAt: new Date() })
      .where(eq(chatroomCredentials.id, id));
    return NextResponse.json({ ok: true, credentials: plaintext });
  } catch (err) {
    console.error("[chatroom decrypt] failed:", err);
    return NextResponse.json({ ok: false, error: "decrypt failed" }, { status: 500 });
  }
}
