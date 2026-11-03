/**
 * POST /api/accelerator/call-rsvp
 *
 * The /roni/tiktokshop funnel's form target. Writes a lead into Neon with
 * action='call_rsvp', pushes to the tenant's Airtable base, and fires an
 * admin email with a clickable wa.me link so the team can message within
 * minutes.
 *
 * Body: { name, email, whatsapp, country, source, accelerator? }
 * Public endpoint. Browser cookie tracks the intent per-device.
 */

import { NextResponse } from "next/server";
import { and, eq } from "drizzle-orm";
import { db } from "@/db";
import { acceleratorIntents } from "@/db/schema";
import { cookies } from "next/headers";
import crypto from "node:crypto";
import { upsertLead } from "@/lib/airtable/leads";
import { sendCallRsvpNotifyAdmin } from "@/lib/email/send";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const COOKIE = "am_accel_intent";
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

async function getBrowserKey(): Promise<{ key: string; setCookie: boolean }> {
  const jar = await cookies();
  const existing = jar.get(COOKIE)?.value;
  if (existing && /^[a-f0-9]{40}$/.test(existing)) return { key: existing, setCookie: false };
  return { key: crypto.randomBytes(20).toString("hex"), setCookie: true };
}
function cookieHeader(v: string) { return `${COOKIE}=${v}; Path=/; Max-Age=15552000; SameSite=Lax`; }

export async function POST(req: Request) {
  let body: Record<string, unknown> = {};
  try { body = await req.json(); } catch { return NextResponse.json({ ok: false, error: "invalid json" }, { status: 400 }); }

  const name = typeof body.name === "string" ? body.name.trim().slice(0, 200) : "";
  const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
  const whatsapp = typeof body.whatsapp === "string" ? body.whatsapp.trim().slice(0, 32) : "";
  const country = typeof body.country === "string" ? body.country.trim().slice(0, 80) : "";
  const source = typeof body.source === "string" ? body.source.trim().slice(0, 200) : "";
  const slug = typeof body.accelerator === "string" && /^[a-z0-9-]{1,40}$/.test(body.accelerator) ? body.accelerator : "roni";

  if (!name) return NextResponse.json({ ok: false, error: "name required" }, { status: 400 });
  if (!EMAIL_RE.test(email)) return NextResponse.json({ ok: false, error: "valid email required" }, { status: 400 });
  if (whatsapp.length < 6) return NextResponse.json({ ok: false, error: "valid WhatsApp number required" }, { status: 400 });
  if (!country) return NextResponse.json({ ok: false, error: "country required" }, { status: 400 });

  const { key, setCookie } = await getBrowserKey();
  const now = new Date();

  // Upsert on (email + browser_key) so repeat submits update, don't duplicate
  const existing = await db.select().from(acceleratorIntents)
    .where(and(eq(acceleratorIntents.email, email), eq(acceleratorIntents.browserKey, key)))
    .limit(1);

  let intent;
  if (existing[0]) {
    const [row] = await db.update(acceleratorIntents)
      .set({ name, whatsapp, country, source, updatedAt: now, action: "call_rsvp", acceleratorSlug: slug })
      .where(eq(acceleratorIntents.id, existing[0].id))
      .returning();
    intent = row;
  } else {
    const [row] = await db.insert(acceleratorIntents).values({
      email, name, browserKey: key, whatsapp, country, source,
      acceleratorSlug: slug, action: "call_rsvp",
    }).returning();
    intent = row;
  }

  // Airtable sync — Lead Source = "1-on-1 Call RSVP", notes include WhatsApp + country + source
  try {
    await upsertLead({
      portalId: intent.id,
      name, email,
      whatsapp, country, source,
      accelerator: slug,
      leadSourceLabel: "1-on-1 Call RSVP",
    });
  } catch (err) { console.error("[call-rsvp] airtable sync failed:", err); }

  // Admin notification
  const adminTo = (process.env.ACCELERATOR_ADMIN_EMAILS ?? "aragonkevin239@gmail.com")
    .split(",").map((e) => e.trim()).filter(Boolean);
  const origin = req.headers.get("origin") || "https://portal.kevin-aragon.com";
  sendCallRsvpNotifyAdmin({
    to: adminTo, name, email, whatsapp, country, source,
    adminUrl: `${origin}/admin/accelerator-leads`,
  }).catch(() => {});

  const headers = new Headers({ "Content-Type": "application/json" });
  if (setCookie) headers.append("Set-Cookie", cookieHeader(key));
  return new Response(JSON.stringify({ ok: true, id: intent.id }), { headers });
}
