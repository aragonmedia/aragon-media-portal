import Link from "next/link";

export const dynamic = "force-static";

export const metadata = {
  title: "Withdrawals history preview — Aragon Media",
};

function fmtUsd(cents: number): string {
  return `$${(cents / 100).toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

const SAMPLE = [
  {
    id: "preview",
    receiptNumber: "AM-WDR-00006",
    netCents: 187200,
    grossCents: 234000,
    status: "requested",
    requestedAt: new Date("2026-04-30T09:14:00Z"),
    paidAt: null as Date | null,
  },
  {
    id: "preview",
    receiptNumber: "AM-WDR-00005",
    netCents: 96000,
    grossCents: 120000,
    status: "paid",
    requestedAt: new Date("2026-04-22T18:02:00Z"),
    paidAt: new Date("2026-04-23T15:11:00Z"),
  },
  {
    id: "preview",
    receiptNumber: "AM-WDR-00004",
    netCents: 64480,
    grossCents: 80600,
    status: "paid",
    requestedAt: new Date("2026-04-15T11:48:00Z"),
    paidAt: new Date("2026-04-16T10:22:00Z"),
  },
  {
    id: "preview",
    receiptNumber: "AM-WDR-00003",
    netCents: 35200,
    grossCents: 44000,
    status: "late_retained",
    requestedAt: new Date("2026-04-08T22:30:00Z"),
    paidAt: null,
  },
  {
    id: "preview",
    receiptNumber: "AM-WDR-00002",
    netCents: 124800,
    grossCents: 156000,
    status: "paid",
    requestedAt: new Date("2026-03-31T16:20:00Z"),
    paidAt: new Date("2026-04-01T13:05:00Z"),
  },
  {
    id: "preview",
    receiptNumber: "AM-WDR-00001",
    netCents: 56800,
    grossCents: 71000,
    status: "paid",
    requestedAt: new Date("2026-03-22T08:55:00Z"),
    paidAt: new Date("2026-03-23T14:40:00Z"),
  },
];

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

export default function PreviewWithdrawalsHistory() {
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

      <div className="dash-card preview-banner">
        <div className="preview-banner-pill">Preview · sample receipts</div>
        <div className="preview-banner-body">
          This is what the Withdrawals tab looks like once a creator has built
          up some history. Each card is clickable and opens the full receipt
          page. Real receipts pull live from the withdrawals table.
        </div>
      </div>

      <div className="dash-card">
        <div className="dash-card-head">
          <h2>Your receipts</h2>
          <span className="dash-meta">
            {SAMPLE.length} submissions · most recent first
          </span>
        </div>
        <div className="wdr-history">
          {SAMPLE.map((w, i) => {
            const pill = statusPill(w.status);
            return (
              <Link
                key={w.receiptNumber}
                href={i === 0 ? "/preview/receipt" : "#"}
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
                    {w.requestedAt.toLocaleString("en-US", {
                      dateStyle: "medium",
                      timeStyle: "short",
                    })}
                  </span>
                  {w.paidAt && (
                    <span>
                      Paid{" "}
                      {w.paidAt.toLocaleDateString("en-US", {
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
      </div>
    </main>
  );
}
