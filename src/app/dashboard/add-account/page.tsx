"use client";

import { useState } from "react";

const SQUARE_LINKS: Record<number, string> = {
  1: "https://square.link/u/2rfvqrD1",
  2: "https://square.link/u/qidSjIek",
  3: "https://square.link/u/uiffueYK",
  4: "https://square.link/u/oU70xlPo",
};

// Bundle pricing matches landing-page model: 1=$100, 2=$225, 3=$350, 4=$475
const BUNDLE_PRICE: Record<number, number> = { 1: 100, 2: 225, 3: 350, 4: 475 };

function tier(n: number): { label: string; cls: string; idx: 1 | 2 } {
  if (n <= 3) return { label: "Standard rate", cls: "tier1", idx: 1 };
  return { label: "Best offer · 14% off", cls: "tier2", idx: 2 };
}

export default function AddAccountPage() {
  const [count, setCount] = useState(1);
  const total = BUNDLE_PRICE[count];
  const each = Math.round(total / count);
  const t = tier(count);
  const pct = Math.round(((count - 1) / 3) * 100);
  const checkoutUrl = SQUARE_LINKS[count];

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
            Add up to 4 TikTok accounts per cycle. Each one gets full AM team
            verification, its own dashboard, and individual GMV tracking.
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
            max={4}
            step={1}
            value={count}
            onChange={(e) => setCount(parseInt(e.target.value))}
            style={{
              background: `linear-gradient(to right, #C9A84C ${pct}%, #222 ${pct}%)`,
            }}
            className="add-slider"
          />
          <div className="tier-markers tier-markers-4">
            {[1, 2, 3, 4].map((n) => (
              <div className="tier-mark" key={n}>
                <strong>{n}</strong>
                {n === 1 ? "Account" : "Accounts"}
              </div>
            ))}
          </div>
        </div>

        <div className="tier-breakdown tier-breakdown-2">
          <div className={`tier-box${t.idx === 1 ? " active-tier" : ""}`}>
            <div className="tier-box-top">Tier 1 · 1–3 accounts</div>
            <div className="tier-box-price">$100 <span>/ account</span></div>
            <div className="tier-box-sub">Standard activation rate</div>
          </div>
          <div className={`tier-box${t.idx === 2 ? " active-tier" : ""}`}>
            <div className="tier-box-top">Tier 2 · 4-account bundle</div>
            <div className="tier-box-price">$475 <span>total</span></div>
            <div className="tier-box-sub">Best offer · save vs incremental</div>
          </div>
        </div>

        <div className="includes-list">
          <div className="inc-item">Full AM team activation per account, within 24 hours each</div>
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
        <div className="why-wrap-inner">
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
      </div>
    </main>
  );
}
