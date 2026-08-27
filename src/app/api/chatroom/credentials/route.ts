/**
 * POST /api/chatroom/credentials
 *
 * User submits their TikTok login info via the modal. Body:
 * { threadId, tiktokUsername, tiktokEmail, password, backupCode?, notes? }
 *
 * Payload is AES-256-GCM encrypted before insert. Ciphertext + IV +
 * auth tag stored in chatroom_credentials. A system message is also
 * appended to the thread so the UX shows a "🔒 Credentials submitted"
 * chip in the timeline, and the admin notification email includes the
 * hasCredentials flag.
 */

import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { chatroomThreads, chatroomMessages, chatroomCredentials } from "@/db/schema";
import { getOrCreateBrowserKey } from "@/lib/chatroom/session";
import { encryptJSON } from "@/lib/chatroom/encryption";
import { sendChatroomUserMessageNotification } from "@/lib/email/send";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  let body: {
    threadId?: unknown;
    tiktokUsername?: unknown;
    tiktokEmail?: unknown;
    password?: unknown;
    backupCode?: unknown;
    notes?: unknown;
  };
  try { body = await req.json(); }
  catch { return NextResponse.json({ ok: false, error: "invalid json" }, { status: 400 }); }

  const threadId = typeof body.threadId === "string" ? body.threadId : "";
  if (!threadId) return NextResponse.json({ ok: false, error: "threadId required" }, { status: 400 });

  const payload = {
    tiktokUsername: (typeof body.tiktokUsername === "string" ? body.tiktokUsername : "").trim(),
    tiktokEmail: (typeof body.tiktokEmail === "string" ? body.tiktokEmail : "").trim(),
    password: (typeof body.password === "string" ? body.password : "").trim(),
    backupCode: (typeof body.backupCode === "string" ? body.backupCode : "").trim(),
    notes: (typeof body.notes === "string" ? body.notes : "").trim(),
  };
  if (!payload.tiktokUsername && !payload.tiktokEmail) {
    return NextResponse.json({ ok: false, error: "username or email required" }, { status: 400 });
  }
  if (!payload.password) {
    return NextResponse.json({ ok: false, error: "password required" }, { status: 400 });
  }

  const { key } = await getOrCreateBrowserKey();
  const rows = await db.select().from(chatroomThreads).where(eq(chatroomThreads.id, threadId)).limit(1);
  const thread = rows[0];
  if (!thread || thread.browserKey !== key) {
    return NextResponse.json({ ok: false, error: "not authorized for this thread" }, { status: 401 });
  }

  const enc = encryptJSON(payload);
  await db.insert(chatroomCredentials).values({
    threadId,
    ciphertext: enc.ciphertext,
    iv: enc.iv,
    authTag: enc.authTag,
  });

  const now = new Date();
  const summary = `🔒 TikTok credentials submitted (${payload.tiktokUsername || payload.tiktokEmail})`;
  const [msg] = await db
    .insert(chatroomMessages)
    .values({ threadId, sender: "user", body: summary, attachments: [] })
    .returning();
  await db
    .update(chatroomThreads)
    .set({ lastMessageAt: now, lastUserMessageAt: now })
    .where(eq(chatroomThreads.id, threadId));

  // Notify Kevin + Roni with the credentials flag
  const kevin = process.env.ACCELERATOR_NOTIFY_EMAIL_KEVIN;
  const roni = process.env.ACCELERATOR_NOTIFY_EMAIL_RONI;
  const to = [kevin, roni].filter((e): e is string => typeof e === "string" && e.includes("@"));
  const origin = new URL(req.url).origin;
  await sendChatroomUserMessageNotification({
    to,
    fromName: thread.name,
    fromEmail: thread.email,
    snippet: summary,
    attachments: 0,
    hasCredentials: true,
    openUrl: `${origin}/admin/chatroom/${thread.id}`,
  });

  return NextResponse.json({
    ok: true,
    message: {
      id: msg.id,
      sender: msg.sender,
      body: msg.body,
      attachments: msg.attachments,
      createdAt: msg.createdAt.toISOString(),
    },
  });
}
