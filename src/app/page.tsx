"use client";

import { useState } from "react";

const BUNDLE_PRICES: Record<number, number> = { 1: 103.72, 2: 225, 3: 350, 4: 475 };
const INCREMENTAL_TOTALS: Record<number, number> = { 1: 103.72, 2: 228.72, 3: 378.72, 4: 553.72 };

const BADGES: Record<number, { label: string; className: string }> = {
  1: { label: "Starter", className: "bundle-badge" },
  2: { label: "Duo", className: "bundle-badge" },
  3: { label: "Trio", className: "bundle-badge" },
  4: { label: "Best offer \u00b7 14% off", className: "bundle-badge best" },
};

const PARTNERS = [
  "TikTok Shop",
  "Kyvo",
  "Creatify",
  "4orte",
  "Creators Corner",
  "C&C",
  "Elite Tok Club",
  "Goli",
  "Nick G",
  "The Accounts Shop",
];

const TESTIMONIALS = [
  { name: "Alkis", role: "Verified Creator", src: "/media/testimonials/alkis.mp4" },
  { name: "Menes", role: "Verified Creator", src: "/media/testimonials/menes.mp4" },
  { name: "Teep",  role: "Verified Creator", src: "/media/testimonials/teep.mp4" },
];

function formatPrice(n: number) {
  return "$" + n.toLocaleString(undefined, { minimumFractionDigits: n % 1 ? 2 : 0 });
}

