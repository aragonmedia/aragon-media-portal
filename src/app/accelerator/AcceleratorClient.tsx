"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

/* ============================================================
   TYPES + CONSTANTS
   ============================================================ */
type Tier = "edu_only" | "edu_plus_account" | "browse";
type GateStatus = "idle" | "submitting" | "revealed";
type ChatStatus = "gate" | "sending" | "open";

const PARTNERS = [
  { src: "/partners/tiktok-shop.png", alt: "TikTok Shop" },
  { src: "/partners/nick-g.png", alt: "Nick G" },
  { src: "/partners/kyvo.png", alt: "Kyvo" },
  { src: "/partners/4orte.png", alt: "4orte" },
  { src: "/partners/goli.png", alt: "Goli Nutrition" },
  { src: "/partners/accounts-shop.png", alt: "Accounts Shop" },
  { src: "/partners/creators-corner.png", alt: "Creators Corner" },
  { src: "/partners/commission-club.png", alt: "Commission Club" },
  { src: "/partners/apex-club.png", alt: "Apex Club" },
  { src: "/partners/cc.png", alt: "CC" },
];

// Wins gallery — Kevin drops screenshots to /public/accelerator/wins/
// and we add entries here. Empty for now.
const WINS: { src: string; caption?: string; video?: boolean }[] = [
  // Big numbers — heavy hitters first
  { src: "/accelerator/wins/proof-486k-nov.png", caption: "$486K in November" },
  { src: "/accelerator/wins/proof-125k-week.png", caption: "$125K in one week" },
  { src: "/accelerator/wins/proof-94k-viral.png", caption: "$94K viral drop" },
  { src: "/accelerator/wins/proof-89k-dec.png", caption: "$89K in December" },
  { src: "/accelerator/wins/38k.png", caption: "$38K day" },
  { src: "/accelerator/wins/proof-33k-pulled.png", caption: "$33K pulled" },
  { src: "/accelerator/wins/IMG_9230 - $31K.jpeg", caption: "$31K" },
  { src: "/accelerator/wins/proof-27k-goli.png", caption: "$27K on Goli" },
  { src: "/accelerator/wins/27k.png", caption: "$27K" },
  { src: "/accelerator/wins/24k.png", caption: "$24K" },
  { src: "/accelerator/wins/23k.png", caption: "$23K" },
  { src: "/accelerator/wins/$18k.png", caption: "$18K" },
  { src: "/accelerator/wins/12k.jpeg", caption: "$12K" },
  { src: "/accelerator/wins/10k.png", caption: "$10K" },
  { src: "/accelerator/wins/2k orders.png", caption: "2K+ orders" },
  { src: "/accelerator/wins/proof-kyvo-card.png", caption: "Kyvo creator card" },
  { src: "/accelerator/wins/proof-views.png", caption: "Views performance" },
  // Video
  { src: "/accelerator/wins/IMG_9468.MOV", video: true, caption: "Inside the program" },
  // Pictures of Kevin / the team
  { src: "/accelerator/wins/IMG_8755.jpg" },
  { src: "/accelerator/wins/IMG_8732.jpg" },
  { src: "/accelerator/wins/IMG_8313.jpg" },
  { src: "/accelerator/wins/IMG_9744.jpg" },
  { src: "/accelerator/wins/IMG_7583.PNG" },
  { src: "/accelerator/wins/IMG_7361.jpg" },
  { src: "/accelerator/wins/IMG_7347.jpg" },
  { src: "/accelerator/wins/IMG_7313.jpg" },
  { src: "/accelerator/wins/IMG_7312.jpg" },
  { src: "/accelerator/wins/IMG_7311.PNG" },
  { src: "/accelerator/wins/IMG_7244.PNG" },
  { src: "/accelerator/wins/IMG_7243.PNG" },
  { src: "/accelerator/wins/IMG_7235.jpg" },
  { src: "/accelerator/wins/IMG_1569.PNG" },
  { src: "/accelerator/wins/IMG_1568.PNG" },
  { src: "/accelerator/wins/IMG_1545.jpg" },
  { src: "/accelerator/wins/IMG_0706.jpg" },
  { src: "/accelerator/wins/IMG_5906.png" },
  { src: "/accelerator/wins/IMG_5993 3.png" },
  { src: "/accelerator/wins/after 08.JPG" },
];

