import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function TiktokAccountPage({
  searchParams,
}: {
  searchParams: Promise<{ preview?: string }>;
}) {
  const params = await searchParams;
  const isPreview = params.preview === "1";

  if (isPreview) return <PreviewView />;
  return <EmptyView />;
}

function EmptyView() {
  return (
    <main className="dash-content">
      <header className="dash-page-head">
        <div>
          <p className="dash-eyebrow">TikTok</p>
          <h1>TikTok Account &amp; Revenue</h1>
          <p className="dash-page-sub">Connect your TikTok account once and watch GMV, item sales, item views, and your 80% commission share update live in this tab.</p>
        </div>
        <Link href="/dashboard/tiktok-account?preview=1" className="dash-cta ghost">Preview connected state →</Link>
      </header>

      <div className="dash-card">
        <div className="dash-card-head">
          <h2>Connection status</h2>
          <span className="status-pill status-requested">Not connected</span>
        </div>
        <div className="dash-empty">
          <div className="dash-empty-body">Once connected via TikTok&apos;s Partner API (TAP Matchmaking), GMV, items sold, item views, and product clicks pull live from TikTok.</div>
          <button className="dash-cta" disabled>Connect TikTok · awaiting API key</button>
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

/* === Preview view: populated mock data so Kevin can critique the UX === */
function PreviewView() {
  // Realistic mock data styled after Kevin's earning history screenshots
  const accounts = [
    { handle: "kevinaragon_main", gmv: 125620, commission: 36800, items: 4823, views: 4_800_000, status: "Active" },
    { handle: "kevinaragon_beauty", gmv: 89150, commission: 26700, items: 2310, views: 3_700_000, status: "Active" },
    { handle: "kevinaragon_pets", gmv: 47800, commission: 14340, items: 1654, views: 2_100_000, status: "Active" },
  ];
  const totalGmv = accounts.reduce((s, a) => s + a.gmv, 0);
  const totalCommission = accounts.reduce((s, a) => s + a.commission, 0);
  const totalItems = accounts.reduce((s, a) => s + a.items, 0);
  const totalViews = accounts.reduce((s, a) => s + a.views, 0);

  // Mock 14-day GMV trend (in cents → display as $)
  const trend = [4200, 5100, 4800, 6300, 7200, 5800, 8400, 9100, 7600, 8800, 10200, 11500, 9800, 12400];
  const maxTrend = Math.max(...trend);

  return (
    <main className="dash-content">
      <header className="dash-page-head">
        <div>
          <p className="dash-eyebrow">TikTok · Preview Mode</p>
          <h1>TikTok Account &amp; Revenue</h1>
          <p className="dash-page-sub">This is what this tab will look like once your TikTok Partner API key is wired and creators connect. Mock data shown.</p>
        </div>
        <Link href="/dashboard/tiktok-account" className="dash-cta ghost">← Back to live view</Link>
      </header>

      <div className="dash-card">
        <div className="dash-card-head">
          <h2>Connection status</h2>
          <span className="status-pill status-paid">Connected · 3 accounts</span>
        </div>
        <div className="preview-conn-row">
          {accounts.map((a) => (
            <div key={a.handle} className="preview-conn-tile">
              <div className="preview-conn-dot" />
              <div>
                <div className="preview-conn-handle">@{a.handle}</div>
                <div className="preview-conn-status">{a.status} · last sync 2m ago</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="dash-card" style={{ marginTop: 16 }}>
        <div className="dash-card-head">
          <h2>GMV &amp; Revenue</h2>
          <span className="dash-meta">Aggregate across all connected accounts · Last 30 days</span>
        </div>
        <div className="gmv-grid">
          <div className="gmv-stat">
            <div className="dash-stat-label">Total GMV</div>
            <div className="dash-stat-value tone-green">${(totalGmv / 1000).toFixed(1)}K</div>
            <div className="dash-stat-hint">+24% vs prior 30d</div>
          </div>
          <div className="gmv-stat">
            <div className="dash-stat-label">Items sold</div>
            <div className="dash-stat-value">{totalItems.toLocaleString()}</div>
            <div className="dash-stat-hint">+18% vs prior 30d</div>
          </div>
          <div className="gmv-stat">
            <div className="dash-stat-label">Est. commission</div>
            <div className="dash-stat-value tone-green">${(totalCommission / 1000).toFixed(1)}K</div>
            <div className="dash-stat-hint">Your 80% share</div>
          </div>
          <div className="gmv-stat">
            <div className="dash-stat-label">Product views</div>
            <div className="dash-stat-value">{(totalViews / 1_000_000).toFixed(1)}M</div>
            <div className="dash-stat-hint">+31% vs prior 30d</div>
          </div>
        </div>

        {/* Mock 14-day chart */}
        <div className="preview-chart">
          <div className="preview-chart-head">
            <strong>Daily GMV · last 14 days</strong>
            <span>Peak: ${trend[trend.length - 1].toLocaleString()}</span>
          </div>
          <div className="preview-chart-bars">
            {trend.map((v, i) => (
              <div key={i} className="preview-chart-bar" style={{ height: `${(v / maxTrend) * 100}%` }} title={`Day ${i + 1}: $${v.toLocaleString()}`} />
            ))}
          </div>
          <div className="preview-chart-x">
            <span>14d ago</span>
            <span>Today</span>
          </div>
        </div>
      </div>

      <div className="dash-card" style={{ marginTop: 16 }}>
        <div className="dash-card-head">
          <h2>Per-account breakdown</h2>
          <span className="dash-meta">Each verified account tracked independently</span>
        </div>
        <table className="dash-table">
          <thead>
            <tr><th>Account</th><th>GMV</th><th>Items</th><th>Views</th><th>Est. commission</th><th>Status</th></tr>
          </thead>
          <tbody>
            {accounts.map((a) => (
              <tr key={a.handle}>
                <td className="mono">@{a.handle}</td>
                <td className="ok">${(a.gmv / 1000).toFixed(1)}K</td>
                <td>{a.items.toLocaleString()}</td>
                <td>{(a.views / 1_000_000).toFixed(1)}M</td>
                <td className="ok">${(a.commission / 1000).toFixed(1)}K</td>
                <td><span className="status-pill status-paid">{a.status}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
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
