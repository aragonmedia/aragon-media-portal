import Link from "next/link";

export const dynamic = "force-dynamic";

export default function GmvRevenuePage() {
  return (
    <main className="dash-content">
      <header className="dash-page-head">
        <div>
          <p className="dash-eyebrow">Performance</p>
          <h1>GMV &amp; Revenue</h1>
          <p className="dash-page-sub">Live TikTok Shop performance for every verified account in your portal: GMV, items sold, item views, product clicks, and your 80% commission share.</p>
        </div>
      </header>

      <div className="dash-card">
        <div className="dash-card-head">
          <h2>No data yet</h2>
          <span className="dash-meta">Charts populate after you connect TikTok</span>
        </div>
        <div className="dash-empty">
          <div className="dash-empty-body">Once your first account is verified and the TikTok Partner API is connected, this tab shows daily / weekly / monthly GMV, the 20% AM fee, and your net commission per account.</div>
          <Link href="/dashboard/tiktok-account" className="dash-cta">Connect TikTok</Link>
        </div>
      </div>
    </main>
  );
}
