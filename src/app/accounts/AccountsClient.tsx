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

type GateTarget = { url: string; label: string } | null;

function DiscordGate({ target, onClose, accelerator }: {
  target: GateTarget;
  onClose: () => void;
  accelerator: string;
}) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    try {
      const em = localStorage.getItem("am_chatroom_email") ?? "";
      const nm = localStorage.getItem("am_chatroom_name") ?? "";
      if (em) setEmail(em);
      if (nm) setName(nm);
    } catch {}
  }, []);

  if (!target) return null;

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (busy || !target) return;
    setBusy(true); setErr(null);
    try {
      const r = await fetch("/api/accelerator/intent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "outbound_accounts", name: name.trim(), email: email.trim(), accelerator }),
      });
      const j = await r.json();
      if (!j.ok) throw new Error(j.error || "Couldn't save your info — try again.");
      try { localStorage.setItem("am_chatroom_email", email.trim()); localStorage.setItem("am_chatroom_name", name.trim()); } catch {}
      window.open(target.url, "_blank", "noopener,noreferrer");
      onClose();
    } catch (ex) {
      setErr(ex instanceof Error ? ex.message : "Something went wrong.");
    } finally { setBusy(false); }
  }

  return (
    <div className="taa-dg-wrap" onClick={onClose}>
      <div className="taa-dg-card" onClick={(e) => e.stopPropagation()}>
        <button className="taa-dg-close" onClick={onClose} aria-label="Close">×</button>
        <div className="taa-dg-eyebrow">BEFORE YOU GO</div>
        <h3 className="taa-dg-title">Who should Nick G know referred you?</h3>
        <p className="taa-dg-sub">Drop your name and email so we can let him know you came from the Accelerator. Takes 2 seconds.</p>
        <form onSubmit={submit} className="taa-dg-form">
          <input type="text" required placeholder="Your name" value={name} onChange={(e) => setName(e.target.value)} autoFocus />
          <input type="email" required placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} />
          <button type="submit" disabled={busy || !name.trim() || !email.trim()}>
            {busy ? "Opening Discord…" : target.label || "Continue to Discord →"}
          </button>
          {err && <p className="taa-dg-err">{err}</p>}
          <button type="button" className="taa-dg-skip" onClick={() => { if (target) window.open(target.url, "_blank", "noopener,noreferrer"); onClose(); }}>
            Skip — just take me there
          </button>
        </form>
      </div>
      <style>{`
        .taa-dg-wrap { position: fixed; inset: 0; z-index: 1000; display: flex; align-items: center; justify-content: center; padding: 20px; background: rgba(0,0,0,0.75); backdrop-filter: blur(6px); }
        .taa-dg-card { position: relative; width: 100%; max-width: 440px; background: var(--taa-bg-card); border: 1px solid var(--taa-border-strong); border-radius: 16px; padding: 28px 26px; box-shadow: 0 30px 80px rgba(0,0,0,0.6); }
        .taa-dg-close { position: absolute; top: 10px; right: 14px; background: transparent; border: none; color: var(--taa-muted); font-size: 24px; cursor: pointer; padding: 4px 10px; }
        .taa-dg-eyebrow { font-size: 10px; letter-spacing: 0.22em; color: var(--taa-red); font-weight: 700; text-transform: uppercase; margin-bottom: 10px; }
        .taa-dg-title { margin: 0 0 10px; font-size: 20px; font-weight: 800; color: var(--taa-white); letter-spacing: -0.01em; line-height: 1.25; }
        .taa-dg-sub { margin: 0 0 20px; font-size: 13px; color: var(--taa-muted); line-height: 1.55; }
        .taa-dg-form { display: flex; flex-direction: column; gap: 10px; }
        .taa-dg-form input { padding: 12px 14px; background: rgba(255,255,255,0.03); border: 1px solid var(--taa-border); border-radius: 8px; color: var(--taa-white); font-size: 14px; font-family: inherit; }
        .taa-dg-form input:focus { outline: none; border-color: var(--taa-red); }
        .taa-dg-form button[type="submit"] { padding: 12px 18px; background: var(--taa-red); color: #FFFFFF; border: none; border-radius: 8px; font-size: 13px; font-weight: 700; letter-spacing: 0.06em; text-transform: uppercase; cursor: pointer; margin-top: 4px; }
        .taa-dg-form button[type="submit"]:disabled { opacity: 0.5; cursor: not-allowed; }
        .taa-dg-skip { background: transparent; border: none; color: var(--taa-muted); font-size: 12px; text-decoration: underline; cursor: pointer; margin-top: 4px; padding: 6px; }
        .taa-dg-err { color: #F87171; font-size: 12px; margin: 4px 0 0; }
      `}</style>
    </div>
  );
}

