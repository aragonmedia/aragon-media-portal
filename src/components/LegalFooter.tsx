/**
 * LegalFooter
 * Three-paragraph disclaimer block shown at the bottom of each lander.
 * Server component. Copy is verbatim per Kevin's spec.
 */

export type Brand = "accelerator" | "roni" | "colt";

const BRAND_COLORS: Record<Brand, { accent: string; bg: string; text: string; muted: string }> = {
  roni:        { accent: "#E11D48", bg: "#0B0B0B", text: "#E5E5E5", muted: "#9CA3AF" },
  accelerator: { accent: "#E11D48", bg: "#0B0B0B", text: "#E5E5E5", muted: "#9CA3AF" },
  colt:        { accent: "#00E5FF", bg: "#061018", text: "#E5E5E5", muted: "#94A3B8" },
};

export default function LegalFooter({ brand }: { brand: Brand }) {
  const c = BRAND_COLORS[brand];
  return (
    <section
      aria-label="Legal disclaimer"
      style={{
        background: c.bg,
        color: c.muted,
        padding: "40px 20px 32px",
        borderTop: `1px solid rgba(255,255,255,0.06)`,
      }}
    >
      <div style={{ maxWidth: "860px", margin: "0 auto", fontSize: "12px", lineHeight: 1.6 }}>
        <div style={{
          fontSize: "11px",
          letterSpacing: "0.08em",
          textTransform: "uppercase",
          color: c.accent,
          fontWeight: 700,
          marginBottom: "14px",
        }}>
          Disclaimer
        </div>
        <p style={{ margin: "0 0 12px" }}>
          The results and experiences referenced on this website represent real feedback from students of our educational programs. Results will vary based on individual experience, effort, marketplace conditions, and other factors. We do not guarantee any specific financial outcomes or earnings. Our programs provide educational information, marketing strategies, and general guidance only.
        </p>
        <p style={{ margin: "0 0 12px" }}>
          Nothing on this website or in our programs should be interpreted as financial advice, legal advice, or a promise of future performance. You are solely responsible for your business decisions and compliance with platform policies, including TikTok Shop and other affiliate programs.
        </p>
        <p style={{ margin: "0 0 0" }}>
          All information provided is for educational and informational purposes only. We recommend consulting with a qualified professional regarding business, financial, or legal matters. Testimonials may represent users who applied the training in different ways; individual results will differ.
        </p>
      </div>
    </section>
  );
}
