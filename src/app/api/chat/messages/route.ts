/**
 * GET /api/chat/messages?chatId=<>&since=<isoStringOrEmpty>
 *
 * Returns messages newer than `since` for the given chat.
 * Auth:
 *   - am_admin cookie → any chat
 *   - am_session cookie owner of the chat → that chat only
 */

import { NextRequest } from "next/server";
import { and, asc, eq, gt } from "drizzle-orm";
import { db } from "@/db";
import { chats, messages } from "@/db/schema";
import { getCurrentUser } from "@/lib/auth/session";
import { isAdminSession } from "@/lib/auth/admin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function parseAttachments(raw: string | null): string[] {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed)
      ? parsed.filter((u): u is string => typeof u === "string")
      : [];
  } catch {
    return [];
  }
}

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const chatId = url.searchParams.get("chatId") ?? "";
  const since = url.searchParams.get("since") ?? "";
  if (!chatId) {
    return Response.json({ ok: false, error: "chatId_required" }, { status: 400 });
  }

  const chatRow = (
    await db
      .select({ id: chats.id, userId: chats.userId })
      .from(chats)
      .where(eq(chats.id, chatId))
      .limit(1)
  )[0];
  if (!chatRow) {
    return Response.json({ ok: false, error: "chat_not_found" }, { status: 404 });
  }

  const adminAuthed = await isAdminSession();
  if (!adminAuthed) {
    const me = await getCurrentUser();
    if (!me || me.id !== chatRow.userId) {
      return Response.json({ ok: false, error: "unauthorized" }, { status: 401 });
    }
  }

  const sinceDate = since ? new Date(since) : null;
  const where =
    sinceDate && !isNaN(sinceDate.getTime())
      ? and(eq(messages.chatId, chatId), gt(messages.createdAt, sinceDate))
      : eq(messages.chatId, chatId);

  const rows = await db
    .select({
      id: messages.id,
      sender: messages.sender,
      body: messages.body,
      attachmentUrls: messages.attachmentUrls,
      createdAt: messages.createdAt,
    })
    .from(messages)
    .where(where)
    .orderBy(asc(messages.createdAt))
    .limit(200);

  return Response.json({
    ok: true,
    messages: rows.map((m) => ({
      id: m.id,
      sender: m.sender,
      body: m.body,
      attachmentUrls: parseAttachments(m.attachmentUrls),
      createdAt:
        typeof m.createdAt === "string" ? m.createdAt : m.createdAt.toISOString(),
    })),
  });
}
