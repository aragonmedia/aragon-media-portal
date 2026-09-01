/**
 * POST /api/accelerator/sync
 *
 * Manual paste-in sync from /admin/accelerator OR the pre-bot fallback
 * path. Uses the shared syncAccountsFromText core.
 *
 * Auth: am_admin cookie OR Bearer ACCELERATOR_SYNC_SECRET (or
 * MIGRATION_SECRET as fallback). Body: { body: string, source?: string }.
 */

import { NextResponse } from "next/server";
import { isAdminSession } from "@/lib/auth/admin";
import { syncAccountsFromText } from "@/lib/accelerator/sync";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

async function isAuthorized(req: Request): Promise<boolean> {
  if (await isAdminSession()) return true;
  const auth = req.headers.get("authorization") ?? "";
  const acceleratorSecret = process.env.ACCELERATOR_SYNC_SECRET;
  const migrationSecret = process.env.MIGRATION_SECRET;
  if (acceleratorSecret && auth === `Bearer ${acceleratorSecret}`) return true;
  if (migrationSecret && auth === `Bearer ${migrationSecret}`) return true;
  return false;
}

export async function POST(req: Request) {
  if (!(await isAuthorized(req))) {
    return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  }

  let payload: { body?: unknown; source?: unknown };
  try { payload = await req.json(); }
  catch { return NextResponse.json({ ok: false, error: "invalid json" }, { status: 400 }); }

  const body = typeof payload.body === "string" ? payload.body : "";
  const source =
    payload.source === "bot" ? "bot" : payload.source === "manual" ? "manual" : "manual";

  if (!body.trim()) {
    return NextResponse.json({ ok: false, error: "empty body" }, { status: 400 });
  }

  const result = await syncAccountsFromText(body, source);
  return NextResponse.json({ ...result, source }, { status: result.ok ? 200 : 422 });
}
