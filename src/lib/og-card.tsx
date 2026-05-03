import { ImageResponse } from "next/og";

/**
 * Shared OG / Twitter card renderer. Lives outside src/app so Next.js
 * doesn't treat it as a route file. Both opengraph-image.tsx and
 * twitter-image.tsx import this and return its result.
 *
 * Layout (1200 × 630):
 *   LEFT — brand mark, eyebrow, big headline, subhead, URL bar
 *   RIGHT — mini phone-mockup of the GMV dashboard (matches landing
 *           page's hero phone, summarized for social-card scale)
 *
 * IMPORTANT: Satori (the renderer powering ImageResponse) requires
 * EVERY <div> with more than one child to have display:flex (or
 * display:none). Avoid Unicode chars outside the system font (e.g.
 * •, ●, →, ↗) — those force a Google Fonts fetch which is blocked
 * at build time on Vercel.
 */
export const OG_SIZE = { width: 1200, height: 630 };
export const OG_ALT = "Aragon Media — Creator Partner Program";
export const OG_CONTENT_TYPE = "image/png";

const GOLD = "#C9A84C";
const GREEN = "#1F8B53";
const BG = "#0F0F0F";
const BG_CARD = "#1A1A1A";
const BG_PHONE = "#0B0B0B";
const TEXT = "#F5F1E6";
const MUTED = "#9A9590";
const BORDER = "#2A2A2A";

