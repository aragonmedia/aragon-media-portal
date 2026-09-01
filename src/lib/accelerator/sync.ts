/**
 * Shared sync core — used by both the manual paste-in endpoint
 * (/api/accelerator/sync) and the Discord bot cron endpoint
 * (/api/accelerator/sync/discord). Given a raw text blob:
 *   1) parse every matching line into a ParsedAccount
 *   2) UPSERT by handle
 *   3) DELETE rows not in this payload so the DB mirrors current state
 *   4) log a sync record
 *
 * Returns a summary { ok, parsed, upserted, removed, error? }.
 */

import { notInArray } from "drizzle-orm";
import { db } from "@/db";
import { acceleratorAccounts, acceleratorSyncs } from "@/db/schema";
import { parseAccountsMessage } from "./parse";

export type SyncSource = "manual" | "bot";

export type SyncResult = {
  ok: boolean;
  parsed: number;
  upserted: number;
  removed: number;
  error?: string;
};

export async function syncAccountsFromText(
  body: string,
  source: SyncSource
): Promise<SyncResult> {
  const parsed = parseAccountsMessage(body);

  if (parsed.length === 0) {
    await db.insert(acceleratorSyncs).values({
      source,
      rowsParsed: 0,
      rowsUpserted: 0,
      rowsRemoved: 0,
      error: "no lines matched parser",
    });
    return { ok: false, parsed: 0, upserted: 0, removed: 0, error: "no lines matched parser" };
  }

  let upserted = 0;
  const now = new Date();
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
        lastSeenAt: now,
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
          lastSeenAt: now,
        },
      });
    upserted++;
  }

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

  return { ok: true, parsed: parsed.length, upserted, removed: removed.length };
}
