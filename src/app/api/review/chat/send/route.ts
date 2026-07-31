/**
 * POST /api/review/chat/send
 * Body: { chatId, body }
 *
 * Demo/reviewer-only chat send. Verifies:
 *   - am_review cookie present + valid
 *   - user is is_demo=true
 *   - the chat belongs to that demo user
 *
 * NO email notification is sent (demo users don't trigger Resend).
 * NO attachments (blocked by middleware anyway).
 */

import { NextRequest } from "next/server";
import { and, eq } from "drizzle-orm";
import { db } from "@/db";
import { chats, messages } from "@/db/schema";
import { getCurrentReviewer } from "@/lib/auth/review-session";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const user = await getCurrentReviewer();
  if (!user) return Response.json({ ok: false, error: "unauth" }, { status: 401 });

  let body: { chatId?: string; body?: string };
  try {
    body = (await req.json()) as { chatId?: string; body?: string };
  } catch {
    return Response.json({ ok: false, error: "invalid_json" }, { status: 400 });
  }

  const chatId = (body.chatId ?? "").trim();
  const text = (body.body ?? "").trim();
  if (!chatId || !text) {
    return Response.json({ ok: false, error: "missing_fields" }, { status: 400 });
  }
  if (text.length > 4000) {
    return Response.json({ ok: false, error: "body_too_long" }, { status: 400 });
  }

  const owned = await db
    .select({ id: chats.id })
    .from(chats)
    .where(and(eq(chats.id, chatId), eq(chats.userId, user.id)))
    .limit(1);
  if (!owned[0]) return Response.json({ ok: false, error: "not_found" }, { status: 404 });

  const [row] = await db
    .insert(messages)
    .values({ chatId, sender: "user", body: text })
    .returning();

  await db
    .update(chats)
    .set({ lastMessageAt: new Date() })
    .where(eq(chats.id, chatId));

  return Response.json({
    ok: true,
    message: {
      id: row.id,
      sender: "user" as const,
      body: row.body,
      createdAt: (row.createdAt as Date).toISOString(),
    },
  });
}
