import { db } from "@/db";
import { withdrawals, users, accounts } from "@/db/schema";
import { desc, eq } from "drizzle-orm";
import Link from "next/link";
import WithdrawalStatusFlip from "./WithdrawalStatusFlip";

export const dynamic = "force-dynamic";
export const revalidate = 0;

function fmtUsd(cents: number): string {
  return `$${(cents / 100).toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
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

const STATUS_LABELS: Record<string, string> = {
  requested: "Pending",
  approved: "Approved",
  calculated: "Calculated",
  paid: "Paid",
  rejected: "Rejected",
  late_retained: "Late · retained",
};

export default async function AdminWithdrawalsPage({
  searchParams,
}: {
  searchParams?: Promise<{ creator?: string }>;
}) {
  const sp = (await searchParams) ?? {};
  const creatorId = sp.creator && sp.creator.length > 0 ? sp.creator : null;

  const where = creatorId ? eq(withdrawals.userId, creatorId) : undefined;

  const list = await db
    .select({
      id: withdrawals.id,
      receiptNumber: withdrawals.receiptNumber,
      grossCents: withdrawals.grossCents,
      feeCents: withdrawals.feeCents,
      netCents: withdrawals.netCents,
      status: withdrawals.status,
      payoutMethod: withdrawals.payoutMethod,
      requestedAt: withdrawals.requestedAt,
      paidAt: withdrawals.paidAt,
      userId: withdrawals.userId,
      creatorEmail: users.email,
      creatorName: users.name,
      tiktokHandle: accounts.tiktokHandle,
    })
    .from(withdrawals)
    .leftJoin(users, eq(users.id, withdrawals.userId))
    .leftJoin(accounts, eq(accounts.id, withdrawals.accountId))
    .where(where)
    .orderBy(desc(withdrawals.requestedAt));

  const filteredCreatorName = creatorId && list.length > 0 ? list[0].creatorName : null;

  return (
    <main className="admin-shell admin-shell-nested">
      <header className="admin-header">
        <div>
          <p className="admin-eyebrow">Aragon Media · Withdrawals</p>
          <h1>
            {creatorId && filteredCreatorName
              ? `${filteredCreatorName}'s receipts`
              : "All withdrawal receipts"}
          </h1>
          <p className="admin-page-sub">
            {list.length} receipt{list.length === 1 ? "" : "s"}
            {creatorId ? " for this creator" : " across all creators"}. Click a
            receipt # to open the detail view + edit gross/fee/net values.
            Flip status from the dropdown.
          </p>
          {creatorId && (
            <p className="admin-filter-strip">
              <span>Filtered by creator</span>
              <Link href="/admin/withdrawals" className="admin-row-btn">
                Clear filter
              </Link>
            </p>
          )}
        </div>
      </header>

      <section className="admin-section">
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Receipt #</th>
                <th>Creator</th>
                <th>TikTok</th>
                <th>Gross</th>
                <th>Fee</th>
                <th>Net to creator</th>
                <th>Status</th>
                <th>Submitted</th>
                <th>Paid</th>
              </tr>
            </thead>
            <tbody>
              {list.length === 0 ? (
                <tr>
                  <td colSpan={9} className="admin-empty">
                    No withdrawal submissions yet.
                  </td>
                </tr>
              ) : (
                list.map((w) => (
                  <tr key={w.id} className={`admin-wdr-row admin-wdr-row-${w.status}`}>
                    <td className="mono gold"><Link href={`/admin/withdrawals/${w.id}`} className="admin-cell-link">{w.receiptNumber}</Link></td>
                    <td>
                      <div>{w.creatorName ?? "—"}</div>
                      <div className="dim small">{w.creatorEmail ?? "—"}</div>
                    </td>
                    <td className="mono dim">
                      {w.tiktokHandle ? `@${w.tiktokHandle}` : "—"}
                    </td>
                    <td>{fmtUsd(w.grossCents)}</td>
                    <td className="dim">{fmtUsd(w.feeCents)}</td>
                    <td className="ok">{fmtUsd(w.netCents)}</td>
                    <td>
                      <WithdrawalStatusFlip
                        id={w.id}
                        current={w.status}
                        labels={STATUS_LABELS}
                      />
                    </td>
                    <td className="dim">{fmt(w.requestedAt)}</td>
                    <td className="dim">{fmt(w.paidAt)}</td>
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
