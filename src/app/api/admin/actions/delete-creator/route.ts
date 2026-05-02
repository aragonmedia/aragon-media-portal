/**
 * POST /api/admin/actions/delete-creator
 * Body: { userId, confirm: "delete" }
 *
 * Authed via am_admin cookie. Hard-deletes the user row. Drizzle's onDelete
 * cascade fans out to dependent rows (accounts, agreements, chats, messages,
 * verification_codes, withdrawals — all keyed by user_id with cascade).
 *
 * Self-protect: refuses to delete a row where is_admin=true so the AM team
 * can't accidentally orphan their own admin account.
 */

import { NextRequest } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { users } from "@/db/schema";
import { isAdminSession } from "@/lib/auth/admin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  if (!(await isAdminSession())) {
    return Response.json({ ok: false, error: "unauthorized" }, { status: 401 });
  }

  let body: { userId?: string; confirm?: string };
  try {
    body = (await req.json()) as { userId?: string; confirm?: string };
  } catch {
    return Response.json({ ok: false, error: "invalid_json" }, { status: 400 });
  }

  if (!body.userId) {
    return Response.json({ ok: false, error: "userId_required" }, { status: 400 });
  }
  if ((body.confirm ?? "").trim().toLowerCase() !== "delete") {
    return Response.json(
      { ok: false, error: "confirm_text_must_be_delete" },
      { status: 400 }
    );
  }

  // Refuse to delete admin rows (safety guard)
  const target = (
    await db
      .select({
        id: users.id,
        email: users.email,
        isAdmin: users.isAdmin,
      })
      .from(users)
      .where(eq(users.id, body.userId))
      .limit(1)
  )[0];
  if (!target) {
    return Response.json({ ok: false, error: "user_not_found" }, { status: 404 });
  }
  if (target.isAdmin) {
    return Response.json(
      { ok: false, error: "cannot_delete_admin" },
      { status: 403 }
    );
  }

  // Cascade deletes happen automatically via Drizzle FK onDelete: cascade
  // (accounts, agreements, chats, withdrawals, sessions, verification_codes).
  await db.delete(users).where(eq(users.id, body.userId));

  return Response.json({
    ok: true,
    deleted: { id: target.id, email: target.email },
  });
}
