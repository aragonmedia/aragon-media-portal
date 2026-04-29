/**
 * POST /api/signin
 *
 * Body: { email }
 * - Looks up the user by email. To prevent email-enumeration we ALWAYS return
 *   ok:true. If the user doesn't exist we just don't send a code.
 */

import { NextRequest } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { users, verificationCodes } from "@/db/schema";
import { generateCode, hashCode, codeExpiry } from "@/lib/auth/codes";
import { sendVerificationEmail } from "@/lib/email/send";

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

  const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
  if (!isEmail(email)) {
    return Response.json({ ok: false, error: "valid email required" }, { status: 400 });
  }

  try {
    const matches = await db
      .select({ id: users.id, name: users.name })
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    if (matches.length > 0) {
      const code = generateCode();
      await db.insert(verificationCodes).values({
        userId: matches[0].id,
        email,
        codeHash: hashCode(code),
        purpose: "signin",
        expiresAt: codeExpiry(),
      });
      try {
        await sendVerificationEmail({
          to: email,
          code,
          purpose: "signin",
          name: matches[0].name,
        });
      } catch (mailErr) {
        console.error("[signin] email send failed:", mailErr);
      }
    } else {
      console.log("[signin] no user for", email);
    }

    return Response.json({ ok: true, message: "if account exists, code sent" });
  } catch (err) {
    console.error("[signin] failed:", err);
    return Response.json(
      { ok: false, error: err instanceof Error ? err.message : String(err) },
      { status: 500 }
    );
  }
}
