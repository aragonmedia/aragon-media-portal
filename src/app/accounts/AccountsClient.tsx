"use client";

import { useEffect, useMemo, useState } from "react";

type FollowerBucket = "all" | "100-200" | "gt200";

const FOLLOWER_BUCKETS: { key: FollowerBucket; label: string; test: (n: number | null) => boolean }[] = [
  { key: "all",      label: "All",         test: () => true },
  { key: "100-200",  label: "100K – 200K", test: (n) => n !== null && n >= 100_000 && n < 200_000 },
  { key: "gt200",    label: "200K +",      test: (n) => n !== null && n >= 200_000 },
];

type Account = {
  id: string;
  handle: string;
  tiktokUrl: string;
  accountType: string;
  followers: number | null;
  priceCents: number;
  originalPriceCents: number | null;
};

type Props = {
  initialAccounts: Account[];
  lastSyncedAt: string | null;
  ticketUrl: string;
  liveListUrl: string;
};

function money(cents: number) {
  return `$${Math.round(cents / 100).toLocaleString()}`;
}

function fmtFollowers(n: number | null) {
  if (n === null) return "—";
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1000) return `${(n / 1000).toFixed(1)}K`;
  return `${n}`;
}

function fmtRelative(iso: string | null) {
  if (!iso) return "never";
  const then = new Date(iso).getTime();
  const now = Date.now();
  const diff = Math.max(0, now - then);
  const m = Math.floor(diff / 60000);
  if (m < 1) return "just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  return `${d}d ago`;
}

