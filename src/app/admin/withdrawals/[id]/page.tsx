import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "@/db";
import { withdrawals, users, accounts } from "@/db/schema";
import { eq } from "drizzle-orm";
import WithdrawalEditPanel from "./WithdrawalEditPanel";

export const dynamic = "force-dynamic";

function fmt(d: Date | string | null | undefined): string {
  if (!d) return "—";
  const date = typeof d === "string" ? new Date(d) : d;
  return date.toLocaleString("en-US", {
    dateStyle: "long",
    timeStyle: "short",
  });
}

export default async function AdminWithdrawalDetail({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const rows = await db
    .select({
      id: withdrawals.id,
      receiptNumber: withdrawals.receiptNumber,
      grossCents: withdrawals.grossCents,
      feeCents: withdrawals.feeCents,
      netCents: withdrawals.netCents,
      status: withdrawals.status,
      payoutMethod: withdrawals.payoutMethod,
      payoutRef: withdrawals.payoutRef,
      notes: withdrawals.notes,
      proofUrl: withdrawals.proofUrl,
      requestedAt: withdrawals.requestedAt,
      approvedAt: withdrawals.approvedAt,
      paidAt: withdrawals.paidAt,
      userId: withdrawals.userId,
      creatorEmail: users.email,
      creatorName: users.name,
      tiktokHandle: accounts.tiktokHandle,
    })
    .from(withdrawals)
    .leftJoin(users, eq(users.id, withdrawals.userId))
    .leftJoin(accounts, eq(accounts.id, withdrawals.accountId))
    .where(eq(withdrawals.id, id))
    .limit(1);

  const w = rows[0];
  if (!w) notFound();

  return (
    <main className="admin-shell admin-shell-nested">
      <header className="admin-header">
        <div>
          <p className="admin-eyebrow">Aragon Media · Withdrawal · {w.receiptNumber}</p>
          <h1>{w.creatorName}&apos;s receipt</h1>
          <p className="admin-page-sub">
            Edit gross / fee / net manually if the creator&apos;s submission needs
            correcting. Status changes notify the creator via email.
          </p>
        </div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <Link
            href={`/admin/withdrawals?creator=${w.userId}`}
            className="admin-row-btn"
          >
            ← All this creator&apos;s receipts
          </Link>
          <Link href="/admin/withdrawals" className="admin-row-btn">
            ← All receipts
          </Link>
        </div>
      </header>

      <section className="admin-section">
        <div className="admin-record-grid">
          <div className="admin-record-field">
            <div className="admin-record-label">Receipt #</div>
            <div className="admin-record-value mono gold">
              {w.receiptNumber}
            </div>
          </div>
          <div className="admin-record-field">
            <div className="admin-record-label">Creator</div>
            <div className="admin-record-value">
              {w.creatorName}
              <div className="dim small">{w.creatorEmail}</div>
            </div>
          </div>
          <div className="admin-record-field">
            <div className="admin-record-label">TikTok account</div>
            <div className="admin-record-value mono">
              {w.tiktokHandle ? `@${w.tiktokHandle}` : "—"}
            </div>
          </div>
          <div className="admin-record-field">
            <div className="admin-record-label">Submitted</div>
            <div className="admin-record-value">{fmt(w.requestedAt)}</div>
          </div>
          <div className="admin-record-field">
            <div className="admin-record-label">Approved</div>
            <div className="admin-record-value">{fmt(w.approvedAt)}</div>
          </div>
          <div className="admin-record-field">
            <div className="admin-record-label">Paid</div>
            <div className="admin-record-value">{fmt(w.paidAt)}</div>
          </div>
          <div className="admin-record-field">
            <div className="admin-record-label">Payout method</div>
            <div className="admin-record-value">{w.payoutMethod ?? "—"}</div>
          </div>
          <div className="admin-record-field">
            <div className="admin-record-label">Payout ref</div>
            <div className="admin-record-value mono">{w.payoutRef ?? "—"}</div>
          </div>
          <div className="admin-record-field">
            <div className="admin-record-label">Withdrawal ID</div>
            <div className="admin-record-value mono dim">{w.id}</div>
          </div>
        </div>
      </section>

      {/* Editable amounts + status */}
      <section className="admin-section">
        <div className="admin-section-head">
          <h2>Adjust amounts &amp; status</h2>
          <span className="admin-meta">
            Save updates the row instantly. Status flip emails the creator.
          </span>
        </div>
        <WithdrawalEditPanel
          id={w.id}
          initial={{
            grossCents: w.grossCents,
            feeCents: w.feeCents,
            netCents: w.netCents,
            status: w.status,
          }}
        />
      </section>

      {/* Original creator submission notes */}
      <section className="admin-section">
        <div className="admin-section-head">
          <h2>Creator&apos;s submission</h2>
          <span className="admin-meta">
            Bank details, screenshot reference, and any notes the creator
            included on submit.
          </span>
        </div>
        <div className="admin-record-doc">
          <pre className="admin-notes-pre">{w.notes ?? "(no notes)"}</pre>
          {w.proofUrl && (
            <p className="admin-meta" style={{ marginTop: 12 }}>
              Screenshot reference: <code>{w.proofUrl}</code>
            </p>
          )}
        </div>
      </section>
    </main>
  );
}
