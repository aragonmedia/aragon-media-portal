/**
 * POST /api/admin/login
 * Body: { email, code }
 *
 * Validates the 6-digit code against verification_codes (purpose=admin_signin
 * for the matching admin user). On success:
 *   - marks the verification_codes row consumed
 *   - sets the am_admin cookie (12h)
 */

import { NextRequest } from "next/server";
import { and, desc, eq, isNull, gt } from "drizzle-orm";
import { db } from "@/db";
import { users, verificationCodes } from "@/db/schema";
import { hashCode } from "@/lib/auth/codes";
import { setAdminCookie } from "@/lib/auth/admin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function isEmail(s: unknown): s is string {
  return typeof s === "string" && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s);
}

export async function POST(req: NextRequest) {
  let body: Record<string, unknown> = {};
  try {
    body = (await req.json()) as Record<string, unknown>;
  } catch {
    return Response.json({ ok: false, error: "invalid json" }, { status: 400 });
  }

  const email =
    typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
  const code =
    typeof body.code === "string" ? body.code.trim().replace(/\D/g, "") : "";

  if (!isEmail(email)) {
    return Response.json(
      { ok: false, error: "valid email required" },
      { status: 400 }
    );
  }
  if (code.length !== 6) {
    return Response.json(
      { ok: false, error: "6-digit code required" },
      { status: 400 }
    );
  }

  // Find user, must be admin
  const userRows = await db
    .select({ id: users.id, isAdmin: users.isAdmin })
    .from(users)
    .where(eq(users.email, email))
    .limit(1);

  const adminUser = userRows[0]?.isAdmin ? userRows[0] : null;
  if (!adminUser) {
    return Response.json(
      { ok: false, error: "incorrect code" },
      { status: 401 }
    );
  }

  // Most recent unconsumed admin_signin code for this user
  const codeRows = await db
    .select({
      id: verificationCodes.id,
      codeHash: verificationCodes.codeHash,
      expiresAt: verificationCodes.expiresAt,
    })
    .from(verificationCodes)
    .where(
      and(
        eq(verificationCodes.userId, adminUser.id),
        eq(verificationCodes.purpose, "admin_signin"),
        isNull(verificationCodes.consumedAt),
        gt(verificationCodes.expiresAt, new Date())
      )
    )
    .orderBy(desc(verificationCodes.createdAt))
    .limit(1);

  if (codeRows.length === 0 || codeRows[0].codeHash !== hashCode(code)) {
    return Response.json(
      { ok: false, error: "incorrect code" },
      { status: 401 }
    );
  }

  // Mark consumed + set cookie
  await db
    .update(verificationCodes)
    .set({ consumedAt: new Date() })
    .where(eq(verificationCodes.id, codeRows[0].id));
  await setAdminCookie();

  return Response.json({ ok: true });
}
