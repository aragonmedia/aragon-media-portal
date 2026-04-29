/**
 * /admin — Aragon Media internal team console.
 *
 * Server component. Reads am_admin cookie:
 *   - missing/invalid → render the password gate (client component)
 *   - valid           → query Neon for stats + user table and render the dash
 *
 * One env var required: ADMIN_PASSWORD. Rotating it logs everyone out.
 */

import { db } from "@/db";
import { users, sessions, purchases, accounts } from "@/db/schema";
import { isAdminSession } from "@/lib/auth/admin";
import { sql, desc, gte, isNull, and, gt } from "drizzle-orm";
import AdminLogin from "./AdminLogin";
import AdminLogout from "./AdminLogout";
import "./admin.css";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function AdminPage() {
  const authed = await isAdminSession();
  if (!authed) {
    return (
      <main className="admin-shell">
        <AdminLogin />
      </main>
    );
  }

  // ----- queries -----
  const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

  const [{ totalUsers }] = await db
    .select({ totalUsers: sql<number>`count(*)::int` })
    .from(users);

  const [{ usersThisWeek }] = await db
    .select({ usersThisWeek: sql<number>`count(*)::int` })
    .from(users)
    .where(gte(users.createdAt, oneWeekAgo));

  const [{ activeSessions }] = await db
    .select({ activeSessions: sql<number>`count(*)::int` })
    .from(sessions)
    .where(and(isNull(sessions.revokedAt), gt(sessions.expiresAt, new Date())));

  const [{ revenueCents }] = await db
    .select({
      revenueCents: sql<number>`coalesce(sum(${purchases.amountCents}), 0)::int`,
    })
    .from(purchases)
    .where(sql`${purchases.status} = 'paid'`);

  const [{ pendingAccounts }] = await db
    .select({ pendingAccounts: sql<number>`count(*)::int` })
    .from(accounts)
    .where(sql`${accounts.status} NOT IN ('active', 'verified', 'cancelled')`);

  const userList = await db
    .select({
      id: users.id,
      email: users.email,
      name: users.name,
      role: users.role,
      handle: users.handle,
      createdAt: users.createdAt,
      verifiedAt: users.verifiedAt,
      lastSigninAt: users.lastSigninAt,
    })
    .from(users)
    .orderBy(desc(users.createdAt))
    .limit(100);

  return (
    <main className="admin-shell">
      <header className="admin-header">
        <div>
          <p className="admin-eyebrow">Aragon Media · Internal</p>
          <h1>Operations console</h1>
        </div>
        <AdminLogout />
      </header>

      <section className="admin-stats">
        <Stat label="Total users" value={totalUsers.toLocaleString()} />
        <Stat label="New (7d)" value={usersThisWeek.toLocaleString()} />
        <Stat label="Active sessions" value={activeSessions.toLocaleString()} />
        <Stat
          label="Revenue (paid)"
          value={`$${(revenueCents / 100).toLocaleString(undefined, {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })}`}
          tone="green"
        />
        <Stat
          label="Pending accounts"
          value={pendingAccounts.toLocaleString()}
          tone={pendingAccounts > 0 ? "gold" : undefined}
        />
      </section>

      <section className="admin-section">
        <div className="admin-section-head">
          <h2>Recent signups</h2>
          <span className="admin-meta">Showing latest {userList.length} of {totalUsers}</span>
        </div>
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Email</th>
                <th>Name</th>
                <th>Role</th>
                <th>Handle</th>
                <th>Signed up</th>
                <th>Verified</th>
                <th>Last sign-in</th>
              </tr>
            </thead>
            <tbody>
              {userList.length === 0 && (
                <tr>
                  <td colSpan={7} className="admin-empty">
                    No signups yet. The /signup wizard is wired and ready.
                  </td>
                </tr>
              )}
              {userList.map((u) => (
                <tr key={u.id}>
                  <td className="mono">{u.email}</td>
                  <td>{u.name}</td>
                  <td>
                    <span className={`role-pill role-${u.role}`}>{u.role}</span>
                  </td>
                  <td className="mono dim">{u.handle ?? "—"}</td>
                  <td className="dim">{fmt(u.createdAt)}</td>
                  <td className="dim">{fmt(u.verifiedAt)}</td>
                  <td className="dim">{fmt(u.lastSigninAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <footer className="admin-footer">
        Aragon Media · Operations console · Data live from Neon · Refresh to update
      </footer>
    </main>
  );
}

function Stat({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone?: "green" | "gold";
}) {
  return (
    <div className={`admin-stat${tone ? ` tone-${tone}` : ""}`}>
      <div className="admin-stat-label">{label}</div>
      <div className="admin-stat-value">{value}</div>
    </div>
  );
}

function fmt(d: Date | string | null | undefined): string {
  if (!d) return "—";
  const date = typeof d === "string" ? new Date(d) : d;
  return date.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}
