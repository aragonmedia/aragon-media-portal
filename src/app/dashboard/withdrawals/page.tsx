import Link from "next/link";
import { desc, eq } from "drizzle-orm";
import { getCurrentUser } from "@/lib/auth/session";
import { db } from "@/db";
import { withdrawals } from "@/db/schema";

export const dynamic = "force-dynamic";

function fmtUsd(cents: number): string {
  return `$${(cents / 100).toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

function statusPill(status: string) {
  if (status === "paid") return { label: "Paid", className: "rcpt-pill-paid" };
  if (status === "late_retained")
    return { label: "Late · retained", className: "rcpt-pill-late" };
  if (status === "approved")
    return { label: "Approved", className: "rcpt-pill-approved" };
  if (status === "calculated")
    return { label: "Calculated", className: "rcpt-pill-calculated" };
  if (status === "rejected")
    return { label: "Rejected", className: "rcpt-pill-rejected" };
  return { label: "Pending review", className: "rcpt-pill-pending" };
}

export default async function WithdrawalsPage() {
  const user = await getCurrentUser();
  if (!user) return null;
  const list = await db
    .select()
    .from(withdrawals)
    .where(eq(withdrawals.userId, user.id))
    .orderBy(desc(withdrawals.requestedAt));

  const contractSigned = !!user.contractSignedAt || !!user.isExistingCreator;

  return (
    <main className="dash-content">
      <header className="dash-page-head">
        <div>
          <p className="dash-eyebrow">Withdrawals</p>
          <h1>Move money to your bank</h1>
          <p className="dash-page-sub">
            Submit every time you have earnings ready · AM processes payouts
            Monday through Friday in USD.
          </p>
        </div>
      </header>

      {/* Gateway: must talk to AM + sign contract before form opens */}
      <div className="dash-card">
        <div className="dash-card-head">
          <h2>Unlock the withdrawal form</h2>
          <span className={`mini-tag ${contractSigned ? "available" : "locked"}`}>
            {contractSigned ? "Contract signed" : "Locked"}
          </span>
        </div>
        <div className="withdraw-gate">
          {/* Step 1 — Once contract is signed, this is implicitly done. */}
          <div className="withdraw-gate-step">
            <div
              className={`withdraw-gate-num${contractSigned ? " done" : ""}`}
            >
              {contractSigned ? "✓" : "1"}
            </div>
            <div>
              <div className="withdraw-gate-title">Open a chat with AM</div>
              <div className="withdraw-gate-sub">
                Let the team know you have commissions ready to withdraw.
                They&apos;ll send the contract.
              </div>
            </div>
            {contractSigned ? (
              <span className="mini-tag available">Done</span>
            ) : (
              <Link href="/dashboard/chat" className="dash-cta">
                Open chat with AM &rarr;
              </Link>
            )}
          </div>

          {/* Step 2 — Once contract is signed, also marked done. */}
          <div className="withdraw-gate-step">
            <div
              className={`withdraw-gate-num${
                contractSigned ? " done" : " locked"
              }`}
            >
              {contractSigned ? "✓" : "2"}
            </div>
            <div>
              <div className="withdraw-gate-title">
                Earn your first commission sale
              </div>
              <div className="withdraw-gate-sub">
                Great &mdash; when your account is verified you can begin
                promoting on TikTok Shop. On your 1st sale, message the AM
                team here for the next step.
              </div>
            </div>
            <span
              className={`mini-tag ${contractSigned ? "available" : "locked"}`}
            >
              {contractSigned ? "Done" : "Locked"}
            </span>
          </div>

          {/* Step 3 — The only step with an active CTA once unlocked. */}
          <div className="withdraw-gate-step">
            <div
              className={`withdraw-gate-num${contractSigned ? "" : " locked"}`}
            >
              3
            </div>
            <div>
              <div className="withdraw-gate-title">Submit the withdrawal form</div>
              <div className="withdraw-gate-sub">
                Upload your TikTok withdrawal screenshot, choose a payout method,
                and AM moves the money Mon to Fri.
              </div>
            </div>
            {contractSigned ? (
              <Link href="/dashboard/withdrawals/new" className="dash-cta">
                Submit a withdrawal &rarr;
              </Link>
            ) : (
              <span className="mini-tag locked">Locked</span>
            )}
          </div>
        </div>
      </div>

      <div className="dash-card" style={{ marginTop: 16 }}>
        <div className="dash-card-head">
          <h2>Your receipts</h2>
          <span className="dash-meta">
            {list.length === 0
              ? "Every payout request lives here for your records."
              : `${list.length} submission${list.length === 1 ? "" : "s"} · most recent first`}
          </span>
        </div>

        {list.length === 0 ? (
          <div className="wdr-history-empty">
            No withdrawals yet. Once you submit the form, every receipt shows up
            here as a card you can click into.
          </div>
        ) : (
          <div className="wdr-history">
            {list.map((w) => {
              const pill = statusPill(w.status);
              return (
                <Link
                  key={w.id}
                  href={`/dashboard/withdrawals/receipt/${w.id}`}
                  className="wdr-card"
                >
                  <div className="wdr-card-top">
                    <span className="wdr-card-rcpt">{w.receiptNumber}</span>
                    <span className={`rcpt-pill ${pill.className}`}>
                      {pill.label}
                    </span>
                  </div>
                  <div className="wdr-card-amounts">
                    <span className="wdr-card-net">{fmtUsd(w.netCents)}</span>
                    <span className="wdr-card-net-label">to you</span>
                    <span className="wdr-card-arrow">→</span>
                  </div>
                  <div className="wdr-card-meta">
                    <span>
                      Submitted from <strong>{fmtUsd(w.grossCents)}</strong>
                    </span>
                    <span>
                      {new Date(w.requestedAt).toLocaleString("en-US", {
                        dateStyle: "medium",
                        timeStyle: "short",
                      })}
                    </span>
                    {w.paidAt && (
                      <span>
                        Paid{" "}
                        {new Date(w.paidAt).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                        })}
                      </span>
                    )}
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}
