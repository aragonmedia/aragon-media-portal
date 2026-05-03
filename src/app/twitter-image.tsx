import { renderOGCard, OG_SIZE, OG_ALT, OG_CONTENT_TYPE } from "@/lib/og-card";

// X (Twitter) card uses the same 1200×630 image as Open Graph.
// Each route file declares its own runtime/size/etc — Next.js does
// static analysis on these exports and won't follow re-exports.
export const runtime = "edge";
export const alt = OG_ALT;
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

export default function TwitterImage() {
  return renderOGCard();
}
