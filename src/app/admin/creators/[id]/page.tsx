import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "@/db";
import {
  users,
  accounts,
  withdrawals,
  agreements,
  chats,
} from "@/db/schema";
import { and, desc, eq, sql } from "drizzle-orm";
import AccountStatusFlip from "./AccountStatusFlip";
import ExistingCreatorToggle from "./ExistingCreatorToggle";
import DeleteCreatorButton from "./DeleteCreatorButton";
import AdminAddAccount from "./AdminAddAccount";

export const dynamic = "force-dynamic";
export const revalidate = 0;

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
function fmtUsd(cents: number): string {
  return `$${(cents / 100).toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

const ACCT_LABELS: Record<string, string> = {
  pending: "Pending",
  credentials_received: "Creds received",
  two_factor_pending: "2FA pending",
  verified: "Verified",
  active: "Active",
  suspended: "Suspended",
  cancelled: "Cancelled",
};

export default async function AdminCreatorDetail({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const u = (
    await db
      .select({
        id: users.id,
        email: users.email,
        name: users.name,
        handle: users.handle,
        role: users.role,
        isAdmin: users.isAdmin,
        contractUnlocked: users.contractUnlocked,
        contractSignedAt: users.contractSignedAt,
        contractVersion: users.contractVersion,
        isExistingCreator: users.isExistingCreator,
        existingCreatorMarkedAt: users.existingCreatorMarkedAt,
        createdAt: users.createdAt,
        verifiedAt: users.verifiedAt,
        lastSigninAt: users.lastSigninAt,
      })
      .from(users)
      .where(eq(users.id, id))
      .limit(1)
  )[0];
  if (!u) notFound();

  const accts = await db
    .select()
    .from(accounts)
    .where(eq(accounts.userId, u.id))
    .orderBy(desc(accounts.createdAt));

  const recentWithdrawals = await db
    .select({
      id: withdrawals.id,
      receiptNumber: withdrawals.receiptNumber,
      grossCents: withdrawals.grossCents,
      netCents: withdrawals.netCents,
      status: withdrawals.status,
      requestedAt: withdrawals.requestedAt,
      paidAt: withdrawals.paidAt,
    })
    .from(withdrawals)
    .where(eq(withdrawals.userId, u.id))
    .orderBy(desc(withdrawals.requestedAt))
    .limit(10);

  const [{ totalReceipts, totalPaidNet, totalCommissions }] = await db
    .select({
      totalReceipts: sql<number>`count(*)::int`,
      totalPaidNet: sql<number>`coalesce(sum(case when status='paid' then net_cents else 0 end), 0)::int`,
      totalCommissions: sql<number>`coalesce(sum(case when status='paid' then fee_cents else 0 end), 0)::int`,
    })
    .from(withdrawals)
    .where(eq(withdrawals.userId, u.id));

  const latestAgreement = (
    await db
      .select()
      .from(agreements)
      .where(eq(agreements.userId, u.id))
      .orderBy(desc(agreements.signedAt))
      .limit(1)
  )[0];

  const chatRow = (
    await db
      .select({ id: chats.id })
      .from(chats)
      .where(and(eq(chats.userId, u.id), eq(chats.status, "open")))
      .limit(1)
  )[0];

  return (
    <main className="admin-shell admin-shell-nested">
      <header className="admin-header">
        <div>
          <p className="admin-eyebrow">Aragon Media · Creator</p>
          <h1>
            {u.name}
            {u.isAdmin && (
              <span
                className="role-pill role-admin"
                style={{ marginLeft: 12, verticalAlign: "middle" }}
              >
                admin
              </span>
            )}
          </h1>
          <p className="admin-page-sub">
            {u.email} · joined {fmt(u.createdAt)} · last sign-in{" "}
            {fmt(u.lastSigninAt)}
          </p>
        </div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "flex-start" }}>
          <ExistingCreatorToggle
            userId={u.id}
            initialValue={u.isExistingCreator}
            creatorName={u.name}
          />
          {chatRow && (
            <Link href={`/admin/chats/${chatRow.id}`} className="admin-row-btn">
              Open chat →
            </Link>
          )}
          <Link
            href={`/admin/withdrawals?creator=${u.id}`}
            className="admin-row-btn"
          >
            All receipts →
          </Link>
          <Link href="/admin/creators" className="admin-row-btn">
            ← All creators
          </Link>
          <DeleteCreatorButton
            userId={u.id}
            creatorName={u.name}
            creatorEmail={u.email}
            isAdmin={u.isAdmin}
          />
        </div>
      </header>

      {u.isExistingCreator && (
        <div className="exist-banner">
          <span className="exist-banner-pip">EXISTING</span>
          <span>
            Grandfathered creator · activation gates bypassed · marked{" "}
            {u.existingCreatorMarkedAt ? fmt(u.existingCreatorMarkedAt) : ""}
          </span>
        </div>
      )}

      {/* Summary stats */}
      <section className="admin-section">
        <div className="admin-stats">
          <div className="admin-stat">
            <div className="admin-stat-label">Linked accounts</div>
            <div className="admin-stat-value">{accts.length}</div>
            <div className="admin-stat-sub">
              {accts.filter((a) => a.status === "verified" || a.status === "active").length}{" "}
              verified · {accts.filter((a) => a.status === "pending" || a.status === "credentials_received" || a.status === "two_factor_pending").length}{" "}
              in progress
            </div>
          </div>
          <div className="admin-stat">
            <div className="admin-stat-label">Receipts submitted</div>
            <div className="admin-stat-value">{totalReceipts}</div>
            <div className="admin-stat-sub">
              {totalReceipts === 0 ? "No receipts yet" : "All-time"}
            </div>
          </div>
          <div className="admin-stat tone-green">
            <div className="admin-stat-label">Sent to creator</div>
            <div className="admin-stat-value">{fmtUsd(totalPaidNet)}</div>
            <div className="admin-stat-sub">Net paid (after 20%)</div>
          </div>
          <div className="admin-stat tone-green">
            <div className="admin-stat-label">AM commissions earned</div>
            <div className="admin-stat-value">{fmtUsd(totalCommissions)}</div>
            <div className="admin-stat-sub">From this creator alone</div>
          </div>
          <div className="admin-stat">
            <div className="admin-stat-label">Agreement</div>
            <div className="admin-stat-value" style={{ fontSize: 16 }}>
              {u.contractSignedAt
                ? `Signed ${u.contractVersion ?? ""}`
                : u.contractUnlocked
                  ? "Unlocked"
                  : "Locked"}
            </div>
            <div className="admin-stat-sub">
              {u.contractSignedAt ? fmt(u.contractSignedAt) : "Awaiting signature"}
            </div>
          </div>
        </div>
      </section>

      {/* TikTok accounts list */}
      <section className="admin-section">
        <div className="admin-section-head">
          <h2>TikTok accounts</h2>
          <span className="admin-meta">
            Use the dropdown or the ✓ button to flip an account&apos;s status.
            Verifying stamps verified_at automatically.
          </span>
        </div>
        <AdminAddAccount userId={u.id} creatorName={u.name} />
        {accts.length === 0 ? (
          <div className="wdr-history-empty">
            No TikTok accounts on file yet.
          </div>
        ) : (
          <div className="acct-list">
            {accts.map((a) => (
              <div key={a.id} className={`acct-row acct-row-${a.status}`}>
                <div className="acct-row-main">
                  <div className="acct-row-handle">@{a.tiktokHandle}</div>
                  <div className="acct-row-meta">
                    Cycle {a.cycleNumber} · #{a.cyclePosition} · added{" "}
                    {fmt(a.createdAt)}
                    {a.verifiedAt && ` · verified ${fmt(a.verifiedAt)}`}
                  </div>
                </div>
                <div className="acct-row-status">
                  <span className={`status-pill acct-pill acct-pill-${a.status}`}>
                    {ACCT_LABELS[a.status] ?? a.status}
                  </span>
                </div>
                <div className="acct-row-actions">
                  <AccountStatusFlip
                    accountId={a.id}
                    current={a.status}
                    handle={a.tiktokHandle}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Latest agreement card */}
      {latestAgreement && (
        <section className="admin-section">
          <div className="admin-section-head">
            <h2>Operations Agreement</h2>
            <span className="admin-meta">
              Signed {latestAgreement.contractVersion} ·{" "}
              {fmt(latestAgreement.signedAt)}
            </span>
          </div>
          <div className="admin-record-grid" style={{ gridTemplateColumns: "repeat(2,1fr)" }}>
            <div className="admin-record-field">
              <div className="admin-record-label">Signature</div>
              <div className="admin-record-value agr-signature-cell">
                {latestAgreement.signature}
              </div>
            </div>
            <div className="admin-record-field">
              <div className="admin-record-label">Version</div>
              <div className="admin-record-value mono">
                {latestAgreement.contractVersion}
              </div>
            </div>
          </div>
          <div style={{ display: "flex", gap: 8, marginTop: 14, flexWrap: "wrap" }}>
            <a
              href={`/api/agreement/${latestAgreement.id}/pdf`}
              className="admin-row-btn admin-row-btn-primary"
              target="_blank"
              rel="noreferrer"
            >
              Download PDF ⬇
            </a>
            <Link
              href={`/admin/agreements/${latestAgreement.id}`}
              className="admin-row-btn"
            >
              View full text →
            </Link>
          </div>
        </section>
      )}

      {/* Recent withdrawals mini-list */}
      <section className="admin-section">
        <div className="admin-section-head">
          <h2>Recent receipts</h2>
          <span className="admin-meta">
            Last {Math.min(10, recentWithdrawals.length)} of {totalReceipts}
          </span>
        </div>
        {recentWithdrawals.length === 0 ? (
          <div className="wdr-history-empty">
            This creator hasn&apos;t submitted any withdrawal receipts yet.
          </div>
        ) : (
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Receipt #</th>
                  <th>Gross</th>
                  <th>Net</th>
                  <th>Status</th>
                  <th>Submitted</th>
                  <th>Paid</th>
                </tr>
              </thead>
              <tbody>
                {recentWithdrawals.map((w) => (
                  <tr key={w.id} className={`admin-wdr-row admin-wdr-row-${w.status}`}>
                    <td className="mono gold">
                      <Link
                        href={`/admin/withdrawals/${w.id}`}
                        className="admin-cell-link"
                      >
                        {w.receiptNumber}
                      </Link>
                    </td>
                    <td>{fmtUsd(w.grossCents)}</td>
                    <td className="ok">{fmtUsd(w.netCents)}</td>
                    <td>{w.status}</td>
                    <td className="dim">{fmt(w.requestedAt)}</td>
                    <td className="dim">{fmt(w.paidAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </main>
  );
}
