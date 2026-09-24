/**
 * POST /api/admin/team/invite
 * Body: { email, role }
 * Owner-only. Creates an admin_invites row + fires the invite email.
 */

import crypto from "node:crypto";
import { NextRequest } from "next/server";
import { and, eq } from "drizzle-orm";
import { db } from "@/db";
import { adminInvites } from "@/db/schema";
import { getAdminRole } from "@/lib/auth/admin-role";
import { sendTeamInviteEmail } from "@/lib/email/send";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const INVITABLE = new Set(["accelerator_admin", "am_lead", "chat_only"]);

function isEmail(s: unknown): s is string {
  return typeof s === "string" && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s);
}

export async function POST(req: NextRequest) {
  const session = await getAdminRole();
  if (!session || session.role !== "owner") {
    return Response.json({ ok: false, error: "owner-only" }, { status: 403 });
  }
  const body = (await req.json().catch(() => ({}))) as Record<string, unknown>;
  const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
  const role = typeof body.role === "string" ? body.role : "";
  if (!isEmail(email)) return Response.json({ ok: false, error: "valid email required" }, { status: 400 });
  if (!INVITABLE.has(role)) return Response.json({ ok: false, error: "invalid role" }, { status: 400 });

  // Refuse duplicate pending
  const existing = await db
    .select({ id: adminInvites.id })
    .from(adminInvites)
    .where(and(eq(adminInvites.email, email), eq(adminInvites.status, "pending")))
    .limit(1);
  if (existing[0]) {
    return Response.json({ ok: false, error: "invite already pending for this email" }, { status: 409 });
  }

  const token = crypto.randomBytes(24).toString("hex");
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

  await db.insert(adminInvites).values({
    email,
    role,
    token,
    invitedBy: session.userId,
    expiresAt,
  });

  const origin = req.headers.get("origin") || "https://portal.kevin-aragon.com";
  try {
    await sendTeamInviteEmail({
      to: email,
      role,
      inviteUrl: `${origin}/admin?invite=${token}`,
      inviterName: "Kevin",
    });
  } catch (err) {
    console.error("[team invite] email failed:", err);
    // Still return ok — invite row is stored; can resend later.
  }

  return Response.json({ ok: true });
}
