/**
 * POST /api/review/accounts/remove
 *
 * Preview-only: removes a linked TikTok account row belonging to the
 * current reviewer session. Body: { id: string }. Only accounts owned
 * by the caller can be deleted (defense against id-tampering). In a
 * real environment this would ALSO revoke the OAuth token with TikTok
 * Partner Center — here it's a straight DB delete.
 */

import { NextResponse } from "next/server";
import { and, eq } from "drizzle-orm";
import { db } from "@/db";
import { accounts } from "@/db/schema";
import { getCurrentReviewer } from "@/lib/auth/review-session";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function POST(req: Request) {
  const user = await getCurrentReviewer();
  if (!user) {
    return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  }

  let body: unknown;
  try { body = await req.json(); }
  catch { return NextResponse.json({ ok: false, error: "invalid json" }, { status: 400 }); }

  const id = typeof (body as { id?: unknown })?.id === "string"
    ? (body as { id: string }).id
    : null;
  if (!id) {
    return NextResponse.json({ ok: false, error: "missing id" }, { status: 400 });
  }

  const removed = await db
    .delete(accounts)
    .where(and(eq(accounts.id, id), eq(accounts.userId, user.id)))
    .returning({ id: accounts.id, handle: accounts.tiktokHandle });

  if (removed.length === 0) {
    return NextResponse.json({ ok: false, error: "not found" }, { status: 404 });
  }

  return NextResponse.json({ ok: true, removed: removed[0] });
}
