"use client";

import { useState } from "react";

const SQUARE_LINKS: Record<number, string> = {
  1: "https://square.link/u/2rfvqrD1",
  2: "https://square.link/u/qidSjIek",
  3: "https://square.link/u/uiffueYK",
  4: "https://square.link/u/oU70xlPo",
};

function priceEach(n: number): number {
  if (n <= 3) return 100;
  if (n <= 4) return 125;
  return 150;
}
function tier(n: number): { label: string; cls: string; idx: 1 | 2 | 3 } {
  if (n <= 3) return { label: "Standard rate", cls: "tier1", idx: 1 };
  if (n <= 4) return { label: "Volume rate", cls: "tier2", idx: 2 };
  return { label: "Premium rate", cls: "tier3", idx: 3 };
}

export default function AddAccountPage() {
  const [count, setCount] = useState(1);
  const each = priceEach(count);
  const total = each * count;
  const t = tier(count);
  const pct = Math.round(((count - 1) / 7) * 100);
  // Map count to existing Square links for first 4 tiers; for >4 default to highest
  const checkoutUrl = SQUARE_LINKS[Math.min(count, 4)];

  return (
    <main className="dash-content">
      <header className="dash-page-head">
        <div>
          <p className="dash-eyebrow">Aragon Media · Account Verification</p>
          <h1>
            Scale your TikTok presence,
            <br />
            <em>multiply your reach.</em>
          </h1>
          <p className="dash-page-sub">
            Add more TikTok accounts to your portal and have each one verified
            and managed by the AM team — all tracked from one dashboard.
          </p>
        </div>
      </header>

      <div className="dash-card slider-card">
        <div className="slider-top">
          <div>
            <div className="slider-label">Number of accounts</div>
            <div className="account-count">{count}</div>
            <div className="account-word">{count === 1 ? "account" : "accounts"}</div>
          </div>
          <div className="price-display">
            <div className="price-each">${each} per account</div>
            <div className="price-total">${total.toLocaleString()}</div>
            <div className={`price-tier-badge ${t.cls}`}>{t.label}</div>
          </div>
        </div>

        <div className="slider-row">
          <input
            type="range"
            min={1}
            max={8}
            step={1}
            value={count}
            onChange={(e) => setCount(parseInt(e.target.value))}
            style={{
              background: `linear-gradient(to right, #C9A84C ${pct}%, #222 ${pct}%)`,
            }}
            className="add-slider"
          />
          <div className="tier-markers">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
              <div className="tier-mark" key={n}>
                <strong>{n}</strong>
                {n === 1 ? "acct" : n === 8 ? "accts" : ""}
              </div>
            ))}
          </div>
        </div>

        <div className="tier-breakdown">
          <div className={`tier-box${t.idx === 1 ? " active-tier" : ""}`}>
            <div className="tier-box-top">Tier 1 · 1–3 accounts</div>
            <div className="tier-box-price">$100 <span>/ account</span></div>
            <div className="tier-box-sub">Standard activation rate</div>
          </div>
          <div className={`tier-box${t.idx === 2 ? " active-tier" : ""}`}>
            <div className="tier-box-top">Tier 2 · 4 accounts</div>
            <div className="tier-box-price">$125 <span>/ account</span></div>
            <div className="tier-box-sub">Volume — expanded ops</div>
          </div>
          <div className={`tier-box${t.idx === 3 ? " active-tier" : ""}`}>
            <div className="tier-box-top">Tier 3 · 5+ accounts</div>
            <div className="tier-box-price">$150 <span>/ account</span></div>
            <div className="tier-box-sub">Premium — full management</div>
          </div>
        </div>

        <div className="includes-list">
          <div className="inc-item">Full AM team activation per account — within 24 hours each</div>
          <div className="inc-item">Dedicated chat channel per account inside your portal</div>
          <div className="inc-item">Individual GMV and revenue tracking per account</div>
          <div className="inc-item">Separate progress tracker and withdrawal form per account</div>
        </div>

        <a href={checkoutUrl} target="_blank" rel="noopener noreferrer" className="pay-btn">
          Activate {count} Account{count === 1 ? "" : "s"} — ${total.toLocaleString()}
        </a>
        <div className="pay-note">
          Processed securely via Square · You&apos;ll be redirected to complete payment
        </div>
      </div>

      <div className="dash-card">
        <div className="sect-label">Why verify more accounts?</div>
        <div className="why-section">
          <div className="why-card">
            <div className="why-num">01</div>
            <h4>Multiple niches, multiple income streams</h4>
            <p>Different TikTok accounts let you test different audiences, products, and content styles. Each one earns commissions independently.</p>
          </div>
          <div className="why-card">
            <div className="why-num">02</div>
            <h4>Protect your primary account</h4>
            <p>If one account faces a restriction, your other verified accounts stay active and earning while AM resolves it on your behalf.</p>
          </div>
          <div className="why-card">
            <div className="why-num">03</div>
            <h4>All managed in one place</h4>
            <p>Every account you verify shows up in this portal. Separate dashboards, one login, one AM team backing all of them.</p>
          </div>
        </div>
      </div>
    </main>
  );
}
