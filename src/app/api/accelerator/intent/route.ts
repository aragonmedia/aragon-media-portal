/**
 * POST /api/accelerator/intent
 *
 * Public. Body:
 *   { action: "reveal", email, name }
 *     → INSERT (or find-by-email/browser_key), stamp viewed_tiers_at.
 *     → Fires admin notification email (new lead).
 *     → Returns 200 with intent id + sets browser cookie.
 *
 *   { action: "click", tier: "edu_only"|"edu_plus_account"|"browse" }
 *     → Requires a prior reveal (browser cookie carries the intent).
 *     → Stamps clicked_tier + clicked_at.
 *     → Fires buyer confirmation email + admin hot-lead email.
 *     → Returns 200 with the Square checkout URL (or /accounts for browse).
 */

import { NextResponse } from "next/server";
import { and, eq } from "drizzle-orm";
import { db } from "@/db";
import { acceleratorIntents } from "@/db/schema";
import { cookies } from "next/headers";
import crypto from "node:crypto";
import { upsertLead } from "@/lib/airtable/leads";
import {
  sendAcceleratorIntentToBuyer,
  sendAcceleratorIntentToAdmin,
  sendAcceleratorRevealNotifyAdmin,
} from "@/lib/email/send";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const COOKIE = "am_accel_intent";
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

type Tier = "edu_only" | "edu_plus_account" | "browse";

const SQUARE_URL_EDU = process.env.SQUARE_ACCELERATOR_EDU_URL ??
  "https://square.link/u/AYMY3X0L";
const SQUARE_URL_EDU_PLUS = process.env.SQUARE_ACCELERATOR_EDU_PLUS_URL ??
  "https://square.link/u/9xgRVCHp";

function tierMeta(t: Tier): { label: string; priceCents: number | null; url: string } {
  if (t === "edu_only") return { label: "Education Only", priceCents: 99700, url: SQUARE_URL_EDU };
  if (t === "edu_plus_account") return { label: "Education + Verified Account", priceCents: 199700, url: SQUARE_URL_EDU_PLUS };
  return { label: "Accounts Only (browse)", priceCents: null, url: "/accounts" };
}

async function getBrowserKey(): Promise<{ key: string; setCookie: boolean }> {
  const jar = await cookies();
  const existing = jar.get(COOKIE)?.value;
  if (existing && /^[a-f0-9]{40}$/.test(existing)) return { key: existing, setCookie: false };
  return { key: crypto.randomBytes(20).toString("hex"), setCookie: true };
}

function cookieHeader(v: string) {
  return `${COOKIE}=${v}; Path=/; Max-Age=15552000; SameSite=Lax`;
}

export async function POST(req: Request) {
  let body: {
    action?: unknown; email?: unknown; name?: unknown; tier?: unknown;
  };
  try { body = await req.json(); }
  catch { return NextResponse.json({ ok: false, error: "invalid json" }, { status: 400 }); }

  const action = body.action === "reveal" || body.action === "click" ? body.action : null;
  if (!action) return NextResponse.json({ ok: false, error: "invalid action" }, { status: 400 });

  const { key, setCookie } = await getBrowserKey();
  const origin = new URL(req.url).origin;
  const referrer = req.headers.get("referer") ?? "";
  const userAgent = req.headers.get("user-agent") ?? "";

  const kevin = process.env.ACCELERATOR_NOTIFY_EMAIL_KEVIN;
  const roni = process.env.ACCELERATOR_NOTIFY_EMAIL_RONI;
  const adminTo = [kevin, roni].filter((e): e is string => typeof e === "string" && e.includes("@"));

  // ============================================================
  // REVEAL
  // ============================================================
  if (action === "reveal") {
    const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
    const name = typeof body.name === "string" ? body.name.trim().slice(0, 200) : "";
    if (!EMAIL_RE.test(email)) return NextResponse.json({ ok: false, error: "invalid email" }, { status: 400 });
    if (!name) return NextResponse.json({ ok: false, error: "name required" }, { status: 400 });

    // Idempotency: if this (email + browser_key) already exists, update viewed_tiers_at
    const existing = await db
      .select()
      .from(acceleratorIntents)
      .where(and(eq(acceleratorIntents.email, email), eq(acceleratorIntents.browserKey, key)))
      .limit(1);

    const now = new Date();
    let intent;
    if (existing[0]) {
      const [row] = await db.update(acceleratorIntents)
        .set({ name, viewedTiersAt: now, updatedAt: now, referrer: referrer.slice(0, 500), userAgent: userAgent.slice(0, 500) })
        .where(eq(acceleratorIntents.id, existing[0].id))
        .returning();
      intent = row;
    } else {
      const [row] = await db.insert(acceleratorIntents).values({
        email, name, browserKey: key,
        viewedTiersAt: now,
        referrer: referrer.slice(0, 500),
        userAgent: userAgent.slice(0, 500),
      }).returning();
      intent = row;
      // Only email admin on a NEW lead (not re-reveals)
      await sendAcceleratorRevealNotifyAdmin({
        to: adminTo, name, email, referrer,
        adminUrl: `${origin}/admin/accelerator`,
      });
    }

    // Airtable sync — awaited so the serverless function doesn't shut down
    // before the fetch completes. No-op if env vars unset.
    try {
      await upsertLead({
        portalId: intent.id,
        name,
        email,
        referrer,
        userAgent,
      });
    } catch (err) {
      console.error("[intent reveal] airtable sync failed:", err);
    }

    const headers = new Headers({ "Content-Type": "application/json" });
    if (setCookie) headers.append("Set-Cookie", cookieHeader(key));
    return new Response(JSON.stringify({ ok: true, id: intent.id }), { headers });
  }

  // ============================================================
  // CLICK
  // ============================================================
  const tier = (body.tier === "edu_only" || body.tier === "edu_plus_account" || body.tier === "browse")
    ? (body.tier as Tier) : null;
  if (!tier) return NextResponse.json({ ok: false, error: "invalid tier" }, { status: 400 });

  const rows = await db
    .select()
    .from(acceleratorIntents)
    .where(eq(acceleratorIntents.browserKey, key))
    .limit(1);
  const intent = rows[0];
  if (!intent) return NextResponse.json({ ok: false, error: "no intent — reveal first" }, { status: 403 });

  const meta = tierMeta(tier);
  const now = new Date();
  await db.update(acceleratorIntents).set({
    clickedTier: tier,
    clickedTierPriceCents: meta.priceCents,
    clickedAt: now,
    updatedAt: now,
  }).where(eq(acceleratorIntents.id, intent.id));

  // Fire emails only for the paid tiers — "browse" is just routing to /accounts
  if (tier !== "browse") {
    await sendAcceleratorIntentToBuyer({
      to: intent.email,
      name: intent.name,
      tierLabel: meta.label,
      priceCents: meta.priceCents!,
      skoolUrl: "https://www.skool.com/accelerator-program-2210/about",
    });
    await sendAcceleratorIntentToAdmin({
      to: adminTo,
      name: intent.name,
      email: intent.email,
      tierLabel: meta.label,
      priceCents: meta.priceCents!,
    });
  }

  // Airtable sync — awaited so the tier update lands before the response.
  try {
    await upsertLead({
      portalId: intent.id,
      name: intent.name,
      email: intent.email,
      clickedTier: tier,
    });
  } catch (err) {
    console.error("[intent click] airtable sync failed:", err);
  }

  return NextResponse.json({ ok: true, checkoutUrl: meta.url });
}
