/**
 * CreatorIntro
 * "I'm X from Y." — Nick-G-style personal intro section.
 * Photo with graceful initial-avatar fallback if photo missing.
 * Server component.
 */

export type Brand = "accelerator" | "roni" | "colt";

const BRAND: Record<Brand, { accent: string; accentBright: string; bg: string; text: string; muted: string; cardBg: string }> = {
  roni: {
    accent: "#E11D48", accentBright: "#F43F5E",
    bg: "linear-gradient(180deg, #0B0B0B 0%, #0F0A0A 100%)",
    text: "#F5F5F5", muted: "#D1D5DB", cardBg: "rgba(225,29,72,0.05)",
  },
  accelerator: {
    accent: "#E11D48", accentBright: "#F43F5E",
    bg: "linear-gradient(180deg, #0B0B0B 0%, #0F0A0A 100%)",
    text: "#F5F5F5", muted: "#D1D5DB", cardBg: "rgba(225,29,72,0.05)",
  },
  colt: {
    accent: "#00E5FF", accentBright: "#2DD4C7",
    bg: "linear-gradient(180deg, #061018 0%, #081822 100%)",
    text: "#F5F5F5", muted: "#CBD5E1", cardBg: "rgba(0,229,255,0.05)",
  },
};

type Props = {
  brand: Brand;
  name: string;
  location: string;
  photoSrc?: string;        // if missing or fails, falls back to initial avatar
  paragraphs: string[];     // 2-3 paragraphs, no em-dashes
  pullQuote?: string;       // optional big-number headline
};

export default function CreatorIntro({ brand, name, location, photoSrc, paragraphs, pullQuote }: Props) {
  const c = BRAND[brand];
  const initial = name.charAt(0).toUpperCase();

  return (
    <section
      aria-label={`Meet ${name}`}
      style={{
        background: c.bg,
        color: c.text,
        padding: "60px 20px",
        borderTop: `1px solid rgba(255,255,255,0.06)`,
      }}
    >
      <div style={{
        maxWidth: "980px", margin: "0 auto",
        display: "grid",
        gridTemplateColumns: "minmax(0, 320px) 1fr",
        gap: "40px",
        alignItems: "start",
      }} className="creator-intro-grid">
        {/* Photo column */}
        <div style={{ position: "relative" }}>
          {photoSrc ? (
            <img
              src={photoSrc}
              alt={name}
              style={{
                width: "100%",
                aspectRatio: "3/4",
                objectFit: "cover",
                borderRadius: "18px",
                border: `1px solid ${c.accent}33`,
                display: "block",
              }}
            />
          ) : (
            <div
              aria-hidden
              style={{
                width: "100%",
                aspectRatio: "3/4",
                borderRadius: "18px",
                border: `1px solid ${c.accent}33`,
                background: `linear-gradient(135deg, ${c.accent}22, ${c.accentBright}11), ${c.bg}`,
                display: "grid",
                placeItems: "center",
                fontWeight: 800,
                fontSize: "clamp(80px, 12vw, 140px)",
                color: c.accentBright,
                letterSpacing: "-0.02em",
              }}
            >
              {initial}
            </div>
          )}
        </div>

        {/* Text column */}
        <div>
          <div style={{
            display: "inline-block",
            fontSize: "11px",
            letterSpacing: "0.12em",
            textTransform: "uppercase",
            color: c.accentBright,
            fontWeight: 800,
            border: `1px solid ${c.accent}66`,
            padding: "6px 12px",
            borderRadius: "999px",
            marginBottom: "16px",
          }}>
            Meet your mentor
          </div>
          <h2 style={{
            fontSize: "clamp(28px, 4.2vw, 40px)",
            lineHeight: 1.1,
            fontWeight: 800,
            letterSpacing: "-0.02em",
            margin: "0 0 20px",
          }}>
            {`I'm ${name}, from ${location}.`}
          </h2>

          {pullQuote && (
            <div style={{
              background: c.cardBg,
              border: `1px solid ${c.accent}33`,
              borderRadius: "14px",
              padding: "14px 18px",
              marginBottom: "20px",
              fontSize: "clamp(16px, 2vw, 18px)",
              lineHeight: 1.4,
              fontWeight: 600,
              color: c.text,
            }}>
              {pullQuote}
            </div>
          )}

          {paragraphs.map((p, i) => (
            <p key={i} style={{
              fontSize: "clamp(15px, 1.7vw, 17px)",
              lineHeight: 1.6,
              color: c.muted,
              margin: i === paragraphs.length - 1 ? "0" : "0 0 14px",
            }}>
              {p}
            </p>
          ))}
        </div>
      </div>

      {/* Responsive: stack on mobile */}
      <style>{`
        @media (max-width: 720px) {
          section[aria-label="Meet ${name}"] .creator-intro-grid {
            grid-template-columns: 1fr !important;
            gap: 24px !important;
          }
          section[aria-label="Meet ${name}"] .creator-intro-grid > div:first-child {
            max-width: 260px;
            margin: 0 auto;
          }
        }
      `}</style>
    </section>
  );
}
