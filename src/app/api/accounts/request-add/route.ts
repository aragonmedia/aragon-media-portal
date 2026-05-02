/**
 * POST /api/accounts/request-add
 *
 * Body: { tiktokHandle }   (no @, just the username)
 *
 * Lets a creator (any kind — grandfathered or paying) submit a TikTok
 * username to be approved by the AM team. Inserts an accounts row with
 * status='pending', cycle_number=0 (zero flags 'not part of standard
 * paid cycle'). Admin then approves via the AccountStatusFlip dropdown
 * on /admin/creators/[id].
 *
 * Idempotent: if the same handle already exists for this creator, returns
 * the existing row instead of inserting a duplicate.
 */

import { NextRequest } from "next/server";
import { and, eq, sql } from "drizzle-orm";
import { db } from "@/db";
import { accounts } from "@/db/schema";
import { getCurrentUser } from "@/lib/auth/session";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function normalizeHandle(raw: string): string {
  // Strip leading @ + whitespace, lowercase, trim to 100 chars (schema limit
  // is 200). Block obviously invalid characters early.
  return raw
    .trim()
    .replace(/^@+/, "")
    .replace(/\s+/g, "")
    .toLowerCase()
    .slice(0, 100);
}

export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) {
    return Response.json({ ok: false, error: "unauthorized" }, { status: 401 });
  }

  let body: { tiktokHandle?: string };
  try {
    body = (await req.json()) as { tiktokHandle?: string };
  } catch {
    return Response.json({ ok: false, error: "invalid_json" }, { status: 400 });
  }

  const handle = normalizeHandle(body.tiktokHandle ?? "");
  if (handle.length < 2) {
    return Response.json(
      { ok: false, error: "handle_too_short" },
      { status: 400 }
    );
  }
  if (!/^[a-z0-9._]+$/.test(handle)) {
    return Response.json(
      {
        ok: false,
        error: "invalid_handle_chars",
        hint: "TikTok handles only allow letters, numbers, dots, and underscores.",
      },
      { status: 400 }
    );
  }

  // Idempotent: if this user already has a row with this handle, return it.
  const existing = await db
    .select({ id: accounts.id, status: accounts.status })
    .from(accounts)
    .where(
      and(eq(accounts.userId, user.id), sql`lower(${accounts.tiktokHandle}) = ${handle}`)
    )
    .limit(1);
  if (existing.length > 0) {
    return Response.json({
      ok: true,
      account: existing[0],
      already: true,
    });
  }

  // cycle_number = 0 is our flag for 'manually added — not a paid cycle slot'
  // so the loophole guard math on /dashboard/add-account doesn't shift.
  const inserted = await db
    .insert(accounts)
    .values({
      userId: user.id,
      tiktokHandle: handle,
      status: "pending",
      cyclePosition: 0,
      cycleNumber: 0,
      notes: "Submitted by creator via Settings — awaiting AM approval",
    })
    .returning({
      id: accounts.id,
      tiktokHandle: accounts.tiktokHandle,
      status: accounts.status,
    });

  return Response.json({
    ok: true,
    account: inserted[0],
    already: false,
  });
}
