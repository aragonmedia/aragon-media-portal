import Link from "next/link";

export const dynamic = "force-dynamic";

export default function TiktokAccountPage() {
  return (
    <main className="dash-content">
      <header className="dash-page-head">
        <div>
          <p className="dash-eyebrow">TikTok</p>
          <h1>TikTok Account &amp; Revenue</h1>
          <p className="dash-page-sub">Connect your TikTok account once and watch GMV, item sales, item views, and your 80% commission share update live in this tab.</p>
        </div>
      </header>

      <div className="dash-card">
        <div className="dash-card-head">
          <h2>Connection status</h2>
          <span className="status-pill status-requested">Not connected</span>
        </div>
        <div className="dash-empty">
          <div className="dash-empty-body">Once connected, your TikTok Shop GMV, items sold, item views, and product clicks pull live from the TikTok Partner API.</div>
          <button className="dash-cta" disabled>Connect TikTok · coming next session</button>
        </div>
      </div>

      <div className="dash-card" style={{ marginTop: 16 }}>
        <div className="dash-card-head">
          <h2>GMV &amp; Revenue</h2>
          <span className="dash-meta">Charts populate after you connect</span>
        </div>
        <div className="gmv-grid">
          <div className="gmv-stat">
            <div className="dash-stat-label">Total GMV</div>
            <div className="dash-stat-value tone-green">—</div>
            <div className="dash-stat-hint">Last 30 days</div>
          </div>
          <div className="gmv-stat">
            <div className="dash-stat-label">Items sold</div>
            <div className="dash-stat-value">—</div>
            <div className="dash-stat-hint">Cumulative</div>
          </div>
          <div className="gmv-stat">
            <div className="dash-stat-label">Est. commission</div>
            <div className="dash-stat-value tone-green">—</div>
            <div className="dash-stat-hint">Your 80% share</div>
          </div>
          <div className="gmv-stat">
            <div className="dash-stat-label">Product views</div>
            <div className="dash-stat-value">—</div>
            <div className="dash-stat-hint">Cumulative</div>
          </div>
        </div>
        <div className="gmv-chart-placeholder">Daily GMV chart unlocks once your first verified account starts selling.</div>
      </div>

      <div className="dash-card" style={{ marginTop: 16 }}>
        <div className="dash-card-head">
          <h2>Want more accounts under the same login?</h2>
        </div>
        <div className="dash-empty">
          <div className="dash-empty-body">Each TikTok account you verify with AM gets its own dashboard, chat, and withdrawal flow.</div>
          <Link href="/dashboard/add-account" className="dash-cta">Add another account</Link>
        </div>
      </div>
    </main>
  );
}