export default function Home() {
  const [accounts, setAccounts] = useState(1);
  const price = BUNDLE_PRICES[accounts];
  const savings = +(INCREMENTAL_TOTALS[accounts] - price).toFixed(2);
  const badge = BADGES[accounts];
  const pct = Math.round(((accounts - 1) / 3) * 100);

  return (
    <>
      <nav>
        <div className="logo">Aragon Media<span>Creator Partner Program</span></div>
        <div className="nav-right">
          <a href="/signup" className="nav-link">Sign up</a>
          <a href="/signin" className="nav-link">Sign in</a>
          <a href="/book-a-demo" className="nav-cta">Book a Demo</a>
        </div>
      </nav>

      <section className="hero">
        <p className="eyebrow">Aragon Media Partner Program</p>
        <h1>Your TikTok business,<br /><em>professionally managed.</em></h1>
        <p className="hero-sub">
          We activate your creator account, track your GMV, and move your commissions into your bank &mdash; so you can earn USD income from anywhere in the world while we handle the ops.
        </p>
        <div className="hero-actions">
          <a href="/signup" className="btn-primary">Get started</a>
          <a href="#journey" className="btn-ghost">&darr; See how it works</a>
        </div>
        <div className="hero-stats">
          <div className="hero-stat"><strong>24hr</strong>Activation guarantee</div>
          <div className="hero-stat"><strong>100%</strong>Completion success rate</div>
          <div className="hero-stat"><strong>USD</strong>Paid anywhere in the world</div>
          <div className="hero-stat"><strong>TAP</strong>Official TikTok Partner</div>
        </div>
      </section>

      <div className="partner-band">
        <p className="partner-label">Partnered with</p>
        <div className="marquee">
          <div className="marquee-track">
            {PARTNERS.map((p) => (<span key={p} className="partner-wordmark">{p}</span>))}
          </div>
          <div className="marquee-track" aria-hidden="true">
            {PARTNERS.map((p) => (<span key={`b-${p}`} className="partner-wordmark">{p}</span>))}
          </div>
        </div>
      </div>

      <section className="section" id="journey">
        <p className="section-label">Your journey with Aragon Media</p>
        <h2>Four steps from signup to <em>earning commissions.</em></h2>
        <p className="section-intro">
          Every stage is handled inside one portal. No scattered DMs, no manual spreadsheets, no guessing what happens next &mdash; here&apos;s the whole flow, with what you unlock at each step.
        </p>
        <div className="journey-grid">
          <div className="journey-card">
            <div className="journey-step"><div className="journey-num">1</div><div className="journey-title">Create your account</div></div>
            <p className="journey-desc">Free email signup. A 6-digit verification code lands in your inbox within seconds.</p>
            <ul className="journey-features">
              <li>Secure portal login</li>
              <li>Personal creator profile</li>
              <li>Zero commitment until activation</li>
            </ul>
          </div>
          <div className="journey-card">
            <div className="journey-step"><div className="journey-num">2</div><div className="journey-title">Choose your path</div></div>
            <p className="journey-desc">Add accounts one at a time or bundle up front. Pay securely via Square &mdash; one-time fee.</p>
            <ul className="journey-features">
              <li>Incremental or bundle pricing</li>
              <li>Up to 4 accounts per cycle</li>
              <li>Instant Square checkout</li>
            </ul>
          </div>
          <div className="journey-card">
            <div className="journey-step"><div className="journey-num">3</div><div className="journey-title">We activate your account</div></div>
            <p className="journey-desc">Your private thread opens with the AM team. Verification completes within 24 hours, guaranteed.</p>
            <ul className="journey-features">
              <li>Dedicated 1-on-1 support thread</li>
              <li>24-hour activation SLA</li>
              <li>Screenshot-verified handoff</li>
            </ul>
          </div>
          <div className="journey-card">
            <div className="journey-step"><div className="journey-num">4</div><div className="journey-title">Track &amp; get paid</div></div>
            <p className="journey-desc">Sign the partner contract, watch your GMV update live, and request withdrawals when you&apos;re ready.</p>
            <ul className="journey-features">
              <li>Real-time GMV dashboard</li>
              <li>Per-account revenue breakdown</li>
              <li>Mon&ndash;Fri USD payouts to your bank</li>
            </ul>
          </div>
        </div>
      </section>

      <div className="divider"></div>

      <section className="section" style={{ paddingBottom: 32 }}>
        <p className="section-label">Pricing</p>
        <h2>Activate one account, or <em>bundle and save.</em></h2>
        <p className="section-intro">
          Every account within a 4-account cycle gets the same premium service. Add them one at a time at the incremental rate &mdash; or bundle up front and pay less overall.
        </p>
      </section>

      <div className="pricing-wrap">
        <div className="pricing-grid">
          <div className="ladder-card">
            <p className="card-label">Path A</p>
            <h3 className="card-title">Add one at a time</h3>
            <p className="card-sub">Pay only for the account you&apos;re activating now. You can come back and add up to 4 per cycle.</p>
            <div className="ladder-list">
              <div className="ladder-row"><div className="ladder-left"><div className="ladder-num">1</div><div className="ladder-label">1st account<small>First verification</small></div></div><div className="ladder-price">$103.72</div></div>
              <div className="ladder-row"><div className="ladder-left"><div className="ladder-num">2</div><div className="ladder-label">2nd account<small>+$125 when added</small></div></div><div className="ladder-price">$125</div></div>
              <div className="ladder-row"><div className="ladder-left"><div className="ladder-num">3</div><div className="ladder-label">3rd account<small>+$150 when added</small></div></div><div className="ladder-price">$150</div></div>
              <div className="ladder-row"><div className="ladder-left"><div className="ladder-num">4</div><div className="ladder-label">4th account<small>+$175 when added</small></div></div><div className="ladder-price">$175</div></div>
            </div>
            <p className="ladder-note">Cycle resets after your 4th account &mdash; the 5th starts back at $103.72.</p>
          </div>

          <div className="bundle-card">
            <p className="card-label">Path B &middot; Most popular</p>
            <h3 className="card-title">Bundle up front</h3>
            <p className="card-sub">Lock in 2, 3, or all 4 accounts now and save compared to adding them one by one.</p>

            <div className="bundle-top">
              <div>
                <div className="card-label" style={{ marginBottom: 6 }}>Accounts</div>
                <div className="bundle-count">{accounts}</div>
                <div className="bundle-word">{accounts === 1 ? "account" : "accounts"}</div>
              </div>
              <div className="bundle-price-wrap">
                <div className="bundle-savings" style={{ visibility: savings > 0 ? "visible" : "hidden" }}>
                  Save ${savings.toFixed(2)}
                </div>
                <div className="bundle-price">{formatPrice(price)}</div>
                <div className={badge.className}>{badge.label}</div>
              </div>
            </div>

            <div className="range-wrap">
              <input
                type="range"
                min={1}
                max={4}
                step={1}
                value={accounts}
                onChange={(e) => setAccounts(parseInt(e.target.value))}
                style={{ background: `linear-gradient(to right, #C9A84C ${pct}%, #2A2A2A ${pct}%)` }}
              />
              <div className="tier-markers">
                {[1, 2, 3, 4].map((n) => (
                  <div
                    key={n}
                    className={`tier-mark${accounts === n ? " active" : ""}`}
                    onClick={() => setAccounts(n)}
                  >
                    <strong>{n}</strong>{n === 1 ? "Account" : "Accounts"}
                  </div>
                ))}
              </div>
            </div>

            <a href="/signup" className="bundle-cta">
              Get started &mdash; {formatPrice(price)}
            </a>
            <p className="bundle-note">Create your account first &middot; Payment completes after signup &middot; Secured by Square</p>
          </div>
        </div>

        <div className="why-wrap">
          <div className="why-label">Why bundle is the smarter choice</div>
          <div className="why-grid">
            <div className="why-card"><div className="why-num">01</div><h4>Multiple niches, multiple income streams</h4><p>Different accounts let you test different audiences, products, and content styles &mdash; each earning commissions independently.</p></div>
            <div className="why-card"><div className="why-num">02</div><h4>Protect your primary account</h4><p>If one account hits a restriction or review, your others stay active and earning while the AM team resolves it on your behalf.</p></div>
            <div className="why-card"><div className="why-num">03</div><h4>All managed in one place</h4><p>Every verified account lives in this portal &mdash; separate dashboards, one login, one AM team backing all of them.</p></div>
          </div>
        </div>
      </div>

      <div className="compare-wrap">
        <p className="why-label">With Aragon Media vs. without</p>
        <div className="compare-card">
          <div className="compare-col ours">
            <div className="compare-col-header"><span className="compare-col-icon">✅</span><h4>With Aragon Media</h4></div>
            <ul className="compare-list ours">
              <li><span className="compare-mark check">✅</span>Verified within 24 hours</li>
              <li><span className="compare-mark check">✅</span>Real-time GMV dashboard, built-in</li>
              <li><span className="compare-mark check">✅</span>USD payouts to your bank, Mon&ndash;Fri</li>
              <li><span className="compare-mark check">✅</span>Dedicated support thread with team</li>
              <li><span className="compare-mark check">✅</span>Up to 4 verified accounts at once</li>
            </ul>
          </div>
          <div className="compare-col theirs">
            <div className="compare-col-header"><span className="compare-col-icon">❌</span><h4>Without AM&apos;s Help</h4></div>
            <ul className="compare-list theirs">
              <li><span className="compare-mark cross">❌</span>Weeks of waiting and downtime</li>
              <li><span className="compare-mark cross">❌</span>Unreliable tracking and miscommunication</li>
              <li><span className="compare-mark cross">❌</span>TikTok payout limits, regional friction with 1%</li>
              <li><span className="compare-mark cross">❌</span>Cold support tickets, DMs, and groupchats</li>
              <li><span className="compare-mark cross">❌</span>Stacked percentages, surprise deductions</li>
            </ul>
          </div>
        </div>
      </div>

      <section className="testi-section">
        <p className="section-label">From the creators we work with</p>
        <h2>Hear it <em>from them.</em></h2>
        <p className="section-intro">Real creators, real activations, real payouts. Swipe through their stories.</p>
        <div className="testi-grid">
          {TESTIMONIALS.map((t) => (
            <div key={t.name} className="testi-card">
              <video className="testi-video" controls preload="metadata" playsInline>
                <source src={t.src} type="video/mp4" />
                Your browser does not support this video format.
              </video>
              <div className="testi-meta">
                <div className="testi-name">{t.name}</div>
                <div className="testi-role">{t.role}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <div className="shots-wrap">
        <p className="why-label">Proof in screenshots</p>
        <p className="shots-intro">GMV dashboards, earnings screens, and creator messages from active accounts &mdash; screenshot files drop into <code style={{ color: "var(--gold)", fontFamily: "monospace", fontSize: 12 }}>public/media/proof/</code> once uploaded.</p>
        <div className="shots-grid">
          <div className="shot-placeholder">$486K GMV &mdash; Nov 2024</div>
          <div className="shot-placeholder">$15,801 withdrawal screen</div>
          <div className="shot-placeholder">$125K weekly GMV</div>
          <div className="shot-placeholder">$89K Dec 2024 totals</div>
          <div className="shot-placeholder">Kyvo 216K / 30 days</div>
          <div className="shot-placeholder">$27K Goli payout</div>
          <div className="shot-placeholder">Creator DM &mdash; heaven sent</div>
          <div className="shot-placeholder">$137K July GMV</div>
        </div>
      </div>

      <footer>
        <div className="logo">Aragon Media<span>Creator Partner Program &middot; Est. 2025</span></div>
        <div className="footer-meta">
          <strong>&copy; 2025 Aragon Media</strong><br />
          Activation &middot; Dashboard &middot; TikTok Partner Program<br />
          Washington State, USA
        </div>
      </footer>
    </>
  );
}
