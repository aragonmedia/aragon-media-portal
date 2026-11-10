"use client";

/**
 * CreatorIntro
 * "I'm X from Y." — Nick-G-style personal intro section.
 * Photo with graceful initial-avatar fallback if photo missing.
 * Client component (so it can be imported inside other client components).
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
  photoSrc?: string;
  paragraphs: string[];
  pullQuote?: string;
};

export default function CreatorIntro({ brand, name, location, photoSrc, paragraphs, pullQuote }: Props) {
  const c = BRAND[brand];
  const initial = name.charAt(0).toUpperCase();
  const slug = `ci-${brand}-${name.toLowerCase().replace(/\s+/g, "-")}`;

  return (
    <section
      aria-label={`Meet ${name}`}
      className={slug}
      style={{
        background: c.bg,
        color: c.text,
        padding: "48px 24px",
        borderRadius: "20px",
        border: `1px solid ${c.accent}22`,
        margin: "36px 0",
      }}
    >
      <div className="ci-grid" style={{
        display: "grid",
        gridTemplateColumns: "minmax(0, 300px) 1fr",
        gap: "32px",
        alignItems: "center",
        maxWidth: "860px",
        margin: "0 auto",
      }}>
        {/* Photo column */}
        <div style={{ position: "relative" }}>
          {photoSrc ? (
            <img
              src={photoSrc}
              alt={name}
              className="ci-photo"
              style={{
                width: "100%",
                aspectRatio: "3/4",
                objectFit: "cover",
                borderRadius: "16px",
                border: `1px solid ${c.accent}33`,
                display: "block",
              }}
            />
          ) : (
            <div
              aria-hidden
              className="ci-photo"
              style={{
                width: "100%",
                aspectRatio: "3/4",
                borderRadius: "16px",
                border: `1px solid ${c.accent}33`,
                background: `linear-gradient(135deg, ${c.accent}22, ${c.accentBright}11), ${c.bg}`,
                display: "grid",
                placeItems: "center",
                fontWeight: 800,
                fontSize: "clamp(64px, 10vw, 120px)",
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
            fontSize: "10.5px",
            letterSpacing: "0.14em",
            textTransform: "uppercase",
            color: c.accentBright,
            fontWeight: 800,
            border: `1px solid ${c.accent}66`,
            padding: "5px 11px",
            borderRadius: "999px",
            marginBottom: "14px",
          }}>
            Meet your mentor
          </div>
          <h2 className="ci-h2" style={{
            fontSize: "clamp(22px, 3vw, 30px)",
            lineHeight: 1.15,
            fontWeight: 800,
            letterSpacing: "-0.02em",
            margin: "0 0 16px",
          }}>
            {`I'm ${name}, from ${location}.`}
          </h2>

          {pullQuote && (
            <div className="ci-quote" style={{
              background: c.cardBg,
              border: `1px solid ${c.accent}33`,
              borderRadius: "12px",
              padding: "12px 15px",
              marginBottom: "16px",
              fontSize: "clamp(14px, 1.7vw, 15.5px)",
              lineHeight: 1.45,
              fontWeight: 600,
              color: c.text,
            }}>
              {pullQuote}
            </div>
          )}

          {paragraphs.map((p, i) => (
            <p key={i} className="ci-p" style={{
              fontSize: "clamp(14px, 1.6vw, 15.5px)",
              lineHeight: 1.65,
              color: c.muted,
              margin: i === paragraphs.length - 1 ? "0" : "0 0 12px",
            }}>
              {p}
            </p>
          ))}
        </div>
      </div>

      {/* Stack on narrow containers (900px covers the 760px funnel shell) */}
      <style>{`
        @media (max-width: 900px) {
          .${slug} .ci-grid {
            grid-template-columns: 1fr !important;
            gap: 20px !important;
            align-items: start !important;
          }
          .${slug} .ci-grid > div:first-child {
            max-width: 240px;
            margin: 0 auto;
          }
          .${slug} .ci-h2 {
            text-align: center;
            font-size: clamp(22px, 5.5vw, 26px) !important;
          }
          .${slug} > section > div > div:last-child {
            text-align: left;
          }
        }
      `}</style>
    </section>
  );
}
