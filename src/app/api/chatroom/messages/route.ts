/**
 * POST /api/chatroom/messages
 *
 * User posts a message in their thread. Body: { threadId, body, attachments? }
 * Requires the browser cookie to match the thread's browser_key.
 *
 * Side effect: emails Kevin + Roni via Resend (throttled inside the mailer).
 */

import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { chatroomThreads, chatroomMessages } from "@/db/schema";
import { getOrCreateBrowserKey } from "@/lib/chatroom/session";
import { sendChatroomUserMessageNotification } from "@/lib/email/send";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  let body: { threadId?: unknown; body?: unknown; attachments?: unknown; hasCredentials?: unknown };
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
  const hasCredentials = body.hasCredentials === true;

  if (!threadId) return NextResponse.json({ ok: false, error: "threadId required" }, { status: 400 });
  if (!text && attachments.length === 0 && !hasCredentials) {
    return NextResponse.json({ ok: false, error: "empty message" }, { status: 400 });
  }

  const { key } = await getOrCreateBrowserKey();
  const rows = await db.select().from(chatroomThreads).where(eq(chatroomThreads.id, threadId)).limit(1);
  const thread = rows[0];
  if (!thread || thread.browserKey !== key) {
    return NextResponse.json({ ok: false, error: "not authorized for this thread" }, { status: 401 });
  }

  const now = new Date();
  const [msg] = await db
    .insert(chatroomMessages)
    .values({ threadId, sender: "user", body: text, attachments })
    .returning();
  await db
    .update(chatroomThreads)
    .set({ lastMessageAt: now, lastUserMessageAt: now })
    .where(eq(chatroomThreads.id, threadId));

  // Notify Kevin + Roni
  const kevin = process.env.ACCELERATOR_NOTIFY_EMAIL_KEVIN;
  const roni = process.env.ACCELERATOR_NOTIFY_EMAIL_RONI;
  const to = [kevin, roni].filter((e): e is string => typeof e === "string" && e.includes("@"));
  const origin = new URL(req.url).origin;
  await sendChatroomUserMessageNotification({
    to,
    fromName: thread.name,
    fromEmail: thread.email,
    snippet: text.slice(0, 280) || (hasCredentials ? "(TikTok credentials submitted)" : "(attachments only)"),
    attachments: attachments.length,
    hasCredentials,
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
