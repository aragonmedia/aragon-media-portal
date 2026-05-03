import { ImageResponse } from "next/og";

/**
 * Shared OG / Twitter card renderer. Lives outside src/app so Next.js
 * doesn't treat it as a route file. Both opengraph-image.tsx and
 * twitter-image.tsx import this and return its result.
 *
 * IMPORTANT: Satori (the renderer powering ImageResponse) requires
 * every <div> with more than one child to have display:flex (or
 * display:none). Avoid Unicode chars outside the system font (e.g.
 * •, ●, →) — those force a Google Fonts fetch which is blocked at
 * build time on Vercel.
 */
export const OG_SIZE = { width: 1200, height: 630 };
export const OG_ALT = "Aragon Media — Creator Partner Program";
export const OG_CONTENT_TYPE = "image/png";

export function renderOGCard(): Promise<ImageResponse> | ImageResponse {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: 80,
          background:
            "linear-gradient(135deg, #0F0F0F 0%, #1A1A1A 60%, #0F0F0F 100%)",
          color: "#F5F1E6",
          fontFamily: "system-ui, sans-serif",
        }}
      >
        {/* Top: brand mark + wordmark */}
        <div style={{ display: "flex", alignItems: "center", gap: 22 }}>
          <div
            style={{
              width: 88,
              height: 88,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background: "#0B0B0B",
              border: "2px solid #C9A84C",
              borderRadius: 18,
              color: "#C9A84C",
              fontSize: 44,
              fontWeight: 800,
              letterSpacing: "-0.06em",
            }}
          >
            AM
          </div>
          <div
            style={{
              fontSize: 30,
              fontWeight: 700,
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              color: "#F5F1E6",
              display: "flex",
            }}
          >
            Aragon Media
          </div>
        </div>

        {/* Middle: headline + subhead, stacked */}
        <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>
          <div
            style={{
              fontSize: 22,
              letterSpacing: "0.18em",
              textTransform: "uppercase",
              color: "#C9A84C",
              fontWeight: 700,
              display: "flex",
            }}
          >
            Creator Partner Program
          </div>
          <div
            style={{
              fontSize: 78,
              lineHeight: 1.05,
              fontWeight: 800,
              letterSpacing: "-0.02em",
              color: "#F5F1E6",
              maxWidth: 1000,
              display: "flex",
              flexDirection: "column",
            }}
          >
            <span>Your TikTok business,</span>
            <span style={{ color: "#C9A84C" }}>professionally managed.</span>
          </div>
          <div
            style={{
              fontSize: 26,
              color: "#9A9590",
              lineHeight: 1.4,
              maxWidth: 900,
              display: "flex",
            }}
          >
            Activation, GMV tracking, withdrawals — USD income from anywhere
            in the world.
          </div>
        </div>

        {/* Footer: URL + status */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            paddingTop: 30,
            borderTop: "1px solid #2A2A2A",
          }}
        >
          <div
            style={{
              fontSize: 22,
              color: "#9A9590",
              letterSpacing: "0.04em",
              display: "flex",
            }}
          >
            aragon-media-portal.vercel.app
          </div>
          <div
            style={{
              fontSize: 18,
              color: "#1F8B53",
              fontWeight: 700,
              letterSpacing: "0.12em",
              textTransform: "uppercase",
              display: "flex",
            }}
          >
            Now onboarding
          </div>
        </div>
      </div>
    ),
    { ...OG_SIZE }
  );
}
