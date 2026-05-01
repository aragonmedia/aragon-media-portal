/**
 * One-shot admin endpoint to flip users.contract_unlocked = true for a given
 * email so the matching creator can sign their Operations Agreement.
 *
 * Auth: same MIGRATION_SECRET as the other /api/admin/* endpoints.
 *
 * Usage:
 *   POST /api/admin/unlock-contract
 *   Authorization: Bearer <MIGRATION_SECRET>
 *   Content-Type: application/json
 *   { "email": "creator@example.com" }
 *
 *   Or (browser-friendly):
 *   GET /api/admin/unlock-contract?secret=<MIGRATION_SECRET>&email=creator@example.com
 *
 * Response: { ok: true, userId, email, unlockedAt } | { ok: false, error }
 *
 * Idempotent — calling twice is a no-op the second time.
 */

import { NextRequest } from "next/server";
import { sql } from "drizzle-orm";
import { db } from "@/db";
import { users } from "@/db/schema";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

async function unlock(email: string) {
  const trimmed = email.trim().toLowerCase();
  if (!trimmed.includes("@")) {
    return Response.json(
      { ok: false, error: "invalid_email" },
      { status: 400 }
    );
  }
  const now = new Date();
  const updated = await db
    .update(users)
    .set({ contractUnlocked: true, contractUnlockedAt: now })
    .where(sql`lower(${users.email}) = ${trimmed}`)
    .returning({
      id: users.id,
      email: users.email,
      unlockedAt: users.contractUnlockedAt,
    });
  if (updated.length === 0) {
    return Response.json({ ok: false, error: "user_not_found" }, { status: 404 });
  }
  return Response.json({
    ok: true,
    userId: updated[0].id,
    email: updated[0].email,
    unlockedAt: updated[0].unlockedAt,
  });
}

export async function POST(req: NextRequest) {
  const auth = req.headers.get("authorization") ?? "";
  const secret = process.env.MIGRATION_SECRET;
  if (!secret) {
    return Response.json(
      { ok: false, error: "MIGRATION_SECRET not set" },
      { status: 500 }
    );
  }
  if (auth !== `Bearer ${secret}`) {
    return Response.json({ ok: false, error: "unauthorized" }, { status: 401 });
  }
  let body: { email?: string };
  try {
    body = (await req.json()) as { email?: string };
  } catch {
    return Response.json({ ok: false, error: "invalid_json" }, { status: 400 });
  }
  if (!body.email) {
    return Response.json(
      { ok: false, error: "email_required" },
      { status: 400 }
    );
  }
  return unlock(body.email);
}

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const querySecret = url.searchParams.get("secret");
  const email = url.searchParams.get("email");
  const secret = process.env.MIGRATION_SECRET;

  if (!querySecret) {
    return Response.json({
      ok: true,
      hint: "POST { email } with Authorization: Bearer <MIGRATION_SECRET>, or GET ?secret=...&email=...",
    });
  }
  if (!secret) {
    return Response.json(
      { ok: false, error: "MIGRATION_SECRET not set" },
      { status: 500 }
    );
  }
  if (querySecret !== secret) {
    return Response.json({ ok: false, error: "unauthorized" }, { status: 401 });
  }
  if (!email) {
    return Response.json(
      { ok: false, error: "email_required" },
      { status: 400 }
    );
  }
  return unlock(email);
}
