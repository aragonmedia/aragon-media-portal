import Link from "next/link";
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

  const contractSigned = !!user.contractSignedAt;

  return (
    <main className="dash-content">
      <header className="dash-page-head">
        <div>
          <p className="dash-eyebrow">Withdrawals</p>
          <h1>Move money to your bank</h1>
          <p className="dash-page-sub">Aragon Media keeps a 20% operating fee. The rest is yours, paid Mon to Fri in USD.</p>
        </div>
      </header>

      {/* Withdrawal gateway: must talk to AM + sign contract before form opens */}
      <div className="dash-card">
        <div className="dash-card-head">
          <h2>Unlock the withdrawal form</h2>
          <span className={`mini-tag ${contractSigned ? "available" : "locked"}`}>{contractSigned ? "Contract signed" : "Locked"}</span>
        </div>
        <div className="withdraw-gate">
          <div className="withdraw-gate-step">
            <div className="withdraw-gate-num">1</div>
            <div>
              <div className="withdraw-gate-title">Open a chat with AM</div>
              <div className="withdraw-gate-sub">Let the team know you have commissions ready to withdraw. They&apos;ll send the contract.</div>
            </div>
            <Link href="/dashboard/chat" className="dash-cta">Open chat with AM →</Link>
          </div>
          <div className="withdraw-gate-step">
            <div className="withdraw-gate-num locked">2</div>
            <div>
              <div className="withdraw-gate-title">Earn your first commission sale</div>
              <div className="withdraw-gate-sub">Great — when your account is verified you can begin promoting on TikTok Shop. On your 1st sale, message the AM team here for the next step.</div>
            </div>
            <span className="mini-tag locked">Locked</span>
          </div>
          <div className="withdraw-gate-step">
            <div className={`withdraw-gate-num${contractSigned ? "" : " locked"}`}>3</div>
            <div>
              <div className="withdraw-gate-title">Submit the withdrawal form</div>
              <div className="withdraw-gate-sub">Upload your TikTok withdrawal screenshot, choose a payout method, and AM moves the money Mon to Fri.</div>
            </div>
            {contractSigned ? (
              <Link href="/dashboard/withdrawals/new" className="dash-cta">Submit a withdrawal →</Link>
            ) : (
              <span className="mini-tag locked">Locked</span>
            )}
          </div>
        </div>
      </div>

      <div className="dash-card" style={{ marginTop: 16 }}>
        <div className="dash-card-head">
          <h2>History</h2>
          <span className="dash-meta">Every payout request lives here for your records.</span>
        </div>
        {list.length === 0 ? (
          <div className="dash-empty"><div className="dash-empty-body">No withdrawals yet. Once your form is submitted it shows up here in real time.</div></div>
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
