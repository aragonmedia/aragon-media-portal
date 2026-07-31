/**
 * Wrapper that returns TikTok Shop analytics for a given user.
 *
 * - If user.isDemo → returns mock data matching TikTok Shop API JSON shape.
 * - Otherwise → calls the real TikTok Shop Analytics API. This part is
 *   scoped for a future ticket once Partner Center approval unlocks
 *   production credentials; for now it throws so real users see a
 *   "Coming soon" empty state rather than mock data.
 *
 * The display code in /review calls this wrapper and never knows
 * whether it got mock or real data.
 */

import {
  mockShopPerformance,
  mockTopProducts,
  type ShopPerformance,
  type ProductPerformance,
} from "@/lib/mocks/tiktok-analytics";

type UserLike = { id: string; email: string; isDemo: boolean };

export async function getShopPerformance(user: UserLike): Promise<ShopPerformance> {
  if (user.isDemo) {
    // Stable seed per demo user so their chart doesn't change between
    // reviewer sessions.
    const seed = seedFromString(user.id);
    return mockShopPerformance({ seed, shopId: `demo-${user.id.slice(0, 8)}` });
  }
  throw new Error(
    "TikTok Shop Analytics is not yet enabled for production users. " +
    "Pending Partner Center approval."
  );
}

export async function getTopProducts(user: UserLike): Promise<ProductPerformance> {
  if (user.isDemo) {
    const seed = seedFromString(user.id);
    return mockTopProducts({ seed });
  }
  throw new Error("Top products unavailable for production users pending API access.");
}

function seedFromString(s: string): number {
  let h = 2166136261 >>> 0;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619) >>> 0;
  }
  return h % 1_000_000_000;
}