export default function AccountsClient({
  initialAccounts,
  lastSyncedAt,
  ticketUrl,
  liveListUrl,
}: Props) {
  const [accounts, setAccounts] = useState<Account[]>(initialAccounts);
  const [syncedAt, setSyncedAt] = useState<string | null>(lastSyncedAt);
  const [refreshing, setRefreshing] = useState(false);
  const [query, setQuery] = useState("");
  const [bucket, setBucket] = useState<FollowerBucket>("all");
  const [relLabel, setRelLabel] = useState(fmtRelative(lastSyncedAt));

  // Live-tick the "last synced" label without re-mounting.
  useEffect(() => {
    const t = setInterval(() => setRelLabel(fmtRelative(syncedAt)), 30_000);
    return () => clearInterval(t);
  }, [syncedAt]);
  useEffect(() => setRelLabel(fmtRelative(syncedAt)), [syncedAt]);

  async function refresh() {
    if (refreshing) return;
    setRefreshing(true);
    try {
      const res = await fetch("/api/accelerator/accounts", { cache: "no-store" });
      const j = await res.json();
      if (j.ok) {
        setAccounts(j.accounts);
        setSyncedAt(j.lastSyncedAt);
      }
    } finally {
      // Minimum 600ms spin so the animation reads as "did something"
      setTimeout(() => setRefreshing(false), 600);
    }
  }

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const bucketTest =
      FOLLOWER_BUCKETS.find((b) => b.key === bucket)?.test ?? (() => true);
    return accounts.filter((a) => {
      if (!bucketTest(a.followers)) return false;
      if (!q) return true;
      return (
        a.handle.toLowerCase().includes(q) ||
        a.accountType.toLowerCase().includes(q)
      );
    });
  }, [accounts, query, bucket]);

  // Per-bucket count for the pill badge
  const bucketCounts = useMemo(() => {
    const out: Record<FollowerBucket, number> = {
      all: accounts.length, "100-200": 0, gt200: 0,
    };
    for (const a of accounts) {
      for (const b of FOLLOWER_BUCKETS) {
        if (b.key === "all") continue;
        if (b.test(a.followers)) out[b.key]++;
      }
    }
    return out;
  }, [accounts]);

  const totalListed = accounts.length;

  return (
    <div className="taa-shell">
      {/* Backdrop grid + radar */}
      <div className="taa-bg" aria-hidden="true">
        <div className="taa-grid" />
        <div className="taa-radar" />
      </div>

      {/* Header */}
      <header className="taa-header">
        <a href="/accounts" className="taa-brand">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/accelerator/wolf-transparent.png"
            alt="TikTok Affiliate Accelerator"
            width={44}
            height={44}
          />
          <div className="taa-brand-text">
            <span className="taa-brand-tag">TIKTOK AFFILIATE</span>
            <span className="taa-brand-name">ACCELERATOR</span>
          </div>
        </a>

        <div className="taa-header-actions">
          <a href={ticketUrl} target="_blank" rel="noopener noreferrer" className="taa-cta">
            <span>+ Buy an Account</span>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
              <path d="M7 17L17 7" /><path d="M8 7h9v9" />
            </svg>
          </a>
        </div>
      </header>

      {/* Hero band */}
      <section className="taa-hero">
        <div className="taa-hero-eyebrow">LIVE INVENTORY</div>
        <h1>US TikTok Shop <span className="taa-hero-accent">Affiliate Accounts</span></h1>
        <p className="taa-hero-sub">
          US Shop affiliate accounts, ready to activate. Prices update
          daily. Click <b>+Buy an Account</b> to open a ticket in{" "}
          <b>Nick G&apos;s Discord</b> and lock in one you like.
        </p>
        <p className="taa-hero-sub">
          <b>Heads up:</b> accounts sell fast. The list refreshes as the
          ticket queue moves, so the account you inquire about may already
          be reserved by the time you open a ticket.
        </p>

        <div className="taa-hero-stats">
          <div className="taa-stat">
            <div className="taa-stat-val">{totalListed}</div>
            <div className="taa-stat-label">Live listings</div>
          </div>
          <div className="taa-stat-sep" />
          <div className="taa-stat">
            <div className="taa-stat-val" data-refreshing={refreshing || undefined}>{relLabel}</div>
            <div className="taa-stat-label">Last refresh</div>
          </div>
          <div className="taa-stat-sep" />
          <a
            href={ticketUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="taa-verify-cta"
            aria-label="Chat with us to verify — opens Discord ticket"
          >
            <div className="taa-verify-cta-label">Chat with us to verify</div>
            <div className="taa-verify-cta-sub">
              Send us a message &middot; AM Team activate
              <span aria-hidden> →</span>
            </div>
          </a>
        </div>
      </section>

      {/* Toolbar */}
      <section className="taa-toolbar">
        <div className="taa-search">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="7" />
            <path d="m20 20-3.5-3.5" />
          </svg>
          <input
            type="search"
            placeholder="Search handle or account type…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          {query && (
            <button className="taa-search-clear" onClick={() => setQuery("")} aria-label="Clear search">×</button>
          )}
        </div>

        <div className="taa-toolbar-actions">
          <a
            href={liveListUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="taa-view-live"
            title="Open Nick G's live listings channel in Discord"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
              <path d="M7 17L17 7" /><path d="M8 7h9v9" />
            </svg>
            <span>View live list</span>
          </a>
          <button
            type="button"
            className="taa-refresh"
            onClick={refresh}
            disabled={refreshing}
            aria-busy={refreshing}
          >
            <svg
              className={refreshing ? "spin" : ""}
              width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"
            >
              <path d="M21 12a9 9 0 1 1-3-6.7" />
              <path d="M21 4v5h-5" />
            </svg>
            <span>{refreshing ? "Refreshing…" : "Refresh accounts"}</span>
          </button>
        </div>
      </section>

      {/* Follower filter pills */}
      <div className="taa-filter-row">
        <span className="taa-filter-label">Followers</span>
        <div className="taa-filter-pills">
          {FOLLOWER_BUCKETS.map((b) => (
            <button
              key={b.key}
              type="button"
              className={`taa-pill${bucket === b.key ? " active" : ""}`}
              onClick={() => setBucket(b.key)}
              aria-pressed={bucket === b.key}
            >
              <span>{b.label}</span>
              <span className="taa-pill-count">{bucketCounts[b.key]}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Accounts */}
      {filtered.length === 0 ? (
        <div className="taa-empty">
          {accounts.length === 0 ? (
            <>
              <p className="taa-empty-title">No accounts loaded yet</p>
              <p className="taa-empty-sub">
                The Discord sync hasn&apos;t run. Roni will authorize the bot
                soon, or paste the message into the admin console to
                populate.
              </p>
            </>
          ) : (
            <>
              <p className="taa-empty-title">No matches for &quot;{query}&quot;</p>
              <p className="taa-empty-sub">Try clearing the search.</p>
            </>
          )}
        </div>
      ) : (
        <ul className="taa-list">
          {filtered.map((a) => {
            const hasDiscount =
              a.originalPriceCents !== null && a.originalPriceCents > a.priceCents;
            const discountPct = hasDiscount
              ? Math.round(
                  ((a.originalPriceCents! - a.priceCents) / a.originalPriceCents!) *
                    100
                )
              : 0;
            return (
              <li key={a.id} className="taa-card">
                <div className="taa-card-glow" aria-hidden="true" />
                <div className="taa-card-left">
                  <a
                    href={a.tiktokUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="taa-handle"
                  >
                    @{a.handle}
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M7 17L17 7" /><path d="M8 7h9v9" />
                    </svg>
                  </a>
                  <div className="taa-meta">
                    <span className="taa-badge">{a.accountType}</span>
                    <span className="taa-followers">
                      {fmtFollowers(a.followers)} followers
                    </span>
                  </div>
                </div>
                <div className="taa-card-right">
                  {hasDiscount && (
                    <span className="taa-save-pill">SAVE {discountPct}%</span>
                  )}
                  <div className="taa-price-block">
                    {hasDiscount && (
                      <span className="taa-price-strike">
                        {money(a.originalPriceCents!)}
                      </span>
                    )}
                    <span className="taa-price">{money(a.priceCents)}</span>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}

      {/* Footer */}
      <footer className="taa-footer">
        <div className="taa-footer-info">
          <span className="taa-footer-line">
            <span className="taa-footer-dot" /> Live sync from Discord
          </span>
          <span className="taa-footer-powered">
            Powered by <b>Aragon Media</b> × <b>Accelerator</b>
          </span>
        </div>
        <a href={ticketUrl} target="_blank" rel="noopener noreferrer">
          Open a ticket →
        </a>
      </footer>
    </div>
  );
}
