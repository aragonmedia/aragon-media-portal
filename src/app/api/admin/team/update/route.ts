/**
 * POST /api/admin/team/update
 * Body: { userId, role?, scope? }
 * Owner-only. Updates an existing teammate's role and/or scope. Doesn't
 * require them to re-login — the change takes effect on their next
 * admin page load.
 *
 * Scope: null → sees all tenants (owner-only setting). "roni" or "colt"
 * → bound to that tenant.
 */

import { NextRequest } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { users } from "@/db/schema";
import { getAdminRole } from "@/lib/auth/admin-role";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const EDITABLE_ROLES = new Set(["accelerator_admin", "am_lead", "chat_only"]);

export async function POST(req: NextRequest) {
  const session = await getAdminRole();
  if (!session || session.role !== "owner") {
    return Response.json({ ok: false, error: "owner-only" }, { status: 403 });
  }
  const body = (await req.json().catch(() => ({}))) as Record<string, unknown>;
  const userId = typeof body.userId === "string" ? body.userId : "";
  const role = typeof body.role === "string" ? body.role : undefined;
  const scope = body.scope === null ? null : (body.scope === "roni" || body.scope === "colt" ? body.scope : undefined);
  if (!userId) return Response.json({ ok: false, error: "userId required" }, { status: 400 });

  // Refuse to demote an owner
  const rows = await db.select({ id: users.id, adminRole: users.adminRole }).from(users).where(eq(users.id, userId)).limit(1);
  const target = rows[0];
  if (!target) return Response.json({ ok: false, error: "not found" }, { status: 404 });
  if (target.adminRole === "owner") return Response.json({ ok: false, error: "cannot modify owner" }, { status: 403 });

  const patch: { adminRole?: string; scopedAccelerator?: string | null } = {};
  if (role !== undefined) {
    if (!EDITABLE_ROLES.has(role)) return Response.json({ ok: false, error: "invalid role" }, { status: 400 });
    patch.adminRole = role;
  }
  if (scope !== undefined) patch.scopedAccelerator = scope;

  if (Object.keys(patch).length === 0) return Response.json({ ok: false, error: "nothing to update" }, { status: 400 });

  await db.update(users).set(patch).where(eq(users.id, userId));
  return Response.json({ ok: true });
}
