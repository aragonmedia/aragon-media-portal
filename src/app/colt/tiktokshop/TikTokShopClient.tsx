"use client";

/**
 * /roni/tiktokshop — Free 1-on-1 call funnel.
 *
 * Celeste-led, countdown-driven, WhatsApp follow-up. Form POSTs to
 * /api/accelerator/call-rsvp which handles Neon insert + Airtable upsert
 * + admin email with clickable wa.me link.
 */

import { useEffect, useState } from "react";
import CreatorIntro from "../../../components/CreatorIntro";

const COLTON_INTRO = [
  "I'm Colton from Toronto, Canada. I did $1.4M CAD on US TikTok Shop starting from nothing. Not a legacy following, not a US address, not a cheat code. Just a Canadian with a phone, Kevin's guidance, the right system, and the stubbornness to not quit when the first videos flopped.",
  "TTSUnlocked is the exact 7-day playbook I wish someone had handed me when I started. Every step I missed, every mistake I made, every tool I use today. Account setup, shipping, approvals, first product pick, first commission. Documented and shippable.",
  "I teach TikTok Shop for free on my channels. The 7-day unlock, the hands-on account + verification walkthrough, the private community of creators actually doing this. That's what you're paying for. Everything else, I give away. The free 1-on-1 call below is how we start. 30 minutes on where you're stuck and whether TTSUnlocked is the right move for you.",
];

const COUNTRIES: { code: string; label: string }[] = [
  { code: "+1-ca", label: "🇨🇦 +1" },
  { code: "+1",    label: "🇺🇸 +1" },
  { code: "+44",   label: "🇬🇧 +44" },
  { code: "+353",  label: "🇮🇪 +353" },
  { code: "+34",   label: "🇪🇸 +34" },
  { code: "+55",   label: "🇧🇷 +55" },
  { code: "+52",   label: "🇲🇽 +52" },
  { code: "+91",   label: "🇮🇳 +91" },
  { code: "+61",   label: "🇦🇺 +61" },
  { code: "+other",label: "Other" },
];

