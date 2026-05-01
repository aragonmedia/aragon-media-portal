/**
 * POST /api/admin/actions/unlock-creator
 * Body: { userId } | { email }
 *
 * Authed via the am_admin cookie (the same gate that protects /admin pages).
 * Flips users.contract_unlocked = true so the creator can sign their
 * Operations Agreement.
 *
 * Idempotent — second call is a no-op.
 */

import { NextRequest } from "next/server";
import { eq, sql } from "drizzle-orm";
import { db } from "@/db";
import { users } from "@/db/schema";
import { isAdminSession } from "@/lib/auth/admin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  if (!(await isAdminSession())) {
    return Response.json({ ok: false, error: "unauthorized" }, { status: 401 });
  }

  let body: { userId?: string; email?: string };
  try {
    body = (await req.json()) as { userId?: string; email?: string };
  } catch {
    return Response.json({ ok: false, error: "invalid_json" }, { status: 400 });
  }

  const now = new Date();
  let where;
  if (body.userId && body.userId.length > 0) {
    where = eq(users.id, body.userId);
  } else if (body.email && body.email.length > 0) {
    where = sql`lower(${users.email}) = ${body.email.trim().toLowerCase()}`;
  } else {
    return Response.json(
      { ok: false, error: "userId_or_email_required" },
      { status: 400 }
    );
  }

  const updated = await db
    .update(users)
    .set({ contractUnlocked: true, contractUnlockedAt: now })
    .where(where)
    .returning({
      id: users.id,
      email: users.email,
      contractUnlocked: users.contractUnlocked,
      contractUnlockedAt: users.contractUnlockedAt,
    });

  if (updated.length === 0) {
    return Response.json({ ok: false, error: "user_not_found" }, { status: 404 });
  }
  return Response.json({ ok: true, user: updated[0] });
}
