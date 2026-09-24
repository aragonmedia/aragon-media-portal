/**
 * Admin role helpers — RBAC on top of the admin cookie session.
 *
 * Roles:
 *   owner              — Kevin. Everything. Cannot be revoked.
 *   accelerator_admin  — Roni. Accelerator Leads + Chatroom.
 *   am_lead            — future AM hire. Accelerator Leads only.
 *   chat_only          — future community mgr. Chatroom only.
 *
 * Fail-open on missing admin_role column: pre-migration, any is_admin=true
 * user is treated as 'owner'. This keeps the app up while /api/admin/migrate
 * gets run once.
 */

import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { users } from "@/db/schema";
import { getAdminSession } from "./admin";

export type AdminRole = "owner" | "accelerator_admin" | "am_lead" | "chat_only";

export const ROLE_LABEL: Record<AdminRole, string> = {
  owner: "Owner",
  accelerator_admin: "Accelerator Admin",
  am_lead: "AM Lead",
  chat_only: "Chatroom",
};

export async function getAdminRole(): Promise<{ userId: string; role: AdminRole } | null> {
  const session = await getAdminSession();
  if (!session) return null;

  // Try the schema with admin_role first; if the column doesn't exist yet
  // (pre-migration), fall back to a legacy is_admin-only lookup and treat
  // any admin as owner.
  try {
    const rows = await db
      .select({ id: users.id, adminRole: users.adminRole, isAdmin: users.isAdmin })
      .from(users)
      .where(eq(users.id, session.userId))
      .limit(1);
    const row = rows[0];
    if (!row || !row.isAdmin) return null;
    const role = (row.adminRole as AdminRole | null) ?? "owner";
    return { userId: row.id, role };
  } catch (err) {
    console.warn("[getAdminRole] falling back to legacy is_admin (migration likely not run):", err instanceof Error ? err.message : err);
    try {
      const rows = await db
        .select({ id: users.id, isAdmin: users.isAdmin })
        .from(users)
        .where(eq(users.id, session.userId))
        .limit(1);
      const row = rows[0];
      if (!row || !row.isAdmin) return null;
      return { userId: row.id, role: "owner" };
    } catch {
      return null;
    }
  }
}

export async function requireAdminRole(allowed: AdminRole[]): Promise<{ userId: string; role: AdminRole }> {
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
