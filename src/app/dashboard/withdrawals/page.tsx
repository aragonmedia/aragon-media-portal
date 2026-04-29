import { desc, eq } from "drizzle-orm";
import { getCurrentUser } from "@/lib/auth/session";
import { db } from "@/db";
import { withdrawals } from "@/db/schema";

export const dynamic = "force-dynamic";

function fmtUsd(cents: number): string {
  return `$${(cents / 100).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export default async function WithdrawalsPage() {
  const user = await getCurrentUser();
  if (!user) return null;
  const list = await db
    .select()
    .from(withdrawals)
    .where(eq(withdrawals.userId, user.id))
    .orderBy(desc(withdrawals.requestedAt));

  return (
    <main className="dash-content">
      <header className="dash-page-head">
        <div>
          <p className="dash-eyebrow">Withdrawals</p>
          <h1>Move money to your bank</h1>
          <p className="dash-page-sub">Aragon Media keeps a 20% operating fee. The rest is yours, paid Mon to Fri in USD.</p>
        </div>
      </header>

      <div className="dash-card">
        <div className="dash-card-head">
          <h2>Request a withdrawal</h2>
          <span className="dash-meta">Available USD goes here once your first commission lands.</span>
        </div>
        <div className="dash-empty">
          <div className="dash-empty-body">The withdrawal request form opens once your first activated account has earnings to draw against. Until then this page just shows your history.</div>
        </div>
      </div>

      <div className="dash-card" style={{ marginTop: 16 }}>
        <div className="dash-card-head">
          <h2>History</h2>
        </div>
        {list.length === 0 ? (
          <div className="dash-empty"><div className="dash-empty-body">No withdrawals yet.</div></div>
        ) : (
          <table className="dash-table">
            <thead>
              <tr><th>Requested</th><th>Gross</th><th>AM fee</th><th>Net to you</th><th>Status</th><th>Paid</th></tr>
            </thead>
            <tbody>
              {list.map((w) => (
                <tr key={w.id}>
                  <td className="dim">{new Date(w.requestedAt).toLocaleString()}</td>
                  <td>{fmtUsd(w.grossCents)}</td>
                  <td className="dim">{fmtUsd(w.feeCents)}</td>
                  <td className="ok">{fmtUsd(w.netCents)}</td>
                  <td><span className={`status-pill status-${w.status}`}>{w.status}</span></td>
                  <td className="dim">{w.paidAt ? new Date(w.paidAt).toLocaleDateString() : "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </main>
  );
}
