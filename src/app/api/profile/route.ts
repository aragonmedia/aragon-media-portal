/**
 * GET  /api/profile  - return current user profile
 * POST /api/profile  - update name + handle (only fields user controls)
 *
 * Email + role are immutable post-signup. AM team handles those via /admin if needed.
 */

import { NextRequest } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { users } from "@/db/schema";
import { getCurrentUser } from "@/lib/auth/session";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return Response.json({ ok: false, error: "unauthorized" }, { status: 401 });
  return Response.json({
    ok: true,
    profile: {
      email: user.email,
      name: user.name,
      handle: user.handle,
      role: user.role,
      verifiedAt: user.verifiedAt,
      createdAt: user.createdAt,
      contractSignedAt: user.contractSignedAt,
    },
  });
}

export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return Response.json({ ok: false, error: "unauthorized" }, { status: 401 });

  let body: Record<string, unknown> = {};
  try {
    body = (await req.json()) as Record<string, unknown>;
  } catch {
    return Response.json({ ok: false, error: "invalid json" }, { status: 400 });
  }

  const name = typeof body.name === "string" ? body.name.trim() : "";
  const handle = typeof body.handle === "string" ? body.handle.trim() : "";

  if (!name) return Response.json({ ok: false, error: "name required" }, { status: 400 });
  if (name.length > 200) return Response.json({ ok: false, error: "name too long" }, { status: 400 });
  if (handle.length > 200) return Response.json({ ok: false, error: "handle too long" }, { status: 400 });

  try {
    await db.update(users).set({ name, handle: handle || null }).where(eq(users.id, user.id));
    return Response.json({ ok: true, message: "profile updated" });
  } catch (err) {
    console.error("[profile] update failed:", err);
    return Response.json(
      { ok: false, error: err instanceof Error ? err.message : String(err) },
      { status: 500 }
    );
  }
}