export default function TikTokShopClient() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [waCountry, setWaCountry] = useState("+1-ca");
  const [waNumber, setWaNumber] = useState("");
  const [country, setCountry] = useState("");
  const [source, setSource] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cd, setCd] = useState({ days: "00", hours: "00", mins: "00", secs: "00" });

  // Countdown to next Wednesday 00:00 local — resets weekly
  useEffect(() => {
    function tick() {
      const now = new Date();
      const target = new Date();
      const daysUntilWed = (3 - now.getDay() + 7) % 7 || 7;
      target.setDate(now.getDate() + daysUntilWed);
      target.setHours(0, 0, 0, 0);
      const diff = target.getTime() - now.getTime();
      if (diff <= 0) return;
      const d = Math.floor(diff / 86400000);
      const h = Math.floor((diff % 86400000) / 3600000);
      const m = Math.floor((diff % 3600000) / 60000);
      const s = Math.floor((diff % 60000) / 1000);
      setCd({
        days: String(d).padStart(2, "0"),
        hours: String(h).padStart(2, "0"),
        mins: String(m).padStart(2, "0"),
        secs: String(s).padStart(2, "0"),
      });
    }
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (submitting) return;
    setSubmitting(true);
    setError(null);
    try {
      const waFull = waCountry.replace(/-ca$/, "") + " " + waNumber.trim();
      const r = await fetch("/api/accelerator/call-rsvp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim(),
          whatsapp: waFull,
          country: country.trim(),
          source: source.trim(),
          accelerator: "colt",
        }),
      });
      const j = await r.json();
      if (!j.ok) throw new Error(j.error || "Something went wrong.");
      setDone(true);
      // Meta Pixel: fire Lead event on successful call-RSVP submit
      if (typeof window !== "undefined" && typeof (window as unknown as { fbq?: (...args: unknown[]) => void }).fbq === "function") {
        (window as unknown as { fbq: (...args: unknown[]) => void }).fbq("track", "Lead", {
          content_name: "COLT Call Funnel · TikTok Shop",
          content_category: "accelerator-colt",
          value: 0,
          currency: "USD",
        });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="rts-root">
      <div className="rts-bg" />
      <div className="rts-radar" />

      <div className="rts-scarcity">🔴 FREE 1-ON-1 CALLS <span className="dot">·</span> <span className="spots">7 of 10 spots left this week</span> <span className="dot">·</span> Prices increase Wednesday</div>

      <header className="rts-header">
        <div className="rts-header-inner">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/accelerator/wolf-transparent.png" alt="" className="rts-wolf" />
          <span className="rts-brand-tag"><small>TIKTOK AFFILIATE</small><b>ACCELERATOR</b></span>
          <span className="rts-brand-x">×</span>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={encodeURI("/AM_LOGO-removebg-preview copy.png")} alt="TTSUnlocked" className="rts-am" />
        </div>
      </header>

      <main className="rts-shell">
        <div className="rts-live-wrap">
          <div className="rts-live">
            <span className="rts-live-dot" />
            Free 1-on-1 Calls · This Week Only
          </div>
        </div>

        <h1 className="rts-h1">How Celeste Pays Her College Tuition Making <span className="rts-accent">$75K/Month</span> on US TikTok Shop From Spain</h1>

        <p className="rts-sub"><b>WITHOUT:</b> Living in the US, a big following, prior experience, or a degree</p>

        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img className="rts-hero" src="/roni/call-funnel/celeste.jpg" alt="Celeste · Spain" />

        <div className="rts-cd-wrap">
          <h2 className="rts-cd-head">1-on-1 Call Spots <u>Reset In:</u></h2>
          <p className="rts-cd-note">After the timer hits zero, this week&apos;s spots are gone and <b>program prices increase</b>. New spots open next Wednesday.</p>
          <div className="rts-cd-grid">
            <div className="rts-cd-cell"><div className="rts-cd-num">{cd.days}</div><div className="rts-cd-label">Days</div></div>
            <div className="rts-cd-cell"><div className="rts-cd-num">{cd.hours}</div><div className="rts-cd-label">Hours</div></div>
            <div className="rts-cd-cell"><div className="rts-cd-num">{cd.mins}</div><div className="rts-cd-label">Minutes</div></div>
            <div className="rts-cd-cell"><div className="rts-cd-num">{cd.secs}</div><div className="rts-cd-label">Seconds</div></div>
          </div>
        </div>

        <a href="#signup" className="rts-cta">Book Your Free 1-on-1 Call<span className="rts-cta-sub">100% Free · Before Wednesday Prices Go Up</span></a>
        <p className="rts-limited">LIMITED TO: <span className="rts-limited-num">10 Free Call Spots This Week</span></p>

        <h2 className="rts-sec-head">On your free 1-on-1, we&apos;ll cover…</h2>
        {[
          { h: "The Product Selection Framework", p: "How Celeste picks winning US TikTok Shop products from Spain, and what to post the first week." },
          { h: "Zero-To-Viral Content Strategy", p: "The EXACT viral content formula that works starting with 0 followers in any country." },
          { h: "Your 7-Day Fast Track", p: "A day-by-day plan to go from zero to live and earning in 7 days. Mapped to your situation on the call." },
          { h: "Your 30-Day Scaling Plan", p: "The exact 30-day plan to go from your first commission to consistent $1K+ days." },
        ].map((f, i) => (
          <div key={i} className="rts-feat"><span className="rts-feat-h">♥</span><h3 className="rts-feat-t">{f.h}</h3><p className="rts-feat-p">{f.p}</p></div>
        ))}

        <div className="rts-case">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img className="rts-case-photo" src="/roni/call-funnel/celeste.jpg" alt="Celeste" />
          <h2 className="rts-case-intro">Celeste<span className="rts-case-aka">Spain · $75K GMV in 3 months</span></h2>
          <div className="rts-case-copy">
            <p>Celeste is a college student in Spain. She never had a huge following. She wasn&apos;t a creator before this.</p>
            <p>What she had was the system Kevin and Colton walk you through on your 1-on-1 call. Three months later she&apos;s doing <b>$75K in GMV</b> on US TikTok Shop and paying her college tuition with the commissions.</p>
            <p>She&apos;s one of 500+ creators from 20+ countries who&apos;ve run this system. Dylan from Ireland is at <b>$155K GMV</b>. Don from Canada is at <b>$1.4M GMV</b>. Different niches, different followings, same framework.</p>
          </div>
        </div>

        <h2 className="rts-sec-head">Who you&apos;re getting on the call</h2>
        <div className="rts-hosts">
          <div className="rts-host">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/roni/call-funnel/kevin.jpg" alt="Kevin Aragon" />
            <h4>Kevin Aragon</h4><p>FOUNDER · ARAGON MEDIA</p>
          </div>
          <div className="rts-host">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/colt/colton.jpg" alt="Colton" />
            <h4>Colton</h4><p>CO-FOUNDER · TTSUNLOCKED</p>
          </div>
        </div>
        <p className="rts-hosts-line">We&apos;ve walked <b>500+ creators</b> through this exact path. On your free call we&apos;ll look at your country, niche, and situation. and tell you honestly if this is a fit.</p>
        <CreatorIntro brand="colt" name="Colton" location="Toronto, Canada" photoSrc="/colt/colton.jpg" paragraphs={COLTON_INTRO} pullQuote={"$1.4M CAD on US TikTok Shop, from Toronto. The 7-day playbook I teach is the one I ran myself."} />

        <div className="rts-sel rts-sel-not">
          <h3>This is NOT for you if…</h3>
          <div className="rts-sel-item">You&apos;re looking for a get-rich-quick scheme</div>
          <div className="rts-sel-item">You don&apos;t want to post content consistently</div>
          <div className="rts-sel-item">You aren&apos;t ready to put in the first 7 days</div>
          <div className="rts-sel-item">You already know everything about TikTok Shop</div>
        </div>
        <div className="rts-sel rts-sel-for">
          <h3>This IS for you if…</h3>
          <div className="rts-sel-item">You want to earn USD from your own country</div>
          <div className="rts-sel-item">You&apos;re ready to build a creator business, not a side hustle</div>
          <div className="rts-sel-item">You want a done-with-you path onto US TikTok Shop</div>
          <div className="rts-sel-item">You want to work from anywhere on your own terms</div>
        </div>

        <h2 className="rts-proof-head">Here&apos;s proof it <u>can happen for you too</u></h2>
        <div className="rts-proof-nums">
          <div className="rts-proof-card"><p className="rts-proof-amt">$75K</p><div className="rts-proof-sub">Celeste · Spain · 3 months</div></div>
          <div className="rts-proof-card"><p className="rts-proof-amt">$155K</p><div className="rts-proof-sub">Dylan · Ireland · 17 months</div></div>
          <div className="rts-proof-card"><p className="rts-proof-amt">$1.4M</p><div className="rts-proof-sub">Don · Canada · 17 months</div></div>
          <div className="rts-proof-card"><p className="rts-proof-amt">500+</p><div className="rts-proof-sub">Creators activated worldwide</div></div>
        </div>
        <div className="rts-proof-screens">
          {[
            { img: "/roni/call-funnel/proof-486k.jpg", amount: "$486K", label: "One Month" },
            { img: "/roni/call-funnel/proof-125k.jpg", amount: "$125K", label: "One Week" },
            { img: "/roni/call-funnel/proof-94k.jpg",  amount: "$94K",  label: "One Viral Drop" },
          ].map((p, i) => (
            <div key={i} className="rts-proof-screen">
              <div className="rts-proof-screen-img">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={p.img} alt={`${p.amount} proof`} />
              </div>
              <div className="rts-proof-cap">
                <b>{p.amount}</b>
                <span>{p.label}</span>
              </div>
            </div>
          ))}
        </div>

        <section id="signup" className="rts-form-wrap">
          {done ? (
            <div className="rts-done">
              <h2>You&apos;re in. We&apos;ll WhatsApp you shortly.</h2>
              <p>Check your email for a confirmation. We&apos;ll message you within 2 hours to lock in a time.</p>
            </div>
          ) : (
            <>
              <div className="rts-form-head">
                <h2>Book Your Free 1-on-1 Call</h2>
                <p>We&apos;ll WhatsApp you to schedule a time this week. Takes 30 minutes.</p>
              </div>
              <form onSubmit={submit}>
                <div className="rts-row"><label>First name</label><input type="text" required placeholder="Your name" value={name} onChange={(e) => setName(e.target.value)} /></div>
                <div className="rts-row"><label>Email</label><input type="email" required placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} /></div>
                <div className="rts-row">
                  <label>WhatsApp number</label>
                  <div className="rts-phone">
                    <select value={waCountry} onChange={(e) => setWaCountry(e.target.value)}>
                      {COUNTRIES.map((c) => (<option key={c.code} value={c.code}>{c.label}</option>))}
                    </select>
                    <input type="tel" required placeholder="555 123 4567" value={waNumber} onChange={(e) => setWaNumber(e.target.value)} />
                  </div>
                </div>
                <div className="rts-row"><label>Country you&apos;re in</label><input type="text" required placeholder="e.g. Canada" value={country} onChange={(e) => setCountry(e.target.value)} /></div>
                <div className="rts-row"><label>How did you hear about us?</label><input type="text" required placeholder="e.g. Instagram, friend, TikTok, Google…" value={source} onChange={(e) => setSource(e.target.value)} /></div>
                <button type="submit" className="rts-cta" disabled={submitting} style={{ fontSize: 20, padding: "18px 16px" }}>{submitting ? "Reserving…" : "Reserve My Call →"}</button>
                {error && <p className="rts-err">{error}</p>}
                <p className="rts-note">By submitting, you agree to be contacted via email + WhatsApp to schedule your free call. We will not spam you.</p>
              </form>
            </>
          )}
        </section>

        <p className="rts-footer">© TTSUnlocked by COLT · <a href="/accelerator/terms">Terms</a> · <a href="/accelerator/privacy">Privacy</a></p>
      </main>

      <style>{`
        :root { --rts-bg:#050505; --rts-bg2:#0B0B0C; --rts-card:#101012; --rts-border:rgba(255,255,255,0.08); --rts-border-strong:rgba(255,255,255,0.14); --rts-text:#F5F5F7; --rts-muted:#9A9590; --rts-sub:#4A4A52; --rts-red:#00E5FF; --rts-red-bright:#2DD4C7; --rts-white:#FFFFFF; }
        .rts-root { background:var(--rts-bg); color:var(--rts-text); font-family:'Inter Tight',system-ui,sans-serif; min-height:100vh; overflow-x:hidden; position:relative; }
        .rts-bg { position:fixed; inset:0; pointer-events:none; z-index:0; background-image:linear-gradient(rgba(0,229,255,0.05) 1px, transparent 1px),linear-gradient(90deg, rgba(0,229,255,0.05) 1px, transparent 1px); background-size:60px 60px; mask-image:radial-gradient(ellipse at 70% 20%, rgba(0,0,0,0.9) 0%, transparent 65%); }
        .rts-radar { position:fixed; top:-300px; right:-300px; width:900px; height:900px; z-index:0; border-radius:50%; pointer-events:none; background:radial-gradient(circle, transparent 0 40%, rgba(0,229,255,0.08) 40% 41%, transparent 42% 60%, rgba(0,229,255,0.05) 60% 61%, transparent 62%); }
        .rts-scarcity { position:sticky; top:0; z-index:50; background:#000; border-bottom:1px solid rgba(0,229,255,0.3); text-align:center; padding:10px 16px; font-size:12.5px; font-weight:700; letter-spacing:0.04em; color:var(--rts-white); }
        .rts-scarcity .spots { color:var(--rts-red); } .rts-scarcity .dot { color:var(--rts-muted); margin:0 4px; }
        .rts-header { position:relative; z-index:20; display:flex; justify-content:center; padding:18px 40px; background:#000; border-bottom:1px solid rgba(255,255,255,0.06); }
        .rts-header-inner { display:inline-flex; align-items:center; gap:14px; }
        .rts-wolf { width:44px; height:44px; filter:drop-shadow(0 0 12px rgba(0,229,255,0.4)); }
        .rts-brand-tag { display:inline-flex; flex-direction:column; gap:2px; line-height:1; }
        .rts-brand-tag small { font-size:9px; letter-spacing:0.24em; color:var(--rts-muted); font-weight:700; text-transform:uppercase; }
        .rts-brand-tag b { font-size:16px; font-weight:900; letter-spacing:0.02em; color:var(--rts-white); text-transform:uppercase; }
        .rts-brand-x { color:var(--rts-red); font-size:22px; font-weight:900; margin:0 2px; }
        .rts-am { height:32px; width:auto; filter:drop-shadow(0 0 8px rgba(0,229,255,0.35)); }
        .rts-shell { position:relative; z-index:1; max-width:760px; margin:0 auto; padding:30px 20px 80px; }
        .rts-live-wrap { text-align:center; }
        .rts-live { display:inline-flex; align-items:center; gap:10px; padding:10px 20px; background:rgba(0,229,255,0.1); border:1px solid rgba(0,229,255,0.5); border-radius:999px; font-size:14px; font-weight:700; color:var(--rts-white); box-shadow:0 0 24px rgba(0,229,255,0.2); margin:0 auto 26px; }
        .rts-live-dot { width:8px; height:8px; border-radius:50%; background:var(--rts-red); box-shadow:0 0 0 4px rgba(0,229,255,0.3); animation:rtsPulse 1.6s ease-in-out infinite; }
        @keyframes rtsPulse { 0%,100%{opacity:1;transform:scale(1);} 50%{opacity:0.6;transform:scale(1.15);} }
        .rts-h1 { font-size:clamp(32px,6.5vw,56px); font-weight:900; letter-spacing:-0.025em; line-height:1.08; text-align:center; margin:0 0 20px; color:var(--rts-white); }
        .rts-accent { color:var(--rts-red); text-shadow:0 0 40px rgba(0,229,255,0.5); }
        .rts-sub { text-align:center; font-size:16px; color:var(--rts-text); margin:0 0 42px; line-height:1.5; }
        .rts-sub b { color:var(--rts-white); font-weight:700; }
        .rts-hero { display:block; width:100%; max-width:460px; margin:0 auto 32px; border-radius:20px; border:1px solid var(--rts-border-strong); box-shadow:0 24px 80px rgba(0,0,0,0.5), 0 0 60px rgba(0,229,255,0.08); }
        .rts-cd-wrap { text-align:center; margin-bottom:24px; }
        .rts-cd-head { font-size:26px; font-weight:800; margin:0 0 6px; color:var(--rts-white); font-style:italic; }
        .rts-cd-head u { text-decoration-color:var(--rts-red); text-decoration-thickness:3px; text-underline-offset:4px; }
        .rts-cd-note { font-size:14px; color:var(--rts-muted); margin:0 0 18px; }
        .rts-cd-note b { color:var(--rts-red); font-weight:700; }
        .rts-cd-grid { display:grid; grid-template-columns:repeat(4,1fr); gap:10px; max-width:500px; margin:0 auto; }
        .rts-cd-cell { background:var(--rts-card); border:1px solid var(--rts-border-strong); border-radius:12px; padding:18px 8px; }
        .rts-cd-num { font-size:clamp(28px,7vw,44px); font-weight:900; color:var(--rts-red); line-height:1; font-variant-numeric:tabular-nums; }
        .rts-cd-label { font-size:10px; letter-spacing:0.14em; text-transform:uppercase; color:var(--rts-muted); font-weight:700; margin-top:6px; }
        .rts-cta { display:block; width:100%; margin:24px 0 12px; background:var(--rts-red); color:var(--rts-white); padding:22px 20px; border:none; border-radius:14px; font-family:inherit; font-size:24px; font-weight:800; cursor:pointer; text-align:center; box-shadow:0 12px 40px rgba(0,229,255,0.4), 0 0 60px rgba(0,229,255,0.15); transition:background 150ms ease, transform 150ms ease; text-decoration:none; }
        .rts-cta:hover:not(:disabled) { background:var(--rts-red-bright); transform:translateY(-1px); }
        .rts-cta:disabled { opacity:0.6; cursor:not-allowed; }
        .rts-cta-sub { display:block; font-size:13px; font-weight:500; margin-top:8px; opacity:0.9; }
        .rts-limited { text-align:center; font-size:15px; font-weight:800; color:var(--rts-white); margin:10px 0 60px; }
        .rts-limited-num { color:var(--rts-red); }
        .rts-sec-head { text-align:center; font-size:32px; font-weight:800; letter-spacing:-0.02em; margin:50px 0 24px; color:var(--rts-white); font-style:italic; }
        .rts-feat { background:var(--rts-card); border:1px solid var(--rts-border); border-radius:12px; padding:20px 24px; margin-bottom:14px; text-align:center; }
        .rts-feat-h { font-size:18px; margin-right:10px; color:var(--rts-red); }
        .rts-feat-t { display:inline; font-size:18px; font-weight:800; color:var(--rts-white); text-decoration:underline; text-decoration-color:rgba(255,255,255,0.4); text-underline-offset:4px; margin:0; }
        .rts-feat-p { margin:10px 0 0; font-size:15px; color:var(--rts-text); line-height:1.5; }
        .rts-feat-p b { color:var(--rts-white); font-weight:700; }
        .rts-case { background:var(--rts-card); border:1px solid var(--rts-border-strong); border-radius:20px; padding:28px; margin:50px 0; text-align:center; }
        .rts-case-photo { display:block; width:100%; max-width:320px; margin:0 auto 20px; border-radius:16px; }
        .rts-case-intro { font-size:clamp(24px,4vw,32px); font-weight:800; letter-spacing:-0.02em; margin:0 0 8px; color:var(--rts-white); }
        .rts-case-aka { color:var(--rts-red); display:block; margin-top:2px; font-size:70%; font-weight:700; }
        .rts-case-copy { text-align:left; max-width:540px; margin:20px auto 0; }
        .rts-case-copy p { font-size:16px; line-height:1.65; margin:0 0 16px; color:var(--rts-text); }
        .rts-case-copy p b { color:var(--rts-white); font-weight:700; }
        .rts-hosts { display:grid; grid-template-columns:1fr 1fr; gap:14px; margin:40px 0; }
        .rts-host { background:var(--rts-card); border:1px solid var(--rts-border); border-radius:14px; padding:20px; text-align:center; }
        .rts-host img { width:100%; aspect-ratio:1; object-fit:cover; border-radius:10px; margin-bottom:12px; background:#F5F5F7; }
        .rts-host h4 { margin:0 0 4px; font-size:17px; font-weight:800; color:var(--rts-white); }
        .rts-host p { margin:0; font-size:12px; color:var(--rts-muted); letter-spacing:0.05em; }
        .rts-hosts-line { text-align:center; max-width:540px; margin:0 auto 40px; font-size:15px; color:var(--rts-text); line-height:1.65; }
        .rts-hosts-line b { color:var(--rts-white); font-weight:700; }
        .rts-sel { border-radius:14px; padding:24px 24px 10px; margin:20px 0; }
        .rts-sel h3 { font-size:24px; font-weight:800; margin:0 0 20px; font-style:italic; }
        .rts-sel-item { display:flex; align-items:start; gap:12px; padding:12px 0; font-size:16px; line-height:1.4; font-weight:600; border-bottom:1px dotted rgba(255,255,255,0.3); }
        .rts-sel-item:last-child { border-bottom:none; }
        .rts-sel-item::before { content:""; flex-shrink:0; width:20px; font-size:18px; line-height:1; margin-top:2px; display:inline-flex; align-items:center; justify-content:center; }
        .rts-sel-not { background:#1A1A1E; color:var(--rts-white); border:1px solid rgba(255,255,255,0.08); }
        .rts-sel-not h3 { color:var(--rts-white); }
        .rts-sel-not .rts-sel-item::before { content:"❌"; }
        .rts-sel-for { background:var(--rts-white); color:#050505; }
        .rts-sel-for h3 { color:#050505; }
        .rts-sel-for .rts-sel-item { color:#050505; font-style:italic; font-weight:600; border-bottom-color:rgba(0,0,0,0.1); }
        .rts-sel-for .rts-sel-item::before { content:"✅"; }
        .rts-proof-head { text-align:center; font-size:clamp(26px,4.5vw,36px); font-weight:800; margin:50px 0 24px; color:var(--rts-white); font-style:italic; }
        .rts-proof-head u { text-decoration-color:var(--rts-red); text-decoration-thickness:3px; text-underline-offset:6px; }
        .rts-proof-nums { display:grid; grid-template-columns:1fr 1fr; gap:12px; margin-bottom:24px; }
        .rts-proof-card { background:var(--rts-card); border:1px solid var(--rts-border); border-radius:12px; padding:20px; text-align:center; }
        .rts-proof-amt { font-size:32px; font-weight:900; color:var(--rts-red); text-shadow:0 0 24px rgba(0,229,255,0.5); margin:0; }
        .rts-proof-sub { font-size:12px; color:var(--rts-muted); letter-spacing:0.08em; text-transform:uppercase; margin-top:4px; font-weight:700; }
        .rts-proof-screens { display:grid; grid-template-columns:repeat(auto-fit, minmax(200px, 1fr)); gap:16px; margin-bottom:50px; max-width:760px; margin-left:auto; margin-right:auto; }
        .rts-proof-screen { background:#000; border:1px solid var(--rts-border-strong); border-radius:18px; overflow:hidden; box-shadow:0 10px 30px rgba(0,0,0,0.4); display:flex; flex-direction:column; }
        .rts-proof-screen-img { aspect-ratio:9/16; width:100%; background:#000; overflow:hidden; display:block; }
        .rts-proof-screen-img img { display:block; width:100%; height:100%; object-fit:contain; object-position:center; padding:8px; box-sizing:border-box; }
        .rts-proof-cap { padding:14px 10px 16px; text-align:center; background:var(--rts-card); border-top:1px solid var(--rts-border); }
        .rts-proof-cap b { display:block; font-size:22px; font-weight:900; color:var(--rts-red); letter-spacing:-0.01em; margin-bottom:4px; }
        .rts-proof-cap span { display:block; font-size:10px; color:var(--rts-muted); letter-spacing:0.14em; text-transform:uppercase; font-weight:700; }
        .rts-form-wrap { background:var(--rts-card); border:1px solid var(--rts-border-strong); border-radius:16px; padding:32px 24px; margin:40px 0 20px; box-shadow:0 20px 60px rgba(0,0,0,0.4); }
        .rts-form-head { text-align:center; margin-bottom:24px; }
        .rts-form-head h2 { font-size:28px; font-weight:800; letter-spacing:-0.02em; margin:0 0 8px; color:var(--rts-white); }
        .rts-form-head p { color:var(--rts-muted); font-size:14px; margin:0; }
        .rts-row { margin-bottom:14px; }
        .rts-row label { display:block; font-size:11px; letter-spacing:0.14em; text-transform:uppercase; color:var(--rts-muted); font-weight:700; margin-bottom:6px; }
        .rts-row input, .rts-row select { width:100%; padding:14px 16px; background:var(--rts-bg2); border:1px solid var(--rts-border); border-radius:10px; color:var(--rts-white); font-size:15px; font-family:inherit; box-sizing:border-box; }
        .rts-row input:focus, .rts-row select:focus { outline:none; border-color:var(--rts-red); }
        .rts-phone { display:grid; grid-template-columns:120px 1fr; gap:8px; }
        .rts-note { font-size:11px; color:var(--rts-sub); text-align:center; margin:12px 0 0; line-height:1.5; }
        .rts-err { color:#F87171; font-size:13px; margin:10px 0 0; text-align:center; }
        .rts-done { text-align:center; padding:20px 0; }
        .rts-done h2 { font-size:26px; font-weight:800; color:var(--rts-white); margin:0 0 10px; }
        .rts-done p { color:var(--rts-muted); font-size:14px; margin:0; }
        .rts-footer { text-align:center; color:var(--rts-sub); font-size:12px; margin-top:40px; }
        .rts-footer a { color:var(--rts-red); }
        @media (max-width:600px) {
          .rts-header { padding:14px 16px; } .rts-header-inner { gap:10px; }
          .rts-wolf { width:36px; height:36px; } .rts-brand-tag b { font-size:14px; } .rts-brand-tag small { font-size:8px; }
          .rts-brand-x { font-size:18px; } .rts-am { height:26px; }
          .rts-h1 { font-size:32px; } .rts-cd-num { font-size:28px; } .rts-cta { font-size:20px; padding:18px 16px; }
          .rts-sec-head { font-size:24px; } .rts-form-wrap { padding:24px 18px; } .rts-phone { grid-template-columns:90px 1fr; }
          .rts-hosts { grid-template-columns:1fr; } .rts-proof-nums { grid-template-columns:1fr; } .rts-proof-screens { grid-template-columns:1fr; max-width:420px; }
        }
      `}</style>
    </div>
  );
}
