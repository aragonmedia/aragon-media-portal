import Link from "next/link";
import { desc, eq } from "drizzle-orm";
import { getCurrentUser } from "@/lib/auth/session";
import { db } from "@/db";
import { accounts } from "@/db/schema";

export const dynamic = "force-dynamic";

export default async function AccountsPage() {
  const user = await getCurrentUser();
  if (!user) return null;
  const my = await db
    .select()
    .from(accounts)
    .where(eq(accounts.userId, user.id))
    .orderBy(desc(accounts.createdAt));

  return (
    <main className="dash-content">
      <header className="dash-page-head">
        <div>
          <p className="dash-eyebrow">Accounts</p>
          <h1>Your TikTok accounts</h1>
          <p className="dash-page-sub">Each cycle holds up to 4 accounts. Once you hit 4, the cycle resets and pricing starts back at $100.</p>
        </div>
        <Link href="/dashboard/add-account" className="dash-cta">Activate next account</Link>
      </header>

      {my.length === 0 ? (
        <div className="dash-card dash-card-block">
          <div className="dash-empty-large">
            <div className="dash-empty-title">No accounts in your cycle yet</div>
            <div className="dash-empty-body">Pick a tier from the home page to activate your first account. The AM team takes it from there inside 24 hours.</div>
            <Link href="/dashboard/add-account" className="dash-cta">See pricing</Link>
          </div>
        </div>
      ) : (
        <div className="dash-card">
          <table className="dash-table">
            <thead>
              <tr><th>Handle</th><th>Cycle</th><th>Position</th><th>Status</th><th>Activated</th></tr>
            </thead>
            <tbody>
              {my.map((a) => (
                <tr key={a.id}>
                  <td className="mono">{a.tiktokHandle || "Pending"}</td>
                  <td>{a.cycleNumber}</td>
                  <td>{a.cyclePosition}</td>
                  <td><span className={`account-pill account-${a.status}`}>{a.status.replace("_", " ")}</span></td>
                  <td className="dim">{a.activatedAt ? new Date(a.activatedAt).toLocaleDateString() : "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </main>
  );
}
