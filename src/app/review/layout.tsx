/**
 * /review shell — creator-facing preview for TikTok Partner Center
 * App Review. Wraps every /review/** page in the icon sidebar + a
 * light/dark theme system driven by CSS custom properties.
 */

import { redirect } from "next/navigation";
import { getCurrentReviewer } from "@/lib/auth/review-session";
import ReviewSidebar from "./ReviewSidebar";

export const dynamic = "force-dynamic";

export default async function ReviewLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentReviewer();
  if (!user) redirect("/login");

  return (
    <div className="rv-shell">
      <ReviewSidebar
        userName={user.name || user.email}
        userEmail={user.email}
      />
      <main className="rv-main">
        <div className="rv-preview-chip">
          <span className="rv-preview-dot" />
          Preview mode &middot; TikTok Partner Center App Review
        </div>
        {children}
      </main>

      <style>{`
        :root, [data-theme="dark"] {
          --rv-bg: #0F0F0F;
          --rv-side-bg: #141414;
          --rv-card-bg: #141414;
          --rv-chip-bg: #101010;
          --rv-chip-hover: #181818;
          --rv-nav-hover: rgba(255,255,255,0.03);
          --rv-border: #1F1F1F;
          --rv-text: #F5F1E6;
          --rv-muted: #9A9590;
          --rv-muted-2: #6B6660;
          --rv-gold: #C9A84C;
          --rv-gold-soft: rgba(201, 168, 76, 0.28);
          --rv-mark-bg: #0B0B0B;
          --rv-good: #2BA567;
          --rv-preview: rgba(201, 168, 76, 0.08);
          --rv-shadow: 0 6px 24px rgba(0,0,0,0.32);
        }
        [data-theme="light"] {
          --rv-bg: #F7F5EF;
          --rv-side-bg: #FFFFFF;
          --rv-card-bg: #FFFFFF;
          --rv-chip-bg: #F3F0E7;
          --rv-chip-hover: #ECE7D8;
          --rv-nav-hover: rgba(0,0,0,0.04);
          --rv-border: #E4DFCE;
          --rv-text: #1A1A1A;
          --rv-muted: #6B6660;
          --rv-muted-2: #8A8578;
          --rv-gold: #8A6D19;
          --rv-gold-soft: rgba(138, 109, 25, 0.34);
          --rv-mark-bg: #FBF8ED;
          --rv-good: #1F7A47;
          --rv-preview: rgba(138, 109, 25, 0.08);
          --rv-shadow: 0 6px 24px rgba(0,0,0,0.06);
        }

        html, body { background: var(--rv-bg); }

        .rv-shell {
          min-height: 100vh;
          display: grid;
          grid-template-columns: 248px 1fr;
          background: var(--rv-bg);
          color: var(--rv-text);
          font-family: 'Inter Tight', system-ui, -apple-system, sans-serif;
        }

        .rv-main {
          min-width: 0;
          padding: 30px 34px 40px;
          display: flex; flex-direction: column;
          gap: 22px;
        }

        .rv-preview-chip {
          align-self: flex-start;
          display: inline-flex; align-items: center; gap: 8px;
          padding: 6px 12px;
          font-size: 11px; letter-spacing: 0.14em;
          text-transform: uppercase; font-weight: 700;
          color: var(--rv-gold);
          background: var(--rv-preview);
          border: 1px solid var(--rv-gold-soft);
          border-radius: 999px;
        }
        .rv-preview-dot {
          width: 6px; height: 6px;
          border-radius: 50%;
          background: var(--rv-gold);
          box-shadow: 0 0 0 3px rgba(201, 168, 76, 0.18);
        }

        @media (max-width: 900px) {
          .rv-shell { grid-template-columns: 1fr; }
          .rv-main { padding: 68px 18px 32px; }
        }
      `}</style>
    </div>
  );
}
