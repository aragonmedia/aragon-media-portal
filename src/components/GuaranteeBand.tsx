/**
 * GuaranteeBand
 * One-sentence guarantee callout. The ONE positive outcome we promise.
 * Sits above the legal footer.
 */

export type Brand = "accelerator" | "roni" | "colt";

const BRAND: Record<Brand, { accent: string; accentBright: string; bg: string; text: string }> = {
  roni:        { accent: "#E11D48", accentBright: "#F43F5E", bg: "linear-gradient(180deg, #0B0B0B 0%, #140707 100%)", text: "#FFFFFF" },
  accelerator: { accent: "#E11D48", accentBright: "#F43F5E", bg: "linear-gradient(180deg, #0B0B0B 0%, #140707 100%)", text: "#FFFFFF" },
  colt:        { accent: "#00E5FF", accentBright: "#2DD4C7", bg: "linear-gradient(180deg, #061018 0%, #072330 100%)", text: "#FFFFFF" },
};

export default function GuaranteeBand({ brand }: { brand: Brand }) {
  const b = BRAND[brand];
  return (
    <section
      aria-label="Program guarantee"
      style={{
        background: b.bg,
        color: b.text,
        padding: "44px 20px",
        borderTop: `1px solid ${b.accent}33`,
      }}
    >
      <div style={{ maxWidth: "860px", margin: "0 auto", textAlign: "center" }}>
        <div style={{
          display: "inline-block",
          fontSize: "11px",
          letterSpacing: "0.12em",
          textTransform: "uppercase",
          color: b.accentBright,
          fontWeight: 800,
          border: `1px solid ${b.accent}66`,
          padding: "6px 12px",
          borderRadius: "999px",
          marginBottom: "16px",
        }}>
          Our Guarantee
        </div>
        <h3 style={{
          fontSize: "clamp(20px, 3.4vw, 28px)",
          lineHeight: 1.3,
          fontWeight: 800,
          letterSpacing: "-0.01em",
          margin: "0 auto",
          maxWidth: "720px",
        }}>
          The creator <span style={{ color: b.accentBright }}>WILL</span> have access to TikTok Shop if they follow the right steps and directions given in the program.
        </h3>
      </div>
    </section>
  );
}
