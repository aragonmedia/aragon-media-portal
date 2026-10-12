/**
 * Admin role helpers — RBAC on top of the admin cookie session.
 *
 * Roles:
 *   owner              — Kevin. Everything. Cannot be revoked.
 *   accelerator_admin  — Partner (Roni, COLT, etc). Leads + Chatroom.
 *   am_lead            — Future AM hire. Leads only.
 *   chat_only          — Future community mgr. Chatroom only.
 *
 * Scope: non-owner roles can be bound to a specific accelerator
 * (users.scoped_accelerator = 'roni' | 'colt'). When set, they only
 * see that tenant's data. Owner ignores scope.
 */

import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { users } from "@/db/schema";
import { getAdminSession } from "./admin";

export type AdminRole = "owner" | "accelerator_admin" | "am_lead" | "chat_only";
export type AcceleratorScope = "roni" | "colt" | null;

export const ROLE_LABEL: Record<AdminRole, string> = {
  owner: "Owner",
  accelerator_admin: "Accelerator Admin",
  am_lead: "AM Lead",
  chat_only: "Chatroom",
};

export async function getAdminRole(): Promise<{ userId: string; role: AdminRole; scope: AcceleratorScope } | null> {
  const session = await getAdminSession();
  if (!session) return null;

  try {
    const rows = await db
      .select({ id: users.id, adminRole: users.adminRole, isAdmin: users.isAdmin, scopedAccelerator: users.scopedAccelerator })
      .from(users)
      .where(eq(users.id, session.userId))
      .limit(1);
    const row = rows[0];
    if (!row || !row.isAdmin) return null;
    const role = (row.adminRole as AdminRole | null) ?? "owner";
    const rawScope = (row.scopedAccelerator as AcceleratorScope | null) ?? null;
    const scope: AcceleratorScope = role === "owner" ? null : rawScope;
    return { userId: row.id, role, scope };
  } catch (err) {
    console.warn("[getAdminRole] fallback (migration pending?):", err instanceof Error ? err.message : err);
    try {
      const rows = await db
        .select({ id: users.id, isAdmin: users.isAdmin })
        .from(users)
        .where(eq(users.id, session.userId))
        .limit(1);
      const row = rows[0];
      if (!row || !row.isAdmin) return null;
      return { userId: row.id, role: "owner", scope: null };
    } catch { return null; }
  }
}

export async function requireAdminRole(allowed: AdminRole[]): Promise<{ userId: string; role: AdminRole; scope: AcceleratorScope }> {
  const cur = await getAdminRole();
  if (!cur) redirect("/admin");
  if (!allowed.includes(cur.role)) redirect("/admin/chatroom");
  return cur;
}

export function defaultRouteFor(role: AdminRole): string {
  switch (role) {
    case "owner": return "/admin";
    case "accelerator_admin": return "/admin/accelerator-leads";
    case "am_lead": return "/admin/accelerator-leads";
    case "chat_only": return "/admin/chatroom";
  }
}