const TESTIMONIALS = [
  { src: "/media/testimonials/alkis.mp4", name: "Alkis", city: "Athens, Greece" },
  { src: "/media/testimonials/menes.mp4", name: "Menes", city: "Toronto, Canada" },
  { src: "/media/testimonials/teep.mp4", name: "Teep", city: "Canada" },
];

const FAQ_ITEMS = [
  { q: "Do I need to be in the US?", a: "No, that's the whole point. The program is built for creators outside the US. We walk you through the VPN, US SIM, and phone setup on Day 2 of the fast track." },
  { q: "Do I need a VPN or a specific phone?", a: "Yes to both. You'll need a reputable VPN and ideally a refurbished phone (we recommend specific models). We show you exactly what to buy and how to configure it in Module 2." },
  { q: "Do I need to buy a TikTok Shop account separately?", a: "Depends on your tier. Education + Verified Account includes one activated account handed to you on day 1. Education Only means you'll source an account yourself (from Nick G's marketplace on /accounts, or elsewhere)." },
  { q: "How fast is activation?", a: "Verified Account tier: 24 hours from submission. Education Only tier: next business day after you source your own account and submit it via the private chat." },
  { q: "How do payouts work?", a: "TikTok Shop pays commissions into a Wise USD account we help you set up. From Wise you can withdraw to your bank in any currency, at the mid-market rate. No US bank required." },
  { q: "What if my account gets a violation?", a: "We cover full compliance walkthroughs in Module 3. The exact things to avoid, how to appeal, and how to restart clean if something goes wrong. Most violations are preventable." },
  { q: "Can I upgrade tiers later?", a: "Yes. Enroll in Education Only, then pay the delta later to add an activated account. We honor the upgrade at any point in your program." },
  { q: "What's the guarantee?", a: "If you follow every step and complete the 7-day fast track, you will be live on TikTok Shop. That's our commitment. This is a completion-based guarantee, not a money-back refund policy. The program works when you work it." },
];

/* ============================================================
   ROOT
   ============================================================ */
export default function AcceleratorClient() {
  return (
    <div className="ac-shell">
      <Backdrop />
      <Header />
      <Hero />
      <Partners />
      <PricingBlock />
      <HowItWorks />
      <Testimonials />
      <Wins />
      <FAQ />
      <Footer />
      <ChatWidget />
      <Styles />
    </div>
  );
}

/* ============================================================
   HEADER (side-by-side co-brand)
   ============================================================ */
function Header() {
  return (
    <header className="ac-header">
      <div className="ac-header-brand">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/accelerator/wolf-transparent.png" alt="" width={40} height={40} />
        <span className="ac-brand-tag">
          <small>TIKTOK AFFILIATE</small>
          <b>ACCELERATOR</b>
        </span>
        <span className="ac-brand-x">×</span>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={encodeURI("/AM_LOGO-removebg-preview copy.png")} alt="Aragon Media" className="ac-am-logo" />
      </div>
      <nav className="ac-header-nav">
        <a href="#how" className="ac-nav-link">How it works</a>
        <a href="#pricing" className="ac-nav-link">Pricing</a>
        <a href="#faq" className="ac-nav-link">FAQ</a>
        <Link href="/accounts" className="ac-nav-cta">Browse accounts →</Link>
      </nav>
    </header>
  );
}

/* ============================================================
   BACKDROP grid + radar (reuses accelerator.css classes)
   ============================================================ */
function Backdrop() {
  return (
    <div className="taa-bg" aria-hidden>
      <div className="taa-grid" />
      <div className="taa-radar" />
    </div>
  );
}

