/**
 * POST /api/login
 *
 * Body: { email: string, password: string }
 *
 * Authenticates a DEMO/reviewer account only. The account must have
 * users.is_demo = true AND a non-null users.password_hash. Real users
 * are rejected (they use /signin's email-code flow).
 *
 * On success sets the am_review cookie and returns { ok: true, next }
 * where next is /review (the reviewer-only shell).
 */

import { NextRequest } from "next/server";
import { and, eq, isNotNull } from "drizzle-orm";
import { db } from "@/db";
import { users } from "@/db/schema";
import { verifyPassword } from "@/lib/auth/passwords";
import { setReviewCookie } from "@/lib/auth/review";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const GENERIC = "Invalid email or password.";

export async function POST(req: NextRequest) {
  let body: { email?: string; password?: string };
  try {
    body = (await req.json()) as { email?: string; password?: string };
  } catch {
    return Response.json({ ok: false, error: "Invalid request" }, { status: 400 });
  }

  const email = (body.email ?? "").trim().toLowerCase();
  const password = body.password ?? "";
  if (!/^\S+@\S+\.\S+$/.test(email) || !password) {
    return Response.json({ ok: false, error: GENERIC }, { status: 401 });
  }

  const rows = await db
    .select({
      id: users.id,
      passwordHash: users.passwordHash,
      isDemo: users.isDemo,
    })
    .from(users)
    .where(and(eq(users.email, email), eq(users.isDemo, true), isNotNull(users.passwordHash)))
    .limit(1);

  const row = rows[0];
  if (!row || !row.passwordHash) {
    // Constant-ish work even on miss so the endpoint doesn't reveal existence.
    await verifyPassword(password, "scrypt$16384$8$1$0000$0000");
    return Response.json({ ok: false, error: GENERIC }, { status: 401 });
  }

  const ok = await verifyPassword(password, row.passwordHash);
  if (!ok) return Response.json({ ok: false, error: GENERIC }, { status: 401 });

  await setReviewCookie(row.id);
  return Response.json({ ok: true, next: "/review" });
}
