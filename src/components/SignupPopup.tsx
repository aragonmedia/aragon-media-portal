"use client";

import { useEffect, useState, useCallback } from "react";

/**
 * SignupPopup
 * Rotating-variant email capture modal.
 * Trigger: whichever of (scroll past 50% of viewport) OR (30s on page) fires first.
 * Shows ONCE per visitor per brand (localStorage flag).
 * On submit: posts to /api/accelerator/call-rsvp with source="popup-{brand}"
 *            and fires Meta Pixel "Subscribe" (separate signal from Lead).
 */

type Variant = {
  kicker: string;       // small label at top of proof card
  student: string;      // "Celeste" / "Mia" / etc.
  claim: string;        // the one-line win
  avatarInitial: string;
};

const DEFAULT_VARIANTS_RONI: Variant[] = [
  {
    kicker: "a real win from the accelerator",
    student: "Celeste",
    claim: "Spain to $75K/month on US TikTok Shop. She used the exact system we open up on the call.",
    avatarInitial: "C",
  },
  {
    kicker: "a real win from the accelerator",
    student: "Mia",
    claim: "Hit $10,200 in her first 30 days without showing her face. Started with under 1K followers.",
    avatarInitial: "M",
  },
  {
    kicker: "a real win from the accelerator",
    student: "Priya",
    claim: "Pulled $5K/mo from Toronto working around a full-time job. 3 Reels per week.",
    avatarInitial: "P",
  },
];

const DEFAULT_VARIANTS_COLT: Variant[] = [
  {
    kicker: "a real win from TTSUnlocked",
    student: "Jordan",
    claim: "Day 7: live on US TikTok Shop from the UK. First commission by day 14.",
    avatarInitial: "J",
  },
  {
    kicker: "a real win from TTSUnlocked",
    student: "Alex",
    claim: "Unlocked US Shop from Toronto in 6 days. $4,200 month-one in creator commissions.",
    avatarInitial: "A",
  },
  {
    kicker: "a real win from TTSUnlocked",
    student: "Sofia",
    claim: "Spain-based, zero US footprint. Approved and earning inside the 7-day window.",
    avatarInitial: "S",
  },
];

export type Brand = "accelerator" | "roni" | "colt";

const COPY: Record<Brand, {
  headline: string;
  sub: string;
  fineprint: string;
  cta: string;
  color: string;         // accent (css)
  colorBright: string;
  bg: string;
  text: string;
  variants: Variant[];
  variantLabel: string;  // byline under logo
  variantLogo: string;   // small logo text
}> = {
  roni: {
    headline: "want to be like Celeste?",
    sub: "Enter for a free 1-on-1 slot this week.",
    fineprint: "we'll WhatsApp you within 2 hours to lock in a time. no spam.",
    cta: "Save my spot",
    color: "#E11D48",
    colorBright: "#F43F5E",
    bg: "#0B0B0B",
    text: "#F5F5F5",
    variants: DEFAULT_VARIANTS_RONI,
    variantLabel: "Roni × Aragon Media",
    variantLogo: "AM",
  },
  colt: {
    headline: "want to be like Jordan?",
    sub: "Enter for a free 1-on-1 slot this week.",
    fineprint: "we'll WhatsApp you within 2 hours. no spam.",
    cta: "Save my spot",
    color: "#00E5FF",
    colorBright: "#2DD4C7",
    bg: "#061018",
    text: "#F5F5F5",
    variants: DEFAULT_VARIANTS_COLT,
    variantLabel: "TTSUnlocked × COLT",
    variantLogo: "CO",
  },
  accelerator: {
    headline: "want to be like Celeste?",
    sub: "Enter for a free 1-on-1 call this week.",
    fineprint: "we'll WhatsApp you within 2 hours to lock in a time. no spam.",
    cta: "Save my spot",
    color: "#E11D48",
    colorBright: "#F43F5E",
    bg: "#0B0B0B",
    text: "#F5F5F5",
    variants: DEFAULT_VARIANTS_RONI,
    variantLabel: "Aragon Media",
    variantLogo: "AM",
  },
};

