"use client";

/**
 * QualifierFlow — 3-step qualifier funnel for the /roni/tiktokshop and
 * /colt/tiktokshop landers. Replaces the single-step RSVP form.
 *
 * Flow:
 *   1) Stage (UGC-with-deals / creator-no-deals / growing / new)
 *   2) Monthly income ($5K+ / $1-5K / <$1K / $0)
 *   3) 90-day goal (free text)
 *   → "You qualify ✨" reveal + contact capture
 *   → Thank-you with VSL gate (click → fires /api/accelerator/vsl-view + reveals video)
 *
 * All qualifier answers persist to Neon (accelerator_intents) + Airtable
 * (Lead Stage, Monthly Income, 90-Day Goal fields) so the Hot/Warm/Nurture
 * priority is derivable without manual work.
 *
 * Brand prop controls palette, logo, host names, WhatsApp area code hint,
 * VSL source path, and Meta Pixel category.
 */

import { useState } from "react";

type Brand = "roni" | "colt";

const BRAND_CFG: Record<Brand, {
  accent: string;
  accentSoft: string;
  accentGlow: string;
  logo: string;
  logoAlt: string;
  brandSmall: string;
  brandBig: string;
  hostFirst: string;      // displayed in VSL overlay
  hostPair: string;       // "right host (Roni or Kevin)"
  waAreaCode: string;     // "+1 (403)"
  vslSrc: string;
  pixelCategory: string;
  pixelName: string;
}> = {
  roni: {
    accent: "#DC1E2E",
    accentSoft: "rgba(220,30,46,0.12)",
    accentGlow: "rgba(220,30,46,0.35)",
    logo: "/accelerator/wolf-transparent.png",
    logoAlt: "TikTok Affiliate Accelerator",
    brandSmall: "TIKTOK AFFILIATE",
    brandBig: "ACCELERATOR",
    hostFirst: "Roni",
    hostPair: "Roni or Kevin",
    waAreaCode: "+1 (403)",
    vslSrc: "/accelerator/vsl.mp4",
    pixelCategory: "accelerator-roni",
    pixelName: "Roni Qualifier · TikTok Shop",
  },
  colt: {
    accent: "#00E5FF",
    accentSoft: "rgba(0,229,255,0.12)",
    accentGlow: "rgba(0,229,255,0.35)",
    logo: "/colt/logo-tu.png",
    logoAlt: "TTSUnlocked · Powered by COLT",
    brandSmall: "TTSUNLOCKED",
    brandBig: "POWERED BY COLT",
    hostFirst: "Colton",
    hostPair: "Colton or Kevin",
    waAreaCode: "+1 (705)",
    vslSrc: "/colt/colt-vsl.mp4",
    pixelCategory: "accelerator-colt",
    pixelName: "Colt Qualifier · TikTok Shop",
  },
};

const COUNTRIES: { code: string; label: string }[] = [
  { code: "+1",    label: "🇺🇸 +1" },
  { code: "+1-ca", label: "🇨🇦 +1 (CA)" },
  { code: "+44",   label: "🇬🇧 +44" },
  { code: "+353",  label: "🇮🇪 +353" },
  { code: "+34",   label: "🇪🇸 +34" },
  { code: "+61",   label: "🇦🇺 +61" },
  { code: "+49",   label: "🇩🇪 +49" },
  { code: "+33",   label: "🇫🇷 +33" },
  { code: "+31",   label: "🇳🇱 +31" },
  { code: "+55",   label: "🇧🇷 +55" },
  { code: "+52",   label: "🇲🇽 +52" },
  { code: "+971",  label: "🇦🇪 +971" },
  { code: "+other",label: "Other" },
];

const STAGE_OPTIONS = [
  { value: "ugc-with-deals",   emoji: "💼", label: "UGC creator with active brand deals", hint: "Consistent income, proven content" },
  { value: "creator-no-deals", emoji: "🎥", label: "Creating content, no brand deals yet", hint: "Posting consistently, ready to monetize" },
  { value: "growing",          emoji: "📈", label: "Growing audience, testing things out", hint: "Early traction, figuring out what works" },
  { value: "new",              emoji: "✨", label: "Just getting started",                 hint: "Haven't posted much yet, exploring" },
];

