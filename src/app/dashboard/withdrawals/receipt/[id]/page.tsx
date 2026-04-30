import { and, eq } from "drizzle-orm";
import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "@/db";
import { accounts, withdrawals } from "@/db/schema";
import { getCurrentUser } from "@/lib/auth/session";

export const dynamic = "force-dynamic";

function fmtCents(cents: number) {
  return (cents / 100).toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
  });
}

function statusPill(status: string) {
  if (status === "paid") return { label: "Paid", className: "rcpt-pill-paid" };
  if (status === "late_retained")
    return { label: "Late · retained", className: "rcpt-pill-late" };
  if (status === "approved")
    return { label: "Approved", className: "rcpt-pill-approved" };
  if (status === "rejected")
    return { label: "Rejected", className: "rcpt-pill-rejected" };
  return { label: "Pending review", className: "rcpt-pill-pending" };
}

export default async function ReceiptPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await getCurrentUser();
  if (!user) return null;
  const { id } = await params;

  const rows = await db
    .select({
      id: withdrawals.id,
      receiptNumber: withdrawals.receiptNumber,
      grossCents: withdrawals.grossCents,
      feeCents: withdrawals.feeCents,
      netCents: withdrawals.netCents,
      status: withdrawals.status,
      withdrawalDate: withdrawals.withdrawalDate,
      sourceAccount: withdrawals.sourceAccount,
      payoutMethod: withdrawals.payoutMethod,
      notes: withdrawals.notes,
      requestedAt: withdrawals.requestedAt,
      paidAt: withdrawals.paidAt,
      accountId: withdrawals.accountId,
      tiktokHandle: accounts.tiktokHandle,
    })
    .from(withdrawals)
    .leftJoin(accounts, eq(accounts.id, withdrawals.accountId))
    .where(and(eq(withdrawals.id, id), eq(withdrawals.userId, user.id)))
    .limit(1);

  const r = rows[0];
  if (!r) notFound();

  const pill = statusPill(r.status);

  return (
    <main className="dash-content">
      <header className="dash-page-head">
        <div>
          <p className="dash-eyebrow">Withdrawals · Receipt</p>
          <h1>Submitted</h1>
          <p className="dash-page-sub">
            Your withdrawal request is recorded. AM processes payouts Monday through
            Friday — you&apos;ll be notified the moment yours is paid.
          </p>
        </div>
        <Link href="/dashboard/withdrawals" className="dash-cta ghost">
          ← Back to withdrawals
        </Link>
      </header>

      <section className="dash-card rcpt-card">
        <div className="rcpt-head">
          <div>
            <div className="rcpt-num-eyebrow">Receipt number</div>
            <div className="rcpt-num">{r.receiptNumber}</div>
          </div>
          <span className={`rcpt-pill ${pill.className}`}>{pill.label}</span>
        </div>

        <div className="rcpt-amount-row">
          <div className="rcpt-amount-block">
            <div className="rcpt-amt-label">Withdrawal amount</div>
            <div className="rcpt-amt-value">{fmtCents(r.grossCents)}</div>
          </div>
          <div className="rcpt-amount-block">
            <div className="rcpt-amt-label">AM fee (20%)</div>
            <div className="rcpt-amt-value rcpt-amt-fee">
              − {fmtCents(r.feeCents)}
            </div>
          </div>
          <div className="rcpt-amount-block">
            <div className="rcpt-amt-label">You receive</div>
            <div className="rcpt-amt-value rcpt-amt-net">{fmtCents(r.netCents)}</div>
          </div>
        </div>

        <div className="rcpt-grid">
          {r.withdrawalDate && (
            <div className="rcpt-field">
              <div className="rcpt-field-label">Withdrawn from TikTok on</div>
              <div className="rcpt-field-value">{r.withdrawalDate}</div>
            </div>
          )}
          {r.sourceAccount && (
            <div className="rcpt-field">
              <div className="rcpt-field-label">Source account (Aragon)</div>
              <div className="rcpt-field-value">{r.sourceAccount}</div>
            </div>
          )}
          <div className="rcpt-field">
            <div className="rcpt-field-label">TikTok account</div>
            <div className="rcpt-field-value">
              {r.tiktokHandle ? `@${r.tiktokHandle}` : "—"}
            </div>
          </div>
          <div className="rcpt-field">
            <div className="rcpt-field-label">Payout method</div>
            <div className="rcpt-field-value">{r.payoutMethod ?? "—"}</div>
          </div>
          <div className="rcpt-field">
            <div className="rcpt-field-label">Submitted</div>
            <div className="rcpt-field-value">
              {new Date(r.requestedAt).toLocaleString("en-US", {
                dateStyle: "medium",
                timeStyle: "short",
              })}
            </div>
          </div>
          <div className="rcpt-field">
            <div className="rcpt-field-label">Paid</div>
            <div className="rcpt-field-value">
              {r.paidAt
                ? new Date(r.paidAt).toLocaleString("en-US", {
                    dateStyle: "medium",
                    timeStyle: "short",
                  })
                : "—"}
            </div>
          </div>
        </div>

        {r.notes && (
          <div className="rcpt-notes">
            <div className="rcpt-field-label">Submitted with</div>
            <pre className="rcpt-notes-body">{r.notes}</pre>
          </div>
        )}

        <div className="rcpt-callout">
          <strong>Keep this receipt number handy</strong> — reference{" "}
          <code>{r.receiptNumber}</code> in chat with the AM team if you need to ask
          about this withdrawal. The receipt stays accessible from your withdrawals
          page indefinitely.
        </div>

        <div className="rcpt-actions">
          <Link href="/dashboard/withdrawals/new" className="dash-cta">
            Submit another →
          </Link>
          <Link href="/dashboard/chat" className="dash-cta ghost">
            Notify AM in chat
          </Link>
        </div>
      </section>
    </main>
  );
}
