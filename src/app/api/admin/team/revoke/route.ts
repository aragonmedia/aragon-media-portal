/**
 * POST /api/admin/team/revoke
 * Body: { kind: "invite" | "member", id: string }
 * Owner-only.
 * - invite: sets status=revoked
 * - member: sets isAdmin=false + adminRole=null (does not delete the user row)
 * Owner rows are refused.
 */

import { NextRequest } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { adminInvites, users } from "@/db/schema";
import { getAdminRole } from "@/lib/auth/admin-role";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const session = await getAdminRole();
  if (!session || session.role !== "owner") {
    return Response.json({ ok: false, error: "owner-only" }, { status: 403 });
  }
  const body = (await req.json().catch(() => ({}))) as Record<string, unknown>;
  const kind = body.kind;
  const id = typeof body.id === "string" ? body.id : "";
  if (!id) return Response.json({ ok: false, error: "id required" }, { status: 400 });

  if (kind === "invite") {
    await db.update(adminInvites).set({ status: "revoked" }).where(eq(adminInvites.id, id));
    return Response.json({ ok: true });
  }
  if (kind === "member") {
    // Refuse to demote self or another owner
    const rows = await db.select({ id: users.id, adminRole: users.adminRole }).from(users).where(eq(users.id, id)).limit(1);
    const target = rows[0];
    if (!target) return Response.json({ ok: false, error: "not found" }, { status: 404 });
    if (target.adminRole === "owner") return Response.json({ ok: false, error: "cannot revoke owner" }, { status: 403 });
    await db.update(users).set({ isAdmin: false, adminRole: null }).where(eq(users.id, id));
    return Response.json({ ok: true });
  }
  return Response.json({ ok: false, error: "invalid kind" }, { status: 400 });
}
