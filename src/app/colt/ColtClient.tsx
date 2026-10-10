"use client";

/**
 * TTSUnlocked — Powered by COLT
 * ------------------------------------------------------------
 * Reuses the taa-* design tokens from /accounts/accelerator.css,
 * overridden to a neon blue palette in colt.css. Shares the
 * chatroom + intent capture backend via accelerator="colt" slug.
 *
 * TODO: refactor shared Styles() into one file so Roni + COLT
 * dedupe. For now it's a scoped copy.
 */

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

type ChatStatus = "gate" | "sending" | "open";
type Tier = "edu_only" | "edu_plus_account" | "browse";

const SLUG = "colt";
const CAL = "https://calendly.com/itskevinaragon/30min";

const TIERS: Array<{ id: Tier; label: string; priceLabel: string; features: string[]; popular?: boolean }> = [
  { id: "edu_only", label: "Education Only", priceLabel: "$1,597", features: ["Step by step training", "TTS best practices", "Creator resources & guides"] },
  { id: "edu_plus_account", label: "Education + Verified Account", priceLabel: "$1,997", popular: true, features: ["Full training program", "TikTok Shop account setup", "Verification support", "Ongoing guidance"] },
  { id: "browse", label: "Accounts Only", priceLabel: "$650–$1K+", features: ["Verified TikTok Shop accounts", "Ready to go (US market)", "Instant access"] },
];

export default function ColtClient() {
  return (
    <div className="colt-shell ac-shell">
      <Backdrop />
      <Header />
      <Hero />
      <Partners />
      <Stats />
      <Pricing />
      <InlineChat />
      <SevenDay />
      <Testimonials />
      <Wins />
      <FAQ />
      <Footer />
      <ChatWidget />
      <Styles />
      <ColtOverrides />
    </div>
  );
}

function Backdrop() {
  return (
    <div className="taa-bg" aria-hidden>
      <div className="taa-grid" />
      <div className="taa-radar" />
    </div>
  );
}

function Header() {
  return (
    <header className="ac-header">
      <div className="ac-header-inner">
        <div className="ac-header-brand">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/colt/logo-tu.png" alt="TTSUnlocked" width={44} height={44} className="colt-logo-img" />
          <span className="ac-brand-tag">
            <small>TTS</small>
            <b>UNLOCKED</b>
          </span>
          <span className="ac-brand-x">×</span>
          <span className="ac-brand-tag">
            <small>POWERED BY</small>
            <b>COLT</b>
          </span>
        </div>
        <nav className="ac-header-nav">
          <a href="#pricing" className="ac-nav-link">Pricing</a>
          <a href="#how" className="ac-nav-link">How it works</a>
          <a href="#talk" className="ac-nav-link">Talk to us</a>
          <Link href="/accounts?from=colt" className="ac-nav-cta">Browse accounts →</Link>
        </nav>
      </div>
    </header>
  );
}

function Hero() {
  return (
    <section className="ac-hero">
      <div className="ac-hero-eyebrow">TTSUNLOCKED × POWERED BY COLT</div>
      <h1 className="ac-hero-title">
        Unlock US TikTok Shop. <span className="ac-accent">From anywhere.</span>
        <br />
        <span className="ac-hero-sub-line">In 7 days.</span>
      </h1>
      <p className="ac-hero-sub">
        The operating system for creators <strong>outside the US</strong> to earn <strong>USD commissions</strong> on TikTok Shop. Verified account, done-with-you setup, and a global creator community. Activation in <strong>24 hours</strong>.
      </p>
      <div className="ac-hero-cta-row">
        <a href="#pricing" className="ac-cta-primary">Apply now →</a>
        <a href="#how" className="ac-cta-ghost">How it works</a>
      </div>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/colt/hero-banner.png" alt="TTSUnlocked" className="colt-hero-banner" />
    </section>
  );
}

function Stats() {
  return (
    <section className="colt-stats-wrap">
      <div className="colt-stats">
        <div className="colt-stat"><div className="colt-stat-num">500+</div><div className="colt-stat-label">Creators activated</div></div>
        <div className="colt-stat"><div className="colt-stat-num">100%</div><div className="colt-stat-label">Activation rate</div></div>
        <div className="colt-stat"><div className="colt-stat-num">24 HR</div><div className="colt-stat-label">Setup</div></div>
        <div className="colt-stat"><div className="colt-stat-num">USD</div><div className="colt-stat-label">Paid direct</div></div>
      </div>
    </section>
  );
}

function Pricing() {
  const [busy, setBusy] = useState<Tier | null>(null);
  async function pick(tier: Tier) {
    setBusy(tier);
    try {
      const res = await fetch("/api/accelerator/intent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "click", tier, accelerator: SLUG }),
      });
      const j = await res.json();
      if (j.ok && j.checkoutUrl) window.location.assign(j.checkoutUrl);
      else alert(j.error || "Please drop your email in the chat below first so we can prep your account.");
    } finally { setBusy(null); }
  }
  return (
    <section className="ac-pricing" id="pricing">
      <div className="ac-pricing-head">
        <p className="ac-section-eyebrow">PRICING</p>
        <h2 className="ac-section-title">Choose <span className="ac-accent">your path.</span></h2>
        <p className="ac-section-sub">Flexible options to fit your goals. All plans give you access to TikTok Shop&apos;s global marketplace and earning potential.</p>
      </div>
      <div className="ac-pricing-grid">
        {TIERS.map((t) => (
          <div key={t.id} className={`ac-tier${t.popular ? " ac-tier-popular" : ""}`}>
            {t.popular && <div className="ac-tier-tag">MOST POPULAR</div>}
            <h3 className="ac-tier-label">{t.label}</h3>
            <div className="ac-tier-price">{t.priceLabel}</div>
            <ul className="ac-tier-features">
              {t.features.map((f) => (<li key={f}>{f}</li>))}
            </ul>
            <button className={`ac-tier-cta${t.popular ? " ac-cta-primary" : " ac-cta-ghost"}`} onClick={() => pick(t.id)} disabled={busy !== null}>
              {busy === t.id ? "Opening…" : "Apply now →"}
            </button>
          </div>
        ))}
      </div>
    </section>
  );
}

