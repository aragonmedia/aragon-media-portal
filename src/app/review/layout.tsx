/**
 * /review shell — creator-facing preview for TikTok Partner Center
 * App Review. Imports the real dashboard.css so the sidebar + theme
 * tokens (--bg, --gold, --text, etc. and [data-theme="light"] overrides)
 * match the production creator portal 1:1.
 */

import "../dashboard/dashboard.css";
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
    <div className="dash-shell rv-shell">
      <ReviewSidebar
        userName={user.name || user.email}
        userEmail={user.email}
      />
      <main className="dash-main rv-main">
        <div className="rv-preview-chip">
          <span className="rv-preview-dot" />
          Preview mode &middot; TikTok Partner Center App Review
        </div>
        {children}
      </main>

      <style>{`
        html, body { background: var(--bg); }
        .rv-main { padding-top: 24px; }
        .rv-preview-chip {
          align-self: flex-start;
          display: inline-flex; align-items: center; gap: 8px;
          padding: 6px 12px;
          font-size: 11px; letter-spacing: 0.14em;
          text-transform: uppercase; font-weight: 700;
          color: var(--gold);
          background: rgba(201, 168, 76, 0.08);
          border: 1px solid rgba(201, 168, 76, 0.28);
          border-radius: 999px;
          margin-bottom: 22px;
        }
        .rv-preview-dot {
          width: 6px; height: 6px; border-radius: 50%;
          background: var(--gold);
          box-shadow: 0 0 0 3px rgba(201, 168, 76, 0.18);
        }
      `}</style>
    </div>
  );
}
