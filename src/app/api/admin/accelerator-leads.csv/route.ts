/**
 * GET /api/admin/accelerator-leads.csv
 *
 * Streams a CSV export of every accelerator landing-page intent.
 * Admin-only (checks am_admin cookie). Used by the Export button on
 * /admin/accelerator-leads.
 */

import { NextResponse } from "next/server";
import { desc } from "drizzle-orm";
import { getAdminRole } from "@/lib/auth/admin-role";
import { db } from "@/db";
import { acceleratorIntents } from "@/db/schema";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const TIER_LABEL: Record<string, string> = {
  edu_only: "Education only ($997)",
  edu_plus_account: "Education + Account ($1,997)",
  browse: "Browse accounts only",
};

// RFC-4180 style CSV escaping: wrap in quotes if the value contains
// comma, quote, or newline; double any embedded quotes.
function csv(v: unknown): string {
  if (v === null || v === undefined) return "";
  const s = String(v);
  if (/[",\n\r]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
  return s;
}

export async function GET() {
  const role = await getAdminRole();
  if (!role || !["owner", "accelerator_admin", "am_lead"].includes(role.role)) {
    return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  }

  const rows = await db
    .select()
    .from(acceleratorIntents)
    .orderBy(desc(acceleratorIntents.createdAt));

  const header = [
    "id",
    "created_at",
    "name",
    "email",
    "clicked_tier",
    "clicked_tier_label",
    "clicked_tier_price_cents",
    "clicked_at",
    "viewed_tiers_at",
    "referrer",
    "user_agent",
    "browser_key",
  ].join(",");

  const body = rows.map((r) =>
    [
      csv(r.id),
      csv(r.createdAt.toISOString()),
      csv(r.name),
      csv(r.email),
      csv(r.clickedTier),
      csv(r.clickedTier ? TIER_LABEL[r.clickedTier] ?? r.clickedTier : ""),
      csv(r.clickedTierPriceCents ?? ""),
      csv(r.clickedAt ? r.clickedAt.toISOString() : ""),
      csv(r.viewedTiersAt ? r.viewedTiersAt.toISOString() : ""),
      csv(r.referrer),
      csv(r.userAgent),
      csv(r.browserKey),
    ].join(",")
  );

  const csvText = [header, ...body].join("\r\n") + "\r\n";
  const stamp = new Date().toISOString().slice(0, 10);

  return new NextResponse(csvText, {
    status: 200,
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="accelerator-leads-${stamp}.csv"`,
      "Cache-Control": "no-store",
    },
  });
}
