/**
 * POST /api/verify
 *
 * Body: { email, code, purpose: "signup"|"signin" }
 * - Finds the most recent unconsumed code for that email + purpose.
 * - Bumps attempts on miss, rejects after MAX_CODE_ATTEMPTS or expiry.
 * - On match: marks code consumed, marks user.verifiedAt (signup) or
 *   user.lastSigninAt (signin), creates a session row, sets the am_session cookie.
 */

import { NextRequest } from "next/server";
import { and, desc, eq, isNull } from "drizzle-orm";
import { db } from "@/db";
import { users, verificationCodes, sessions } from "@/db/schema";
import { hashCode, isExpired, MAX_CODE_ATTEMPTS } from "@/lib/auth/codes";
import {
  generateSessionToken,
  hashSessionToken,
  sessionExpiry,
  setSessionCookie,
} from "@/lib/auth/sessions";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Purpose = "signup" | "signin";

export async function POST(req: NextRequest) {
  let body: Record<string, unknown> = {};
  try {
    body = (await req.json()) as Record<string, unknown>;
  } catch {
    return Response.json({ ok: false, error: "invalid json" }, { status: 400 });
  }

  const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
  const code = typeof body.code === "string" ? body.code.trim() : "";
  const purpose = String(body.purpose ?? "signup") as Purpose;

  if (!email || !/^\d{6}$/.test(code) || !["signup", "signin"].includes(purpose)) {
    return Response.json({ ok: false, error: "email + 6-digit code required" }, { status: 400 });
  }

  try {
    const rows = await db
      .select()
      .from(verificationCodes)
      .where(
        and(
          eq(verificationCodes.email, email),
          eq(verificationCodes.purpose, purpose),
          isNull(verificationCodes.consumedAt)
        )
      )
      .orderBy(desc(verificationCodes.createdAt))
      .limit(1);

    if (rows.length === 0) {
      return Response.json(
        { ok: false, error: "no active code — request a new one" },
        { status: 400 }
      );
    }

    const row = rows[0];

    if (isExpired(row.expiresAt)) {
      return Response.json(
        { ok: false, error: "code expired — request a new one" },
        { status: 400 }
      );
    }

    if (row.attempts >= MAX_CODE_ATTEMPTS) {
      return Response.json(
        { ok: false, error: "too many attempts — request a new code" },
        { status: 400 }
      );
    }

    if (hashCode(code) !== row.codeHash) {
      await db
        .update(verificationCodes)
        .set({ attempts: row.attempts + 1 })
        .where(eq(verificationCodes.id, row.id));
      return Response.json(
        { ok: false, error: "incorrect code", attemptsLeft: MAX_CODE_ATTEMPTS - (row.attempts + 1) },
        { status: 400 }
      );
    }

    // Match — consume the code
    await db
      .update(verificationCodes)
      .set({ consumedAt: new Date() })
      .where(eq(verificationCodes.id, row.id));

    // Resolve user
    let userId = row.userId;
    if (!userId) {
      const u = await db
        .select({ id: users.id })
        .from(users)
        .where(eq(users.email, email))
        .limit(1);
      if (u.length === 0) {
        return Response.json(
          { ok: false, error: "user not found — try signing up first" },
          { status: 400 }
        );
      }
      userId = u[0].id;
    }

    // Mark user verified / signed-in
    if (purpose === "signup") {
      await db.update(users).set({ verifiedAt: new Date() }).where(eq(users.id, userId));
    }
    await db.update(users).set({ lastSigninAt: new Date() }).where(eq(users.id, userId));

    // Create session
    const token = generateSessionToken();
    const expiresAt = sessionExpiry();
    await db.insert(sessions).values({
      userId,
      tokenHash: hashSessionToken(token),
      expiresAt,
      ipAddress: req.headers.get("x-forwarded-for") ?? null,
      userAgent: req.headers.get("user-agent") ?? null,
    });
    await setSessionCookie(token, expiresAt);

    return Response.json({ ok: true, message: "verified", redirect: "/dashboard" });
  } catch (err) {
    console.error("[verify] failed:", err);
    return Response.json(
      { ok: false, error: err instanceof Error ? err.message : String(err) },
      { status: 500 }
    );
  }
}
