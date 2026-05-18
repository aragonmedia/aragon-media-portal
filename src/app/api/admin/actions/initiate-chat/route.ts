/**
 * POST /api/admin/actions/initiate-chat
 * Body: { userId: string }
 *
 * Authed via the am_admin cookie.
 *
 * Find-or-create the OPEN chat thread for the given creator user_id.
 * Used by the admin console when AM needs to initiate the conversation
 * BEFORE the creator has visited their own /dashboard/chat page (which
 * is what normally triggers the chat row's lazy creation).
 *
 * Idempotent — if an open chat already exists for the user, returns
 * its id instead of creating a duplicate. Seeds a system welcome
 * message on first creation so the room isn't empty when admin lands.
 *
 * Returns:
 *   { ok: true, chatId: "...", created: boolean }
 */

import { NextRequest } from "next/server";
import { and, eq } from "drizzle-orm";
import { db } from "@/db";
import { chats, messages, users } from "@/db/schema";
import { isAdminSession } from "@/lib/auth/admin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  if (!(await isAdminSession())) {
    return Response.json({ ok: false, error: "unauthorized" }, { status: 401 });
  }

  let body: { userId?: string };
  try {
    body = (await req.json()) as { userId?: string };
  } catch {
    return Response.json({ ok: false, error: "invalid_json" }, { status: 400 });
  }

  const userId = (body.userId ?? "").trim();
  if (!userId) {
    return Response.json({ ok: false, error: "userId_required" }, { status: 400 });
  }

  // Confirm the user exists (don't want to create chats for dangling ids)
  const target = (
    await db
      .select({ id: users.id, name: users.name })
      .from(users)
      .where(eq(users.id, userId))
      .limit(1)
  )[0];
  if (!target) {
    return Response.json({ ok: false, error: "user_not_found" }, { status: 404 });
  }

  // Find existing open chat
  const existing = (
    await db
      .select({ id: chats.id })
      .from(chats)
      .where(and(eq(chats.userId, userId), eq(chats.status, "open")))
      .limit(1)
  )[0];

  if (existing) {
    return Response.json({ ok: true, chatId: existing.id, created: false });
  }

  // Create — single open chat per user, mirrors the creator-side
  // find-or-create logic in /dashboard/chat
  const inserted = await db
    .insert(chats)
    .values({
      userId,
      subject: "Aragon Media support",
      status: "open",
    })
    .returning({ id: chats.id });

  const row = inserted[0];
  if (!row) {
    return Response.json({ ok: false, error: "insert_failed" }, { status: 500 });
  }

  // Seed welcome system message so the room isn't empty when admin
  // (or the creator on their next visit) opens it
  await db.insert(messages).values({
    chatId: row.id,
    sender: "system",
    body: `Welcome — this is your private channel with the Aragon Media team. Drop us a note any time and we'll respond ASAP.`,
  });

  return Response.json({ ok: true, chatId: row.id, created: true });
}
