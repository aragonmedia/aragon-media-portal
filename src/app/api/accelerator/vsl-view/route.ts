/**
 * POST /api/accelerator/vsl-view
 *
 * Fires when a qualified lead clicks the "Watch the VSL" gate on the
 * qualifier thank-you page. Marks the intent row as vsl_viewed=true,
 * stamps vsl_viewed_at, patches the Airtable record so the sales team
 * can filter "VSL watched" leads as priority, and sends a short admin
 * notification so Kevin/Roni/Colton know who's actively engaged.
 *
 * Body: { id: string (intent uuid), accelerator?: "roni" | "colt" }
 */

import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { acceleratorIntents } from "@/db/schema";
import { upsertLead } from "@/lib/airtable/leads";
import { sendVslViewedNotifyAdmin } from "@/lib/email/send";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const UUID_RE = /^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/i;

export async function POST(req: Request) {
  let body: Record<string, unknown> = {};
  try { body = await req.json(); } catch { return NextResponse.json({ ok: false, error: "invalid json" }, { status: 400 }); }

  const id = typeof body.id === "string" ? body.id : "";
  const slug = typeof body.accelerator === "string" && /^[a-z0-9-]{1,40}$/.test(body.accelerator) ? body.accelerator : "roni";
  if (!UUID_RE.test(id)) return NextResponse.json({ ok: false, error: "invalid id" }, { status: 400 });

  const [row] = await db.select().from(acceleratorIntents).where(eq(acceleratorIntents.id, id)).limit(1);
  if (!row) return NextResponse.json({ ok: false, error: "not found" }, { status: 404 });

  // Idempotent — already viewed? short-circuit.
  if (row.vslViewed) return NextResponse.json({ ok: true, alreadyViewed: true });

  const now = new Date();
  await db.update(acceleratorIntents)
    .set({ vslViewed: true, vslViewedAt: now, updatedAt: now })
    .where(eq(acceleratorIntents.id, id));

  // Airtable sync (best-effort)
  try {
    await upsertLead({
      portalId: row.id,
      name: row.name,
      email: row.email,
      whatsapp: row.whatsapp,
      country: row.country,
      source: row.source,
      accelerator: slug,
      leadSourceLabel: "1-on-1 Call RSVP",
      leadStage: row.leadStage,
      monthlyIncome: row.monthlyIncome,
      goalText: row.goalText,
      vslViewed: true,
    });
  } catch (err) { console.error("[vsl-view] airtable sync failed:", err); }

  // Admin heads-up (best-effort, non-blocking since this isn't the primary flow)
  const adminTo = (process.env.ACCELERATOR_ADMIN_EMAILS ?? "aragonkevin239@gmail.com")
    .split(",").map((e) => e.trim()).filter(Boolean);
  try {
    await sendVslViewedNotifyAdmin({
      to: adminTo,
      name: row.name,
      email: row.email,
      whatsapp: row.whatsapp || "",
      country: row.country || "",
      accelerator: slug,
    });
  } catch (err) { console.error("[vsl-view] admin email failed:", err); }

  return NextResponse.json({ ok: true });
}
