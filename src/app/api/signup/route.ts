/**
 * POST /api/signup
 *
 * Body: { role: "creator"|"brand"|"other", otherText?, name, email, handle? }
 * - Validates fields.
 * - Upserts the user row (one row per email; updates name/role/handle on repeat).
 * - Generates a 6-digit code, stores its sha256 hash with purpose=signup,
 *   expires in 15 min.
 * - Sends a branded code email via Resend.
 *
 * Always returns 200 ok:true on validation success even if email send fails,
 * so we don't leak email-validity (and we still log server-side).
 */

import { NextRequest } from "next/server";
import { eq, and } from "drizzle-orm";
import { db } from "@/db";
import { users, verificationCodes } from "@/db/schema";
import { generateCode, hashCode, codeExpiry } from "@/lib/auth/codes";
import { sendVerificationEmail } from "@/lib/email/send";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Role = "creator" | "brand" | "other";

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

  const role = String(body.role ?? "").trim() as Role;
  const otherText = typeof body.otherText === "string" ? body.otherText.trim() : "";
  const name = typeof body.name === "string" ? body.name.trim() : "";
  const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
  const handle = typeof body.handle === "string" ? body.handle.trim() : "";

  if (!["creator", "brand", "other"].includes(role)) {
    return Response.json({ ok: false, error: "role required" }, { status: 400 });
  }
  if (!name) {
    return Response.json({ ok: false, error: "name required" }, { status: 400 });
  }
  if (!isEmail(email)) {
    return Response.json({ ok: false, error: "valid email required" }, { status: 400 });
  }

  try {
    // Upsert user (one row per email)
    const existing = await db.select().from(users).where(eq(users.email, email)).limit(1);
    let userId: string;
    if (existing.length === 0) {
      const inserted = await db
        .insert(users)
        .values({
          email,
          name,
          role,
          handle: handle || null,
          otherDetails: role === "other" && otherText ? otherText : null,
        })
        .returning({ id: users.id });
      userId = inserted[0].id;
    } else {
      userId = existing[0].id;
      // Refresh role/name/handle in case they're correcting their entry
      await db
        .update(users)
        .set({
          name,
          role,
          handle: handle || existing[0].handle,
          otherDetails:
            role === "other" && otherText ? otherText : existing[0].otherDetails,
        })
        .where(eq(users.id, userId));
    }

    // Generate + persist hashed code
    const code = generateCode();
    await db.insert(verificationCodes).values({
      userId,
      email,
      codeHash: hashCode(code),
      purpose: "signup",
      expiresAt: codeExpiry(),
    });

    // Send the email (best-effort — don't fail the request if Resend hiccups)
    try {
      await sendVerificationEmail({ to: email, code, purpose: "signup", name });
    } catch (mailErr) {
      console.error("[signup] email send failed:", mailErr);
    }

    return Response.json({ ok: true, message: "code sent" });
  } catch (err) {
    console.error("[signup] failed:", err);
    return Response.json(
      { ok: false, error: err instanceof Error ? err.message : String(err) },
      { status: 500 }
    );
  }
}

export async function GET() {
  return Response.json({ ok: true, hint: "POST { role, name, email, handle? }" });
}
// suppress unused import warning for future expansion
void and;
