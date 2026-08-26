/**
 * GET /api/accelerator/accounts
 *
 * Returns the current cached accelerator account listings + the
 * timestamp of the last successful sync. Fully public (matches the
 * page's public routing).
 */

import { NextResponse } from "next/server";
import { asc, desc, isNull, and } from "drizzle-orm";
import { db } from "@/db";
import { acceleratorAccounts, acceleratorSyncs } from "@/db/schema";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  const [rows, lastSuccess] = await Promise.all([
    db
      .select()
      .from(acceleratorAccounts)
      .orderBy(asc(acceleratorAccounts.position), asc(acceleratorAccounts.handle)),
    db
      .select()
      .from(acceleratorSyncs)
      .where(isNull(acceleratorSyncs.error))
      .orderBy(desc(acceleratorSyncs.createdAt))
      .limit(1),
  ]);
  return NextResponse.json({
    ok: true,
    accounts: rows,
    lastSyncedAt: lastSuccess[0]?.createdAt ?? null,
  });
}
