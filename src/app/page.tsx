"use client";

import Link from "next/link";

import { useEffect, useState } from "react";

const BUNDLE_PRICES: Record<number, number> = { 1: 100, 2: 225, 3: 350, 4: 475 };
const INCREMENTAL_TOTALS: Record<number, number> = { 1: 100, 2: 225, 3: 375, 4: 550 };
const SQUARE_LINKS: Record<number, string> = {
  1: "https://square.link/u/2rfvqrD1",
  2: "https://square.link/u/qidSjIek",
  3: "https://square.link/u/uiffueYK",
  4: "https://square.link/u/oU70xlPo",
};

const BADGES: Record<number, { label: string; className: string }> = {
  1: { label: "Starter", className: "bundle-badge" },
  2: { label: "Duo", className: "bundle-badge" },
  3: { label: "Trio", className: "bundle-badge" },
  4: { label: "Best offer \u00b7 14% off", className: "bundle-badge best" },
};

type Partner = { name: string; logo?: string };
const PARTNERS: Partner[] = [
  { name: "TikTok Shop",       logo: "/partners/tiktok-shop.png" },
  { name: "Kyvo",              logo: "/partners/kyvo.png" },
  { name: "Creatify",          logo: "/partners/creatify.png" },
  { name: "4orte",             logo: "/partners/4orte.png" },
  { name: "Creators Corner",   logo: "/partners/creators-corner.png" },
  { name: "C&C",               logo: "/partners/cc.png" },
  { name: "Commission Club",   logo: "/partners/commission-club.png" },
  { name: "Elite Tok Club",    logo: "/partners/elite-tok-club.png" },
  { name: "Goli",              logo: "/partners/goli.png" },
  { name: "Nick G",            logo: "/partners/nick-g.png" },
  { name: "The Accounts Shop", logo: "/partners/accounts-shop.png" },
];

const TESTIMONIALS = [
  { name: "Alkis", role: "Verified Creator", src: "/media/testimonials/alkis.mp4" },
  { name: "Menes", role: "Verified Creator", src: "/media/testimonials/menes.mp4" },
  { name: "Teep",  role: "Verified Creator", src: "/media/testimonials/teep.mp4" },
];
const SHOTS: { label: string; blurb: string; img?: string }[] = [
  { label: "$486.4K GMV \u00b7 Nov 2024",     blurb: "One creator, in 30 days, $152K PROFIT on TikTok Shop.", img: "/media/proof/proof-486k-nov.png" },
  { label: "$125.6K \u00b7 last 7 days",      blurb: "Weekly GMV from an active AM-Member: $36.8K commission.", img: "/media/proof/proof-125k-week.png" },
  { label: "$89.2K \u00b7 Dec 2024",          blurb: "Steady close to the year. $10.5K profit, 5K items sold, 3.7M views.", img: "/media/proof/proof-89k-dec.png" },
  { label: "$27,000 Goli payout",              blurb: "Single-brand payout, what it looks to scale with the AM team.", img: "/media/proof/proof-27k-goli.png" },
  { label: "First $200 day \u00b7 94K views", blurb: "Creator DM after their first viral video lands inside the portal.", img: "/media/proof/proof-94k-viral.png" },
  { label: "$33K withdrawal in motion",        blurb: "Colton Alpha Partner withdrawing $33,000+ and notifying us.", img: "/media/proof/proof-33k-pulled.png" },
  { label: "Kyvo \u00b7 join the program",    blurb: "For the creator, by creators. Kyvo is one of our Top-Commission Partners. Where you can earn 2x Profit!", img: "/media/proof/proof-kyvo-card.png" },
  { label: "Viral content reel",               blurb: "Snapshot of recent AM-Managed videos crossing 100M+ views", img: "/media/proof/proof-views.png" },
];

function formatPrice(n: number) {
  return "$" + n.toLocaleString(undefined, { minimumFractionDigits: n % 1 ? 2 : 0 });
}

