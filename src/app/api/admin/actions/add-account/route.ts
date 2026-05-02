/**
 * POST /api/admin/actions/add-account
 *
 * Body: { userId, tiktokHandle, status? }
 *
 * Authed via am_admin cookie. Lets the AM team add a TikTok account to a
 * creator's profile directly — typical use is grandfathering existing
 * accounts that were running before the portal launched.
 *
 * Default status='verified' since admin is adding it intentionally; pass
 * an explicit status if you want it queued for verification instead.
 *
 * Idempotent on (userId, lower(handle)).
 */

import { NextRequest } from "next/server";
import { and, eq, sql } from "drizzle-orm";
import { db } from "@/db";
import { accounts, users } from "@/db/schema";
import { isAdminSession } from "@/lib/auth/admin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const ALLOWED_STATUSES = new Set([
  "pending",
  "credentials_received",
  "two_factor_pending",
  "verified",
  "active",
  "suspended",
  "cancelled",
]);

function normalizeHandle(raw: string): string {
  return raw
    .trim()
    .replace(/^@+/, "")
    .replace(/\s+/g, "")
    .toLowerCase()
    .slice(0, 100);
}

export async function POST(req: NextRequest) {
  if (!(await isAdminSession())) {
    return Response.json({ ok: false, error: "unauthorized" }, { status: 401 });
  }

  let body: { userId?: string; tiktokHandle?: string; status?: string };
  try {
    body = (await req.json()) as {
      userId?: string;
      tiktokHandle?: string;
      status?: string;
    };
  } catch {
    return Response.json({ ok: false, error: "invalid_json" }, { status: 400 });
  }

  if (!body.userId) {
    return Response.json({ ok: false, error: "userId_required" }, { status: 400 });
  }
  const handle = normalizeHandle(body.tiktokHandle ?? "");
  if (handle.length < 2 || !/^[a-z0-9._]+$/.test(handle)) {
    return Response.json(
      { ok: false, error: "invalid_handle" },
      { status: 400 }
    );
  }
  const status = body.status && ALLOWED_STATUSES.has(body.status) ? body.status : "verified";

  // Confirm user exists
  const target = (
    await db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.id, body.userId))
      .limit(1)
  )[0];
  if (!target) {
    return Response.json({ ok: false, error: "user_not_found" }, { status: 404 });
  }

  // Idempotent
  const existing = await db
    .select({ id: accounts.id })
    .from(accounts)
    .where(
      and(eq(accounts.userId, body.userId), sql`lower(${accounts.tiktokHandle}) = ${handle}`)
    )
    .limit(1);
  if (existing.length > 0) {
    return Response.json({
      ok: true,
      account: existing[0],
      already: true,
    });
  }

  const now = new Date();
  const verifiedAt = status === "verified" || status === "active" ? now : null;
  const inserted = await db
    .insert(accounts)
    .values({
      userId: body.userId,
      tiktokHandle: handle,
      status: status as
        | "pending"
        | "credentials_received"
        | "two_factor_pending"
        | "verified"
        | "active"
        | "suspended"
        | "cancelled",
      cyclePosition: 0,
      cycleNumber: 0,
      notes: "Added by AM team",
      verifiedAt,
    })
    .returning({
      id: accounts.id,
      tiktokHandle: accounts.tiktokHandle,
      status: accounts.status,
    });

  return Response.json({ ok: true, account: inserted[0], already: false });
}
