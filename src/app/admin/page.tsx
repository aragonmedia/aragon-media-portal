/**
 * /admin — Operations console home (Overview).
 *
 * Layout (admin/layout.tsx) handles the auth gate + sidebar. This page
 * renders the dashboard content for the Overview tab: top-line revenue/
 * commission/account-verified stats + 3 scrollable mini-lists showing
 * recent creators, recent withdrawals, and recent agreements.
 */

import Link from "next/link";
import OverviewChart from "./OverviewChart";
import { db } from "@/db";
import {
  users,
  sessions,
  purchases,
  accounts,
  withdrawals,
  agreements,
} from "@/db/schema";
import { sql, desc, gte, isNull, and, gt, eq } from "drizzle-orm";

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

const STATUS_LABEL: Record<string, string> = {
  requested: "Pending",
  approved: "Approved",
  calculated: "Calculated",
  paid: "Paid",
  rejected: "Rejected",
  late_retained: "Late · retained",
};

export default async function AdminOverviewPage() {
  const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

  // Top-line stats — single trips per metric
  const [{ totalUsers }] = await db
    .select({ totalUsers: sql<number>`count(*)::int` })
    .from(users);

  const [{ usersThisWeek }] = await db
    .select({ usersThisWeek: sql<number>`count(*)::int` })
    .from(users)
    .where(gte(users.createdAt, oneWeekAgo));

  const [{ activeSessions }] = await db
    .select({ activeSessions: sql<number>`count(*)::int` })
    .from(sessions)
    .where(and(isNull(sessions.revokedAt), gt(sessions.expiresAt, new Date())));

  // Square purchases — total inflow (paid)
  const [{ activationRevenueCents }] = await db
    .select({
      activationRevenueCents: sql<number>`coalesce(sum(${purchases.amountCents}), 0)::int`,
    })
    .from(purchases)
    .where(sql`${purchases.status} = 'paid'`);

  // Withdrawal totals (paid only — what's actually flowed through)
  const [{ withdrawalGrossCents, withdrawalCommissionCents, withdrawalNetCents }] =
    await db
      .select({
        withdrawalGrossCents: sql<number>`coalesce(sum(${withdrawals.grossCents}), 0)::int`,
        withdrawalCommissionCents: sql<number>`coalesce(sum(${withdrawals.feeCents}), 0)::int`,
        withdrawalNetCents: sql<number>`coalesce(sum(${withdrawals.netCents}), 0)::int`,
      })
      .from(withdrawals)
      .where(sql`${withdrawals.status} = 'paid'`);

  // Pending withdrawals (action queue)
  const [{ pendingWithdrawals, pendingPayoutCents }] = await db
    .select({
      pendingWithdrawals: sql<number>`count(*)::int`,
      pendingPayoutCents: sql<number>`coalesce(sum(${withdrawals.netCents}), 0)::int`,
    })
    .from(withdrawals)
    .where(sql`${withdrawals.status} IN ('requested', 'approved')`);

  // Account verification breakdown
  const [{ verifiedAccounts }] = await db
    .select({ verifiedAccounts: sql<number>`count(*)::int` })
    .from(accounts)
    .where(sql`${accounts.status} IN ('verified', 'active')`);

  const [{ pendingAccounts }] = await db
    .select({ pendingAccounts: sql<number>`count(*)::int` })
    .from(accounts)
    .where(sql`${accounts.status} NOT IN ('active', 'verified', 'cancelled')`);

  const [{ totalAgreements }] = await db
    .select({ totalAgreements: sql<number>`count(*)::int` })
    .from(agreements);

  // Daily series for the Overview chart — paid revenue (Square purchases)
  // + AM commissions earned (sum of fee_cents on paid withdrawals).
  // Bucket by created_at::date for purchases and paid_at::date for
  // withdrawals so a paid receipt counts on the day it was actually paid.
  const purchaseDays = (await db.execute(sql`
    select to_char(date_trunc('day', created_at), 'YYYY-MM-DD') as d,
           coalesce(sum(amount_cents), 0)::int as cents
      from purchases
     where status = 'paid'
     group by 1
     order by 1
  `)) as unknown as { rows: { d: string; cents: number }[] };

  const withdrawalDays = (await db.execute(sql`
    select to_char(date_trunc('day', paid_at), 'YYYY-MM-DD') as d,
           coalesce(sum(fee_cents), 0)::int as cents
      from withdrawals
     where status = 'paid' and paid_at is not null
     group by 1
     order by 1
  `)) as unknown as { rows: { d: string; cents: number }[] };

  // Walk every day from the earliest event to today so the line has no gaps.
  const allDates = [
    ...(purchaseDays.rows ?? []).map((r) => r.d),
    ...(withdrawalDays.rows ?? []).map((r) => r.d),
  ];
  const today = new Date();
  const todayStr = today.toISOString().slice(0, 10);
  const earliest = allDates.length > 0
    ? allDates.reduce((min, d) => (d < min ? d : min), allDates[0])
    : new Date(today.getTime() - 27 * 86400_000).toISOString().slice(0, 10);
  const purchaseMap = new Map((purchaseDays.rows ?? []).map((r) => [r.d, r.cents]));
  const withdrawalMap = new Map((withdrawalDays.rows ?? []).map((r) => [r.d, r.cents]));
  const dailySeries: { date: string; revenue: number; commissions: number }[] = [];
  const cur = new Date(earliest + "T00:00:00Z");
  const end = new Date(todayStr + "T00:00:00Z");
  while (cur <= end) {
    const k = cur.toISOString().slice(0, 10);
    dailySeries.push({
      date: k,
      revenue: purchaseMap.get(k) ?? 0,
      commissions: withdrawalMap.get(k) ?? 0,
    });
    cur.setUTCDate(cur.getUTCDate() + 1);
  }

  // Recent lists for the 3 scrollable cards
  const recentCreators = await db
    .select({
      id: users.id,
      name: users.name,
      email: users.email,
      createdAt: users.createdAt,
      contractSignedAt: users.contractSignedAt,
    })
    .from(users)
    .orderBy(desc(users.createdAt))
    .limit(12);

  const recentWithdrawals = await db
    .select({
      id: withdrawals.id,
      receiptNumber: withdrawals.receiptNumber,
      grossCents: withdrawals.grossCents,
      netCents: withdrawals.netCents,
      status: withdrawals.status,
      requestedAt: withdrawals.requestedAt,
      creatorName: users.name,
    })
    .from(withdrawals)
    .leftJoin(users, eq(users.id, withdrawals.userId))
    .orderBy(desc(withdrawals.requestedAt))
    .limit(12);

  const recentAgreements = await db
    .select({
      id: agreements.id,
      signature: agreements.signature,
      contractVersion: agreements.contractVersion,
      signedAt: agreements.signedAt,
      creatorName: users.name,
      creatorEmail: users.email,
    })
    .from(agreements)
    .leftJoin(users, eq(users.id, agreements.userId))
    .orderBy(desc(agreements.signedAt))
    .limit(12);

  return (
    <main className="admin-shell admin-shell-nested">
      <header className="admin-header">
        <div>
          <p className="admin-eyebrow">Aragon Media · Operations</p>
          <h1>Overview</h1>
          <p className="admin-page-sub">
            Live snapshot of revenue, payouts, and creator activity. Numbers
            update on every page load — refresh for the latest.
          </p>
        </div>
      </header>

      {/* Revenue + commission stat row — these are the headline numbers */}
      <section className="admin-section">
        <div className="admin-section-head">
          <h2>Money</h2>
          <span className="admin-meta">
            Activation fees (Square) + paid commission cycles
          </span>
        </div>
        <div className="admin-stats">
          <Stat
            label="Activation revenue"
            value={fmtUsd(activationRevenueCents)}
            tone="green"
            sub="Sum of paid Square purchases"
          />
          <Stat
            label="AM commissions earned"
            value={fmtUsd(withdrawalCommissionCents)}
            tone="green"
            sub="20% fee on paid withdrawals"
          />
          <Stat
            label="Total payout volume"
            value={fmtUsd(withdrawalGrossCents)}
            sub="Gross flowed through paid receipts"
          />
          <Stat
            label="Sent to creators"
            value={fmtUsd(withdrawalNetCents)}
            sub="Net we&apos;ve paid out (after 20%)"
          />
          <Stat
            label="Pending payouts"
            value={fmtUsd(pendingPayoutCents)}
            tone={pendingPayoutCents > 0 ? "gold" : undefined}
            sub={`${pendingWithdrawals} receipt${pendingWithdrawals === 1 ? "" : "s"} awaiting action`}
          />
        </div>
      </section>

      {/* Account & agreement stats */}
      <section className="admin-section">
        <div className="admin-section-head">
          <h2>Operations</h2>
          <span className="admin-meta">Creator accounts + signed agreements</span>
        </div>
        <div className="admin-stats">
          <Stat label="Total creators" value={totalUsers.toLocaleString()} sub={`${usersThisWeek} new this week`} />
          <Stat label="Active sessions" value={activeSessions.toLocaleString()} />
          <Stat
            label="Accounts verified"
            value={verifiedAccounts.toLocaleString()}
            tone="green"
          />
          <Stat
            label="Accounts pending"
            value={pendingAccounts.toLocaleString()}
            tone={pendingAccounts > 0 ? "gold" : undefined}
          />
          <Stat
            label="Signed agreements"
            value={totalAgreements.toLocaleString()}
          />
        </div>
      </section>

      {/* Live revenue + AM commissions line chart */}
      <section className="admin-section">
        <OverviewChart daily={dailySeries} />
      </section>

      {/* Three scrollable mini-lists */}
      <section className="admin-section admin-3up">
        <MiniList
          title="Recent creators"
          href="/admin/creators"
          items={recentCreators.map((u) => ({
            id: u.id,
            primary: u.name,
            secondary: u.email,
            meta: fmt(u.createdAt),
            pill: u.contractSignedAt
              ? { label: "Signed", className: "rcpt-pill-paid" }
              : { label: "—", className: "rcpt-pill-pending" },
            href: `/admin/withdrawals?creator=${u.id}`,
          }))}
        />
        <MiniList
          title="Recent withdrawals"
          href="/admin/withdrawals"
          items={recentWithdrawals.map((w) => ({
            id: w.id,
            primary: w.receiptNumber,
            secondary: `${w.creatorName ?? "—"} · ${fmtUsd(w.netCents)} of ${fmtUsd(w.grossCents)}`,
            meta: fmt(w.requestedAt),
            pill: { label: STATUS_LABEL[w.status] ?? w.status, className: `rcpt-pill-${w.status === "late_retained" ? "late" : w.status === "paid" ? "paid" : w.status === "approved" ? "approved" : "pending"}` },
            href: `/admin/withdrawals/${w.id}`,
          }))}
        />
        <MiniList
          title="Recent agreements"
          href="/admin/agreements"
          items={recentAgreements.map((a) => ({
            id: a.id,
            primary: a.creatorName ?? "—",
            secondary: `${a.signature} · ${a.contractVersion}`,
            meta: fmt(a.signedAt),
            pill: { label: "Signed", className: "rcpt-pill-paid" },
            href: `/admin/agreements/${a.id}`,
          }))}
        />
      </section>

      <footer className="admin-footer">
        Aragon Media · Operations console · Data live from Neon · Refresh to update
      </footer>
    </main>
  );
}

