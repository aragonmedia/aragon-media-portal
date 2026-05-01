/**
 * POST /api/admin/actions/set-account-status
 * Body: { accountId, status }
 *
 * Authed via am_admin cookie. Flips an accounts row's status. When set to
 * 'verified' or 'active' we also stamp the matching timestamp column so
 * the verification timeline stays auditable.
 */

import { NextRequest } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { accounts } from "@/db/schema";
import { isAdminSession } from "@/lib/auth/admin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const ALLOWED = new Set([
  "pending",
  "credentials_received",
  "two_factor_pending",
  "verified",
  "active",
  "suspended",
  "cancelled",
]);

type AStatus =
  | "pending"
  | "credentials_received"
  | "two_factor_pending"
  | "verified"
  | "active"
  | "suspended"
  | "cancelled";

export async function POST(req: NextRequest) {
  if (!(await isAdminSession())) {
    return Response.json({ ok: false, error: "unauthorized" }, { status: 401 });
  }
  let body: { accountId?: string; status?: string };
  try {
    body = (await req.json()) as { accountId?: string; status?: string };
  } catch {
    return Response.json({ ok: false, error: "invalid_json" }, { status: 400 });
  }
  if (!body.accountId || !body.status || !ALLOWED.has(body.status)) {
    return Response.json(
      { ok: false, error: "accountId_and_valid_status_required" },
      { status: 400 }
    );
  }
  const status = body.status as AStatus;
  const now = new Date();
  const patch: Record<string, unknown> = { status };
  if (status === "credentials_received") patch.credentialsReceivedAt = now;
  if (status === "two_factor_pending") patch.twoFactorAt = now;
  if (status === "verified") patch.verifiedAt = now;
  if (status === "active") patch.activatedAt = now;

  const updated = await db
    .update(accounts)
    .set(patch)
    .where(eq(accounts.id, body.accountId))
    .returning({
      id: accounts.id,
      tiktokHandle: accounts.tiktokHandle,
      status: accounts.status,
      verifiedAt: accounts.verifiedAt,
      activatedAt: accounts.activatedAt,
    });
  if (updated.length === 0) {
    return Response.json({ ok: false, error: "not_found" }, { status: 404 });
  }
  return Response.json({ ok: true, account: updated[0] });
}