function SevenDay() {
  const steps = [
    { d: "DAY 1", t: "Enroll & unlock", b: "Submit your application and get approved." },
    { d: "DAY 2", t: "Set up", b: "Create your account and complete verification." },
    { d: "DAY 3", t: "Activate", b: "Your TikTok Shop account goes live." },
    { d: "DAY 4–7", t: "Start earning", b: "Post UGC, showcase products, and start earning USD." },
  ];
  return (
    <section className="ac-how" id="how">
      <div className="ac-how-head">
        <p className="ac-section-eyebrow">THE 7-DAY PATH</p>
        <h2 className="ac-section-title">From sign-up to <span className="ac-accent">earnings.</span></h2>
      </div>
      <div className="ac-how-steps">
        {steps.map((s, i) => (
          <div key={i} className="ac-how-step">
            <div className="ac-how-step-num">{i + 1}</div>
            <div className="ac-how-step-day">{s.d}</div>
            <div className="ac-how-step-title">{s.t}</div>
            <div className="ac-how-step-body">{s.b}</div>
          </div>
        ))}
      </div>
    </section>
  );
}

function InlineChat() {
  const [status, setStatus] = useState<ChatStatus>("gate");
  const [form, setForm] = useState({ name: "", email: "" });
  const [thread, setThread] = useState<{ id: string; email: string; name: string } | null>(null);
  const [msgs, setMsgs] = useState<Array<{ id: string; sender: string; body: string; createdAt: string }>>([]);
  const [composer, setComposer] = useState("");
  const [error, setError] = useState<string | null>(null);
  const feedRef = useRef<HTMLDivElement>(null);

  useEffect(() => { try { const em = localStorage.getItem("am_chatroom_email") ?? ""; const nm = localStorage.getItem("am_chatroom_name") ?? ""; if (em) setForm({ name: nm, email: em }); } catch {} }, []);
  useEffect(() => { feedRef.current?.scrollTo({ top: feedRef.current.scrollHeight, behavior: "smooth" }); }, [msgs.length]);

  const openThread = useCallback(async () => {
    setError(null);
    try {
      fetch("/api/accelerator/intent", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "reveal", name: form.name.trim(), email: form.email.trim(), accelerator: SLUG }),
      }).catch(() => {});
      const res = await fetch("/api/chatroom/threads", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: form.email.trim(), name: form.name.trim() }),
      });
      const j = await res.json();
      if (!j.ok) throw new Error(j.error || "Couldn't open the chat.");
      setThread(j.thread); setMsgs(j.messages); setStatus("open");
      try { localStorage.setItem("am_chatroom_email", form.email.trim()); localStorage.setItem("am_chatroom_name", form.name.trim()); } catch {}
    } catch (e) { setError(e instanceof Error ? e.message : "Something went wrong."); }
  }, [form.email, form.name]);

  async function send() {
    if (!thread || !composer.trim() || status === "sending") return;
    const text = composer.trim();
    setStatus("sending"); setError(null);
    try {
      const res = await fetch("/api/chatroom/messages", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ threadId: thread.id, body: text }),
      });
      const j = await res.json();
      if (!j.ok) throw new Error(j.error || "Send failed.");
      setMsgs((cur) => [...cur, j.message]);
      setComposer("");
    } catch (err) { setError(err instanceof Error ? err.message : "Send failed."); } finally { setStatus("open"); }
  }

  return (
    <section className="ac-inline-chat" id="talk">
      <div className="ac-inline-chat-head">
        <p className="ac-section-eyebrow">TALK TO US LIVE</p>
        <h2 className="ac-section-title">Questions? <span className="ac-accent">Send it.</span></h2>
        <p className="ac-section-sub">The TTSUnlocked team is here. Drop your name and email, then chat with us directly.</p>
      </div>
      <div className="ac-inline-chat-card">
        <div className="ac-inline-chat-side">
          <div className="ac-inline-chat-bullets">
            <div className="ac-inline-chat-bullet"><span className="ac-inline-chat-dot" /><div><b>Fast replies.</b><span>The team responds the same day.</span></div></div>
            <div className="ac-inline-chat-bullet"><span className="ac-inline-chat-dot" /><div><b>No pitch.</b><span>Ask anything about tiers, timing, or process.</span></div></div>
            <div className="ac-inline-chat-bullet"><span className="ac-inline-chat-dot" /><div><b>Prefer a call?</b><span>Book a 30-min meeting below.</span></div></div>
          </div>
          <a href={CAL} target="_blank" rel="noopener noreferrer" className="ac-cta-ghost ac-inline-chat-book">Book a 30-min call →</a>
        </div>
        <div className="ac-inline-chat-panel">
          <div className="ac-inline-chat-head-strip">
            <span className="ac-inline-chat-live-dot" />
            <div><div className="ac-inline-chat-title">Chat with TTSUnlocked</div><div className="ac-inline-chat-sub">We&apos;ll email you when we reply.</div></div>
          </div>
          {status === "gate" ? (
            <form className="ac-inline-chat-gate" onSubmit={(e) => { e.preventDefault(); openThread(); }}>
              <input type="text" required placeholder="Your name" autoComplete="name" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} />
              <input type="email" required placeholder="you@example.com" autoComplete="email" value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} />
              <button type="submit" className="ac-cta-primary">Start chat →</button>
              {error && <p className="ac-chat-err">{error}</p>}
            </form>
          ) : (
            <>
              <div ref={feedRef} className="ac-inline-chat-feed">
                {msgs.length === 0 ? (
                  <div className="ac-chat-empty">Say hi — the team will jump in.</div>
                ) : msgs.map((m) => (
                  <div key={m.id} className={`ac-chat-msg ${m.sender === "user" ? "me" : "them"}`}>
                    <p>{m.body}</p>
                    <span>{m.sender === "user" ? "You" : "TTSUnlocked"} · {new Date(m.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
                  </div>
                ))}
              </div>
              <form className="ac-inline-chat-composer" onSubmit={(e) => { e.preventDefault(); send(); }}>
                <input type="text" placeholder="Type a message…" value={composer} onChange={(e) => setComposer(e.target.value)} disabled={status === "sending"} />
                <button type="submit" disabled={!composer.trim() || status === "sending"}>Send</button>
                {error && <p className="ac-chat-err">{error}</p>}
              </form>
            </>
          )}
        </div>
      </div>
    </section>
  );
}

