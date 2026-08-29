/**
 * POST /api/chatroom/threads
 *
 * Start a new thread OR resume an existing one for this (email + browser)
 * pair. Body: { email, name }. Sets the browser cookie if it wasn't set.
 * Returns the thread + full message history (last 200 msgs).
 *
 * Public. No auth — this is the entry point into the /chatroom flow.
 */

import { NextResponse } from "next/server";
import { and, asc, eq } from "drizzle-orm";
import { db } from "@/db";
import { chatroomThreads, chatroomMessages } from "@/db/schema";
import { browserCookieHeader, getOrCreateBrowserKey } from "@/lib/chatroom/session";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(req: Request) {
  let body: { email?: unknown; name?: unknown };
  try { body = await req.json(); }
  catch { return NextResponse.json({ ok: false, error: "invalid json" }, { status: 400 }); }

  const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
  const name = typeof body.name === "string" ? body.name.trim().slice(0, 200) : "";
  if (!EMAIL_RE.test(email)) {
    return NextResponse.json({ ok: false, error: "invalid email" }, { status: 400 });
  }
  if (!name) {
    return NextResponse.json({ ok: false, error: "name required" }, { status: 400 });
  }

  const { key, setCookie } = await getOrCreateBrowserKey();

  // Try to find an existing thread for (email, browser_key)
  const existing = await db
    .select()
    .from(chatroomThreads)
    .where(and(eq(chatroomThreads.email, email), eq(chatroomThreads.browserKey, key)))
    .limit(1);

  let thread = existing[0];
  if (!thread) {
    const inserted = await db
      .insert(chatroomThreads)
      .values({ email, name, browserKey: key })
      .returning();
    thread = inserted[0];
  } else if (thread.name !== name) {
    // User updated their name — persist it
    const updated = await db
      .update(chatroomThreads)
      .set({ name })
      .where(eq(chatroomThreads.id, thread.id))
      .returning();
    thread = updated[0];
  }

  const msgs = await db
    .select()
    .from(chatroomMessages)
    .where(eq(chatroomMessages.threadId, thread.id))
    .orderBy(asc(chatroomMessages.createdAt))
    .limit(200);

  const headers = new Headers({ "Content-Type": "application/json" });
  if (setCookie) headers.append("Set-Cookie", browserCookieHeader(setCookie));
  return new Response(
    JSON.stringify({
      ok: true,
      thread: {
        id: thread.id,
        email: thread.email,
        name: thread.name,
        createdAt: thread.createdAt.toISOString(),
      },
      messages: msgs.map((m) => ({
        id: m.id,
        sender: m.sender,
        body: m.body,
        attachments: m.attachments,
        createdAt: m.createdAt.toISOString(),
      })),
    }),
    { headers }
  );
}
