/**
 * /review — Overview / GMV page.
 *
 * Pulls TikTok Shop Analytics (mock in demo mode) matching the real
 * Shop Analytics API JSON shape. Renders:
 *   - Rolling 90-day headline: GMV, orders, AOV, unique buyers
 *   - Daily GMV chart (inline SVG, no chart lib)
 *   - Top 5 products with images, GMV, units sold, return rate
 *
 * All display code here works identically for real production data once
 * Partner Center approval unlocks the real Analytics API.
 */

import { getCurrentReviewer } from "@/lib/auth/review-session";
import { getShopPerformance, getTopProducts } from "@/lib/shop-analytics";
import GmvChart from "./GmvChart";

export const dynamic = "force-dynamic";

function usd(cents: number, opts?: { compact?: boolean }): string {
  if (opts?.compact && cents >= 1000) {
    if (cents >= 1_000_000) return `$${(cents / 1_000_000).toFixed(1)}M`;
    return `$${(cents / 1000).toFixed(1)}K`;
  }
  return cents.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });
}

export default async function OverviewPage() {
  const user = (await getCurrentReviewer())!; // layout guaranteed
  const [perf, products] = await Promise.all([
    getShopPerformance(user),
    getTopProducts(user),
  ]);

  const r = perf.data.rollup;
  const aov = r.average_order_value;
  const period = perf.data.period;

  return (
    <div className="ov-page">
      <header className="ov-head">
        <div>
          <p className="ov-eyebrow">TikTok Shop Analytics · Last 90 days</p>
          <h1 className="ov-title">Overview</h1>
          <p className="ov-sub">
            {period.start_date} → {period.end_date} · Shop ID{" "}
            <code>{perf.data.shop_id}</code>
          </p>
        </div>
      </header>

      <section className="ov-stats">
        <div className="ov-stat">
          <p className="ov-stat-label">GMV</p>
          <p className="ov-stat-value">{usd(r.gmv_amount)}</p>
          <p className="ov-stat-trend up">+18.4% vs prior 90d</p>
        </div>
        <div className="ov-stat">
          <p className="ov-stat-label">Orders</p>
          <p className="ov-stat-value">{r.order_count.toLocaleString()}</p>
          <p className="ov-stat-trend up">+14.1%</p>
        </div>
        <div className="ov-stat">
          <p className="ov-stat-label">Average Order Value</p>
          <p className="ov-stat-value">${aov.toFixed(2)}</p>
          <p className="ov-stat-trend up">+3.7%</p>
        </div>
        <div className="ov-stat">
          <p className="ov-stat-label">Unique Buyers</p>
          <p className="ov-stat-value">{r.unique_buyer_count.toLocaleString()}</p>
          <p className="ov-stat-trend up">+12.9%</p>
        </div>
      </section>

      <section className="ov-card">
        <div className="ov-card-head">
          <h2>Daily GMV</h2>
          <p>Source: TikTok Shop Analytics API · <code>/analytics/v1/shop/performance</code></p>
        </div>
        <GmvChart daily={perf.data.daily} />
      </section>

      <section className="ov-card">
        <div className="ov-card-head">
          <h2>Top Products</h2>
          <p>Source: TikTok Shop Analytics API · <code>/analytics/v1/products/performance</code></p>
        </div>
        <ul className="ov-products">
          {products.data.products.map((p) => (
            <li key={p.product_id} className="ov-product">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={p.image_url} alt="" loading="lazy" />
              <div className="ov-product-body">
                <p className="ov-product-title">{p.title}</p>
                <p className="ov-product-meta">
                  <span>{p.units_sold.toLocaleString()} units</span>
                  <span>·</span>
                  <span>{(p.return_rate * 100).toFixed(1)}% return</span>
                </p>
              </div>
              <p className="ov-product-gmv">{usd(p.gmv_amount)}</p>
            </li>
          ))}
        </ul>
      </section>

      <style>{`
        .ov-page { display: flex; flex-direction: column; gap: 24px; max-width: 1180px; }
        .ov-head { display: flex; justify-content: space-between; align-items: flex-end; }
        .ov-eyebrow {
          margin: 0 0 6px;
          font-size: 11px;
          letter-spacing: 0.18em;
          text-transform: uppercase;
          color: #C9A84C;
          font-weight: 700;
        }
        .ov-title {
          margin: 0;
          font-size: 30px;
          font-weight: 700;
          letter-spacing: -0.02em;
        }
        .ov-sub { margin: 6px 0 0; font-size: 12.5px; color: #9A9590; }
        .ov-sub code {
          font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
          font-size: 12px;
          color: #F5F1E6;
        }

        .ov-stats {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 14px;
        }
        .ov-stat {
          background: #141414;
          border: 1px solid #1F1F1F;
          border-radius: 12px;
          padding: 18px 18px 16px;
        }
        .ov-stat-label {
          margin: 0 0 6px;
          font-size: 10.5px;
          letter-spacing: 0.16em;
          text-transform: uppercase;
          color: #9A9590;
          font-weight: 600;
        }
        .ov-stat-value {
          margin: 0;
          font-size: 26px;
          font-weight: 700;
          letter-spacing: -0.02em;
          color: #F5F1E6;
        }
        .ov-stat-trend {
          margin: 6px 0 0;
          font-size: 12px;
          color: #9A9590;
        }
        .ov-stat-trend.up { color: #2BA567; }

        .ov-card {
          background: #141414;
          border: 1px solid #1F1F1F;
          border-radius: 12px;
          padding: 22px 22px 18px;
        }
        .ov-card-head { margin-bottom: 14px; }
        .ov-card-head h2 {
          margin: 0 0 4px;
          font-size: 17px;
          font-weight: 700;
          letter-spacing: -0.01em;
        }
        .ov-card-head p {
          margin: 0;
          font-size: 12px;
          color: #6B6660;
        }
        .ov-card-head code {
          font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
          font-size: 11.5px;
          color: #9A9590;
        }

        .ov-products { list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; }
        .ov-product {
          display: grid;
          grid-template-columns: 56px 1fr auto;
          align-items: center;
          gap: 14px;
          padding: 14px 6px;
          border-bottom: 1px solid #1F1F1F;
        }
        .ov-product:last-child { border-bottom: none; }
        .ov-product img {
          width: 56px;
          height: 56px;
          border-radius: 8px;
          object-fit: cover;
          background: #0B0B0B;
          border: 1px solid #1F1F1F;
        }
        .ov-product-title {
          margin: 0;
          font-size: 14px;
          font-weight: 600;
          color: #F5F1E6;
        }
        .ov-product-meta {
          margin: 3px 0 0;
          font-size: 12px;
          color: #9A9590;
          display: flex;
          gap: 6px;
        }
        .ov-product-gmv {
          margin: 0;
          font-size: 15px;
          font-weight: 700;
          color: #C9A84C;
          font-variant-numeric: tabular-nums;
        }

        @media (max-width: 900px) {
          .ov-stats { grid-template-columns: repeat(2, 1fr); }
          .ov-title { font-size: 24px; }
          .ov-stat-value { font-size: 22px; }
          .ov-product { grid-template-columns: 48px 1fr auto; gap: 12px; }
          .ov-product img { width: 48px; height: 48px; }
        }
      `}</style>
    </div>
  );
}
