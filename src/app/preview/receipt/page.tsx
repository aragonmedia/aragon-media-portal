import Link from "next/link";
import "../../dashboard/dashboard.css";

export const dynamic = "force-static";

export const metadata = {
  title: "Receipt preview — Aragon Media",
};

function fmtCents(cents: number) {
  return (cents / 100).toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
  });
}

export default function ReceiptPreviewPage() {
  // Hardcoded sample so Kevin can see the receipt UI before the live flow
  // is unlocked. Real receipts live at /dashboard/withdrawals/receipt/[uuid].
  const sample = {
    receiptNumber: "AM-WDR-00001",
    grossCents: 134200, // $1,342.00
    feeCents: 26840,    //   $268.40
    netCents: 107360,   //   $1,073.60
    status: "requested" as const,
    tiktokHandle: "kevinaragon_main",
    payoutMethod: "ACH Bank Transfer (Same Day)",
    requestedAt: new Date(Date.now() - 1000 * 60 * 7), // 7 minutes ago
    paidAt: null as Date | null,
    notes: [
      "Bank/payout details:",
      "Kevin Aragon",
      "Chase ····6512  ·  Routing 021000021",
      "",
      "Creator notes:",
      "First withdrawal — let me know if anything is off!",
      "",
      "Screenshot pending upload — filename: tt-withdraw-2026-04-30.png",
    ].join("\n"),
  };

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

      <div className="dash-card preview-banner">
        <div className="preview-banner-pill">Preview · sample receipt</div>
        <div className="preview-banner-body">
          This is what every creator will see right after they submit a withdrawal
          form. Real receipts pull live data from your row in the withdrawals table.
          Numbers, account, and notes shown here are placeholders.
        </div>
      </div>

      <section className="dash-card rcpt-card">
        <div className="rcpt-head">
          <div>
            <div className="rcpt-num-eyebrow">Receipt number</div>
            <div className="rcpt-num">{sample.receiptNumber}</div>
          </div>
          <span className="rcpt-pill rcpt-pill-pending">Pending review</span>
        </div>

        <div className="rcpt-amount-row">
          <div className="rcpt-amount-block">
            <div className="rcpt-amt-label">Withdrawal amount</div>
            <div className="rcpt-amt-value">{fmtCents(sample.grossCents)}</div>
          </div>
          <div className="rcpt-amount-block">
            <div className="rcpt-amt-label">AM fee (20%)</div>
            <div className="rcpt-amt-value rcpt-amt-fee">
              − {fmtCents(sample.feeCents)}
            </div>
          </div>
          <div className="rcpt-amount-block">
            <div className="rcpt-amt-label">You receive</div>
            <div className="rcpt-amt-value rcpt-amt-net">{fmtCents(sample.netCents)}</div>
          </div>
        </div>

        <div className="rcpt-grid">
          <div className="rcpt-field">
            <div className="rcpt-field-label">TikTok account</div>
            <div className="rcpt-field-value">@{sample.tiktokHandle}</div>
          </div>
          <div className="rcpt-field">
            <div className="rcpt-field-label">Payout method</div>
            <div className="rcpt-field-value">{sample.payoutMethod}</div>
          </div>
          <div className="rcpt-field">
            <div className="rcpt-field-label">Submitted</div>
            <div className="rcpt-field-value">
              {sample.requestedAt.toLocaleString("en-US", {
                dateStyle: "medium",
                timeStyle: "short",
              })}
            </div>
          </div>
          <div className="rcpt-field">
            <div className="rcpt-field-label">Paid</div>
            <div className="rcpt-field-value">—</div>
          </div>
        </div>

        <div className="rcpt-notes">
          <div className="rcpt-field-label">Submitted with</div>
          <pre className="rcpt-notes-body">{sample.notes}</pre>
        </div>

        <div className="rcpt-callout">
          <strong>Keep this receipt number handy</strong> — reference{" "}
          <code>{sample.receiptNumber}</code> in chat with the AM team if you need to
          ask about this withdrawal. The receipt stays accessible from your
          withdrawals page indefinitely.
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