export default function Home() {
  const [accounts, setAccounts] = useState(1);
  const [menuOpen, setMenuOpen] = useState(false);

  // If user is already signed in, bounce them to the dashboard so they
  // can't accidentally re-use the public pricing slider (loophole guard)
  useEffect(() => {
    if (typeof document === "undefined") return;
    const hasSession = document.cookie.split(";").some((c) => c.trim().startsWith("am_session="));
    if (hasSession) {
      window.location.href = "/dashboard";
    }
  }, []);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  const price = BUNDLE_PRICES[accounts];
  const savings = +(INCREMENTAL_TOTALS[accounts] - price).toFixed(2);
  const badge = BADGES[accounts];
  const pct = Math.round(((accounts - 1) / 3) * 100);

  return (
    <>
      <nav className={`${menuOpen ? "nav-open " : ""}${scrolled ? "nav-scrolled" : ""}`}>
        <Link href="/" className="logo-block" onClick={() => setMenuOpen(false)}>
          <span className="logo-mark" aria-hidden="true">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/logo-am.svg" alt="" width={36} height={36} />
          </span>
          <span className="logo-text">
            Aragon Media<span>Creator Partner Program</span>
          </span>
        </Link>

        <div className="nav-right">
          <Link href="/signup" className="nav-link">Sign up</Link>
          <Link href="/signin" className="nav-link">Sign in</Link>
          <Link href="/book-a-demo" className="nav-cta">Book a Demo</Link>
        </div>

        <button
          type="button"
          className="nav-toggle"
          aria-label={menuOpen ? "Close menu" : "Open menu"}
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen((v) => !v)}
        >
          <span /><span /><span />
        </button>

        <div className="nav-mobile-panel" role="menu">
          <Link href="/signup" className="nav-link" onClick={() => setMenuOpen(false)}>Sign up</Link>
          <Link href="/signin" className="nav-link" onClick={() => setMenuOpen(false)}>Sign in</Link>
          <Link href="/book-a-demo" className="nav-cta" onClick={() => setMenuOpen(false)}>Book a Demo</Link>
        </div>
      </nav>

      <section className="hero">
        <div className="hero-grid">
          <div className="hero-copy">
            <p className="eyebrow">Aragon Media Partner Program</p>
            <h1>Your TikTok business,<br /><em>professionally managed.</em></h1>
            <p className="hero-sub">
              We activate your TikTok Account, track GMV, and move commissions into your bank, so you can earn USD income from anywhere in the world while we handle the ops.
            </p>
            <div className="hero-actions">
              <Link href="/signup" className="btn-primary">Get started</Link>
              <a href="#journey" className="btn-ghost">&darr; See how it works</a>
            </div>
            <div className="hero-stats">
              <div className="hero-stat"><strong>24hr</strong>Activation guarantee</div>
              <div className="hero-stat"><strong>100%</strong>Completion success rate</div>
              <div className="hero-stat"><strong>USD</strong>Paid anywhere in the world</div>
              <div className="hero-stat"><strong>TAP</strong>Official TikTok Partner</div>
            </div>
          </div>

          <div className="hero-visual" aria-hidden="true">
            <div className="phone-mock">
              <div className="phone-notch" />
              <div className="phone-screen">
                <div className="phone-pill">Aragon Dashboard</div>

                <div className="phone-stat-card">
                  <div className="phone-stat-label">Total GMV</div>
                  <div className="phone-stat-value">$48,200</div>
                  <div className="phone-trend up">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="3 17 10 10 14 14 21 7" />
                      <polyline points="14 7 21 7 21 14" />
                    </svg>
                    +$15,900 this month
                  </div>
                </div>

                <div className="phone-stat-card">
                  <div className="phone-stat-label">Conversion Rate</div>
                  <div className="phone-stat-value sm">4.8%</div>
                  <div className="phone-bars">
                    <span style={{ height: "30%" }} />
                    <span style={{ height: "55%" }} />
                    <span style={{ height: "42%" }} />
                    <span style={{ height: "78%" }} />
                    <span style={{ height: "62%" }} />
                    <span style={{ height: "92%" }} />
                  </div>
                </div>

                <div className="phone-stat-card">
                  <div className="phone-stat-label">Campaign Revenue</div>
                  <div className="phone-stat-value sm green">$12,300</div>
                  <div className="phone-trend up">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="3 17 10 10 14 14 21 7" />
                      <polyline points="14 7 21 7 21 14" />
                    </svg>
                    +24% vs last month
                  </div>
                </div>
              </div>
            </div>

            <div className="float-card float-card--reports">
              <div className="float-card-title">Our Reports</div>
              <div className="float-card-sub">Your analytics view</div>
              <svg className="float-spark" viewBox="0 0 120 50" preserveAspectRatio="none">
                <polyline points="0,40 20,30 40,32 60,18 80,22 100,12 120,8" fill="none" stroke="#3DCF82" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <div className="float-card-meta">+1.17% increased</div>
            </div>

            <div className="float-card float-card--conversion">
              <div className="float-card-title">Conversion Rates</div>
              <div className="float-bar">
                <span style={{ width: "72%" }} />
              </div>
              <div className="float-card-sub">95.5%</div>
            </div>

            <div className="float-card float-card--increase">
              <div className="float-card-pill">+$15,900</div>
              <div className="float-card-sub">monthly delta</div>
            </div>
          </div>
        </div>
      </section>

      <div className="partner-band">
        <p className="partner-label">Partnered with</p>
        <div className="marquee">
          <div className="marquee-track">
            {PARTNERS.map((p) => (
              <span key={p.name} className="partner-chip">
                {p.logo ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={p.logo} alt={p.name} loading="lazy" />
                ) : (
                  <span className="partner-wordmark">{p.name}</span>
                )}
              </span>
            ))}
          </div>
          <div className="marquee-track" aria-hidden="true">
            {PARTNERS.map((p) => (
              <span key={`b-${p.name}`} className="partner-chip">
                {p.logo ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={p.logo} alt="" loading="lazy" />
                ) : (
                  <span className="partner-wordmark">{p.name}</span>
                )}
              </span>
            ))}
          </div>
        </div>
      </div>

      <section className="section" id="journey">
        <p className="section-label">Your journey with Aragon Media</p>
        <h2>Four steps from signup to <em>earning commissions.</em></h2>
        <p className="section-intro">
          Every stage is handled inside one portal. No scattered DMs, no manual spreadsheets, no guessing what happens next. Here&apos;s the whole flow, with what you unlock at each step.
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
            <Link href="/signup" className="journey-cta">SIGN UP HERE</Link>
          </div>
          <div className="journey-card">
            <div className="journey-step"><div className="journey-num">2</div><div className="journey-title">Choose your path</div></div>
            <p className="journey-desc">Add accounts one at a time or bundle up front. Pay securely via Square as a one-time fee.</p>
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

      <section className="section" style={{ paddingBottom: 16 }}>
        <p className="section-label">Aragon Media · Account verification</p>
        <h2>Scale your TikTok presence, <em>multiply your reach.</em></h2>
        <p className="section-intro">
          Add up to 4 TikTok accounts per cycle. Pick the path that fits how you want to pay.
        </p>
      </section>

      {/* Replicates /dashboard/add-account exactly per Kevin's spec */}
      <div className="pricing-wrap">
        <div className="lander-paths">
          <div className="lander-path lander-path-a">
            <p className="card-label">Path A</p>
            <h3 className="lander-path-title">Add one at a time</h3>
            <p className="lander-path-sub">Pay only for the account you&apos;re activating now. The next price unlocks once each prior account is verified.</p>
            <div className="lander-ladder">
              <div className="lander-rung lander-rung-active">
                <div className="lander-rung-num">1</div>
                <div className="lander-rung-label">
                  <span>1st account</span>
                  <small>Active &mdash; your next purchase</small>
                </div>
                <div className="lander-rung-price lander-rung-price-active">$100</div>
              </div>
              <div className="lander-rung lander-rung-locked">
                <div className="lander-rung-num">2</div>
                <div className="lander-rung-label">
                  <span>2nd account</span>
                  <small>Unlocks after 1st</small>
                </div>
                <div className="lander-rung-price">$125</div>
              </div>
              <div className="lander-rung lander-rung-locked">
                <div className="lander-rung-num">3</div>
                <div className="lander-rung-label">
                  <span>3rd account</span>
                  <small>Unlocks after 2nd</small>
                </div>
                <div className="lander-rung-price">$150</div>
              </div>
              <div className="lander-rung lander-rung-locked">
                <div className="lander-rung-num">4</div>
                <div className="lander-rung-label">
                  <span>4th account</span>
                  <small>Unlocks after 3rd</small>
                </div>
                <div className="lander-rung-price">$175</div>
              </div>
            </div>
            <a
              href={SQUARE_LINKS[1]}
              target="_blank"
              rel="noopener noreferrer"
              className="lander-path-cta"
            >
              ACTIVATE 1ST ACCOUNT &mdash; $100
            </a>
            <p className="lander-path-foot">Total if added one-by-one: $550 per cycle.</p>
          </div>

          <div className="lander-path lander-path-b">
            <p className="card-label">Path B &middot; Most popular</p>
            <h3 className="lander-path-title">Bundle up front</h3>
            <p className="lander-path-sub">Lock in 2, 3, or all 4 accounts now and save vs adding them one by one.</p>

            <div className="lander-bundle-top">
              <div>
                <div className="card-label" style={{ marginBottom: 6 }}>Accounts</div>
                <div className="lander-bundle-count">{accounts}</div>
                <div className="lander-bundle-word">{accounts === 1 ? "account" : "accounts"}</div>
              </div>
              <div className="lander-bundle-price-wrap">
                <div className="lander-bundle-price">{formatPrice(price)}</div>
                {savings > 0 && (
                  <div className="lander-bundle-best">{badge.label}</div>
                )}
                {savings > 0 && (
                  <div className="lander-bundle-savings">SAVE ${savings.toFixed(0)} VS INCREMENTAL</div>
                )}
              </div>
            </div>

            <div className="range-wrap lander-range">
              <input
                type="range"
                min={1}
                max={4}
                step={1}
                value={accounts}
                onChange={(e) => setAccounts(parseInt(e.target.value))}
                style={{ background: `linear-gradient(to right, #C9A84C ${pct}%, #2A2A2A ${pct}%)` }}
              />
              <div className="tier-markers lander-markers">
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

            <a
              href={SQUARE_LINKS[accounts]}
              target="_blank"
              rel="noopener noreferrer"
              className="lander-path-cta lander-path-cta-bundle"
            >
              BUNDLE ACTIVATE {accounts} {accounts === 1 ? "ACCOUNT" : "ACCOUNTS"} &mdash; {formatPrice(price)}
            </a>
            <p className="lander-path-foot">Direct Square checkout &middot; No portal account required to pay &middot; Secured by Square</p>
          </div>
        </div>

        {/* Both paths include — matches /dashboard/add-account, more padding so text isn't kissing the frame */}
        <div className="lander-includes-card">
          <p className="lander-includes-label">Both paths include</p>
          <ul className="lander-includes-list">
            <li><span className="lander-include-check">✓</span>Full AM team activation per account, within 24 hours each</li>
            <li><span className="lander-include-check">✓</span>One AM team chat hub for all your accounts</li>
            <li><span className="lander-include-check">✓</span>Individual GMV and revenue tracking per account</li>
            <li><span className="lander-include-check">✓</span>Separate progress tracker and withdrawal form per account</li>
          </ul>
        </div>

        {/* Why verify more accounts? — matches dashboard, more padding */}
        <div className="lander-why-card">
          <p className="lander-includes-label">Why verify more accounts?</p>
          <div className="lander-why-grid">
            <div className="lander-why-tile">
              <div className="lander-why-num">01</div>
              <h4>Multiple niches, multiple income streams</h4>
              <p>Different TikTok accounts let you test different audiences, products, and content styles. Each one earns commissions independently.</p>
            </div>
            <div className="lander-why-tile">
              <div className="lander-why-num">02</div>
              <h4>Protect your primary account</h4>
              <p>If one account faces a restriction, your other verified accounts stay active and earning while AM resolves it on your behalf.</p>
            </div>
            <div className="lander-why-tile">
              <div className="lander-why-num">03</div>
              <h4>All managed in one place</h4>
              <p>Every account we verify for you shows up in this portal. One login, one AM team backing all of them.</p>
            </div>
          </div>
        </div>
      </div>