const INCOME_OPTIONS = [
  { value: "5k-plus",  emoji: "💰", label: "$5K+ per month, consistent",   hint: "Brand deals, UGC, affiliate income" },
  { value: "1k-5k",    emoji: "💵", label: "$1K – $5K per month",          hint: "A few deals, building momentum" },
  { value: "under-1k", emoji: "🌱", label: "Under $1K per month",          hint: "Small income, want to scale" },
  { value: "zero",     emoji: "🚀", label: "Not earning from content yet", hint: "Starting from zero, ready to work" },
];

const STAGE_REVEAL: Record<string, string> = {
  "ugc-with-deals":   "You're already monetizing with brand deals. We can focus the call on <b>scaling to US TikTok Shop</b> without starting from scratch.",
  "creator-no-deals": "You've got the content muscle. Now it's about <b>connecting that to US TikTok Shop income</b>. That's exactly our wheelhouse.",
  "growing":          "You're in the sweet spot to layer <b>US TikTok Shop income</b> onto what you're already building. The call will map the fastest path.",
  "new":              "Starting fresh means we build the playbook <b>right the first time</b>. The call will show you the exact 7-day setup.",
};

export default function QualifierFlow({ brand }: { brand: Brand }) {
  const cfg = BRAND_CFG[brand];

  const [step, setStep] = useState<1 | 2 | 3 | 4 | 5>(1);
  const [stage, setStage] = useState<string>("");
  const [income, setIncome] = useState<string>("");
  const [goal, setGoal] = useState("");
  const [firstName, setFirstName] = useState("");
  const [waCountry, setWaCountry] = useState(brand === "roni" ? "+1-ca" : "+1");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [intentId, setIntentId] = useState<string | null>(null);
  const [vslRevealed, setVslRevealed] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (submitting) return;
    setSubmitting(true);
    setError(null);
    try {
      const waFull = waCountry.replace(/-ca$/, "") + " " + phone.trim();
      const r = await fetch("/api/accelerator/call-rsvp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: firstName.trim(),
          email: email.trim(),
          whatsapp: waFull,
          country: waCountry === "+1-ca" ? "Canada" : waCountry === "+1" ? "USA" : waCountry,
          source: "Qualifier Funnel",
          accelerator: brand,
          leadStage: stage,
          monthlyIncome: income,
          goalText: goal.trim(),
        }),
      });
      const j = await r.json();
      if (!j.ok) throw new Error(j.error || "Something went wrong.");
      setIntentId(j.id || null);
      setStep(5);
      // Meta Pixel
      if (typeof window !== "undefined") {
        const w = window as unknown as { fbq?: (...args: unknown[]) => void };
        if (typeof w.fbq === "function") {
          w.fbq("track", "Lead", {
            content_name: cfg.pixelName,
            content_category: cfg.pixelCategory,
            value: 0,
            currency: "USD",
          });
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  async function onVslClick() {
    setVslRevealed(true);
    if (!intentId) return;
    try {
      await fetch("/api/accelerator/vsl-view", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: intentId, accelerator: brand }),
      });
    } catch { /* non-blocking */ }
  }

  const canNext1 = !!stage;
  const canNext2 = !!income;
  const canNext3 = goal.trim().length >= 5;
  const canSubmit = firstName.trim().length > 1 && phone.trim().length > 5 && email.includes("@");

  return (
    <section id="signup" className="qf-wrap" data-brand={brand}>
      <div className="qf-brand">
        <div className="qf-mark">
          <img src={cfg.logo} alt={cfg.logoAlt} />
        </div>
        <div className="qf-brand-text">
          <small>{cfg.brandSmall}</small>
          <b>{cfg.brandBig}</b>
        </div>
      </div>

      {step <= 3 && (
        <div className="qf-progress">
          <div className="qf-progress-meta">
            <span className="qf-step-label">Step {step} of 3</span>
            <span className="qf-step-count">Takes ~30 seconds</span>
          </div>
          <div className="qf-progress-bar"><div className="qf-progress-fill" style={{ width: `${(step/3)*100}%` }} /></div>
        </div>
      )}

      {step === 1 && (
        <div className="qf-step">
          <h2 className="qf-q">Where are you at as a creator today?</h2>
          <p className="qf-sub">Helps us tailor your 1-on-1 call to where you actually are.</p>
          <div className="qf-options">
            {STAGE_OPTIONS.map((o) => (
              <button key={o.value} type="button"
                className={`qf-option${stage === o.value ? " selected" : ""}`}
                onClick={() => setStage(o.value)}>
                <span className="qf-emoji">{o.emoji}</span>
                <span className="qf-content">
                  <span className="qf-label">{o.label}</span>
                  <span className="qf-hint">{o.hint}</span>
                </span>
                <span className="qf-check" />
              </button>
            ))}
          </div>
          <div className="qf-actions">
            <button className="qf-btn qf-btn-primary" disabled={!canNext1} onClick={() => setStep(2)}>Continue →</button>
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="qf-step">
          <h2 className="qf-q">What are you currently earning per month from content?</h2>
          <p className="qf-sub">No judgment, just helps us match the right strategy to your situation.</p>
          <div className="qf-options">
            {INCOME_OPTIONS.map((o) => (
              <button key={o.value} type="button"
                className={`qf-option${income === o.value ? " selected" : ""}`}
                onClick={() => setIncome(o.value)}>
                <span className="qf-emoji">{o.emoji}</span>
                <span className="qf-content">
                  <span className="qf-label">{o.label}</span>
                  <span className="qf-hint">{o.hint}</span>
                </span>
                <span className="qf-check" />
              </button>
            ))}
          </div>
          <div className="qf-actions">
            <button className="qf-btn qf-btn-primary" disabled={!canNext2} onClick={() => setStep(3)}>Continue →</button>
          </div>
        </div>
      )}

      {step === 3 && (
        <div className="qf-step">
          <h2 className="qf-q">What&apos;s your #1 goal for the next 90 days?</h2>
          <p className="qf-sub">In your own words. The more specific, the better we can prep your call.</p>
          <div className="qf-textarea-wrap">
            <textarea className="qf-textarea" value={goal} onChange={(e) => setGoal(e.target.value)}
              placeholder="e.g. Hit $10K/month on US TikTok Shop, land my first 3 brand deals in the US, replace my 9-5 income by Q1..." />
          </div>
          <div className="qf-actions">
            <button className="qf-btn qf-btn-primary" disabled={!canNext3} onClick={() => setStep(4)}>See if I qualify →</button>
          </div>
        </div>
      )}

      {step === 4 && (
        <div className="qf-step">
          <div className="qf-qualify-badge">
            <span className="qf-pulse-dot" />
            <span>You qualify</span>
          </div>
          <h2 className="qf-qualify-title">You&apos;re a great fit <span className="qf-spark">✨</span></h2>
          <p className="qf-qualify-sub" dangerouslySetInnerHTML={{ __html: (STAGE_REVEAL[stage] || "You're a great fit for this program.") + " <b>Drop your details below</b> and the team will reach out within 24 hours." }} />
          <form onSubmit={submit}>
            <div className="qf-field">
              <label>First name</label>
              <input type="text" required placeholder="Your first name" value={firstName} onChange={(e) => setFirstName(e.target.value)} />
            </div>
            <div className="qf-field">
              <label>WhatsApp number</label>
              <div className="qf-phone-row">
                <select value={waCountry} onChange={(e) => setWaCountry(e.target.value)}>
                  {COUNTRIES.map((c) => (<option key={c.code} value={c.code}>{c.label}</option>))}
                </select>
                <input type="tel" required placeholder="Your WhatsApp number" value={phone} onChange={(e) => setPhone(e.target.value)} />
              </div>
            </div>
            <div className="qf-field">
              <label>Email</label>
              <input type="email" required placeholder="you@email.com" value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
            <div className="qf-assurance">
              <span className="qf-assurance-icon">🔒</span>
              <span>Your info stays private. We only use it to reach you about your free call.</span>
            </div>
            {error && <p className="qf-err">{error}</p>}
            <div className="qf-actions">
              <button type="submit" className="qf-btn qf-btn-primary" disabled={!canSubmit || submitting}>
                {submitting ? "Locking in…" : "Lock in my free call →"}
              </button>
            </div>
          </form>
        </div>
      )}

      {step === 5 && (
        <div className="qf-step qf-thanks">
          <div className="qf-check-circle" />
          <h2 className="qf-thanks-title">You&apos;re in. We&apos;ll be in touch.</h2>
          <p className="qf-thanks-copy">The team will reach out on <b>WhatsApp within 24 hours</b> to confirm your free 1-on-1 call.</p>
          <p className="qf-thanks-copy qf-thanks-small">Keep an eye on your messages. Check that we&apos;re not in your filtered folder.</p>

          {!vslRevealed ? (
            <button type="button" className="qf-vsl-gate" onClick={onVslClick}>
              <span className="qf-vsl-icon">▶</span>
              <span className="qf-vsl-text">
                <b>Ready to see your next steps?</b>
                <small>Watch {cfg.hostFirst} walk through the full playbook before your call</small>
              </span>
              <span className="qf-vsl-arrow">→</span>
            </button>
          ) : (
            <div className="qf-vsl-reveal">
              <div className="qf-vsl-label"><span className="qf-pulse-dot" /><span>Your video is ready</span></div>
              <video className="qf-vsl-player" src={cfg.vslSrc} controls autoPlay playsInline />
            </div>
          )}

          <div className="qf-next-steps">
            <h4>What happens next</h4>
            <ul>
              <li><span className="qf-num">1</span><span>We review your answers and match you with the right host ({cfg.hostPair}).</span></li>
              <li><span className="qf-num">2</span><span>You get a WhatsApp from <b>{cfg.waAreaCode} ...</b> within 24 hours with your call booking link.</span></li>
              <li><span className="qf-num">3</span><span>On the call we walk you through the exact 7-day setup, pricing, and whether it&apos;s a fit. No pressure.</span></li>
            </ul>
          </div>
        </div>
      )}

      <style>{`
        .qf-wrap { --qf-accent:${cfg.accent}; --qf-accent-soft:${cfg.accentSoft}; --qf-accent-glow:${cfg.accentGlow}; --qf-bg:#0a0a0c; --qf-surface:#111116; --qf-surface-2:#17171f; --qf-border:#23232e; --qf-border-strong:#2e2e3a; --qf-text:#f5f5fa; --qf-muted:#8a8a9a; --qf-success:#22c55e; --qf-success-soft:rgba(34,197,94,0.12);
          background:var(--qf-bg); color:var(--qf-text); border:1px solid var(--qf-border); border-radius:20px; padding:36px 24px; margin:40px 0 20px; box-shadow:0 20px 60px rgba(0,0,0,0.5); font-family:'Inter',system-ui,sans-serif; position:relative; overflow:hidden; }
        .qf-wrap::before { content:""; position:absolute; inset:0; pointer-events:none; background:radial-gradient(ellipse 80% 50% at 50% -10%, var(--qf-accent-soft) 0%, transparent 60%); }
        .qf-wrap > * { position:relative; z-index:1; }
        .qf-brand { display:flex; align-items:center; gap:10px; margin-bottom:28px; }
        .qf-mark { width:40px; height:40px; border-radius:10px; background:linear-gradient(135deg, var(--qf-accent-soft), transparent); border:1px solid var(--qf-accent); display:flex; align-items:center; justify-content:center; overflow:hidden; box-shadow:0 4px 16px -4px var(--qf-accent-glow); }
        .qf-mark img { width:100%; height:100%; object-fit:contain; padding:4px; }
        .qf-brand-text { display:flex; flex-direction:column; line-height:1; }
        .qf-brand-text small { font-size:10px; letter-spacing:0.14em; color:var(--qf-muted); text-transform:uppercase; margin-bottom:4px; font-weight:700; }
        .qf-brand-text b { font-family:'Poppins','Inter Tight',sans-serif; font-weight:800; font-size:14px; letter-spacing:-0.01em; color:var(--qf-text); }
        .qf-progress { margin-bottom:28px; }
        .qf-progress-meta { display:flex; justify-content:space-between; align-items:center; margin-bottom:10px; }
        .qf-step-label { font-family:'Poppins',sans-serif; font-weight:700; font-size:12px; letter-spacing:0.08em; text-transform:uppercase; color:var(--qf-accent); }
        .qf-step-count { font-size:12px; color:var(--qf-muted); font-weight:500; }
        .qf-progress-bar { height:4px; background:var(--qf-border); border-radius:999px; overflow:hidden; }
        .qf-progress-fill { height:100%; background:var(--qf-accent); border-radius:999px; transition:width 0.5s cubic-bezier(.4,0,.2,1); box-shadow:0 0 20px var(--qf-accent-glow); }
        .qf-step { animation:qfFade 0.35s ease; }
        @keyframes qfFade { from { opacity:0; transform:translateY(8px); } to { opacity:1; transform:translateY(0); } }
        .qf-q { font-family:'Poppins',sans-serif; font-weight:800; font-size:28px; line-height:1.15; letter-spacing:-0.02em; margin:0 0 8px; color:var(--qf-text); }
        .qf-sub { color:var(--qf-muted); font-size:15px; margin:0 0 24px; line-height:1.5; }
        .qf-options { display:flex; flex-direction:column; gap:10px; }
        .qf-option { all:unset; cursor:pointer; display:flex; align-items:center; gap:14px; padding:16px 18px; background:var(--qf-surface); border:1px solid var(--qf-border); border-radius:14px; transition:all 0.18s ease; box-sizing:border-box; }
        .qf-option:hover { background:var(--qf-surface-2); border-color:var(--qf-border-strong); transform:translateY(-1px); }
        .qf-option.selected { background:var(--qf-accent-soft); border-color:var(--qf-accent); box-shadow:0 0 0 1px var(--qf-accent), 0 8px 24px -8px var(--qf-accent-glow); }
        .qf-emoji { font-size:20px; width:36px; height:36px; display:flex; align-items:center; justify-content:center; background:var(--qf-surface-2); border-radius:10px; flex-shrink:0; }
        .qf-option.selected .qf-emoji { background:rgba(0,0,0,0.3); }
        .qf-content { flex:1; display:flex; flex-direction:column; }
        .qf-label { font-weight:600; font-size:15px; margin-bottom:2px; color:var(--qf-text); }
        .qf-hint { font-size:12px; color:var(--qf-muted); }
        .qf-check { width:20px; height:20px; border-radius:50%; border:1.5px solid var(--qf-border-strong); flex-shrink:0; display:flex; align-items:center; justify-content:center; position:relative; }
        .qf-option.selected .qf-check { background:var(--qf-accent); border-color:var(--qf-accent); }
        .qf-option.selected .qf-check::after { content:""; width:8px; height:4px; border-left:2px solid #000; border-bottom:2px solid #000; transform:rotate(-45deg) translateY(-1px); }
        .qf-textarea-wrap { background:var(--qf-surface); border:1px solid var(--qf-border); border-radius:14px; padding:4px; transition:all 0.18s ease; }
        .qf-textarea-wrap:focus-within { border-color:var(--qf-accent); box-shadow:0 0 0 1px var(--qf-accent), 0 8px 24px -8px var(--qf-accent-glow); }
        .qf-textarea { width:100%; min-height:110px; padding:14px 16px; background:transparent; border:none; outline:none; font-family:inherit; font-size:15px; line-height:1.5; color:var(--qf-text); resize:none; box-sizing:border-box; }
        .qf-textarea::placeholder { color:#5a5a6a; }
        .qf-actions { display:flex; gap:10px; margin-top:24px; }
        .qf-btn { all:unset; cursor:pointer; text-align:center; padding:15px 22px; border-radius:12px; font-weight:700; font-size:15px; transition:all 0.18s ease; display:inline-flex; align-items:center; justify-content:center; gap:8px; box-sizing:border-box; }
        .qf-btn-primary { background:var(--qf-accent); color:#000; flex:1; box-shadow:0 8px 24px -8px var(--qf-accent-glow); }
        .qf-btn-primary:hover:not(:disabled) { transform:translateY(-1px); box-shadow:0 12px 32px -8px var(--qf-accent-glow); }
        .qf-btn-primary:disabled { background:var(--qf-surface-2); color:var(--qf-muted); cursor:not-allowed; box-shadow:none; }
        .qf-qualify-badge { display:inline-flex; align-items:center; gap:8px; padding:8px 14px; background:var(--qf-success-soft); border:1px solid rgba(34,197,94,0.3); border-radius:999px; font-size:12px; font-weight:700; color:var(--qf-success); letter-spacing:0.06em; text-transform:uppercase; margin-bottom:18px; }
        .qf-pulse-dot { width:8px; height:8px; border-radius:50%; background:currentColor; box-shadow:0 0 10px currentColor; animation:qfPulse 1.8s ease-in-out infinite; }
        @keyframes qfPulse { 0%,100% { opacity:1; transform:scale(1); } 50% { opacity:0.6; transform:scale(1.2); } }
        .qf-qualify-title { font-family:'Poppins',sans-serif; font-weight:900; font-size:36px; line-height:1.05; letter-spacing:-0.03em; margin:0 0 12px; color:var(--qf-text); }
        .qf-spark { display:inline-block; animation:qfSpark 1.6s ease-in-out infinite; }
        @keyframes qfSpark { 0%,100% { transform:scale(1) rotate(0); } 50% { transform:scale(1.15) rotate(10deg); } }
        .qf-qualify-sub { color:var(--qf-muted); font-size:15px; line-height:1.55; margin:0 0 24px; }
        .qf-qualify-sub b { color:var(--qf-text); font-weight:600; }
        .qf-field { margin-bottom:14px; }
        .qf-field label { display:block; font-size:12px; font-weight:600; color:var(--qf-muted); letter-spacing:0.05em; text-transform:uppercase; margin-bottom:8px; }
        .qf-field input { width:100%; padding:13px 15px; background:var(--qf-surface); border:1px solid var(--qf-border); border-radius:12px; font-size:15px; color:var(--qf-text); box-sizing:border-box; transition:all 0.18s ease; font-family:inherit; outline:none; }
        .qf-field input:focus { border-color:var(--qf-accent); box-shadow:0 0 0 1px var(--qf-accent), 0 8px 24px -8px var(--qf-accent-glow); }
        .qf-field input::placeholder { color:#5a5a6a; }
        .qf-phone-row { display:grid; grid-template-columns:120px 1fr; gap:10px; }
        .qf-phone-row select { padding:13px 15px; background:var(--qf-surface); border:1px solid var(--qf-border); border-radius:12px; font-size:15px; color:var(--qf-text); cursor:pointer; box-sizing:border-box; font-family:inherit; outline:none; }
        .qf-assurance { display:flex; align-items:flex-start; gap:10px; padding:12px 14px; background:var(--qf-surface); border:1px solid var(--qf-border); border-radius:12px; font-size:13px; color:var(--qf-muted); line-height:1.5; margin:16px 0; }
        .qf-assurance-icon { flex-shrink:0; }
        .qf-err { color:#ff4d4d; font-size:13px; margin:6px 0 0; }
        .qf-thanks { text-align:center; padding:12px 0 0; }
        .qf-check-circle { width:68px; height:68px; border-radius:50%; background:var(--qf-success-soft); border:2px solid var(--qf-success); margin:0 auto 20px; display:flex; align-items:center; justify-content:center; animation:qfPop 0.5s cubic-bezier(.34,1.56,.64,1); }
        @keyframes qfPop { 0% { transform:scale(0); } 100% { transform:scale(1); } }
        .qf-check-circle::after { content:""; width:20px; height:10px; border-left:3px solid var(--qf-success); border-bottom:3px solid var(--qf-success); transform:rotate(-45deg) translateY(-2px); }
        .qf-thanks-title { font-family:'Poppins',sans-serif; font-weight:900; font-size:28px; letter-spacing:-0.02em; margin:0 0 10px; color:var(--qf-text); }
        .qf-thanks-copy { color:var(--qf-muted); font-size:15px; line-height:1.55; max-width:420px; margin:0 auto 8px; }
        .qf-thanks-copy b { color:var(--qf-text); }
        .qf-thanks-small { font-size:13px; }
        .qf-vsl-gate { all:unset; cursor:pointer; display:flex; align-items:center; gap:14px; width:100%; box-sizing:border-box; padding:16px 18px; background:linear-gradient(135deg, var(--qf-accent-soft), transparent); border:1px solid var(--qf-accent); border-radius:14px; color:var(--qf-text); transition:all 0.2s ease; box-shadow:0 8px 24px -12px var(--qf-accent-glow); margin:24px 0 0; text-align:left; }
        .qf-vsl-gate:hover { transform:translateY(-2px); box-shadow:0 16px 36px -8px var(--qf-accent-glow); }
        .qf-vsl-icon { width:42px; height:42px; border-radius:50%; background:var(--qf-accent); color:#000; display:flex; align-items:center; justify-content:center; font-size:14px; flex-shrink:0; padding-left:3px; box-shadow:0 0 20px var(--qf-accent-glow); }
        .qf-vsl-text { flex:1; display:flex; flex-direction:column; line-height:1.35; }
        .qf-vsl-text b { font-family:'Poppins',sans-serif; font-weight:700; font-size:14px; margin-bottom:2px; color:var(--qf-text); }
        .qf-vsl-text small { font-size:12px; color:var(--qf-muted); }
        .qf-vsl-arrow { color:var(--qf-accent); font-size:20px; font-weight:700; }
        .qf-vsl-reveal { margin:24px 0 0; animation:qfReveal 0.5s cubic-bezier(.34,1.56,.64,1); }
        @keyframes qfReveal { 0% { opacity:0; transform:translateY(12px) scale(0.96); } 100% { opacity:1; transform:translateY(0) scale(1); } }
        .qf-vsl-label { display:flex; align-items:center; gap:8px; font-family:'Poppins',sans-serif; font-weight:700; font-size:13px; margin-bottom:10px; color:var(--qf-text); justify-content:center; }
        .qf-vsl-label .qf-pulse-dot { color:var(--qf-accent); background:var(--qf-accent); }
        .qf-vsl-player { width:100%; aspect-ratio:16/9; border-radius:14px; background:#000; border:1px solid var(--qf-accent); box-shadow:0 12px 40px -12px var(--qf-accent-glow); }
        .qf-next-steps { margin-top:28px; padding:20px; background:var(--qf-surface); border:1px solid var(--qf-border); border-radius:14px; text-align:left; }
        .qf-next-steps h4 { font-size:11px; font-weight:700; letter-spacing:0.1em; text-transform:uppercase; color:var(--qf-muted); margin:0 0 12px; }
        .qf-next-steps ul { margin:0; padding:0; list-style:none; display:flex; flex-direction:column; gap:10px; }
        .qf-next-steps li { display:flex; align-items:flex-start; gap:10px; font-size:14px; line-height:1.5; color:var(--qf-text); }
        .qf-next-steps li .qf-num { width:20px; height:20px; border-radius:50%; background:var(--qf-accent); color:#000; font-size:11px; font-weight:800; display:flex; align-items:center; justify-content:center; flex-shrink:0; margin-top:1px; }
        .qf-next-steps li b { color:var(--qf-text); font-weight:600; }
        @media (max-width: 520px) {
          .qf-wrap { padding:24px 16px; }
          .qf-q { font-size:24px; }
          .qf-qualify-title { font-size:28px; }
          .qf-thanks-title { font-size:24px; }
          .qf-phone-row { grid-template-columns:100px 1fr; }
        }
      `}</style>
    </section>
  );
}
