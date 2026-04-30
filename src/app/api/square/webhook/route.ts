/**
 * POST /api/square/webhook
 *
 * Square posts here when a payment event fires (we subscribe to
 * payment.created + payment.updated). On COMPLETED status we upsert a
 * purchases row so the user's roadmap, cred form, and Path A ladder all
 * advance automatically.
 *
 * Signature verification:
 *   Square computes HMAC-SHA256 over (notification_url + raw_body) with
 *   the Webhook Signature Key. The signature is sent in
 *   `x-square-hmacsha256-signature`. We MUST verify before trusting the
 *   payload.
 *
 * Env vars required:
 *   SQUARE_WEBHOOK_SECRET - signature key from Square dashboard
 *
 * To attach a Square payment to a portal user we look up the user by the
 * Square buyer email (payment.buyer_email_address). For sandbox payments
 * without a buyer email we fall back to no-op + log.
 */

import crypto from "node:crypto";
import { NextRequest } from "next/server";
import { eq, and } from "drizzle-orm";
import { db } from "@/db";
import { users, purchases } from "@/db/schema";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// The notification URL configured in Square. Must match exactly.
const NOTIFICATION_URL = "https://aragon-media-portal.vercel.app/api/square/webhook";

type SquarePaymentEvent = {
  type: string;
  event_id: string;
  data: {
    object: {
      payment?: {
        id: string;
        status: string;
        amount_money?: { amount: number; currency: string };
        buyer_email_address?: string;
        order_id?: string;
        receipt_url?: string;
        created_at?: string;
        updated_at?: string;
      };
    };
  };
};

function verifySignature(rawBody: string, signature: string, secret: string): boolean {
  const expected = crypto
    .createHmac("sha256", secret)
    .update(NOTIFICATION_URL + rawBody)
    .digest("base64");
  // Constant-time compare
  if (expected.length !== signature.length) return false;
  return crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(signature));
}

// Best-effort tier inference from amount paid (cents)
function inferTier(amountCents: number): "path_a_1" | "path_b_1" | "path_b_2" | "path_b_3" | "path_b_4" {
  if (amountCents === 47500) return "path_b_4"; // $475 bundle
  if (amountCents === 35000) return "path_b_3"; // $350 bundle
  if (amountCents === 22500) return "path_b_2"; // $225 bundle
  if (amountCents === 17500 || amountCents === 15000 || amountCents === 12500) return "path_a_1"; // path A 2/3/4
  return "path_b_1"; // $100 first
}

// 20% AM fee captured at time of purchase
function feeCents(amountCents: number): number {
  return Math.round(amountCents * 0.2);
}

export async function POST(req: NextRequest) {
  const secret = process.env.SQUARE_WEBHOOK_SECRET;
  if (!secret) {
    console.error("[square webhook] SQUARE_WEBHOOK_SECRET not set");
    return Response.json({ ok: false, error: "secret not configured" }, { status: 500 });
  }

  const signature = req.headers.get("x-square-hmacsha256-signature");
  if (!signature) {
    return Response.json({ ok: false, error: "missing signature" }, { status: 401 });
  }

  const rawBody = await req.text();
  if (!verifySignature(rawBody, signature, secret)) {
    console.warn("[square webhook] signature mismatch");
    return Response.json({ ok: false, error: "bad signature" }, { status: 401 });
  }

  let event: SquarePaymentEvent;
  try {
    event = JSON.parse(rawBody) as SquarePaymentEvent;
  } catch {
    return Response.json({ ok: false, error: "invalid json" }, { status: 400 });
  }

  // We only care about payment.created / payment.updated with COMPLETED
  if (!["payment.created", "payment.updated"].includes(event.type)) {
    return Response.json({ ok: true, ignored: event.type });
  }

  const payment = event.data?.object?.payment;
  if (!payment || payment.status !== "COMPLETED") {
    return Response.json({ ok: true, ignored: payment?.status ?? "no payment" });
  }

  const amountCents = payment.amount_money?.amount ?? 0;
  const buyerEmail = payment.buyer_email_address?.toLowerCase().trim();

  if (!buyerEmail) {
    console.warn("[square webhook] payment without buyer email — cannot attribute", payment.id);
    return Response.json({ ok: true, warning: "no buyer email" });
  }

  try {
    // Find user by email
    const matched = await db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.email, buyerEmail))
      .limit(1);

    if (matched.length === 0) {
      console.warn("[square webhook] no user found for", buyerEmail);
      return Response.json({ ok: true, warning: "no user found" });
    }

    const userId = matched[0].id;

    // Idempotency: skip if we already have this Square payment ID
    const existing = await db
      .select({ id: purchases.id })
      .from(purchases)
      .where(and(eq(purchases.userId, userId), eq(purchases.squarePaymentId, payment.id)))
      .limit(1);

    if (existing.length > 0) {
      // Already recorded — make sure it's marked paid
      await db
        .update(purchases)
        .set({ status: "paid", paidAt: new Date() })
        .where(eq(purchases.id, existing[0].id));
      return Response.json({ ok: true, message: "already recorded — refreshed status" });
    }

    await db.insert(purchases).values({
      userId,
      tier: inferTier(amountCents),
      amountCents,
      feeCents: feeCents(amountCents),
      squarePaymentId: payment.id,
      squareCheckoutUrl: payment.receipt_url ?? null,
      status: "paid",
      paidAt: new Date(),
    });

    console.log("[square webhook] purchase recorded", { userId, amountCents, paymentId: payment.id });
    return Response.json({ ok: true, message: "purchase recorded" });
  } catch (err) {
    console.error("[square webhook] failed:", err);
    return Response.json(
      { ok: false, error: err instanceof Error ? err.message : String(err) },
      { status: 500 }
    );
  }
}

// GET for handshake / sanity check
export async function GET() {
  return Response.json({
    ok: true,
    notificationUrl: NOTIFICATION_URL,
    expectsHeader: "x-square-hmacsha256-signature",
    eventsHandled: ["payment.created", "payment.updated"],
  });
}
