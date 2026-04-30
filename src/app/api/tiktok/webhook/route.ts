/**
 * POST /api/tiktok/webhook
 *
 * Stub for TikTok Shop Partner Center event webhooks. Once OAuth is live
 * and we subscribe to events (e.g. authorization.granted, order.created,
 * etc.), this is where TikTok will POST notifications.
 *
 * For now: logs payload + returns ok so the URL passes Partner Center
 * validation. Signature verification + per-event handlers wire next round.
 */

import { NextRequest } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const raw = await req.text();
  const sig = req.headers.get("x-tts-signature") ?? req.headers.get("authorization") ?? null;
  console.log("[tiktok webhook] received", { sigPresent: !!sig, bodyPreview: raw.slice(0, 240) });
  return Response.json({ ok: true, received: true });
}

export async function GET() {
  return Response.json({
    ok: true,
    notificationUrl: "https://aragon-media-portal.vercel.app/api/tiktok/webhook",
    note: "Stub endpoint — accepts POSTs from TikTok Shop Partner Center. Full event handlers wired once OAuth + subscriptions go live.",
  });
}
