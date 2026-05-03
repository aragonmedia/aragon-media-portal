/**
 * POST /api/chat/send
 * Body: { chatId, body }
 *
 * Sender is detected from cookies:
 *   - am_admin valid → sender='am_team', any chatId allowed
 *   - else am_session for the chat owner → sender='user'
 *   - else 401
 *
 * Side effects:
 *   - inserts a messages row
 *   - bumps chats.last_message_at
 *   - emails the OTHER party (throttled: only if no message in this chat
 *     in the last 5 minutes from the same sender side, to avoid spamming
 *     during rapid back-and-forth)
 */

import { NextRequest } from "next/server";
import { and, desc, eq } from "drizzle-orm";
import { db } from "@/db";
import { chats, messages, users } from "@/db/schema";
import { getCurrentUser } from "@/lib/auth/session";
import { isAdminSession } from "@/lib/auth/admin";
import { sendChatNotificationEmail } from "@/lib/email/send";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  let body: { chatId?: string; body?: string; attachmentUrls?: string[] };
  try {
    body = (await req.json()) as { chatId?: string; body?: string; attachmentUrls?: string[] };
  } catch {
    return Response.json({ ok: false, error: "invalid_json" }, { status: 400 });
  }

  const chatId = (body.chatId ?? "").trim();
  const text = (body.body ?? "").trim();
  const attachments = Array.isArray(body.attachmentUrls)
    ? body.attachmentUrls
        .filter((u): u is string => typeof u === "string")
        .filter((u) => /^https?:\/\//.test(u))
        .slice(0, 4)
    : [];
  if (!chatId) {
    return Response.json({ ok: false, error: "chatId_required" }, { status: 400 });
  }
  if (text.length > 4000) {
    return Response.json({ ok: false, error: "body_too_long" }, { status: 400 });
  }
  if (text.length === 0 && attachments.length === 0) {
    return Response.json(
      { ok: false, error: "empty_message" },
      { status: 400 }
    );
  }

  // Resolve the chat + its owner
  const chatRow = (
    await db
      .select({
        id: chats.id,
        userId: chats.userId,
        ownerEmail: users.email,
        ownerName: users.name,
      })
      .from(chats)
      .leftJoin(users, eq(users.id, chats.userId))
      .where(eq(chats.id, chatId))
      .limit(1)
  )[0];
  if (!chatRow) {
    return Response.json({ ok: false, error: "chat_not_found" }, { status: 404 });
  }

  // Sender resolution
  const adminAuthed = await isAdminSession();
  let sender: "am_team" | "user";
  if (adminAuthed) {
    sender = "am_team";
  } else {
    const me = await getCurrentUser();
    if (!me || me.id !== chatRow.userId) {
      return Response.json({ ok: false, error: "unauthorized" }, { status: 401 });
    }
    sender = "user";
  }

  // Insert message + bump last_message_at
  const now = new Date();
  const inserted = await db
    .insert(messages)
    .values({
      chatId,
      sender,
      body: text,
      attachmentUrls: attachments.length > 0 ? JSON.stringify(attachments) : null,
      createdAt: now,
    })
    .returning({
      id: messages.id,
      sender: messages.sender,
      body: messages.body,
      attachmentUrls: messages.attachmentUrls,
      createdAt: messages.createdAt,
    });
  await db
    .update(chats)
    .set({ lastMessageAt: now })
    .where(eq(chats.id, chatId));

  // Throttle email: only send if the previous message in this chat from the
  // SAME sender side was older than 5 minutes (or there isn't one). This
  // avoids paging the recipient on every keystroke during a live exchange.
  const FIVE_MIN_MS = 5 * 60 * 1000;
  const lastSame = (
    await db
      .select({ createdAt: messages.createdAt })
      .from(messages)
      .where(and(eq(messages.chatId, chatId), eq(messages.sender, sender)))
      .orderBy(desc(messages.createdAt))
      .limit(2)
  )[1]; // [0] is the one we just inserted
  const shouldEmail =
    !lastSame ||
    now.getTime() - new Date(lastSame.createdAt).getTime() >= FIVE_MIN_MS;

  if (shouldEmail) {
    try {
      const snippetText = text || `[Sent ${attachments.length} image attachment${attachments.length === 1 ? "" : "s"}]`;
      if (sender === "user" && chatRow.ownerEmail) {
        // Notify admin of the creator's reply
        await sendChatNotificationEmail({
          to: "aragonkevin239@gmail.com",
          fromLabel: chatRow.ownerName ?? "A creator",
          fromContext: chatRow.ownerEmail,
          snippet: snippetText.slice(0, 280),
          openUrl: `https://portal.kevin-aragon.com/admin/chats/${chatId}`,
          recipientIsAdmin: true,
        });
      } else if (sender === "am_team" && chatRow.ownerEmail) {
        // Notify the creator of the AM team reply
        await sendChatNotificationEmail({
          to: chatRow.ownerEmail,
          fromLabel: "Aragon Media",
          fromContext: "AM team",
          snippet: snippetText.slice(0, 280),
          openUrl: `https://portal.kevin-aragon.com/dashboard/chat`,
          recipientIsAdmin: false,
        });
      }
    } catch (err) {
      console.error("[chat/send] notify failed:", err);
    }
  }

  return Response.json({
    ok: true,
    message: {
      id: inserted[0].id,
      sender: inserted[0].sender,
      body: inserted[0].body,
      attachmentUrls: attachments,
      createdAt:
        typeof inserted[0].createdAt === "string"
          ? inserted[0].createdAt
          : inserted[0].createdAt.toISOString(),
    },
    notified: shouldEmail,
  });
}
