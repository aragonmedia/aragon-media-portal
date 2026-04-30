/**
 * GET  /api/accounts   - list this user's TikTok accounts
 * POST /api/accounts   - add a new TikTok handle (status='pending', cycle math handled server-side)
 *
 * Cycle math: each account gets a position 1..4 within its cycle. Once the
 * 4th account in a cycle is recorded, the next account starts a new cycle
 * at position 1 with cycleNumber++.
 */

import { NextRequest } from "next/server";
import { eq, desc, max } from "drizzle-orm";
import { db } from "@/db";
import { accounts } from "@/db/schema";
import { getCurrentUser } from "@/lib/auth/session";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return Response.json({ ok: false, error: "unauthorized" }, { status: 401 });
  const list = await db
    .select()
    .from(accounts)
    .where(eq(accounts.userId, user.id))
    .orderBy(desc(accounts.createdAt));
  return Response.json({ ok: true, accounts: list });
}

export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return Response.json({ ok: false, error: "unauthorized" }, { status: 401 });

  let body: Record<string, unknown> = {};
  try { body = (await req.json()) as Record<string, unknown>; } catch {
    return Response.json({ ok: false, error: "invalid json" }, { status: 400 });
  }
  let handle = typeof body.tiktokHandle === "string" ? body.tiktokHandle.trim() : "";
  if (!handle) return Response.json({ ok: false, error: "tiktok handle required" }, { status: 400 });
  if (handle.length > 200) return Response.json({ ok: false, error: "handle too long" }, { status: 400 });
  if (handle.startsWith("@")) handle = handle.slice(1);

  try {
    // Compute cycle math: find the latest account, increment position. Reset cycle after 4.
    const latest = await db
      .select({ cyclePosition: accounts.cyclePosition, cycleNumber: accounts.cycleNumber })
      .from(accounts)
      .where(eq(accounts.userId, user.id))
      .orderBy(desc(accounts.createdAt))
      .limit(1);

    let cycleNumber = 1;
    let cyclePosition = 1;
    if (latest.length > 0) {
      const last = latest[0];
      if (last.cyclePosition >= 4) {
        cycleNumber = last.cycleNumber + 1;
        cyclePosition = 1;
      } else {
        cycleNumber = last.cycleNumber;
        cyclePosition = last.cyclePosition + 1;
      }
    }

    const inserted = await db
      .insert(accounts)
      .values({
        userId: user.id,
        tiktokHandle: handle,
        status: "pending",
        cyclePosition,
        cycleNumber,
      })
      .returning({ id: accounts.id, tiktokHandle: accounts.tiktokHandle });

    return Response.json({ ok: true, account: inserted[0], cycleNumber, cyclePosition });
  } catch (err) {
    console.error("[accounts] insert failed:", err);
    return Response.json(
      { ok: false, error: err instanceof Error ? err.message : String(err) },
      { status: 500 }
    );
  }
}
// silence unused import (max is here for future use in cycle math)
void max;
