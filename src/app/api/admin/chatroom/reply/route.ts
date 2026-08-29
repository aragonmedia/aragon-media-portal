/**
 * POST /api/admin/chatroom/reply
 *
 * Admin (am_admin cookie) posts a reply to a chatroom thread.
 * Body: { threadId, body, attachments? }
 * Does NOT email the user back — they see replies when they return
 * to /chatroom with the same email + browser cookie.
 */

import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { chatroomThreads, chatroomMessages } from "@/db/schema";
import { isAdminSession } from "@/lib/auth/admin";
import { sendChatroomAdminReplyNotification } from "@/lib/email/send";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  if (!(await isAdminSession())) {
    return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  }

  let body: { threadId?: unknown; body?: unknown; attachments?: unknown };
  try { body = await req.json(); }
  catch { return NextResponse.json({ ok: false, error: "invalid json" }, { status: 400 }); }

  const threadId = typeof body.threadId === "string" ? body.threadId : "";
  const text = (typeof body.body === "string" ? body.body : "").trim().slice(0, 4000);
  const attachments = Array.isArray(body.attachments)
    ? body.attachments
        .filter((u): u is string => typeof u === "string")
        .filter((u) => /^https?:\/\//.test(u))
        .slice(0, 4)
    : [];
  if (!threadId) return NextResponse.json({ ok: false, error: "threadId required" }, { status: 400 });
  if (!text && attachments.length === 0) {
    return NextResponse.json({ ok: false, error: "empty message" }, { status: 400 });
  }

  const rows = await db.select().from(chatroomThreads).where(eq(chatroomThreads.id, threadId)).limit(1);
  if (rows.length === 0) return NextResponse.json({ ok: false, error: "thread not found" }, { status: 404 });

  const [msg] = await db
    .insert(chatroomMessages)
    .values({ threadId, sender: "am", body: text, attachments })
    .returning();
  const now = new Date();
  await db
    .update(chatroomThreads)
    .set({ lastMessageAt: now, lastAdminMessageAt: now })
    .where(eq(chatroomThreads.id, threadId));

  // Notify the user that AM replied (fire-and-log, non-blocking)
  const thread = rows[0];
  const origin = new URL(req.url).origin;
  await sendChatroomAdminReplyNotification({
    to: thread.email,
    userName: thread.name,
    snippet: text.slice(0, 280) || (attachments.length ? "(attachments only — open the chat to view)" : ""),
    attachments: attachments.length,
    openUrl: `${origin}/chatroom`,
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