function Stat({
  label,
  value,
  tone,
  sub,
}: {
  label: string;
  value: string;
  tone?: "green" | "gold";
  sub?: string;
}) {
  return (
    <div className={`admin-stat${tone ? ` tone-${tone}` : ""}`}>
      <div className="admin-stat-label">{label}</div>
      <div className="admin-stat-value">{value}</div>
      {sub && <div className="admin-stat-sub">{sub}</div>}
    </div>
  );
}

function MiniList({
  title,
  href,
  items,
}: {
  title: string;
  href: string;
  items: {
    id: string;
    primary: string;
    secondary: string;
    meta: string;
    pill: { label: string; className: string };
    href: string;
  }[];
}) {
  return (
    <div className="admin-mini-card">
      <div className="admin-mini-head">
        <h3>{title}</h3>
        <Link href={href} className="admin-mini-all">View all →</Link>
      </div>
      <div className="admin-mini-list">
        {items.length === 0 ? (
          <div className="admin-mini-empty">Nothing yet.</div>
        ) : (
          items.map((it) => (
            <Link key={it.id} href={it.href} className="admin-mini-row">
              <div className="admin-mini-row-main">
                <div className="admin-mini-primary">{it.primary}</div>
                <div className="admin-mini-secondary">{it.secondary}</div>
              </div>
              <div className="admin-mini-row-side">
                <span className={`rcpt-pill ${it.pill.className} admin-mini-pill`}>{it.pill.label}</span>
                <div className="admin-mini-meta">{it.meta}</div>
              </div>
            </Link>
          ))
        )}
      </div>
    </div>
  );
}