<section className="testi-section">
        <p className="section-label">From the creators we work with</p>
        <h2>Hear it <em>from them.</em></h2>
        <p className="section-intro">Real Creators, Real Activations, Real Payouts.<br />Swipe through their experience.</p>
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
        <p className="why-label">Receipts from the field</p>
        <h3 className="shots-title">Real dashboards. Real payouts. Real creator wins.</h3>
        <p className="shots-intro">Every tile below is a verified moment from an Aragon-managed account: a six-figure GMV month, a USD payout landing in a bank, a creator DM after their first big week. Numbers redacted only when the creator asked.</p>
        <div className="shots-grid">
          {SHOTS.map((shot) => (
            <figure key={shot.label} className="shot-tile">
              <div className="shot-img-wrap">
                {shot.img ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={shot.img} alt={shot.label} loading="lazy" />
                ) : (
                  <div className="shot-placeholder">{shot.label}</div>
                )}
              </div>
              <figcaption>
                <div className="shot-headline">{shot.label}</div>
                <div className="shot-blurb">{shot.blurb}</div>
              </figcaption>
            </figure>
          ))}
        </div>
      </div>

      <footer>
        <div className="footer-brand">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo-am.svg" alt="Aragon Media" width={40} height={40} className="footer-logo" />
          <div className="logo">Aragon Media<span>Creator Partner Program &middot; Est. 2025</span></div>
        </div>
        <nav className="footer-nav" aria-label="Footer">
          <Link href="/signin">Sign in</Link>
          <Link href="/signup">Sign up</Link>
          <Link href="/book-a-demo">Book a Demo</Link>
          <Link href="/privacy">Privacy</Link>
          <Link href="/terms">Terms</Link>
        </nav>
        <div className="footer-meta">
          <strong>&copy; 2025 Aragon Media</strong>
          <span>1309 Coffeen Ave, Sheridan, WY 82801</span>
          <span>Activation &middot; Dashboard &middot; TikTok Partner Program</span>
        </div>
      </footer>
    </>
  );
}