export default function AccountsClient({
  initialAccounts,
  lastSyncedAt,
  ticketUrl,
  liveListUrl,
}: Props) {
  const [gateTarget, setGateTarget] = useState<GateTarget>(null);
  const [accelerator, setAccelerator] = useState<string>("roni");
  useEffect(() => {
    try {
      const p = new URLSearchParams(window.location.search);
      const from = p.get("from");
      if (from && /^[a-z0-9-]{1,40}$/.test(from)) setAccelerator(from);
    } catch {}
  }, []);
  function openDiscord(url: string, label: string) {
    setGateTarget({ url, label });
  }
  const [accounts, setAccounts] = useState<Account[]>(initialAccounts);
  const [syncedAt, setSyncedAt] = useState<string | null>(lastSyncedAt);
  const [refreshing, setRefreshing] = useState(false);
  const [query, setQuery] = useState("");
  const [lastRefreshedAt, setLastRefreshedAt] = useState<number>(0);
  const [nowTs, setNowTs] = useState<number>(() => Date.now());

  const REFRESH_MIN_INTERVAL_MS = 60 * 60 * 1000; // 1 hour throttle
  const REFRESH_STORAGE_KEY = "taa_last_refresh_ts";
  const [bucket, setBucket] = useState<FollowerBucket>("all");
  const [relLabel, setRelLabel] = useState(fmtRelative(lastSyncedAt));

  // Live-tick the "last synced" label without re-mounting.
  useEffect(() => {
    const t = setInterval(() => setRelLabel(fmtRelative(syncedAt)), 30_000);
    return () => clearInterval(t);
  }, [syncedAt]);
  useEffect(() => setRelLabel(fmtRelative(syncedAt)), [syncedAt]);

  // Restore last-refresh timestamp (persist across reloads)
  useEffect(() => {
    try {
      const raw = localStorage.getItem(REFRESH_STORAGE_KEY);
      if (raw) {
        const n = Number(raw);
        if (Number.isFinite(n)) setLastRefreshedAt(n);
      }
    } catch {}
  }, []);
  // Tick nowTs every 15s so the countdown label updates in real time.
  useEffect(() => {
    const t = setInterval(() => setNowTs(Date.now()), 15_000);
    return () => clearInterval(t);
  }, []);

  async function refresh() {
    if (refreshing) return;
    const now = Date.now();
    if (lastRefreshedAt && now - lastRefreshedAt < REFRESH_MIN_INTERVAL_MS) {
      // Throttled — no-op. UI already shows the countdown.
      return;
    }
    setRefreshing(true);
    try {
      const res = await fetch("/api/accelerator/accounts", { cache: "no-store" });
      const j = await res.json();
      if (j.ok) {
        setAccounts(j.accounts);
        setSyncedAt(j.lastSyncedAt);
      }
      setLastRefreshedAt(now);
      try { localStorage.setItem(REFRESH_STORAGE_KEY, String(now)); } catch {}
    } finally {
      setTimeout(() => setRefreshing(false), 600);
    }
  }

  const cooldownMs = lastRefreshedAt
    ? Math.max(0, REFRESH_MIN_INTERVAL_MS - (nowTs - lastRefreshedAt))
    : 0;
  const cooldownLabel = (() => {
    if (cooldownMs <= 0) return "";
    const mins = Math.ceil(cooldownMs / 60_000);
    if (mins >= 60) return "1h";
    return `${mins}m`;
  })();

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
          <button type="button" onClick={() => openDiscord(ticketUrl, "Continue to Discord →")} className="taa-cta">
            <span>+ Buy an Account</span>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
              <path d="M7 17L17 7" /><path d="M8 7h9v9" />
            </svg>
          </button>
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
            href="/chatroom"
            className="taa-verify-cta"
            aria-label="Chat with us to verify — opens verification chatroom"
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
          <button type="button" onClick={() => openDiscord(liveListUrl, "Continue to live list →")} className="taa-ghost">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
              <path d="M7 17L17 7" /><path d="M8 7h9v9" />
            </svg>
            <span>View live list</span>
          </button>
          <button
            type="button"
            className="taa-refresh"
            onClick={refresh}
            disabled={refreshing || cooldownMs > 0}
            aria-busy={refreshing}
            title={cooldownMs > 0 ? `Refresh available in ${cooldownLabel}` : "Refresh accounts"}
          >
            <svg
              className={refreshing ? "spin" : ""}
              width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"
            >
              <path d="M21 12a9 9 0 1 1-3-6.7" />
              <path d="M21 4v5h-5" />
            </svg>
            <span>
              {refreshing
                ? "Refreshing…"
                : cooldownMs > 0
                ? `Refresh in ${cooldownLabel}`
                : "Refresh accounts"}
            </span>
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
        <button type="button" onClick={() => openDiscord(ticketUrl, "Continue to Discord →")} className="taa-footer-link">
          Open a ticket →
        </button>
      </footer>
      <DiscordGate target={gateTarget} onClose={() => setGateTarget(null)} accelerator={accelerator} />
    </div>
  );
}
