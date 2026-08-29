/**
 * POST /api/chatroom/threads
 *
 * Two auth paths:
 *   (a) Magic-link cookie present + valid → resume thread by tid,
 *       bypass email/name entirely. Used when the user returns from
 *       an email link (any device, any browser).
 *   (b) Body { email, name } → existing browser-cookie flow. Creates
 *       a new thread if none matches (email + browser_key).
 *
 * Returns { thread, messages }. Sets browser cookie if it was missing.
 */

import { NextResponse } from "next/server";
import { and, asc, eq } from "drizzle-orm";
import { db } from "@/db";
import { chatroomThreads, chatroomMessages } from "@/db/schema";
import { browserCookieHeader, getOrCreateBrowserKey } from "@/lib/chatroom/session";
import { TOKEN_COOKIE, verifyToken } from "@/lib/chatroom/magic-link";
import { cookies } from "next/headers";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(req: Request) {
  // (a) Try magic-link cookie first — no body required
  const jar = await cookies();
  const tokenCookie = jar.get(TOKEN_COOKIE)?.value;
  if (tokenCookie) {
    const verified = verifyToken(tokenCookie);
    if (verified) {
      const rows = await db
        .select()
        .from(chatroomThreads)
        .where(eq(chatroomThreads.id, verified.threadId))
        .limit(1);
      if (rows[0]) {
        const thread = rows[0];
        const msgs = await db
          .select()
          .from(chatroomMessages)
          .where(eq(chatroomMessages.threadId, thread.id))
          .orderBy(asc(chatroomMessages.createdAt))
          .limit(200);
        return NextResponse.json({
          ok: true,
          via: "magic",
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
        });
      }
    }
  }

  // (b) Body-based create/resume by email + browser_key
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
      via: "email",
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
