/**
 * Mock TikTok Shop Analytics provider.
 *
 * Returns responses matching TikTok Shop's Analytics API JSON shape so
 * the display code can consume mock data and real data identically.
 *
 * Reference: https://partner.tiktokshop.com/docv2/page/6507ead7b99d5302be949ba9
 *   Shop Performance → GET /analytics/v1/shop/performance
 *   Product Performance → GET /analytics/v1/products/performance
 *
 * The wrapper getShopAnalytics(user) elsewhere branches on user.isDemo
 * and calls this in demo mode. Real users hit the real API (or a stub
 * that returns 501 until Partner Center approval unlocks it).
 */

export type DailyGmvPoint = {
  date: string; // ISO YYYY-MM-DD
  gmv_amount: number;
  currency: "USD";
  order_count: number;
  buyer_count: number;
};

export type ShopPerformance = {
  code: 0;
  message: "success";
  request_id: string;
  data: {
    shop_id: string;
    shop_region: "US";
    period: { start_date: string; end_date: string };
    rollup: {
      gmv_amount: number;
      order_count: number;
      average_order_value: number;
      unique_buyer_count: number;
      unit_sold: number;
      currency: "USD";
    };
    daily: DailyGmvPoint[];
  };
};

export type TopProduct = {
  product_id: string;
  title: string;
  image_url: string;
  gmv_amount: number;
  units_sold: number;
  currency: "USD";
  return_rate: number; // 0..1
};

export type ProductPerformance = {
  code: 0;
  message: "success";
  request_id: string;
  data: { products: TopProduct[] };
};

// --------- Deterministic pseudo-random so seeded numbers stay stable
function seededRandom(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 0x1_0000_0000;
  };
}

function isoDate(d: Date): string {
  return d.toISOString().slice(0, 10);
}

/**
 * Generate 90 days of daily GMV that adds up to roughly $180K, 4,200
 * orders, ~$43 AOV — the review-brief numbers.
 */
export function mockShopPerformance(opts?: {
  shopId?: string;
  days?: number;
  seed?: number;
  targetGmv?: number;
  targetOrders?: number;
}): ShopPerformance {
  const shopId = opts?.shopId ?? "7500000000000001234";
  const days = opts?.days ?? 90;
  const seed = opts?.seed ?? 20260601;
  const targetGmv = opts?.targetGmv ?? 180_000;
  const targetOrders = opts?.targetOrders ?? 4_200;
  const rng = seededRandom(seed);

  const end = new Date();
  end.setUTCHours(0, 0, 0, 0);
  const start = new Date(end);
  start.setUTCDate(end.getUTCDate() - (days - 1));

  // Base daily average with gentle upward drift + weekend spikes + noise.
  const baseGmv = targetGmv / days;
  const baseOrders = targetOrders / days;
  const daily: DailyGmvPoint[] = [];
  let gmvSum = 0;
  let orderSum = 0;

  for (let i = 0; i < days; i++) {
    const d = new Date(start);
    d.setUTCDate(start.getUTCDate() + i);
    const dow = d.getUTCDay(); // 0=Sun
    const weekendBoost = dow === 0 || dow === 6 ? 1.22 : 1.0;
    const drift = 0.85 + (i / days) * 0.35; // ramps 0.85 → 1.20
    const noise = 0.78 + rng() * 0.44;      // 0.78..1.22
    const gmv = Math.round(baseGmv * weekendBoost * drift * noise);
    const orders = Math.max(1, Math.round(baseOrders * weekendBoost * drift * noise));
    const aov = gmv / orders;
    daily.push({
      date: isoDate(d),
      gmv_amount: gmv,
      currency: "USD",
      order_count: orders,
      buyer_count: Math.max(1, Math.round(orders * (0.86 + rng() * 0.1))),
    });
    gmvSum += gmv;
    orderSum += orders;
    void aov;
  }

  const uniqueBuyers = Math.round(orderSum * 0.72);

  return {
    code: 0,
    message: "success",
    request_id: `mock-${seed}-${Date.now()}`,
    data: {
      shop_id: shopId,
      shop_region: "US",
      period: { start_date: isoDate(start), end_date: isoDate(end) },
      rollup: {
        gmv_amount: gmvSum,
        order_count: orderSum,
        average_order_value: Math.round((gmvSum / Math.max(1, orderSum)) * 100) / 100,
        unique_buyer_count: uniqueBuyers,
        unit_sold: Math.round(orderSum * 1.18),
        currency: "USD",
      },
      daily,
    },
  };
}

/**
 * Top 5 wellness-oriented products with placeholder imagery via
 * https://picsum.photos (seeded so images stay consistent per product).
 */
export function mockTopProducts(opts?: {
  seed?: number;
  totalGmv?: number;
}): ProductPerformance {
  const seed = opts?.seed ?? 20260601;
  const totalGmv = opts?.totalGmv ?? 180_000;

  const catalog = [
    { id: "PRD-VW-001", title: "Verdant Elderberry Immune Gummies (60ct)", share: 0.28, units: 1450, ret: 0.021 },
    { id: "PRD-VW-002", title: "Verdant Ashwagandha Calm Complex", share: 0.22, units: 1120, ret: 0.017 },
    { id: "PRD-VW-003", title: "Daily Greens + Prebiotic Powder", share: 0.18, units: 890, ret: 0.028 },
    { id: "PRD-VW-004", title: "Marine Collagen Peptides 20g", share: 0.17, units: 780, ret: 0.024 },
    { id: "PRD-VW-005", title: "Verdant Sleep Well Melatonin Drops", share: 0.15, units: 690, ret: 0.019 },
  ];

  const products: TopProduct[] = catalog.map((c, i) => ({
    product_id: c.id,
    title: c.title,
    image_url: `https://picsum.photos/seed/${seed + i}/240/240`,
    gmv_amount: Math.round(totalGmv * c.share),
    units_sold: c.units,
    currency: "USD",
    return_rate: c.ret,
  }));

  return {
    code: 0,
    message: "success",
    request_id: `mock-products-${seed}-${Date.now()}`,
    data: { products },
  };
}
