/**
 * POST /api/accelerator/sync
 *
 * Ingests the raw text of the Discord channel message (bot or manual
 * paste) and upserts the accelerator_accounts table.
 *
 * Auth (two supported paths):
 *   - Admin cookie (am_admin)  → paste-in via /admin/accelerator
 *   - Authorization: Bearer $ACCELERATOR_SYNC_SECRET (or MIGRATION_SECRET
 *     as fallback)  → Discord bot cron/service
 *
 * Body: { body: string, source?: "manual" | "bot" }
 *
 * Behaviour:
 *   - Parses every matching line into a ParsedAccount.
 *   - UPSERTs by handle (INSERT ... ON CONFLICT DO UPDATE).
 *   - Marks position by parse order.
 *   - Marks last_seen_at = now() for every parsed row.
 *   - Rows that were NOT seen in this payload but exist in DB → deleted,
 *     so the public /accounts view always mirrors the current Discord
 *     state, not a stale accumulation.
 *   - Records a row in accelerator_syncs with rows_parsed / upserted /
 *     removed for the "last refreshed" display.
 */

import { NextResponse } from "next/server";
import { inArray, notInArray, sql } from "drizzle-orm";
import { db } from "@/db";
import { acceleratorAccounts, acceleratorSyncs } from "@/db/schema";
import { isAdminSession } from "@/lib/auth/admin";
import { parseAccountsMessage } from "@/lib/accelerator/parse";

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
  try {
    payload = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "invalid json" }, { status: 400 });
  }

  const body = typeof payload.body === "string" ? payload.body : "";
  const source =
    payload.source === "bot" ? "bot" : payload.source === "manual" ? "manual" : "manual";

  if (!body.trim()) {
    return NextResponse.json({ ok: false, error: "empty body" }, { status: 400 });
  }

  const parsed = parseAccountsMessage(body);
  if (parsed.length === 0) {
    // Log a failed sync but don't destroy existing rows.
    await db.insert(acceleratorSyncs).values({
      source,
      rowsParsed: 0,
      rowsUpserted: 0,
      rowsRemoved: 0,
      error: "no lines matched parser",
    });
    return NextResponse.json(
      { ok: false, error: "no lines matched parser", parsed: 0 },
      { status: 422 }
    );
  }

  let upserted = 0;
  for (let i = 0; i < parsed.length; i++) {
    const row = parsed[i];
    await db
      .insert(acceleratorAccounts)
      .values({
        handle: row.handle,
        tiktokUrl: row.tiktokUrl,
        accountType: row.accountType,
        followers: row.followers,
        priceCents: row.priceCents,
        originalPriceCents: row.originalPriceCents,
        rawLine: row.rawLine,
        position: i,
        lastSeenAt: new Date(),
      })
      .onConflictDoUpdate({
        target: acceleratorAccounts.handle,
        set: {
          tiktokUrl: row.tiktokUrl,
          accountType: row.accountType,
          followers: row.followers,
          priceCents: row.priceCents,
          originalPriceCents: row.originalPriceCents,
          rawLine: row.rawLine,
          position: i,
          lastSeenAt: new Date(),
        },
      });
    upserted++;
  }

  // Purge stale rows — anything not in this payload.
  const currentHandles = parsed.map((p) => p.handle);
  const removed = await db
    .delete(acceleratorAccounts)
    .where(notInArray(acceleratorAccounts.handle, currentHandles))
    .returning({ id: acceleratorAccounts.id });

  await db.insert(acceleratorSyncs).values({
    source,
    rowsParsed: parsed.length,
    rowsUpserted: upserted,
    rowsRemoved: removed.length,
  });

  return NextResponse.json({
    ok: true,
    source,
    parsed: parsed.length,
    upserted,
    removed: removed.length,
  });
}