/* ============================================================
   HERO
   ============================================================ */
function Hero() {
  return (
    <section className="ac-hero">
      <div className="ac-hero-eyebrow">TIKTOK AFFILIATE ACCELERATOR × ARAGON MEDIA</div>
      <h1 className="ac-hero-title">
        US TikTok Shop <span className="ac-accent">from anywhere.</span>
        <br />
        <span className="ac-hero-sub-line">In 7 days.</span>
      </h1>
      <p className="ac-hero-sub">
        The operating system for creators <strong>outside the US</strong> to earn
        <strong> USD commissions</strong> on TikTok Shop. Skool community, live
        workshops, and a verified account handed to you. Activation in
        <strong> 24 hours</strong>.
      </p>
      <div className="ac-hero-cta-row">
        <a href="#pricing" className="ac-cta-primary">See the tiers ↓</a>
        <a href="#how" className="ac-cta-ghost">How it works</a>
      </div>
      <div className="ac-hero-stats">
        <Stat n="500+" label="CREATORS ACTIVATED" />
        <Stat n="100%" label="ACTIVATION RATE" />
        <Stat n="24 HR" label="SETUP" />
        <Stat n="USD" label="PAID DIRECT" />
      </div>
    </section>
  );
}
function Stat({ n, label }: { n: string; label: string }) {
  return (
    <div className="ac-stat">
      <div className="ac-stat-n">{n}</div>
      <div className="ac-stat-l">{label}</div>
    </div>
  );
}

/* ============================================================
   PARTNERS (auto-scrolling marquee)
   ============================================================ */
