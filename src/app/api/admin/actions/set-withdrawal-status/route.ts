/**
 * POST /api/admin/actions/set-withdrawal-status
 * Body: { id, status }
 *
 * Authed via the am_admin cookie. Updates a single withdrawals row's status
 * (Pending -> Approved -> Paid -> Late·retained -> Rejected, in any order).
 * If status flips to 'paid', also stamps paid_at = now().
 * If status flips to 'approved', also stamps approved_at = now().
 */

import { NextRequest } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { withdrawals } from "@/db/schema";
import { isAdminSession } from "@/lib/auth/admin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const ALLOWED = new Set([
  "requested",
  "approved",
  "paid",
  "rejected",
  "late_retained",
]);

type WStatus =
  | "requested"
  | "approved"
  | "paid"
  | "rejected"
  | "late_retained";

export async function POST(req: NextRequest) {
  if (!(await isAdminSession())) {
    return Response.json({ ok: false, error: "unauthorized" }, { status: 401 });
  }

  let body: { id?: string; status?: string };
  try {
    body = (await req.json()) as { id?: string; status?: string };
  } catch {
    return Response.json({ ok: false, error: "invalid_json" }, { status: 400 });
  }

  if (!body.id || !body.status || !ALLOWED.has(body.status)) {
    return Response.json(
      { ok: false, error: "id_and_valid_status_required" },
      { status: 400 }
    );
  }

  const status = body.status as WStatus;
  const now = new Date();
  const patch: Record<string, unknown> = { status };
  if (status === "paid") patch.paidAt = now;
  if (status === "approved") patch.approvedAt = now;

  const updated = await db
    .update(withdrawals)
    .set(patch)
    .where(eq(withdrawals.id, body.id))
    .returning({
      id: withdrawals.id,
      status: withdrawals.status,
      paidAt: withdrawals.paidAt,
      approvedAt: withdrawals.approvedAt,
    });

  if (updated.length === 0) {
    return Response.json({ ok: false, error: "not_found" }, { status: 404 });
  }
  return Response.json({ ok: true, withdrawal: updated[0] });
}
