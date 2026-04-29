import Link from "next/link";

export const dynamic = "force-dynamic";

export default function TiktokAccountPage() {
  return (
    <main className="dash-content">
      <header className="dash-page-head">
        <div>
          <p className="dash-eyebrow">TikTok</p>
          <h1>TikTok Account</h1>
          <p className="dash-page-sub">Connect your TikTok account via the TikTok Partner API to unlock live GMV tracking, revenue breakdown, and per-video commission data.</p>
        </div>
      </header>

      <div className="dash-card">
        <div className="dash-card-head">
          <h2>Connection status</h2>
          <span className="status-pill status-requested">Not connected</span>
        </div>
        <div className="dash-empty">
          <div className="dash-empty-body">
            Once connected, your TikTok Shop GMV, items sold, item views, and product clicks pull live from the TikTok Partner API and feed the Overview + GMV &amp; Revenue tabs.
          </div>
          <button className="dash-cta" disabled>Connect TikTok · coming next session</button>
        </div>
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