function Partners() {
  return (
    <section className="ac-partners">
      <p className="ac-partners-eyebrow">BUILT WITH PARTNERS WHO WIN</p>
      <div className="ac-marquee">
        <div className="ac-marquee-track">
          {[...PARTNERS, ...PARTNERS].map((p, i) => (
            <div key={i} className="ac-partner-logo-wrap">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={p.src} alt={p.alt} className="ac-partner-logo" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ============================================================
   TESTIMONIALS
   ============================================================ */
function Testimonials() {
  return (
    <section className="ac-tests" id="testimonials">
      <div className="ac-tests-head">
        <p className="ac-section-eyebrow">RESULTS</p>
        <h2 className="ac-section-title">Real creators. <span className="ac-accent">Real USD commissions.</span></h2>
        <p className="ac-section-sub">These are creators outside the US who ran the program and now get paid in USD every month.</p>
      </div>
      <div className="ac-tests-grid">
        {TESTIMONIALS.map((t) => (
          <div key={t.src} className="ac-test-card">
            <video className="ac-test-video" controls preload="metadata" playsInline>
              <source src={t.src} type="video/mp4" />
            </video>
            <div className="ac-test-meta">
              <div className="ac-test-name">{t.name}</div>
              <div className="ac-test-city">{t.city}</div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

/* ============================================================
   HOW IT WORKS
   ============================================================ */
function HowItWorks() {
  const steps = [
    { d: "DAY 1", t: "Enroll & unlock", b: "Join the Skool community, meet the operators, get your onboarding roadmap. Everything's laid out before you start." },
    { d: "DAY 2", t: "Get set up", b: "VPN, US SIM, refurbished phone, Wise USD account. We walk you through every setup step live so nothing gets missed." },
    { d: "DAY 3", t: "Get activated", b: "Submit your account details in the private chat. The AM team verifies and activates within 24 hours." },
    { d: "DAY 4–7", t: "Start earning", b: "Post your first UGC, showcase products in your videos, watch USD land in your Wise account." },
  ];
  return (
    <section className="ac-how" id="how">
      <div className="ac-how-head">
        <p className="ac-section-eyebrow">THE 7-DAY FAST TRACK</p>
        <h2 className="ac-section-title">Zero to <span className="ac-accent">earning USD</span> in one week.</h2>
        <p className="ac-section-sub">A structured day-by-day walkthrough. Follow the steps, complete each module, activate.</p>
      </div>
      <ol className="ac-steps">
        {steps.map((s, i) => (
          <li key={s.d} className="ac-step">
            <div className="ac-step-num">{String(i + 1).padStart(2, "0")}</div>
            <div className="ac-step-body">
              <div className="ac-step-day">{s.d}</div>
              <h3 className="ac-step-title">{s.t}</h3>
              <p className="ac-step-desc">{s.b}</p>
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}

/* ============================================================
   PRICING (gated)
   ============================================================ */
function PricingBlock() {
  const [gate, setGate] = useState<GateStatus>("idle");
  const [form, setForm] = useState({ name: "", email: "" });
  const [error, setError] = useState<string | null>(null);
  const [clicking, setClicking] = useState<Tier | null>(null);

  // Resume if this browser has already unlocked
  useEffect(() => {
    try {
      if (localStorage.getItem("ac_gate_ok") === "1") setGate("revealed");
    } catch {}
  }, []);

  async function submitGate(e: React.FormEvent) {
    e.preventDefault();
    if (gate === "submitting") return;
    setError(null);
    setGate("submitting");
    try {
      const res = await fetch("/api/accelerator/intent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "reveal", email: form.email.trim(), name: form.name.trim() }),
      });
      const j = await res.json();
      if (!j.ok) throw new Error(j.error || "Something went wrong.");
      try { localStorage.setItem("ac_gate_ok", "1"); localStorage.setItem("ac_gate_email", form.email.trim()); localStorage.setItem("ac_gate_name", form.name.trim()); } catch {}
      setGate("revealed");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
      setGate("idle");
    }
  }

  async function clickTier(tier: Tier) {
    if (clicking) return;
    setClicking(tier);
    try {
      const res = await fetch("/api/accelerator/intent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "click", tier }),
      });
      const j = await res.json();
      if (j.ok && j.checkoutUrl) {
        window.location.href = j.checkoutUrl;
      } else {
        setClicking(null);
      }
    } catch {
      setClicking(null);
    }
  }

  return (
    <section className="ac-pricing" id="pricing">
      <div className="ac-pricing-head">
        <p className="ac-section-eyebrow">PICK YOUR PATH</p>
        <h2 className="ac-section-title">One program. <span className="ac-accent">Three tiers.</span></h2>
        <p className="ac-section-sub">Education-only, education + a verified account handed to you, or just browse Nick G&apos;s live inventory.</p>
        <div className="ac-guarantee">
          <span className="ac-guarantee-icon">🛡</span>
          <div>
            <b>7-Day Activation Guarantee.</b> Follow every step and complete the fast track. You will be live on TikTok Shop. That&apos;s our commitment.
          </div>
        </div>
      </div>

      {gate !== "revealed" ? (
        <div className="ac-gate-card">
          <div className="ac-gate-eyebrow">UNLOCK PRICING</div>
          <h3 className="ac-gate-title">Enter your name and email to see the tiers.</h3>
          <p className="ac-gate-sub">Takes 3 seconds. No spam. Just so we can send you Skool access details after you enroll.</p>
          <form onSubmit={submitGate} className="ac-gate-form">
            <div className="ac-gate-row">
              <input
                type="text" required placeholder="Your name" autoComplete="name"
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              />
              <input
                type="email" required placeholder="you@example.com" autoComplete="email"
                value={form.email}
                onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
              />
            </div>
            <button type="submit" className="ac-cta-primary" disabled={gate === "submitting"}>
              {gate === "submitting" ? "Unlocking…" : "Unlock the tiers →"}
            </button>
            {error && <p className="ac-gate-err">{error}</p>}
          </form>
        </div>
      ) : (
        <div className="ac-tiers">
          <TierCard
            eyebrow="EDUCATION ONLY"
            price="$997"
            label="one-time"
            features={[
              "Full Skool community access",
              "All 7-day fast track modules",
              "Weekly live workshops with Roni + AM",
              "Resource vault + templates",
              "Private chat with the AM team",
              "Account NOT included (source your own)",
            ]}
            cta="Enroll — $997"
            onClick={() => clickTier("edu_only")}
            loading={clicking === "edu_only"}
          />
          <TierCard
            highlight
            eyebrow="EDUCATION + VERIFIED ACCOUNT"
            price="$1,997"
            label="one-time · most popular"
            features={[
              "Everything in Education Only",
              "One verified US TikTok Shop account, day 1",
              "Priority same-day activation",
              "1-on-1 kickoff call with the AM team",
              "Compliance walkthrough for your niche",
              "Fast track your first commission",
            ]}
            cta="Enroll — $1,997"
            onClick={() => clickTier("edu_plus_account")}
            loading={clicking === "edu_plus_account"}
          />
          <TierCard
            variant="browse"
            eyebrow="ACCOUNTS ONLY"
            price="Browse"
            label="marketplace access"
            features={[
              "Nick G's live account inventory",
              "Handles, follower counts, prices",
              "Filter by follower tier",
              "One-click Discord ticket to buy",
              "No program included — accounts only",
              "For creators who already know the game",
            ]}
            cta="Browse accounts →"
            onClick={() => clickTier("browse")}
            loading={clicking === "browse"}
          />
        </div>
      )}
    </section>
  );
}

function TierCard(props: {
  eyebrow: string; price: string; label: string; features: string[];
  cta: string; onClick: () => void; loading?: boolean;
  highlight?: boolean; variant?: "browse";
}) {
  return (
    <div className={`ac-tier${props.highlight ? " ac-tier-highlight" : ""}${props.variant === "browse" ? " ac-tier-browse" : ""}`}>
      {props.highlight && <div className="ac-tier-ribbon">MOST POPULAR</div>}
      <div className="ac-tier-eyebrow">{props.eyebrow}</div>
      <div className="ac-tier-price">{props.price}</div>
      <div className="ac-tier-label">{props.label}</div>
      <ul className="ac-tier-features">
        {props.features.map((f, i) => (
          <li key={i}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
            <span>{f}</span>
          </li>
        ))}
      </ul>
      <button type="button" className="ac-cta-primary" onClick={props.onClick} disabled={props.loading}>
        {props.loading ? "Routing…" : props.cta}
      </button>
    </div>
  );
}

/* ============================================================
   FAQ (accordion)
   ============================================================ */
function FAQ() {
  const [open, setOpen] = useState<number | null>(0);
  return (
    <section className="ac-faq" id="faq">
      <div className="ac-faq-head">
        <p className="ac-section-eyebrow">FAQ</p>
        <h2 className="ac-section-title">Questions we get <span className="ac-accent">every week.</span></h2>
      </div>
      <div className="ac-faq-list">
        {FAQ_ITEMS.map((f, i) => {
          const isOpen = open === i;
          return (
            <button
              key={i}
              type="button"
              className={`ac-faq-item${isOpen ? " open" : ""}`}
              onClick={() => setOpen(isOpen ? null : i)}
              aria-expanded={isOpen}
            >
              <div className="ac-faq-q">
                <span>{f.q}</span>
                <span className="ac-faq-sign">{isOpen ? "–" : "+"}</span>
              </div>
              {isOpen && <div className="ac-faq-a">{f.a}</div>}
            </button>
          );
        })}
      </div>
    </section>
  );
}

/* ============================================================
   FOOTER
   ============================================================ */
function Footer() {
  return (
    <footer className="ac-footer">
      <div className="ac-footer-brand">
        <span className="ac-footer-dot" /> Powered by <b>Aragon Media</b> × <b>Accelerator</b>
      </div>
      <div className="ac-footer-links">
        <Link href="/terms">Terms</Link>
        <Link href="/privacy">Privacy</Link>
        <Link href="/accounts">Accounts</Link>
        <a href="mailto:aragonkevin239@gmail.com">Contact</a>
      </div>
    </footer>
  );
}

/* ============================================================
   CHAT WIDGET — reuses /api/chatroom infrastructure
   ============================================================ */
function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [status, setStatus] = useState<ChatStatus>("gate");
  const [form, setForm] = useState({ name: "", email: "" });
  const [thread, setThread] = useState<{ id: string; email: string; name: string } | null>(null);
  const [msgs, setMsgs] = useState<Array<{ id: string; sender: string; body: string; createdAt: string }>>([]);
  const [composer, setComposer] = useState("");
  const [error, setError] = useState<string | null>(null);
  const feedRef = useRef<HTMLDivElement>(null);
  const CAL = "https://calendly.com/itskevinaragon/30min";

  useEffect(() => {
    try {
      const em = localStorage.getItem("am_chatroom_email") ?? "";
      const nm = localStorage.getItem("am_chatroom_name") ?? "";
      if (em) setForm({ name: nm, email: em });
    } catch {}
  }, []);

  useEffect(() => {
    feedRef.current?.scrollTo({ top: feedRef.current.scrollHeight, behavior: "smooth" });
  }, [msgs.length]);

  const openThread = useCallback(async () => {
    setError(null);
    try {
      const res = await fetch("/api/chatroom/threads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
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
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ threadId: thread.id, body: text }),
      });
      const j = await res.json();
      if (!j.ok) throw new Error(j.error || "Send failed.");
      setMsgs((cur) => [...cur, j.message]);
      setComposer("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Send failed.");
    } finally { setStatus("open"); }
  }

  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);
  if (!mounted) return null;

  const widget = (
    <div className="ac-chat-widget" data-open={open}>
      {!open && (
        <button className="ac-chat-toggle" onClick={() => setOpen(true)} aria-label="Open chat">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/></svg>
          <span>Chat with AM</span>
        </button>
      )}
      {open && (
        <div className="ac-chat-panel">
          <div className="ac-chat-head">
            <div>
              <div className="ac-chat-head-title">Chat with the AM team</div>
              <div className="ac-chat-head-sub">We reply as fast as we can.</div>
            </div>
            <button className="ac-chat-close" onClick={() => setOpen(false)} aria-label="Close">×</button>
          </div>

          {status === "gate" ? (
            <form className="ac-chat-gate" onSubmit={(e) => { e.preventDefault(); openThread(); }}>
              <p>Name + email starts a private thread tied to you. We&apos;ll get back to you here.</p>
              <input
                type="text" required placeholder="Your name" autoComplete="name"
                value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              />
              <input
                type="email" required placeholder="you@example.com" autoComplete="email"
                value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
              />
              <button type="submit" className="ac-cta-primary">Start chat →</button>
              <a href={CAL} target="_blank" rel="noopener noreferrer" className="ac-chat-book">
                Or book a 30-min call →
              </a>
              {error && <p className="ac-chat-err">{error}</p>}
            </form>
          ) : (
            <>
              <div ref={feedRef} className="ac-chat-feed">
                {msgs.length === 0 ? (
                  <div className="ac-chat-empty">Say hi — the AM team will jump in.</div>
                ) : msgs.map((m) => (
                  <div key={m.id} className={`ac-chat-msg ${m.sender === "user" ? "me" : "them"}`}>
                    <p>{m.body}</p>
                    <span>{m.sender === "user" ? "You" : "AM Team"} · {new Date(m.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
                  </div>
                ))}
              </div>
              <div className="ac-chat-quicks">
                <a href={CAL} target="_blank" rel="noopener noreferrer">📞 Book a call</a>
              </div>
              <form className="ac-chat-composer" onSubmit={(e) => { e.preventDefault(); send(); }}>
                <input
                  type="text" placeholder="Type a message…"
                  value={composer} onChange={(e) => setComposer(e.target.value)}
                  disabled={status === "sending"}
                />
                <button type="submit" disabled={!composer.trim() || status === "sending"}>Send</button>
                {error && <p className="ac-chat-err">{error}</p>}
              </form>
            </>
          )}
        </div>
      )}
    </div>
  );

  return createPortal(widget, document.body);
}

/* ============================================================
   WINS gallery (Kevin uploads screenshots here)
   ============================================================ */
function Wins() {
  return (
    <section className="ac-wins" id="wins">
      <div className="ac-wins-head">
        <p className="ac-section-eyebrow">MORE WINS</p>
        <h2 className="ac-section-title">The <span className="ac-accent">receipts.</span></h2>
        <p className="ac-section-sub">Fresh screenshots straight from the creators inside the program. Updated weekly.</p>
      </div>
      {WINS.length === 0 ? (
        <div className="ac-wins-empty">
          <div className="ac-wins-empty-glow" aria-hidden="true" />
          <p className="ac-wins-empty-title">More wins landing shortly.</p>
          <p className="ac-wins-empty-sub">Check back weekly. The team is flooding this space with fresh screenshots as creators activate and start earning.</p>
        </div>
      ) : (
        <div className="ac-wins-grid">
          {WINS.map((w, i) => (
            <figure key={i} className="ac-win-card">
              {w.video ? (
                <video
                  src={encodeURI(w.src)}
                  autoPlay
                  muted
                  loop
                  playsInline
                  controls
                  preload="metadata"
                />
              ) : (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img src={encodeURI(w.src)} alt={w.caption || "Creator win"} loading="lazy" />
              )}
              {w.caption && <figcaption>{w.caption}</figcaption>}
            </figure>
          ))}
        </div>
      )}
    </section>
  );
}

/* ============================================================
   STYLES
   ============================================================ */
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
      .ac-header { position: sticky; top: 0; z-index: 20; display: flex; justify-content: space-between; align-items: center; padding: 18px 40px; background: rgba(5, 5, 5, 0.75); backdrop-filter: blur(10px); border-bottom: 1px solid var(--taa-border); }
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
      .ac-hero { max-width: 1180px; margin: 0 auto; padding: 80px 40px 60px; }
      .ac-hero-eyebrow { display: inline-block; padding: 6px 14px; font-size: 10.5px; letter-spacing: 0.24em; color: var(--taa-red); font-weight: 700; background: rgba(220, 30, 46, 0.06); border: 1px solid rgba(220, 30, 46, 0.32); border-radius: 999px; text-transform: uppercase; margin-bottom: 22px; }
      .ac-hero-title { margin: 0 0 20px; font-size: clamp(44px, 8vw, 88px); font-weight: 900; letter-spacing: -0.04em; line-height: 0.96; text-transform: uppercase; color: var(--taa-white); }
      .ac-hero-sub-line { color: var(--taa-white); }
      .ac-hero-sub { margin: 0 0 30px; max-width: 640px; color: var(--taa-muted); font-size: 16px; line-height: 1.65; }
      .ac-hero-sub strong { color: var(--taa-white); font-weight: 700; }
      .ac-hero-cta-row { display: flex; gap: 12px; margin-bottom: 56px; flex-wrap: wrap; }
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
        .ac-header { padding: 12px 16px; gap: 10px; }
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
        .ac-hero-stats { display: grid; grid-template-columns: 1fr 1fr; padding: 14px 18px; gap: 14px 18px; width: 100%; box-sizing: border-box; }
        .ac-hero-stats .ac-stat-sep { display: none; }
        .ac-hero-stats .ac-stat { min-width: 0; text-align: left; }
        .ac-stat-n { font-size: 20px; }
        .ac-stat-l { font-size: 9.5px; }
        .ac-partners { padding: 30px 20px 40px; }
        .ac-partner-logo-wrap { height: 56px; min-width: 90px; padding: 10px 14px; }
        .ac-partner-logo { height: 32px; max-width: 100px; }
        .ac-tests, .ac-how, .ac-pricing, .ac-faq, .ac-wins { padding-left: 20px; padding-right: 20px; padding-top: 50px; padding-bottom: 30px; }
        .ac-tests-grid { grid-template-columns: 1fr; gap: 14px; }
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
