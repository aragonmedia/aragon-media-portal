import { desc, eq } from "drizzle-orm";
import { requireAdminRole, ROLE_LABEL, type AdminRole } from "@/lib/auth/admin-role";
import { db } from "@/db";
import { adminInvites, users } from "@/db/schema";
import TeamClient from "./TeamClient";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export default async function TeamPage() {
  await requireAdminRole(["owner"]);

  let members: Array<{ id: string; email: string; name: string; adminRole: string | null; scopedAccelerator: string | null; createdAt: Date; lastSigninAt: Date | null }> = [];
  try {
    members = await db
      .select({ id: users.id, email: users.email, name: users.name, adminRole: users.adminRole, scopedAccelerator: users.scopedAccelerator, createdAt: users.createdAt, lastSigninAt: users.lastSigninAt })
      .from(users)
      .where(eq(users.isAdmin, true))
      .orderBy(desc(users.createdAt));
  } catch {
    const legacy = await db
      .select({ id: users.id, email: users.email, name: users.name, createdAt: users.createdAt, lastSigninAt: users.lastSigninAt })
      .from(users)
      .where(eq(users.isAdmin, true))
      .orderBy(desc(users.createdAt));
    members = legacy.map((r) => ({ ...r, adminRole: null, scopedAccelerator: null }));
  }

  let pending: Array<{ id: string; email: string; role: string; scopedAccelerator: string | null; createdAt: Date; expiresAt: Date }> = [];
  try {
    pending = await db
      .select({ id: adminInvites.id, email: adminInvites.email, role: adminInvites.role, scopedAccelerator: adminInvites.scopedAccelerator, createdAt: adminInvites.createdAt, expiresAt: adminInvites.expiresAt })
      .from(adminInvites)
      .where(eq(adminInvites.status, "pending"))
      .orderBy(desc(adminInvites.createdAt));
  } catch (err) {
    console.warn("[team page] pending invites unavailable:", err instanceof Error ? err.message : err);
  }

  return (
    <TeamClient
      members={members.map((m) => ({
        id: m.id,
        email: m.email,
        name: m.name,
        role: ((m.adminRole as AdminRole | null) ?? "owner"),
        roleLabel: ROLE_LABEL[((m.adminRole as AdminRole | null) ?? "owner")],
        scope: (m.scopedAccelerator as "roni" | "colt" | null) ?? null,
        joinedAt: m.createdAt.toISOString(),
        lastSigninAt: m.lastSigninAt?.toISOString() ?? null,
      }))}
      pending={pending.map((p) => ({
        id: p.id,
        email: p.email,
        role: p.role as AdminRole,
        roleLabel: ROLE_LABEL[p.role as AdminRole],
        scope: (p.scopedAccelerator as "roni" | "colt" | null) ?? null,
        createdAt: p.createdAt.toISOString(),
        expiresAt: p.expiresAt.toISOString(),
      }))}
    />
  );
}
