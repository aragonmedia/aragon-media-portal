/**
 * POST /api/review/accounts/add
 *
 * Preview-only: creates a new demo TikTok account row for the current
 * reviewer session so the /review/accounts list demonstrates the
 * "connected another shop" state. No external TikTok OAuth call — this
 * is a fully mocked handshake that only runs for am_review sessions.
 */

import { NextResponse } from "next/server";
import { db } from "@/db";
import { accounts } from "@/db/schema";
import { getCurrentReviewer } from "@/lib/auth/review-session";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const HANDLE_POOL = [
  "aragoncreator.us",
  "aragoncreator.beauty",
  "aragoncreator.wellness",
  "aragoncreator.home",
  "aragoncreator.pets",
  "aragoncreator.fitness",
  "aragoncreator.kitchen",
  "aragoncreator.tech",
];

export async function POST(req: Request) {
  const user = await getCurrentReviewer();
  if (!user) return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });

  // Pull existing to avoid dupes + compute next cycle position
  const existing = await db.select().from(accounts);
  const mine = existing.filter((a) => a.userId === user.id);
  const taken = new Set(mine.map((a) => a.tiktokHandle));
  const handle = HANDLE_POOL.find((h) => !taken.has(h)) ?? `aragoncreator.alt${mine.length + 1}`;
  const nextPos = (mine.at(-1)?.cyclePosition ?? 0) + 1;

  const now = new Date();
  const [row] = await db
    .insert(accounts)
    .values({
      userId: user.id,
      tiktokHandle: handle,
      status: "verified",
      cyclePosition: nextPos,
      cycleNumber: 1,
      notes: "Demo account added via reviewer preview flow.",
      credentialsReceivedAt: now,
      verifiedAt: now,
    })
    .returning();

  return NextResponse.json({ ok: true, handle, id: row.id });
}
