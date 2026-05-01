import { db } from "@/db";
import { users, accounts, agreements, withdrawals } from "@/db/schema";
import { sql, desc } from "drizzle-orm";
import CreatorRowActions from "./CreatorRowActions";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function AdminCreatorsPage() {
  // One query per stat we need to surface inline. Joining/aggregating in
  // Postgres beats N+1 loops here even though the population is tiny.
  const list = await db
    .select({
      id: users.id,
      email: users.email,
      name: users.name,
      handle: users.handle,
      isAdmin: users.isAdmin,
      createdAt: users.createdAt,
      lastSigninAt: users.lastSigninAt,
      contractUnlocked: users.contractUnlocked,
      contractSignedAt: users.contractSignedAt,
      contractVersion: users.contractVersion,
      accountsCount: sql<number>`(select count(*)::int from ${accounts} a where a.user_id = ${users.id})`,
      agreementsCount: sql<number>`(select count(*)::int from ${agreements} g where g.user_id = ${users.id})`,
      withdrawalsCount: sql<number>`(select count(*)::int from ${withdrawals} w where w.user_id = ${users.id})`,
    })
    .from(users)
    .orderBy(desc(users.createdAt));

  return (
    <main className="admin-shell admin-shell-nested">
      <header className="admin-header">
        <div>
          <p className="admin-eyebrow">Aragon Media · Creators</p>
          <h1>All creators</h1>
          <p className="admin-page-sub">
            {list.length} creator{list.length === 1 ? "" : "s"} on the portal.
            Use the actions column to unlock agreements without leaving this
            page.
          </p>
        </div>
      </header>

      <section className="admin-section">
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Email</th>
                <th>Name</th>
                <th>Handle</th>
                <th>Accts</th>
                <th>Receipts</th>
                <th>Agreement</th>
                <th>Signed up</th>
                <th>Last sign-in</th>
                <th className="col-actions">Actions</th>
              </tr>
            </thead>
            <tbody>
              {list.length === 0 ? (
                <tr>
                  <td colSpan={9} className="admin-empty">
                    No creators yet.
                  </td>
                </tr>
              ) : (
                list.map((u) => (
                  <tr key={u.id}>
                    <td className="mono">
                      {u.email}
                      {u.isAdmin && (
                        <span className="role-pill role-admin">admin</span>
                      )}
                    </td>
                    <td>{u.name}</td>
                    <td className="mono dim">{u.handle ?? "—"}</td>
                    <td>{u.accountsCount}</td>
                    <td>{u.withdrawalsCount}</td>
                    <td>
                      {u.contractSignedAt ? (
                        <span className="status-pill status-paid">
                          Signed{u.contractVersion ? ` ${u.contractVersion}` : ""}
                        </span>
                      ) : u.contractUnlocked ? (
                        <span className="status-pill status-approved">
                          Unlocked
                        </span>
                      ) : (
                        <span className="status-pill status-locked">
                          Locked
                        </span>
                      )}
                    </td>
                    <td className="dim">{fmt(u.createdAt)}</td>
                    <td className="dim">{fmt(u.lastSigninAt)}</td>
                    <td className="col-actions">
                      <CreatorRowActions
                        userId={u.id}
                        email={u.email}
                        contractUnlocked={u.contractUnlocked}
                        contractSigned={!!u.contractSignedAt}
                      />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>
    </main>
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
