/**
 * Admin role helpers — RBAC on top of the admin cookie session.
 *
 * Roles:
 *   owner              — Kevin. Everything. Cannot be revoked.
 *   accelerator_admin  — Roni. Accelerator Leads + Chatroom.
 *   am_lead            — future AM hire. Accelerator Leads only.
 *   chat_only          — future community mgr. Chatroom only.
 *
 * Every admin server component should call requireAdminRole([...])
 * near the top. The sidebar renders per-role. Both are needed —
 * hidden menus are decoration; middleware is truth.
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

/** Look up the signed-in admin's role. Returns null if no session or no role. */
export async function getAdminRole(): Promise<{ userId: string; role: AdminRole } | null> {
  const session = await getAdminSession();
  if (!session) return null;
  const rows = await db
    .select({ id: users.id, adminRole: users.adminRole, isAdmin: users.isAdmin })
    .from(users)
    .where(eq(users.id, session.userId))
    .limit(1);
  const row = rows[0];
  if (!row || !row.isAdmin) return null;
  const role = (row.adminRole as AdminRole | null) ?? "owner"; // legacy admins default to owner
  return { userId: row.id, role };
}

/** Redirect to /admin (login) if not signed in, or /admin (root) if wrong role. */
export async function requireAdminRole(allowed: AdminRole[]): Promise<{ userId: string; role: AdminRole }> {
  const cur = await getAdminRole();
  if (!cur) redirect("/admin");
  if (!allowed.includes(cur.role)) redirect("/admin/chatroom"); // safe default landing
  return cur;
}

/** Where each role should land after signing in — first surface they can see. */
export function defaultRouteFor(role: AdminRole): string {
  switch (role) {
    case "owner": return "/admin";
    case "accelerator_admin": return "/admin/accelerator-leads";
    case "am_lead": return "/admin/accelerator-leads";
    case "chat_only": return "/admin/chatroom";
  }
}
