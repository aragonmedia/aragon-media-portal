import Link from "next/link";
import GmvPreviewClient from "./GmvPreviewClient";

export const dynamic = "force-dynamic";

export default async function TiktokAccountPage({
  searchParams,
}: {
  searchParams: Promise<{ preview?: string }>;
}) {
  const params = await searchParams;
  const isPreview = params.preview === "1";
  if (isPreview) return <GmvPreviewClient />;
  return <EmptyView />;
}

function EmptyView() {
  return (
    <main className="dash-content">
      <header className="dash-page-head">
        <div>
          <p className="dash-eyebrow">TikTok</p>
          <h1>TikTok Account &amp; Revenue</h1>
          <p className="dash-page-sub">Connect your TikTok account once and watch GMV, items sold, orders, and your 80% creator commission update live in this tab.</p>
        </div>
        <Link href="/dashboard/tiktok-account?preview=1" className="dash-cta ghost">Preview connected state →</Link>
      </header>

      <div className="dash-card">
        <div className="dash-card-head">
          <h2>Connection status</h2>
          <span className="status-pill status-requested">Not connected</span>
        </div>
        <div className="dash-empty">
          <div className="dash-empty-body">Click below to connect via TikTok Shop Partner Center. After approving, GMV pulls live within minutes.</div>
          <a href="/api/tiktok/auth" className="dash-cta">Connect TikTok →</a>
        </div>
      </div>

      <div className="dash-card" style={{ marginTop: 16 }}>
        <div className="dash-card-head">
          <h2>GMV &amp; Revenue</h2>
          <span className="dash-meta">Preview locked — connect to unlock live numbers</span>
        </div>
        <div className="gmv-stat-grid">
          <div className="gmv-stat-card locked"><div className="gmv-stat-label">Total GMV</div><div className="gmv-stat-val green">—</div><div className="gmv-stat-sub">Connect TikTok to unlock</div><div className="gmv-stat-lock">🔒</div></div>
          <div className="gmv-stat-card locked"><div className="gmv-stat-label">Creator Commission</div><div className="gmv-stat-val green">—</div><div className="gmv-stat-sub">Your earnings</div><div className="gmv-stat-lock">🔒</div></div>
          <div className="gmv-stat-card locked"><div className="gmv-stat-label">Orders Sold</div><div className="gmv-stat-val">—</div><div className="gmv-stat-sub">Total fulfilled</div><div className="gmv-stat-lock">🔒</div></div>
          <div className="gmv-stat-card locked"><div className="gmv-stat-label">Total Videos Posted</div><div className="gmv-stat-val gold">—</div><div className="gmv-stat-sub">Across all accounts</div><div className="gmv-stat-lock">🔒</div></div>
        </div>
        <div className="gmv-chart-placeholder">Earnings Over Time chart unlocks once your TikTok account is connected and your first sale is recorded.</div>
      </div>
    </main>
  );
}
