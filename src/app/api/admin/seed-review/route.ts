/**
 * POST /api/admin/seed-review
 *
 * Idempotently seeds the TikTok Partner Center review accounts against
 * the connected Neon database. Auth: Authorization: Bearer <MIGRATION_SECRET>
 * (same pattern as /api/admin/migrate + /api/admin/unlock-contract).
 *
 * Creates or refreshes two users:
 *   1. tiktok-review-seller@kevin-aragon.com  (creator, is_demo=true, password Test123$)
 *      - contract signed 30 days ago
 *      - one verified TikTok account @verdant.wellness
 *      - one chat thread with 5 messages
 *   2. tiktok-review-admin@kevin-aragon.com   (creator, is_demo=true, is_admin=true, password Test123$)
 *
 * Safe to re-run — updates password_hash + refreshes seeded data.
 */

import { NextRequest } from "next/server";
import { and, eq } from "drizzle-orm";
import { db } from "@/db";
import { users, accounts, chats, messages, agreements } from "@/db/schema";
import { hashPassword } from "@/lib/auth/passwords";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const REVIEW_PASSWORD = "Test123$";
const SELLER_EMAIL = "tiktok-review-seller@kevin-aragon.com";
const ADMIN_EMAIL = "tiktok-review-admin@kevin-aragon.com";
const CONTRACT_VERSION = "v1.2026-04";

function daysAgo(n: number): Date {
  const d = new Date();
  d.setUTCDate(d.getUTCDate() - n);
  return d;
}

async function upsertReviewUser(opts: {
  email: string;
  name: string;
  handle: string;
  isAdmin: boolean;
  passwordHash: string;
}): Promise<string> {
  const existing = await db.select().from(users).where(eq(users.email, opts.email)).limit(1);
  if (existing[0]) {
    await db
      .update(users)
      .set({
        name: opts.name,
        handle: opts.handle,
        isAdmin: opts.isAdmin,
        isDemo: true,
        passwordHash: opts.passwordHash,
        contractSignedAt: daysAgo(30),
        contractVersion: CONTRACT_VERSION,
        contractUnlocked: true,
        verifiedAt: daysAgo(30),
        role: "creator",
      })
      .where(eq(users.id, existing[0].id));
    return existing[0].id;
  }
  const [row] = await db
    .insert(users)
    .values({
      email: opts.email,
      name: opts.name,
      handle: opts.handle,
      role: "creator",
      isAdmin: opts.isAdmin,
      isDemo: true,
      passwordHash: opts.passwordHash,
      contractSignedAt: daysAgo(30),
      contractVersion: CONTRACT_VERSION,
      contractUnlocked: true,
      verifiedAt: daysAgo(30),
    })
    .returning({ id: users.id });
  return row.id;
}

async function seedAgreement(userId: string) {
  const has = await db.select().from(agreements).where(eq(agreements.userId, userId)).limit(1);
  if (has[0]) return;
  await db.insert(agreements).values({
    userId,
    signature: "TikTok Reviewer",
    contractVersion: CONTRACT_VERSION,
    signedAt: daysAgo(30),
  });
}

async function seedAccount(userId: string) {
  const has = await db
    .select()
    .from(accounts)
    .where(and(eq(accounts.userId, userId), eq(accounts.tiktokHandle, "verdant.wellness")))
    .limit(1);
  if (has[0]) return;
  await db.insert(accounts).values({
    userId,
    tiktokHandle: "verdant.wellness",
    status: "verified",
    cyclePosition: 1,
    cycleNumber: 1,
    notes: "Demo wellness brand seeded for TikTok Partner Center App Review.",
    credentialsReceivedAt: daysAgo(28),
    twoFactorAt: daysAgo(27),
    verifiedAt: daysAgo(25),
    activatedAt: daysAgo(25),
  });
}

async function seedChat(userId: string) {
  const existing = await db.select().from(chats).where(eq(chats.userId, userId)).limit(1);
  const chatId =
    existing[0]?.id ??
    (
      await db
        .insert(chats)
        .values({
          userId,
          subject: "Welcome to Aragon Media",
          status: "open",
          createdAt: daysAgo(20),
          lastMessageAt: daysAgo(2),
        })
        .returning({ id: chats.id })
    )[0].id;

  // Wipe + re-seed the 5 canonical messages so repeat runs are stable.
  await db.delete(messages).where(eq(messages.chatId, chatId));

  const seed: Array<{ sender: "user" | "am_team" | "system"; body: string; daysAgo: number }> = [
    { sender: "system", body: "This is the direct line between you and the Aragon Media operations team. Reply here anytime.", daysAgo: 20 },
    { sender: "am_team", body: "Hi! I'm Kevin from the Aragon Media team. Congrats on getting your first TikTok Shop account verified — @verdant.wellness is now active in your dashboard. Let me know if you have questions on the GMV analytics or want to schedule a strategy call.", daysAgo: 20 },
    { sender: "user", body: "Thanks Kevin — dashboard is pulling data cleanly. Curious how you calculate the top-products list on the overview page?", daysAgo: 19 },
    { sender: "am_team", body: "It's a direct pull from the TikTok Shop Analytics API — the /analytics/v1/products/performance endpoint. We sort by GMV descending and cap at 5. If you want a different sort (units, return rate) we can flag that as a feature request.", daysAgo: 19 },
    { sender: "user", body: "Perfect, thanks. I'll poke around the dashboard for a bit.", daysAgo: 2 },
  ];

  for (const m of seed) {
    await db.insert(messages).values({
      chatId,
      sender: m.sender,
      body: m.body,
      createdAt: daysAgo(m.daysAgo),
    });
  }
}

async function seedReview() {
  const passwordHash = await hashPassword(REVIEW_PASSWORD);

  const sellerId = await upsertReviewUser({
    email: SELLER_EMAIL,
    name: "Verdant Wellness — TikTok Review",
    handle: "verdant.wellness",
    isAdmin: false,
    passwordHash,
  });

  const adminId = await upsertReviewUser({
    email: ADMIN_EMAIL,
    name: "AM Team — TikTok Review",
    handle: "aragon.review",
    isAdmin: true,
    passwordHash,
  });

  await seedAgreement(sellerId);
  await seedAgreement(adminId);
  await seedAccount(sellerId);
  await seedChat(sellerId);

  return {
    ok: true,
    seeded: {
      sellerId,
      adminId,
      credentials: {
        seller: { email: SELLER_EMAIL, password: REVIEW_PASSWORD },
        admin: { email: ADMIN_EMAIL, password: REVIEW_PASSWORD },
      },
    },
  };
}

async function guardAndRun(req: NextRequest, viaHeader: boolean) {
  const secret = process.env.MIGRATION_SECRET;
  if (!secret) {
    return Response.json({ ok: false, error: "MIGRATION_SECRET not set" }, { status: 500 });
  }
  const provided = viaHeader
    ? req.headers.get("authorization") === `Bearer ${secret}`
    : new URL(req.url).searchParams.get("secret") === secret;
  if (!provided) {
    return Response.json({ ok: false, error: "unauthorized" }, { status: 401 });
  }
  try {
    const result = await seedReview();
    return Response.json(result);
  } catch (err) {
    console.error("[seed-review] failed", err);
    return Response.json(
      { ok: false, error: err instanceof Error ? err.message : String(err) },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  return guardAndRun(req, true);
}

export async function GET(req: NextRequest) {
  return guardAndRun(req, false);
}