export default function SignupPopup({ brand }: { brand: Brand }) {
  const copy = COPY[brand];
  const [open, setOpen] = useState(false);
  const [variant, setVariant] = useState<Variant>(copy.variants[0]);
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const storageKey = `am_popup_${brand}_seen_v1`;

  // Pick a rotating variant on mount
  useEffect(() => {
    const idx = Math.floor(Math.random() * copy.variants.length);
    setVariant(copy.variants[idx]);
  }, [copy.variants]);

  // Trigger: whichever of 50% scroll OR 30s fires first. Show once.
  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      if (window.localStorage.getItem(storageKey)) return;
    } catch {}

    let fired = false;
    const fire = () => {
      if (fired) return;
      fired = true;
      try { window.localStorage.setItem(storageKey, "1"); } catch {}
      setOpen(true);
      window.removeEventListener("scroll", onScroll);
      clearTimeout(timer);
    };

    const onScroll = () => {
      const h = document.documentElement;
      const scrolled = (h.scrollTop + window.innerHeight) / h.scrollHeight;
      if (scrolled >= 0.5) fire();
    };

    const timer = setTimeout(fire, 30_000);
    window.addEventListener("scroll", onScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", onScroll);
      clearTimeout(timer);
    };
  }, [storageKey]);

  const close = useCallback(() => setOpen(false), []);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (submitting) return;
    setErr(null);
    setSubmitting(true);
    try {
      const res = await fetch("/api/accelerator/call-rsvp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: "",
          email,
          waFull: "",
          country: "",
          source: `popup-${brand}`,
          accelerator: brand === "accelerator" ? "roni" : brand,
        }),
      });
      if (!res.ok) throw new Error(`status ${res.status}`);
      setDone(true);
      // Meta Pixel: Subscribe (separate from Lead; weaker signal)
      if (typeof window !== "undefined" && typeof (window as unknown as { fbq?: (...args: unknown[]) => void }).fbq === "function") {
        (window as unknown as { fbq: (...args: unknown[]) => void }).fbq("track", "Subscribe", {
          content_name: `Popup · ${brand}`,
          content_category: `popup-${brand}`,
          value: 0,
          currency: "USD",
        });
      }
    } catch {
      setErr("Could not save. Try again.");
    } finally {
      setSubmitting(false);
    }
  }

  if (!open) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="am-popup-title"
      style={{
        position: "fixed", inset: 0, zIndex: 100000,
        display: "flex", alignItems: "center", justifyContent: "center",
        background: "rgba(0,0,0,0.65)", backdropFilter: "blur(6px)",
        padding: "16px",
      }}
      onClick={close}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: "100%", maxWidth: "440px",
          background: copy.bg, color: copy.text,
          border: `1px solid rgba(255,255,255,0.08)`,
          borderRadius: "22px",
          padding: "28px 24px 24px",
          position: "relative",
          fontFamily: "ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial",
        }}
      >
        <button
          aria-label="Close"
          onClick={close}
          style={{
            position: "absolute", top: "12px", right: "12px",
            width: "32px", height: "32px", borderRadius: "999px",
            background: "transparent", color: copy.text,
            border: `1px solid rgba(255,255,255,0.2)`,
            cursor: "pointer", fontSize: "16px", lineHeight: "1",
          }}
        >
          ×
        </button>

        {/* header */}
        <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "14px" }}>
          <div style={{
            width: "36px", height: "36px", borderRadius: "999px",
            background: `linear-gradient(135deg, ${copy.color}, ${copy.colorBright})`,
            display: "grid", placeItems: "center",
            fontWeight: 800, fontSize: "13px", color: "#fff",
          }}>{copy.variantLogo}</div>
          <div style={{ fontSize: "13px", opacity: 0.8 }}>
            <div style={{ fontWeight: 700 }}>{copy.variantLabel}</div>
          </div>
        </div>

        {!done && (
          <>
            <h2 id="am-popup-title" style={{
              fontSize: "28px", lineHeight: 1.1, margin: "6px 0 16px",
              fontWeight: 800, letterSpacing: "-0.01em",
            }}>
              {copy.headline.replace("Celeste", variant.student).replace("Jordan", variant.student)}
            </h2>

            <div style={{
              border: `1px solid ${copy.color}55`,
              borderRadius: "14px", padding: "14px",
              background: "rgba(255,255,255,0.03)",
              marginBottom: "16px",
            }}>
              <div style={{
                display: "flex", alignItems: "center", gap: "8px",
                fontSize: "12px", color: copy.colorBright, fontWeight: 700,
                marginBottom: "8px",
              }}>
                <span style={{
                  width: "8px", height: "8px", borderRadius: "999px",
                  background: copy.colorBright, display: "inline-block",
                }} />
                {variant.kicker}
              </div>
              <div style={{ display: "flex", gap: "10px", alignItems: "flex-start" }}>
                <div style={{
                  width: "40px", height: "40px", borderRadius: "999px",
                  background: `linear-gradient(135deg, ${copy.color}, ${copy.colorBright})`,
                  display: "grid", placeItems: "center",
                  fontWeight: 800, fontSize: "14px", color: "#fff", flexShrink: 0,
                }}>{variant.avatarInitial}</div>
                <div style={{ fontSize: "14px", lineHeight: 1.45 }}>
                  <strong>{variant.student}:</strong> {variant.claim}
                  <div style={{ fontSize: "11px", opacity: 0.6, marginTop: "6px" }}>
                    Individual results vary.
                  </div>
                </div>
              </div>
            </div>

            <p style={{ fontSize: "14px", opacity: 0.9, margin: "0 0 12px", textAlign: "center" }}>
              {copy.sub}
            </p>

            <form onSubmit={onSubmit} style={{ display: "flex", gap: "8px" }}>
              <input
                type="email"
                required
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={{
                  flex: 1,
                  padding: "12px 14px",
                  borderRadius: "10px",
                  background: "rgba(255,255,255,0.04)",
                  color: copy.text,
                  border: "1px solid rgba(255,255,255,0.1)",
                  fontSize: "15px",
                  outline: "none",
                }}
              />
              <button
                type="submit"
                disabled={submitting}
                style={{
                  padding: "12px 18px",
                  borderRadius: "10px",
                  background: copy.color,
                  color: "#fff",
                  border: "none",
                  fontWeight: 700,
                  fontSize: "15px",
                  cursor: submitting ? "default" : "pointer",
                  opacity: submitting ? 0.7 : 1,
                }}
              >
                {submitting ? "..." : copy.cta}
              </button>
            </form>
            {err && <div style={{ color: "#F87171", fontSize: "12px", marginTop: "8px" }}>{err}</div>}

            <p style={{ fontSize: "12px", opacity: 0.6, margin: "14px 0 0", textAlign: "center" }}>
              {copy.fineprint}
            </p>
          </>
        )}

        {done && (
          <div style={{ textAlign: "center", padding: "12px 0" }}>
            <div style={{ fontSize: "20px", fontWeight: 800, marginBottom: "8px" }}>
              You're in.
            </div>
            <div style={{ fontSize: "14px", opacity: 0.85, marginBottom: "16px" }}>
              Check your email. We'll WhatsApp you within 2 hours to lock in a time.
            </div>
            <button
              onClick={close}
              style={{
                padding: "10px 16px",
                borderRadius: "10px",
                background: copy.color,
                color: "#fff",
                border: "none",
                fontWeight: 700,
                fontSize: "14px",
                cursor: "pointer",
              }}
            >
              Close
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
