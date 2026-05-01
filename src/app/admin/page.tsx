/**
 * /admin — Operations console home (Overview).
 *
 * Layout (admin/layout.tsx) handles the auth gate + sidebar. This page
 * renders just the dashboard content for the Overview tab.
 */

import { db } from "@/db";
import { users, sessions, purchases, accounts, withdrawals, agreements } from "@/db/schema";
import { sql, desc, gte, isNull, and, gt } from "drizzle-orm";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function AdminOverviewPage() {
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

  const [{ totalWithdrawals }] = await db
    .select({ totalWithdrawals: sql<number>`count(*)::int` })
    .from(withdrawals);

  const [{ pendingWithdrawals }] = await db
    .select({ pendingWithdrawals: sql<number>`count(*)::int` })
    .from(withdrawals)
    .where(sql`${withdrawals.status} = 'requested'`);

  const [{ totalAgreements }] = await db
    .select({ totalAgreements: sql<number>`count(*)::int` })
    .from(agreements);

  const recent = await db
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
    .limit(20);

  return (
    <main className="admin-shell admin-shell-nested">
      <header className="admin-header">
        <div>
          <p className="admin-eyebrow">Aragon Media · Internal</p>
          <h1>Operations console</h1>
        </div>
      </header>

      <section className="admin-stats">
        <Stat label="Total creators" value={totalUsers.toLocaleString()} />
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
        <Stat
          label="Withdrawals total"
          value={totalWithdrawals.toLocaleString()}
        />
        <Stat
          label="Withdrawals pending"
          value={pendingWithdrawals.toLocaleString()}
          tone={pendingWithdrawals > 0 ? "gold" : undefined}
        />
        <Stat
          label="Signed agreements"
          value={totalAgreements.toLocaleString()}
        />
      </section>

      <section className="admin-section">
        <div className="admin-section-head">
          <h2>Recent signups</h2>
          <span className="admin-meta">
            Showing latest {recent.length} of {totalUsers}
          </span>
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
              {recent.length === 0 && (
                <tr>
                  <td colSpan={7} className="admin-empty">
                    No signups yet. The /signup wizard is wired and ready.
                  </td>
                </tr>
              )}
              {recent.map((u) => (
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