function Partners() {
  const partners = [
    { src: "/partners/tiktok-shop.png", alt: "TikTok Shop" },
    { src: "/partners/goli.png", alt: "Goli" },
    { src: "/partners/npro.png", alt: "NPRO" },
    { src: "/partners/apex.png", alt: "APEX" },
    { src: "/partners/cc.png", alt: "C&C" },
  ];
  return (
    <section className="ac-partners">
      <p className="ac-partners-eyebrow">BUILT WITH PARTNERS WHO WIN</p>
      <div className="ac-partners-logos">
        {partners.map((p, i) => (
          <div key={i} className="ac-partner-logo-wrap">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={p.src} alt={p.alt} className="ac-partner-logo" />
          </div>
        ))}
      </div>
    </section>
  );
}

function Testimonials() {
  const items = [
    { name: "Jess", city: "USA", quote: "TTSUnlocked made it so simple. Verified in 2 days, first sale within a week." },
    { name: "Tom", city: "UK", quote: "The support team is amazing. They walked me through everything step by step." },
    { name: "Sarah", city: "Canada", quote: "The verified account gave me instant credibility. Sales started coming right away." },
  ];
  return (
    <section className="ac-tests" id="testimonials">
      <div className="ac-tests-head">
        <p className="ac-section-eyebrow">REAL CREATORS. REAL RESULTS.</p>
        <h2 className="ac-section-title">Creators <span className="ac-accent">already earning.</span></h2>
      </div>
      <div className="ac-tests-grid">
        {items.map((t) => (
          <div key={t.name} className="ac-test-card">
            <div className="ac-test-meta">
              <div className="ac-test-name">{t.name}</div>
              <div className="ac-test-city">{t.city}</div>
              <p style={{ marginTop: 10, fontSize: 13.5, color: "var(--taa-muted)", lineHeight: 1.55 }}>&ldquo;{t.quote}&rdquo;</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function Wins() {
  return (
    <section className="ac-wins" id="wins">
      <div className="ac-wins-head">
        <p className="ac-section-eyebrow">MORE WINS</p>
        <h2 className="ac-section-title">The <span className="ac-accent">receipts.</span></h2>
        <p className="ac-section-sub">Fresh screenshots from TTSUnlocked members. Updated weekly.</p>
      </div>
      <div className="ac-wins-empty">
        <div className="ac-wins-empty-glow" aria-hidden="true" />
        <p className="ac-wins-empty-title">More wins landing shortly.</p>
        <p className="ac-wins-empty-sub">Fresh screenshots posting here as creators activate and start earning. Check back weekly.</p>
      </div>
    </section>
  );
}

function FAQ() {
  const items = [
    { q: "Do I need to be in the US?", a: "No. TTSUnlocked is built specifically for creators outside the US. The verified account path handles everything." },
    { q: "How long does setup take?", a: "24 hours from the moment your account details are submitted. The team activates and verifies in that window." },
    { q: "How and when do I get paid?", a: "USD, direct to your bank. Payouts follow TikTok Shop\u2019s standard cycle (typically weekly after the hold period)." },
    { q: "Is there a refund?", a: "Our guarantee is completion-based: follow the steps, complete the 7-day program, and we guarantee you\u2019ll be live on TikTok Shop. If you don\u2019t complete, there\u2019s no refund." },
    { q: "What if I already know TikTok Shop?", a: "The Accounts Only tier is for you. Grab a verified account and plug in \u2014 skip the training." },
    { q: "Can I upgrade later?", a: "Yes. Start with Education Only, add the verified account whenever you\u2019re ready." },
  ];
  return (
    <section className="ac-faq" id="faq">
      <div className="ac-faq-head">
        <p className="ac-section-eyebrow">FREQUENTLY ASKED</p>
        <h2 className="ac-section-title">Quick <span className="ac-accent">answers.</span></h2>
      </div>
      <div className="ac-faq-list">
        {items.map((it, i) => (
          <details key={i} className="ac-faq-item">
            <summary>{it.q}</summary>
            <p>{it.a}</p>
          </details>
        ))}
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="ac-footer">
      <div><span className="ac-footer-dot" /> Powered by <b>COLT</b> × <b>TTSUnlocked</b></div>
      <div className="ac-footer-links">
        <Link href="/privacy">Privacy</Link>
        <Link href="/terms">Terms</Link>
        <a href="mailto:hello@ttsaccelerators.com">Contact</a>
      </div>
    </footer>
  );
}

function ChatWidget() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);
  if (!mounted) return null;
  const widget = (
    <a href="#talk" className="ac-chat-toggle" aria-label="Chat with TTSUnlocked" style={{ position: "fixed", bottom: 24, right: 24, zIndex: 999 }}>
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/></svg>
      <span>Chat with us</span>
    </a>
  );
  return createPortal(widget, document.body);
}

function Styles() {
  return (
    <style>{`
      /* ---- shell ---- */
      .ac-shell { position: relative; min-height: 100vh; background: var(--taa-bg); color: var(--taa-text); font-family: 'Inter Tight', system-ui, sans-serif; overflow: hidden; }
      .ac-shell > *:not(.taa-bg) { position: relative; z-index: 1; }
      .ac-accent { color: var(--taa-red); text-shadow: 0 0 40px rgba(220, 30, 46, 0.5); }
      .ac-section-eyebrow { font-size: 11px; letter-spacing: 0.24em; color: var(--taa-red); font-weight: 700; text-transform: uppercase; margin: 0 0 14px; }
      .ac-section-title { margin: 0; font-size: clamp(28px, 4vw, 44px); font-weight: 900; letter-spacing: -0.02em; text-transform: uppercase; color: var(--taa-white); line-height: 1.02; }
      .ac-section-sub { margin: 12px 0 0; max-width: 640px; color: var(--taa-muted); font-size: 14.5px; line-height: 1.6; }

      /* ---- header ---- */
      .ac-header { position: sticky; top: 0; z-index: 20; padding: 18px 40px; background: rgba(5, 5, 5, 0.75); backdrop-filter: blur(10px); border-bottom: 1px solid var(--taa-border); }
      .ac-header-inner { max-width: 1180px; margin: 0 auto; display: flex; justify-content: space-between; align-items: center; gap: 24px; }
      .ac-header-brand { display: inline-flex; align-items: center; gap: 14px; }
      .ac-header-brand img { filter: drop-shadow(0 0 12px rgba(220, 30, 46, 0.4)); }
      .ac-brand-tag { display: inline-flex; flex-direction: column; gap: 2px; line-height: 1; }
      .ac-brand-tag small { font-size: 9px; letter-spacing: 0.24em; color: var(--taa-muted); font-weight: 700; text-transform: uppercase; }
      .ac-brand-tag b { font-size: 16px; font-weight: 900; letter-spacing: 0.02em; color: var(--taa-white); text-transform: uppercase; }
      .ac-brand-x { color: var(--taa-red); font-size: 22px; font-weight: 900; }
      .ac-header-nav { display: inline-flex; align-items: center; gap: 24px; }
      .ac-nav-link { color: var(--taa-muted); font-size: 13px; font-weight: 700; letter-spacing: 0.05em; text-transform: uppercase; text-decoration: none; }
      .ac-nav-link:hover { color: var(--taa-red); }
      .ac-nav-cta { display: inline-flex; align-items: center; gap: 6px; padding: 9px 16px; border: 1px solid var(--taa-red); color: var(--taa-red); font-size: 12.5px; font-weight: 700; letter-spacing: 0.06em; text-transform: uppercase; border-radius: 6px; text-decoration: none; transition: background 150ms ease; }
      .ac-nav-cta:hover { background: rgba(220, 30, 46, 0.1); }

      /* ---- hero ---- */
      .ac-hero { max-width: 1180px; margin: 0 auto; padding: 80px 40px 60px; text-align: center; }
      .ac-hero-eyebrow { display: inline-block; padding: 6px 14px; font-size: 10.5px; letter-spacing: 0.24em; color: var(--taa-red); font-weight: 700; background: rgba(220, 30, 46, 0.06); border: 1px solid rgba(220, 30, 46, 0.32); border-radius: 999px; text-transform: uppercase; margin-bottom: 22px; }
      .ac-hero-title { margin: 0 0 20px; font-size: clamp(44px, 8vw, 88px); font-weight: 900; letter-spacing: -0.04em; line-height: 0.96; text-transform: uppercase; color: var(--taa-white); }
      .ac-hero-sub-line { color: var(--taa-white); }
      .ac-hero-sub { margin: 0 auto 30px; max-width: 640px; color: var(--taa-muted); font-size: 16px; line-height: 1.65; }
      .ac-hero-sub strong { color: var(--taa-white); font-weight: 700; }
      .ac-hero-cta-row { display: flex; gap: 12px; margin-bottom: 56px; flex-wrap: wrap; justify-content: center; }
      .ac-cta-primary { background: var(--taa-red); color: var(--taa-white); border: 1px solid var(--taa-red); font: inherit; font-size: 13px; font-weight: 700; letter-spacing: 0.08em; text-transform: uppercase; padding: 13px 24px; border-radius: 6px; cursor: pointer; text-decoration: none; display: inline-flex; align-items: center; gap: 8px; transition: transform 120ms ease, box-shadow 120ms ease, background 120ms ease; }
      .ac-cta-primary:hover:not(:disabled) { background: var(--taa-red-bright); transform: translateY(-1px); box-shadow: 0 12px 30px -10px var(--taa-red-glow); }
      .ac-cta-primary:disabled { opacity: 0.6; cursor: progress; }
      .ac-cta-ghost { background: transparent; color: var(--taa-white); border: 1px solid var(--taa-border-strong); font: inherit; font-size: 13px; font-weight: 700; letter-spacing: 0.08em; text-transform: uppercase; padding: 13px 24px; border-radius: 6px; text-decoration: none; display: inline-flex; align-items: center; gap: 8px; }
      .ac-cta-ghost:hover { border-color: var(--taa-red); color: var(--taa-red); }
      .ac-hero-stats { display: inline-flex; align-items: center; gap: 24px; padding: 20px 30px; background: var(--taa-bg-card); border: 1px solid var(--taa-border); border-radius: 12px; flex-wrap: wrap; }
      .ac-stat { display: flex; flex-direction: column; gap: 4px; min-width: 92px; }
      .ac-stat-n { font-size: 24px; font-weight: 900; color: var(--taa-white); letter-spacing: -0.02em; line-height: 1; font-variant-numeric: tabular-nums; }
      .ac-stat-l { font-size: 10.5px; letter-spacing: 0.18em; color: var(--taa-muted); text-transform: uppercase; font-weight: 700; }

      /* ---- partners ---- */
      .ac-partners { padding: 40px 40px 60px; max-width: 1180px; margin: 0 auto; text-align: center; }
      .ac-partners-eyebrow { font-size: 10.5px; letter-spacing: 0.24em; color: var(--taa-muted); font-weight: 700; text-transform: uppercase; margin: 0 0 20px; }
      .ac-marquee { overflow: hidden; mask-image: linear-gradient(to right, transparent 0%, black 12%, black 88%, transparent 100%); -webkit-mask-image: linear-gradient(to right, transparent 0%, black 12%, black 88%, transparent 100%); }
      .ac-marquee-track { display: flex; gap: 24px; align-items: center; width: max-content; animation: ac-slide 40s linear infinite; }
      .ac-partner-logo-wrap { background: #FFFFFF; border-radius: 10px; padding: 12px 18px; height: 68px; min-width: 110px; display: inline-flex; align-items: center; justify-content: center; flex-shrink: 0; box-shadow: 0 4px 20px rgba(0,0,0,0.25); }
      .ac-partner-logo { height: 42px; width: auto; max-width: 140px; object-fit: contain; display: block; }
      @keyframes ac-slide { from { transform: translateX(0); } to { transform: translateX(-50%); } }

      /* ---- testimonials ---- */
      .ac-tests { padding: 80px 40px; max-width: 1180px; margin: 0 auto; }
      .ac-tests-head { text-align: center; max-width: 760px; margin: 0 auto 40px; }
      .ac-tests-head .ac-section-sub { margin-left: auto; margin-right: auto; }
      .ac-tests-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; }
      .ac-test-card { background: var(--taa-bg-card); border: 1px solid var(--taa-border); border-radius: 14px; overflow: hidden; }
      .ac-test-video { width: 100%; aspect-ratio: 9 / 16; background: #000; display: block; }
      .ac-test-meta { padding: 14px 18px; }
      .ac-test-name { font-size: 15px; font-weight: 800; color: var(--taa-white); }
      .ac-test-city { font-size: 12px; color: var(--taa-muted); margin-top: 2px; letter-spacing: 0.08em; text-transform: uppercase; font-weight: 600; }

      /* ---- how it works ---- */
      .ac-how { padding: 80px 40px; max-width: 1180px; margin: 0 auto; }
      .ac-how-head { text-align: center; max-width: 760px; margin: 0 auto 40px; }
      .ac-how-head .ac-section-sub { margin-left: auto; margin-right: auto; }
      .ac-steps { list-style: none; padding: 0; margin: 0; display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; }
      .ac-step { position: relative; background: var(--taa-bg-card); border: 1px solid var(--taa-border); border-left: 3px solid var(--taa-red); border-radius: 14px; padding: 24px 22px; }
      .ac-step-num { font-size: 44px; font-weight: 900; color: rgba(220, 30, 46, 0.28); letter-spacing: -0.04em; line-height: 1; margin-bottom: 8px; font-variant-numeric: tabular-nums; }
      .ac-step-day { font-size: 10.5px; letter-spacing: 0.18em; color: var(--taa-red); font-weight: 800; text-transform: uppercase; margin-bottom: 4px; }
      .ac-step-title { margin: 0 0 8px; font-size: 17px; font-weight: 800; color: var(--taa-white); letter-spacing: -0.01em; }
      .ac-step-desc { margin: 0; font-size: 13px; color: var(--taa-muted); line-height: 1.6; }

      /* ---- pricing ---- */
      .ac-pricing { padding: 80px 40px; max-width: 1180px; margin: 0 auto; }
      .ac-pricing-head { text-align: center; max-width: 760px; margin: 0 auto 32px; }
      .ac-pricing-head .ac-section-sub { margin-left: auto; margin-right: auto; }
      .ac-guarantee { display: inline-flex; align-items: center; gap: 12px; padding: 12px 18px; background: rgba(220, 30, 46, 0.08); border: 1px solid rgba(220, 30, 46, 0.3); border-left: 3px solid var(--taa-red); border-radius: 10px; margin-top: 22px; text-align: left; max-width: 720px; }
      .ac-guarantee-icon { font-size: 20px; }
      .ac-guarantee div { font-size: 13px; color: var(--taa-muted); line-height: 1.55; }
      .ac-guarantee b { color: var(--taa-white); }

      .ac-gate-card { max-width: 520px; margin: 40px auto 0; padding: 32px 28px; background: var(--taa-bg-card); border: 1px solid var(--taa-border-strong); border-radius: 14px; text-align: center; }
      .ac-gate-eyebrow { font-size: 10.5px; letter-spacing: 0.24em; color: var(--taa-red); font-weight: 700; text-transform: uppercase; margin-bottom: 10px; }
      .ac-gate-title { margin: 0 0 8px; font-size: 20px; font-weight: 800; color: var(--taa-white); letter-spacing: -0.01em; }
      .ac-gate-sub { margin: 0 0 20px; font-size: 13px; color: var(--taa-muted); }
      .ac-gate-form { display: flex; flex-direction: column; gap: 12px; }
      .ac-gate-row { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }
      .ac-gate-form input { background: var(--taa-bg-elev); border: 1px solid var(--taa-border-strong); border-radius: 8px; color: var(--taa-white); padding: 12px 14px; font: inherit; font-size: 14px; outline: none; }
      .ac-gate-form input:focus { border-color: var(--taa-red); }
      .ac-gate-err { margin: 6px 0 0; color: var(--taa-red); font-size: 12.5px; font-weight: 600; }

      .ac-tiers { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; margin-top: 40px; align-items: stretch; }
      .ac-tier { display: flex; flex-direction: column; padding: 32px 26px; background: var(--taa-bg-card); border: 1px solid var(--taa-border); border-radius: 14px; }
      .ac-tier-highlight { border-color: var(--taa-red); background: linear-gradient(180deg, rgba(220, 30, 46, 0.08) 0%, var(--taa-bg-card) 100%); box-shadow: 0 0 40px rgba(220, 30, 46, 0.15); position: relative; }
      .ac-tier-ribbon { position: absolute; top: -12px; left: 50%; transform: translateX(-50%); background: var(--taa-red); color: var(--taa-white); font-size: 10.5px; letter-spacing: 0.18em; font-weight: 800; padding: 5px 14px; border-radius: 999px; text-transform: uppercase; }
      .ac-tier-eyebrow { font-size: 10.5px; letter-spacing: 0.2em; color: var(--taa-muted); font-weight: 700; text-transform: uppercase; margin-bottom: 12px; }
      .ac-tier-price { font-size: 40px; font-weight: 900; color: var(--taa-white); letter-spacing: -0.03em; line-height: 1; }
      .ac-tier-highlight .ac-tier-price { color: var(--taa-red); }
      .ac-tier-label { font-size: 11.5px; letter-spacing: 0.14em; color: var(--taa-muted); text-transform: uppercase; font-weight: 700; margin-top: 6px; margin-bottom: 22px; }
      .ac-tier-features { list-style: none; padding: 0; margin: 0 0 24px; display: flex; flex-direction: column; gap: 10px; flex: 1; }
      .ac-tier-features li { display: flex; gap: 10px; align-items: flex-start; font-size: 13.5px; color: var(--taa-text); line-height: 1.5; }
      .ac-tier-features svg { color: var(--taa-red); flex-shrink: 0; margin-top: 4px; }
      .ac-tier-browse { background: var(--taa-bg-2); }
      .ac-tier .ac-cta-primary { width: 100%; justify-content: center; }
      .ac-tier-browse .ac-cta-primary { background: transparent; color: var(--taa-red); }

      /* ---- FAQ ---- */
      .ac-faq { padding: 80px 40px 40px; max-width: 900px; margin: 0 auto; }
      .ac-faq-head { text-align: center; margin-bottom: 30px; }
      .ac-faq-list { display: flex; flex-direction: column; gap: 8px; }
      .ac-faq-item { text-align: left; background: var(--taa-bg-card); border: 1px solid var(--taa-border); border-radius: 12px; padding: 18px 22px; cursor: pointer; font: inherit; color: var(--taa-text); transition: border-color 150ms ease; }
      .ac-faq-item:hover { border-color: rgba(220, 30, 46, 0.4); }
      .ac-faq-item.open { border-color: var(--taa-red); }
      .ac-faq-q { display: flex; justify-content: space-between; align-items: center; gap: 12px; font-size: 14.5px; font-weight: 700; color: var(--taa-white); }
      .ac-faq-sign { color: var(--taa-red); font-size: 20px; font-weight: 300; }
      .ac-faq-a { margin-top: 12px; font-size: 13.5px; color: var(--taa-muted); line-height: 1.65; }

      /* ---- wins ---- */
      .ac-wins { padding: 80px 40px; max-width: 1180px; margin: 0 auto; }
      .ac-wins-head { text-align: center; max-width: 760px; margin: 0 auto 40px; }
      .ac-wins-head .ac-section-sub { margin-left: auto; margin-right: auto; }
      .ac-wins-grid { column-count: 3; column-gap: 16px; }
      .ac-win-card { break-inside: avoid; -webkit-column-break-inside: avoid; page-break-inside: avoid; display: block; width: 100%; margin: 0 0 16px; }
      .ac-am-logo { height: 34px; width: auto; display: block; filter: drop-shadow(0 0 8px rgba(220,30,46,0.35)); }
      .ac-win-card video { width: 100%; height: auto; display: block; background: #000; }
      .ac-win-card { background: var(--taa-bg-card); border: 1px solid var(--taa-border); border-radius: 14px; overflow: hidden; }
      .ac-win-card img { width: 100%; height: auto; display: block; }
      .ac-win-card figcaption { padding: 12px 16px; font-size: 12.5px; color: var(--taa-muted); border-top: 1px solid var(--taa-border); }
      .ac-wins-empty { position: relative; padding: 60px 40px; background: var(--taa-bg-card); border: 1px dashed var(--taa-border-strong); border-radius: 14px; text-align: center; overflow: hidden; }
      .ac-wins-empty-glow { position: absolute; inset: 0; background: radial-gradient(ellipse at center, rgba(220,30,46,0.06) 0%, transparent 70%); pointer-events: none; }
      .ac-wins-empty-title { position: relative; margin: 0 0 8px; font-size: 18px; font-weight: 800; color: var(--taa-white); letter-spacing: -0.01em; }
      .ac-wins-empty-sub { position: relative; margin: 0; max-width: 480px; margin-left: auto; margin-right: auto; font-size: 13.5px; color: var(--taa-muted); line-height: 1.6; }

      /* ---- inline chat (below pricing) ---- */
      .ac-inline-chat { max-width: 1180px; margin: 0 auto; padding: 30px 40px 60px; }
      .ac-inline-chat-head { text-align: center; max-width: 720px; margin: 0 auto 32px; }
      .ac-inline-chat-head .ac-section-sub { margin-left: auto; margin-right: auto; }
      .ac-inline-chat-card { display: grid; grid-template-columns: 1fr 1.15fr; gap: 24px; background: var(--taa-bg-card); border: 1px solid var(--taa-border-strong); border-radius: 18px; padding: 28px; box-shadow: 0 20px 60px rgba(0,0,0,0.35); position: relative; overflow: hidden; }
      .ac-inline-chat-card::before { content: ""; position: absolute; inset: 0; background: radial-gradient(ellipse at top left, rgba(220,30,46,0.07), transparent 55%); pointer-events: none; }
      .ac-inline-chat-side { position: relative; display: flex; flex-direction: column; justify-content: space-between; gap: 24px; padding: 6px 4px 6px 6px; }
      .ac-inline-chat-bullets { display: flex; flex-direction: column; gap: 18px; }
      .ac-inline-chat-bullet { display: flex; gap: 12px; align-items: flex-start; }
      .ac-inline-chat-bullet div { display: flex; flex-direction: column; gap: 3px; }
      .ac-inline-chat-bullet b { color: var(--taa-white); font-size: 14px; font-weight: 800; letter-spacing: -0.005em; }
      .ac-inline-chat-bullet span { color: var(--taa-muted); font-size: 13px; line-height: 1.55; }
      .ac-inline-chat-dot { flex-shrink: 0; width: 8px; height: 8px; border-radius: 50%; background: var(--taa-red); margin-top: 6px; box-shadow: 0 0 0 3px rgba(220,30,46,0.18); }
      .ac-inline-chat-book { align-self: flex-start; }
      .ac-inline-chat-panel { position: relative; background: rgba(0,0,0,0.35); border: 1px solid var(--taa-border); border-radius: 14px; display: flex; flex-direction: column; min-height: 340px; overflow: hidden; }
      .ac-inline-chat-head-strip { display: flex; align-items: center; gap: 12px; padding: 14px 18px; border-bottom: 1px solid var(--taa-border); background: rgba(255,255,255,0.02); }
      .ac-inline-chat-live-dot { width: 8px; height: 8px; border-radius: 50%; background: #22c55e; box-shadow: 0 0 0 3px rgba(34,197,94,0.2); animation: acPulse 1.6s ease-in-out infinite; flex-shrink: 0; }
      @keyframes acPulse { 0%,100% { opacity: 1; } 50% { opacity: 0.55; } }
      .ac-inline-chat-title { font-size: 14px; font-weight: 800; color: var(--taa-white); }
      .ac-inline-chat-sub { font-size: 12px; color: var(--taa-muted); margin-top: 2px; }
      .ac-inline-chat-gate { display: flex; flex-direction: column; gap: 10px; padding: 18px; flex: 1; }
      .ac-inline-chat-gate input { width: 100%; padding: 12px 14px; background: rgba(255,255,255,0.03); border: 1px solid var(--taa-border); border-radius: 8px; color: var(--taa-white); font-size: 14px; box-sizing: border-box; }
      .ac-inline-chat-gate input:focus { outline: none; border-color: var(--taa-red); }
      .ac-inline-chat-gate .ac-cta-primary { margin-top: 4px; justify-content: center; }
      .ac-inline-chat-feed { flex: 1; overflow-y: auto; padding: 16px 18px; display: flex; flex-direction: column; gap: 10px; max-height: 300px; }
      .ac-inline-chat-composer { display: flex; gap: 8px; padding: 12px; border-top: 1px solid var(--taa-border); background: rgba(0,0,0,0.4); }
      .ac-inline-chat-composer input { flex: 1; padding: 10px 12px; background: rgba(255,255,255,0.03); border: 1px solid var(--taa-border); border-radius: 8px; color: var(--taa-white); font-size: 14px; }
      .ac-inline-chat-composer input:focus { outline: none; border-color: var(--taa-red); }
      .ac-inline-chat-composer button { padding: 10px 16px; background: var(--taa-red); color: var(--taa-white); border: none; border-radius: 8px; font-size: 13px; font-weight: 700; letter-spacing: 0.04em; text-transform: uppercase; cursor: pointer; }
      .ac-inline-chat-composer button:disabled { opacity: 0.5; cursor: not-allowed; }

      /* ---- footer ---- */
      .ac-footer { max-width: 1180px; margin: 0 auto; padding: 40px 40px 60px; border-top: 1px solid var(--taa-border); display: flex; justify-content: space-between; align-items: center; color: var(--taa-muted); font-size: 12.5px; flex-wrap: wrap; gap: 14px; }
      .ac-footer b { color: var(--taa-white); }
      .ac-footer-dot { display: inline-block; width: 6px; height: 6px; border-radius: 50%; background: var(--taa-red); margin-right: 6px; box-shadow: 0 0 0 3px rgba(220, 30, 46, 0.2); }
      .ac-footer-links { display: inline-flex; gap: 20px; }
      .ac-footer-links a { color: var(--taa-muted); text-decoration: none; }
      .ac-footer-links a:hover { color: var(--taa-red); }

      /* ---- chat widget ---- */
      .ac-chat-widget { position: fixed; bottom: 24px; right: 24px; z-index: 9999; }
      .ac-chat-toggle { display: inline-flex; align-items: center; gap: 10px; background: var(--taa-red); color: var(--taa-white); border: none; font: inherit; font-size: 13px; font-weight: 700; letter-spacing: 0.08em; text-transform: uppercase; padding: 14px 22px; border-radius: 999px; cursor: pointer; box-shadow: 0 8px 30px rgba(220, 30, 46, 0.4); transition: transform 120ms ease; }
      .ac-chat-toggle:hover { transform: translateY(-2px); }
      .ac-chat-panel { width: 380px; max-width: calc(100vw - 32px); max-height: min(600px, calc(100vh - 100px)); background: var(--taa-bg-card); border: 1px solid var(--taa-border-strong); border-radius: 14px; box-shadow: 0 20px 60px rgba(0, 0, 0, 0.6); overflow: hidden; display: flex; flex-direction: column; }
      .ac-chat-head { display: flex; justify-content: space-between; align-items: flex-start; padding: 16px 18px; border-bottom: 1px solid var(--taa-border); background: var(--taa-bg-elev); }
      .ac-chat-head-title { font-size: 14px; font-weight: 800; color: var(--taa-white); }
      .ac-chat-head-sub { font-size: 11px; color: var(--taa-muted); margin-top: 2px; }
      .ac-chat-close { background: transparent; border: none; color: var(--taa-muted); font-size: 22px; cursor: pointer; line-height: 1; padding: 0 4px; }
      .ac-chat-close:hover { color: var(--taa-red); }
      .ac-chat-gate { padding: 20px 18px; display: flex; flex-direction: column; gap: 10px; }
      .ac-chat-gate p { margin: 0 0 6px; font-size: 12.5px; color: var(--taa-muted); line-height: 1.5; }
      .ac-chat-gate input { background: var(--taa-bg-elev); border: 1px solid var(--taa-border-strong); border-radius: 8px; color: var(--taa-white); padding: 10px 12px; font: inherit; font-size: 13.5px; outline: none; }
      .ac-chat-gate input:focus { border-color: var(--taa-red); }
      .ac-chat-book { display: block; text-align: center; margin-top: 6px; color: var(--taa-muted); font-size: 12px; text-decoration: none; }
      .ac-chat-book:hover { color: var(--taa-red); }
      .ac-chat-err { margin: 4px 0 0; color: var(--taa-red); font-size: 12px; font-weight: 600; }
      .ac-chat-feed { flex: 1; overflow-y: auto; padding: 16px; display: flex; flex-direction: column; gap: 10px; min-height: 200px; }
      .ac-chat-empty { color: var(--taa-muted); font-size: 13px; text-align: center; padding: 20px; }
      .ac-chat-msg { max-width: 82%; padding: 10px 12px; border-radius: 10px; }
      .ac-chat-msg p { margin: 0; font-size: 13.5px; line-height: 1.5; word-break: break-word; }
      .ac-chat-msg span { display: block; margin-top: 4px; font-size: 10.5px; color: var(--taa-muted); letter-spacing: 0.06em; text-transform: uppercase; font-weight: 700; }
      .ac-chat-msg.me { margin-left: auto; background: rgba(220, 30, 46, 0.14); border: 1px solid rgba(220, 30, 46, 0.32); }
      .ac-chat-msg.them { background: var(--taa-bg-elev); border: 1px solid var(--taa-border-strong); }
      .ac-chat-quicks { padding: 8px 16px; border-top: 1px solid var(--taa-border); background: var(--taa-bg-2); }
      .ac-chat-quicks a { display: inline-flex; align-items: center; gap: 4px; background: transparent; border: 1px solid var(--taa-border-strong); color: var(--taa-white); font-size: 11.5px; font-weight: 700; letter-spacing: 0.06em; text-transform: uppercase; padding: 6px 12px; border-radius: 6px; text-decoration: none; }
      .ac-chat-quicks a:hover { border-color: var(--taa-red); color: var(--taa-red); }
      .ac-chat-composer { padding: 12px 16px; border-top: 1px solid var(--taa-border); background: var(--taa-bg-2); display: flex; gap: 8px; }
      .ac-chat-composer input { flex: 1; background: var(--taa-bg-elev); border: 1px solid var(--taa-border-strong); border-radius: 8px; color: var(--taa-white); padding: 10px 12px; font: inherit; font-size: 13.5px; outline: none; }
      .ac-chat-composer input:focus { border-color: var(--taa-red); }
      .ac-chat-composer button { background: var(--taa-red); border: none; color: var(--taa-white); font: inherit; font-size: 12px; font-weight: 700; letter-spacing: 0.08em; text-transform: uppercase; padding: 10px 16px; border-radius: 8px; cursor: pointer; }
      .ac-chat-composer button:disabled { opacity: 0.5; cursor: not-allowed; }

      /* ---- responsive ---- */
      @media (max-width: 900px) {
        .ac-header { padding: 12px 16px; }
        .ac-header-inner { gap: 10px; }
        .ac-header-brand { gap: 8px; }
        .ac-header-brand img { width: 32px; height: 32px; }
        .ac-brand-tag b { font-size: 13px; }
        .ac-brand-tag small { font-size: 8px; }
        .ac-brand-x { font-size: 16px; }
        .ac-header-nav { display: none; }
        .ac-hero { padding: 40px 20px 30px; }
        .ac-hero-eyebrow { font-size: 9.5px; padding: 5px 12px; }
        .ac-hero-title { font-size: clamp(38px, 10vw, 56px); }
        .ac-hero-sub { font-size: 15px; margin-bottom: 26px; }
        .ac-hero-cta-row { margin-bottom: 40px; width: 100%; }
        .ac-hero-cta-row .ac-cta-primary, .ac-hero-cta-row .ac-cta-ghost { flex: 1; justify-content: center; padding: 12px 18px; font-size: 12px; }
        .ac-hero-stats { display: grid; grid-template-columns: 1fr 1fr; padding: 14px 18px; gap: 14px 18px; width: 100%; max-width: 420px; margin-left: auto; margin-right: auto; box-sizing: border-box; }
        .ac-hero-stats .ac-stat-sep { display: none; }
        .ac-hero-stats .ac-stat { min-width: 0; text-align: left; }
        .ac-stat-n { font-size: 20px; }
        .ac-stat-l { font-size: 9.5px; }
        .ac-partners { padding: 30px 20px 40px; }
        .ac-partner-logo-wrap { height: 56px; min-width: 90px; padding: 10px 14px; }
        .ac-partner-logo { height: 32px; max-width: 100px; }
        .ac-tests, .ac-how, .ac-pricing, .ac-faq, .ac-wins { padding-left: 20px; padding-right: 20px; padding-top: 50px; padding-bottom: 30px; }
        .ac-inline-chat { padding: 20px 20px 40px; }
        .ac-inline-chat-card { grid-template-columns: 1fr; padding: 20px; gap: 20px; }
        .ac-inline-chat-side { text-align: left; }
        .ac-inline-chat-book { align-self: stretch; text-align: center; justify-content: center; }
        .ac-inline-chat-panel { min-height: 300px; }
        .ac-tests-grid { grid-template-columns: 1fr; gap: 14px; }
        .ac-test-meta { text-align: center; padding: 14px 18px 16px; }
        .ac-wins-grid { column-count: 2; column-gap: 10px; }
        .ac-win-card { margin: 0 0 10px; }
        .ac-am-logo { height: 26px; }
        .ac-steps { grid-template-columns: 1fr; gap: 12px; }
        .ac-step { padding: 20px 18px; }
        .ac-step-num { font-size: 36px; }
        .ac-tiers { grid-template-columns: 1fr; gap: 14px; margin-top: 30px; }
        .ac-tier { padding: 28px 22px; }
        .ac-tier-price { font-size: 34px; }
        .ac-gate-card { padding: 24px 20px; margin: 32px auto 0; }
        .ac-gate-row { grid-template-columns: 1fr; }
        .ac-guarantee { flex-direction: column; text-align: center; align-items: center; padding: 14px 16px; }
        .ac-faq { padding-top: 50px; padding-bottom: 30px; }
        .ac-faq-q { font-size: 13.5px; }
        .ac-faq-a { font-size: 13px; }
        .ac-footer { flex-direction: column; align-items: flex-start; padding: 24px 20px 40px; gap: 12px; }
        .ac-footer-links { flex-wrap: wrap; gap: 14px; }
        .ac-chat-widget { bottom: 14px; right: 14px; }
        .ac-chat-toggle { padding: 12px 18px; font-size: 12px; }
        .ac-chat-toggle svg { width: 18px; height: 18px; }
        .ac-chat-panel { width: calc(100vw - 24px); max-height: calc(100vh - 88px); }
      }
      @media (max-width: 480px) {
        .ac-hero-title { font-size: clamp(32px, 11vw, 44px); }
        .ac-hero-stats { gap: 10px 16px; padding: 12px 14px; }
        .ac-stat { min-width: 68px; }
        .ac-stat-n { font-size: 18px; }
        .ac-section-title { font-size: clamp(24px, 7vw, 32px); }
      }
    `}</style>
  );
}

function ColtOverrides() {
  return (
    <style>{`
      .colt-shell { color: var(--taa-text); }
      .colt-logo-img { display: block; width: 44px; height: 44px; border-radius: 10px; filter: drop-shadow(0 0 16px rgba(0, 229, 255, 0.4)); }
      .colt-hero-banner { display: block; width: 100%; max-width: 1180px; margin: 24px auto 0; border-radius: 16px; border: 1px solid var(--taa-border-strong); box-shadow: 0 24px 80px rgba(0, 229, 255, 0.08); }
      .colt-stats-wrap { max-width: 1180px; margin: 0 auto; padding: 10px 40px 30px; }
      .colt-stats { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; background: var(--taa-bg-card); border: 1px solid var(--taa-border-strong); border-radius: 16px; padding: 28px 24px; }
      .colt-stat { text-align: center; }
      .colt-stat-num { font-size: 32px; font-weight: 900; color: var(--taa-red); letter-spacing: -0.02em; text-shadow: 0 0 24px var(--taa-red-glow); }
      .colt-stat-label { font-size: 11px; letter-spacing: 0.18em; text-transform: uppercase; color: var(--taa-muted); font-weight: 700; margin-top: 6px; }
      @media (max-width: 900px) {
        .colt-stats { grid-template-columns: 1fr 1fr; gap: 20px 14px; padding: 20px 14px; }
        .colt-stat-num { font-size: 24px; }
        .colt-stats-wrap { padding: 10px 20px 20px; }
        .colt-hero-banner { margin-top: 16px; border-radius: 10px; }
        .colt-logo-img { width: 36px; height: 36px; }
      }
    `}</style>
  );
}