export function renderOGCard(): Promise<ImageResponse> | ImageResponse {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "row",
          background:
            "linear-gradient(135deg, #0F0F0F 0%, #161616 60%, #0B0B0B 100%)",
          color: TEXT,
          fontFamily: "system-ui, sans-serif",
        }}
      >
        {/* ────────── LEFT: brand + headline + URL ────────── */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            width: 700,
            padding: "60px 0 60px 70px",
          }}
        >
          {/* Brand row */}
          <div
            style={{ display: "flex", alignItems: "center", gap: 18 }}
          >
            <div
              style={{
                width: 72,
                height: 72,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                background: BG_PHONE,
                border: `2px solid ${GOLD}`,
                borderRadius: 16,
                color: GOLD,
                fontSize: 36,
                fontWeight: 800,
                letterSpacing: "-0.06em",
              }}
            >
              AM
            </div>
            <div
              style={{
                fontSize: 26,
                fontWeight: 700,
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                color: TEXT,
                display: "flex",
              }}
            >
              Aragon Media
            </div>
          </div>

          {/* Headline stack */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 18,
            }}
          >
            <div
              style={{
                fontSize: 18,
                letterSpacing: "0.22em",
                textTransform: "uppercase",
                color: GOLD,
                fontWeight: 700,
                display: "flex",
              }}
            >
              Creator Partner Program
            </div>
            <div
              style={{
                fontSize: 64,
                lineHeight: 1.04,
                fontWeight: 800,
                letterSpacing: "-0.02em",
                color: TEXT,
                display: "flex",
                flexDirection: "column",
              }}
            >
              <span>Your TikTok business,</span>
              <span style={{ color: GOLD }}>professionally managed.</span>
            </div>
            <div
              style={{
                fontSize: 22,
                color: MUTED,
                lineHeight: 1.4,
                maxWidth: 560,
                display: "flex",
              }}
            >
              Activation, GMV tracking, and withdrawals — USD income from
              anywhere in the world.
            </div>
          </div>

          {/* Bottom URL bar */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 14,
              paddingTop: 24,
              borderTop: `1px solid ${BORDER}`,
            }}
          >
            <div
              style={{
                fontSize: 20,
                color: MUTED,
                letterSpacing: "0.04em",
                display: "flex",
              }}
            >
              aragon-media-portal.vercel.app
            </div>
            <div
              style={{
                width: 6,
                height: 6,
                borderRadius: 6,
                background: GREEN,
              }}
            />
            <div
              style={{
                fontSize: 14,
                color: GREEN,
                fontWeight: 700,
                letterSpacing: "0.14em",
                textTransform: "uppercase",
                display: "flex",
              }}
            >
              Now onboarding
            </div>
          </div>
        </div>

        {/* ────────── RIGHT: phone mockup ────────── */}
        <div
          style={{
            display: "flex",
            flex: 1,
            alignItems: "center",
            justifyContent: "center",
            padding: "40px 50px 40px 0",
          }}
        >
          {/* Phone frame */}
          <div
            style={{
              width: 320,
              height: 540,
              display: "flex",
              flexDirection: "column",
              background: BG_PHONE,
              borderRadius: 44,
              border: `2px solid ${BORDER}`,
              padding: 16,
              position: "relative",
            }}
          >
            {/* Notch */}
            <div
              style={{
                position: "absolute",
                top: 14,
                left: "50%",
                transform: "translateX(-50%)",
                width: 110,
                height: 24,
                background: "#000",
                borderRadius: 14,
                display: "flex",
              }}
            />

            {/* Screen */}
            <div
              style={{
                marginTop: 36,
                flex: 1,
                display: "flex",
                flexDirection: "column",
                gap: 12,
                background: BG_CARD,
                borderRadius: 28,
                padding: 18,
              }}
            >
              {/* Brand pill chip */}
              <div
                style={{
                  alignSelf: "flex-start",
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  padding: "6px 12px",
                  background: BG_PHONE,
                  border: `1px solid ${BORDER}`,
                  borderRadius: 999,
                  fontSize: 11,
                  color: MUTED,
                  letterSpacing: "0.14em",
                  textTransform: "uppercase",
                  fontWeight: 700,
                }}
              >
                <div
                  style={{
                    width: 6,
                    height: 6,
                    borderRadius: 6,
                    background: GOLD,
                  }}
                />
                <div style={{ display: "flex" }}>Aragon Dashboard</div>
              </div>

              {/* GMV stat card */}
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: 4,
                  padding: "14px 14px 14px",
                  background: BG_PHONE,
                  border: `1px solid ${BORDER}`,
                  borderRadius: 14,
                }}
              >
                <div
                  style={{
                    fontSize: 11,
                    color: MUTED,
                    letterSpacing: "0.14em",
                    textTransform: "uppercase",
                    fontWeight: 600,
                    display: "flex",
                  }}
                >
                  Total GMV
                </div>
                <div
                  style={{
                    fontSize: 30,
                    color: TEXT,
                    fontWeight: 800,
                    letterSpacing: "-0.02em",
                    display: "flex",
                  }}
                >
                  $48,200
                </div>
                <div
                  style={{
                    fontSize: 11,
                    color: GREEN,
                    fontWeight: 700,
                    letterSpacing: "0.04em",
                    display: "flex",
                  }}
                >
                  +$15,900 this month
                </div>
              </div>

              {/* Sparkline chart card */}
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: 6,
                  padding: "12px 14px 8px",
                  background: BG_PHONE,
                  border: `1px solid ${BORDER}`,
                  borderRadius: 14,
                  height: 92,
                }}
              >
                <div
                  style={{
                    fontSize: 10,
                    color: MUTED,
                    letterSpacing: "0.14em",
                    textTransform: "uppercase",
                    fontWeight: 600,
                    display: "flex",
                  }}
                >
                  Revenue Trend
                </div>
                <div
                  style={{
                    flex: 1,
                    display: "flex",
                  }}
                >
                  {/* Bar chart — 7 bars representing weekly trend */}
                  <div
                    style={{
                      flex: 1,
                      display: "flex",
                      alignItems: "flex-end",
                      gap: 6,
                    }}
                  >
                    <div style={{ flex: 1, height: "30%", background: GOLD, borderRadius: 2 }} />
                    <div style={{ flex: 1, height: "45%", background: GOLD, borderRadius: 2 }} />
                    <div style={{ flex: 1, height: "38%", background: GOLD, borderRadius: 2 }} />
                    <div style={{ flex: 1, height: "62%", background: GOLD, borderRadius: 2 }} />
                    <div style={{ flex: 1, height: "55%", background: GOLD, borderRadius: 2 }} />
                    <div style={{ flex: 1, height: "82%", background: GREEN, borderRadius: 2 }} />
                    <div style={{ flex: 1, height: "95%", background: GREEN, borderRadius: 2 }} />
                  </div>
                </div>
              </div>

              {/* Campaign revenue stat card */}
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: 4,
                  padding: "12px 14px",
                  background: BG_PHONE,
                  border: `1px solid ${BORDER}`,
                  borderRadius: 14,
                }}
              >
                <div
                  style={{
                    fontSize: 11,
                    color: MUTED,
                    letterSpacing: "0.14em",
                    textTransform: "uppercase",
                    fontWeight: 600,
                    display: "flex",
                  }}
                >
                  Withdrawals Paid
                </div>
                <div
                  style={{
                    fontSize: 22,
                    color: GREEN,
                    fontWeight: 800,
                    letterSpacing: "-0.01em",
                    display: "flex",
                  }}
                >
                  $12,300
                </div>
                <div
                  style={{
                    fontSize: 10,
                    color: MUTED,
                    fontWeight: 600,
                    letterSpacing: "0.04em",
                    display: "flex",
                  }}
                >
                  Cleared in 2 business days
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    ),
    { ...OG_SIZE }
  );
}
