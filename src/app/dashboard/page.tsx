import Link from "next/link";
import { sql, desc, eq } from "drizzle-orm";
import { getCurrentUser } from "@/lib/auth/session";
import { db } from "@/db";
import { accounts, purchases, withdrawals } from "@/db/schema";

export const dynamic = "force-dynamic";

export default async function DashboardLanding() {
  // layout already gates auth, but tighten the type
  const user = await getCurrentUser();
  if (!user) return null;

  const myAccounts = await db
    .select()
    .from(accounts)
    .where(eq(accounts.userId, user.id))
    .orderBy(desc(accounts.createdAt));

  const [{ paidTotal }] = await db
    .select({
      paidTotal: sql<number>`coalesce(sum(${purchases.amountCents}), 0)::int`,
    })
    .from(purchases)
    .where(sql`${purchases.userId} = ${user.id} AND ${purchases.status} = 'paid'`);

  const [{ withdrawnTotal }] = await db
    .select({
      withdrawnTotal: sql<number>`coalesce(sum(${withdrawals.netCents}), 0)::int`,
    })
    .from(withdrawals)
    .where(sql`${withdrawals.userId} = ${user.id} AND ${withdrawals.status} = 'paid'`);

  // Placeholder GMV/commission until TikTok OAuth is wired
  const gmvCents = 0;
  const commissionCents = 0;
  const withdrawableCents = 0;

  const greeting = greetByHour();
  const firstName = user.name.split(/\s+/)[0] || user.name;
  const activeAccountsCount = myAccounts.filter(
    (a) => a.status === "active" || a.status === "verified"
  ).length;

  return (
    <main className="dash-content">
      <header className="dash-greeting">
        <p className="dash-eyebrow">Creator portal</p>
        <h1>{greeting}, {firstName}.</h1>
        <p className="dash-greeting-sub">Here&apos;s where your TikTok business lives. Once an account is activated, your GMV and commissions update here in real time.</p>
      </header>

      <section className="dash-stats">
        <Stat label="Total GMV" value={fmtUsd(gmvCents)} hint={gmvCents === 0 ? "No data yet" : undefined} />
        <Stat label="Your commission" value={fmtUsd(commissionCents)} tone="green" hint="80% of GMV after the AM fee" />
        <Stat label="Available to withdraw" value={fmtUsd(withdrawableCents)} tone="green" />
        <Stat label="Active accounts" value={`${activeAccountsCount} / 4`} tone={activeAccountsCount > 0 ? "gold" : undefined} />
      </section>

      <section className="dash-grid">
        <div className="dash-card">
          <div className="dash-card-head">
            <h2>Your accounts</h2>
            <Link href="/dashboard/accounts" className="dash-link">View all →</Link>
          </div>
          {myAccounts.length === 0 ? (
            <EmptyState
              title="No accounts yet"
              body="Activation starts the moment you complete your first checkout. The AM team handles the rest within 24 hours."
              cta={{ href: "/#pricing", label: "Activate your first account" }}
            />
          ) : (
            <ul className="dash-account-list">
              {myAccounts.slice(0, 3).map((a) => (
                <li key={a.id} className="dash-account-row">
                  <div>
                    <div className="dash-account-handle">{a.tiktokHandle || "Pending handle"}</div>
                    <div className="dash-account-meta">Cycle {a.cycleNumber} · Position {a.cyclePosition}</div>
                  </div>
                  <span className={`account-pill account-${a.status}`}>{a.status.replace("_", " ")}</span>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="dash-card">
          <div className="dash-card-head">
            <h2>Quick actions</h2>
          </div>
          <div className="dash-actions">
            <ActionTile
              href="/#pricing"
              title="Add an account"
              body="Activate the next account in your cycle."
              icon="+"
            />
            <ActionTile
              href="/dashboard/withdrawals"
              title="Request a withdrawal"
              body="Move your USD commission into your bank."
              icon="$"
            />
            <ActionTile
              href="/dashboard/chat"
              title="Open AM chat"
              body="Talk directly with your dedicated team."
              icon="✦"
            />
          </div>
        </div>
      </section>

      <section className="dash-grid dash-grid-2">
        <div className="dash-card">
          <div className="dash-card-head">
            <h2>Recent activity</h2>
            <span className="dash-meta">Live from your account</span>
          </div>
          <EmptyState
            title="Nothing yet"
            body="Verifications, GMV updates, and AM team messages will appear here as they happen."
          />
        </div>
        <div className="dash-card">
          <div className="dash-card-head">
            <h2>Account summary</h2>
          </div>
          <ul className="dash-summary-list">
            <li><span>Spent on activations</span><strong>{fmtUsd(paidTotal)}</strong></li>
            <li><span>Total withdrawn</span><strong>{fmtUsd(withdrawnTotal)}</strong></li>
            <li><span>Contract</span><strong className={user.contractSignedAt ? "ok" : "muted"}>{user.contractSignedAt ? "Signed" : "Not signed yet"}</strong></li>
            <li><span>Account status</span><strong className={user.verifiedAt ? "ok" : "muted"}>{user.verifiedAt ? "Verified" : "Email verified, awaiting first activation"}</strong></li>
          </ul>
        </div>
      </section>
    </main>
  );
}

/* ---- helpers ---- */
function Stat({ label, value, hint, tone }: { label: string; value: string; hint?: string; tone?: "green" | "gold" }) {
  return (
    <div className={`dash-stat${tone ? ` tone-${tone}` : ""}`}>
      <div className="dash-stat-label">{label}</div>
      <div className="dash-stat-value">{value}</div>
      {hint && <div className="dash-stat-hint">{hint}</div>}
    </div>
  );
}

function ActionTile({ href, title, body, icon }: { href: string; title: string; body: string; icon: string }) {
  return (
    <Link href={href} className="dash-action-tile">
      <span className="dash-action-icon">{icon}</span>
      <div>
        <div className="dash-action-title">{title}</div>
        <div className="dash-action-body">{body}</div>
      </div>
    </Link>
  );
}

function EmptyState({ title, body, cta }: { title: string; body: string; cta?: { href: string; label: string } }) {
  return (
    <div className="dash-empty">
      <div className="dash-empty-title">{title}</div>
      <div className="dash-empty-body">{body}</div>
      {cta && <Link href={cta.href} className="dash-cta">{cta.label}</Link>}
    </div>
  );
}

function fmtUsd(cents: number): string {
  return `$${(cents / 100).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function greetByHour(): string {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 18) return "Good afternoon";
  return "Good evening";
}
