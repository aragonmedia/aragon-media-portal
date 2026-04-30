"use client";

import { useState } from "react";

const SQUARE_LINKS: Record<number, string> = {
  1: "https://square.link/u/2rfvqrD1",
  2: "https://square.link/u/qidSjIek",
  3: "https://square.link/u/uiffueYK",
  4: "https://square.link/u/oU70xlPo",
};

// Path A — incremental ladder (each row is a one-off purchase tied to your current cycle position)
const PATH_A_LADDER: { pos: number; price: number; label: string; sub: string }[] = [
  { pos: 1, price: 100, label: "1st account", sub: "First verification" },
  { pos: 2, price: 125, label: "2nd account", sub: "+$125 when added" },
  { pos: 3, price: 150, label: "3rd account", sub: "+$150 when added" },
  { pos: 4, price: 175, label: "4th account", sub: "+$175 when added" },
];
const INCREMENTAL_TOTAL = PATH_A_LADDER.reduce((s, r) => s + r.price, 0); // 550

// Path B — bundle (lock in 1-4 up front, save vs incremental)
const BUNDLE_PRICE: Record<number, number> = { 1: 100, 2: 225, 3: 350, 4: 475 };
const BUNDLE_LABEL: Record<number, string> = {
  1: "Standard",
  2: "Duo",
  3: "Trio",
  4: "Best offer · save 14%",
};

export default function AddAccountPage() {
  const [count, setCount] = useState(4); // default to best offer for impact
  const total = BUNDLE_PRICE[count];
  const incrementalAtCount = PATH_A_LADDER.slice(0, count).reduce((s, r) => s + r.price, 0);
  const savings = incrementalAtCount - total;
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
            Add up to 4 TikTok accounts per cycle. Pick the path that fits how you want to pay.
          </p>
        </div>
      </header>

      <div className="paths-grid">
        {/* === PATH A — incremental === */}
        <section className="path-card">
          <header className="path-head">
            <p className="path-eyebrow">Path A</p>
            <h2>Add one at a time</h2>
            <p className="path-sub">Pay only for the account you&apos;re activating now. Come back any time to add the next one.</p>
          </header>
          <div className="path-ladder">
            {PATH_A_LADDER.map((row) => (
              <div key={row.pos} className={`path-ladder-row${row.pos === 1 ? " first" : ""}`}>
                <div className="path-ladder-num">{row.pos}</div>
                <div className="path-ladder-label">
                  <div className="path-ladder-title">{row.label}</div>
                  <div className="path-ladder-sub">{row.sub}</div>
                </div>
                <div className="path-ladder-price">${row.price}</div>
              </div>
            ))}
          </div>
          <a
            href={SQUARE_LINKS[1]}
            target="_blank"
            rel="noopener noreferrer"
            className="path-cta"
          >
            Activate 1st Account — $100
          </a>
          <p className="path-note">Only the 1st account is purchaseable here. Accounts 2 to 4 unlock after verification. Total if added one-by-one: ${INCREMENTAL_TOTAL}.</p>
        </section>

        {/* === PATH B — bundle === */}
        <section className="path-card path-card-feature">
          <header className="path-head">
            <p className="path-eyebrow">Path B · Most popular</p>
            <h2>Bundle up front</h2>
            <p className="path-sub">Lock in 2, 3, or all 4 accounts now and save vs adding them one by one.</p>
          </header>

          <div className="bundle-summary">
            <div>
              <div className="slider-label">Accounts</div>
              <div className="account-count">{count}</div>
              <div className="account-word">{count === 1 ? "account" : "accounts"}</div>
            </div>
            <div className="bundle-price-block">
              <div className="price-total">${total.toLocaleString()}</div>
              <div className={`price-tier-badge ${count === 4 ? "tier2" : "tier1"}`}>{BUNDLE_LABEL[count]}</div>
              {savings > 0 && (
                <div className="bundle-savings">Save ${savings} vs incremental</div>
              )}
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
              style={{ background: `linear-gradient(to right, #C9A84C ${pct}%, #222 ${pct}%)` }}
              className="add-slider"
            />
            <div className="tier-markers tier-markers-4">
              {[1, 2, 3, 4].map((n) => (
                <button
                  key={n}
                  type="button"
                  className={`tier-mark-btn${count === n ? " active" : ""}`}
                  onClick={() => setCount(n)}
                >
                  <strong>{n}</strong>
                  {n === 1 ? "Account" : "Accounts"}
                </button>
              ))}
            </div>
          </div>

          <a
            href={checkoutUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="path-cta path-cta-feature"
          >
            Bundle Activate {count} {count === 1 ? "Account" : "Accounts"} — ${total.toLocaleString()}
          </a>
          <p className="path-note">Direct Square checkout · No portal account required to pay · Secured by Square</p>
        </section>
      </div>

      {/* === Includes (shared) === */}
      <div className="dash-card">
        <div className="why-wrap-inner">
          <div className="sect-label">Both paths include</div>
          <div className="includes-list">
            <div className="inc-item">Full AM team activation per account, within 24 hours each</div>
            <div className="inc-item">One AM team chat hub for all your accounts — no scattered threads</div>
            <div className="inc-item">Individual GMV and revenue tracking per account on the GMV tab</div>
            <div className="inc-item">Separate progress tracker and withdrawal form per account</div>
          </div>
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
              <p>Every account you verify shows up in this portal. One login, one AM team backing all of them.</p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
