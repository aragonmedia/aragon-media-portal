/**
 * POST /api/admin/request-code
 * Body: { email }
 *
 * Validates the email belongs to an admin user (users.is_admin = true),
 * then generates a 6-digit code, stores its hash in verification_codes
 * with purpose=admin_signin, and emails it via Resend.
 *
 * Anti-enumeration: ALWAYS returns ok:true regardless of whether the
 * email exists or is admin. No code is sent for non-admin emails.
 */

import { NextRequest } from "next/server";
import { db } from "@/db";
import { and, eq, gt } from "drizzle-orm";
import { users, verificationCodes, adminInvites } from "@/db/schema";
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

  const email =
    typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
  if (!isEmail(email)) {
    return Response.json(
      { ok: false, error: "valid email required" },
      { status: 400 }
    );
  }

  try {
    const matches = await db
      .select({ id: users.id, name: users.name, isAdmin: users.isAdmin })
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    let adminRow = matches[0]?.isAdmin ? matches[0] : null;

    // If not an admin yet, check for a pending invite. Invite proves intent;
    // the code (below) will prove email ownership. Wrapped in try/catch so
    // we don't 500 when the invite table doesn't exist yet (pre-migration).
    if (!adminRow) {
      try {
      const inv = await db
        .select({ id: adminInvites.id, role: adminInvites.role })
        .from(adminInvites)
        .where(
          and(
            eq(adminInvites.email, email),
            eq(adminInvites.status, "pending"),
            gt(adminInvites.expiresAt, new Date())
          )
        )
        .limit(1);
      if (inv[0]) {
        if (matches[0]) {
          await db
            .update(users)
            .set({ isAdmin: true, adminRole: inv[0].role })
            .where(eq(users.id, matches[0].id));
          adminRow = { id: matches[0].id, name: matches[0].name, isAdmin: true };
        } else {
          // Minimal user row so the code flow has something to attach to.
          const [created] = await db.insert(users).values({
            email,
            name: email.split("@")[0],
            role: "creator",
            isAdmin: true,
            adminRole: inv[0].role,
          }).returning({ id: users.id, name: users.name });
          adminRow = { id: created.id, name: created.name, isAdmin: true };
        }
      }
      } catch (err) {
        console.warn("[admin request-code] invite lookup skipped:", err instanceof Error ? err.message : err);
      }
    }

    if (adminRow) {
      const code = generateCode();
      await db.insert(verificationCodes).values({
        userId: adminRow.id,
        email,
        codeHash: hashCode(code),
        purpose: "admin_signin",
        expiresAt: codeExpiry(),
      });
      try {
        await sendVerificationEmail({
          to: email,
          code,
          purpose: "signin",
          name: adminRow.name,
        });
      } catch (mailErr) {
        console.error("[admin request-code] email send failed:", mailErr);
      }
    } else {
      // Don't leak admin status — log only.
      console.log("[admin request-code] no admin user for", email);
    }

    return Response.json({
      ok: true,
      message: "if an admin account exists for this email, a code has been sent",
    });
  } catch (err) {
    console.error("[admin request-code] failed:", err);
    return Response.json(
      { ok: false, error: err instanceof Error ? err.message : String(err) },
      { status: 500 }
    );
  }
}
