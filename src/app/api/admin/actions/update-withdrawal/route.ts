/**
 * POST /api/admin/actions/update-withdrawal
 * Body: { id, grossCents?, feeCents?, netCents?, status? }
 *
 * Authed via the am_admin cookie. Updates any subset of:
 *   - grossCents / feeCents / netCents (admin can correct creator math)
 *   - status (Pending/Approved/Paid/Rejected/Late·retained)
 *
 * Side effects:
 *   - status='approved' → stamps approved_at = now()
 *   - status='paid'     → stamps paid_at = now()
 *   - on ANY status change vs. the prior value, emails the creator with
 *     status-specific copy.
 */

import { NextRequest } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { withdrawals, users } from "@/db/schema";
import { isAdminSession } from "@/lib/auth/admin";
import { sendWithdrawalPaidEmail } from "@/lib/email/send";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const STATUS_OK = new Set([
  "requested",
  "approved",
  "calculated",
  "paid",
  "rejected",
  "late_retained",
]);

type WStatus =
  | "requested"
  | "approved"
  | "calculated"
  | "paid"
  | "rejected"
  | "late_retained";

function isInt(n: unknown): n is number {
  return typeof n === "number" && Number.isFinite(n) && Number.isInteger(n);
}

export async function POST(req: NextRequest) {
  if (!(await isAdminSession())) {
    return Response.json({ ok: false, error: "unauthorized" }, { status: 401 });
  }

  let body: {
    id?: string;
    grossCents?: number;
    feeCents?: number;
    netCents?: number;
    status?: string;
    forceEmail?: boolean;
  };
  try {
    body = (await req.json()) as typeof body;
  } catch {
    return Response.json({ ok: false, error: "invalid_json" }, { status: 400 });
  }

  if (!body.id || typeof body.id !== "string") {
    return Response.json({ ok: false, error: "id_required" }, { status: 400 });
  }

  // Validate all provided fields up front
  if (body.grossCents !== undefined && !isInt(body.grossCents)) {
    return Response.json(
      { ok: false, error: "invalid_gross_cents" },
      { status: 400 }
    );
  }
  if (body.feeCents !== undefined && !isInt(body.feeCents)) {
    return Response.json(
      { ok: false, error: "invalid_fee_cents" },
      { status: 400 }
    );
  }
  if (body.netCents !== undefined && !isInt(body.netCents)) {
    return Response.json(
      { ok: false, error: "invalid_net_cents" },
      { status: 400 }
    );
  }
  if (body.status !== undefined && !STATUS_OK.has(body.status)) {
    return Response.json(
      { ok: false, error: "invalid_status" },
      { status: 400 }
    );
  }

  // Fetch the prior row so we know whether status changed and can email
  const before = (
    await db
      .select({
        id: withdrawals.id,
        receiptNumber: withdrawals.receiptNumber,
        userId: withdrawals.userId,
        status: withdrawals.status,
        grossCents: withdrawals.grossCents,
        netCents: withdrawals.netCents,
      })
      .from(withdrawals)
      .where(eq(withdrawals.id, body.id))
      .limit(1)
  )[0];
  if (!before) {
    return Response.json({ ok: false, error: "not_found" }, { status: 404 });
  }

  const now = new Date();
  const patch: Record<string, unknown> = {};
  if (body.grossCents !== undefined) patch.grossCents = body.grossCents;
  if (body.feeCents !== undefined) patch.feeCents = body.feeCents;
  if (body.netCents !== undefined) patch.netCents = body.netCents;

  let newStatus: WStatus | null = null;
  if (body.status !== undefined && body.status !== before.status) {
    newStatus = body.status as WStatus;
    patch.status = newStatus;
    if (newStatus === "approved") patch.approvedAt = now;
    if (newStatus === "paid") patch.paidAt = now;
  }

  if (Object.keys(patch).length === 0 && body.forceEmail !== true) {
    return Response.json({ ok: true, noop: true });
  }

  // If patch is empty but forceEmail is set, skip the UPDATE (Drizzle
  // doesn't accept empty .set()) and use `before` as the source of truth
  // for the email payload. Otherwise apply the patch and use the returned
  // row.
  type WithdrawalRow = {
    id: string;
    receiptNumber: string;
    grossCents: number;
    feeCents: number;
    netCents: number;
    status: WStatus;
    paidAt: Date | null;
  };
  let after: WithdrawalRow;
  if (Object.keys(patch).length === 0) {
    // forceEmail-only — re-fetch row to pick up status + amounts
    const fresh = await db
      .select({
        id: withdrawals.id,
        receiptNumber: withdrawals.receiptNumber,
        grossCents: withdrawals.grossCents,
        feeCents: withdrawals.feeCents,
        netCents: withdrawals.netCents,
        status: withdrawals.status,
        paidAt: withdrawals.paidAt,
      })
      .from(withdrawals)
      .where(eq(withdrawals.id, body.id))
      .limit(1);
    if (!fresh[0]) {
      return Response.json({ ok: false, error: "not_found" }, { status: 404 });
    }
    after = fresh[0] as WithdrawalRow;
  } else {
    const updated = await db
      .update(withdrawals)
      .set(patch)
      .where(eq(withdrawals.id, body.id))
      .returning({
        id: withdrawals.id,
        receiptNumber: withdrawals.receiptNumber,
        grossCents: withdrawals.grossCents,
        feeCents: withdrawals.feeCents,
        netCents: withdrawals.netCents,
        status: withdrawals.status,
        paidAt: withdrawals.paidAt,
      });
    if (!updated[0]) {
      return Response.json(
        { ok: false, error: "update_failed" },
        { status: 500 }
      );
    }
    after = updated[0] as WithdrawalRow;
  }

  // Email firing logic:
  //   - On a status TRANSITION to 'paid' (newStatus === 'paid'): auto-fire
  //   - On forceEmail: true with current status 'paid': fire regardless
  //     (admin's manual "Send Paid email" button — finalizes the send when
  //     the status was already paid before the save, e.g. a typo fix).
  // Email failures are caught here so the DB save still returns 200 — but
  // emailSent is honest about whether the message actually shipped.
  const wantsEmail =
    newStatus === "paid" ||
    (body.forceEmail === true && after.status === "paid");

  let emailSent = false;
  let emailError: string | null = null;
  if (wantsEmail) {
    const creator = (
      await db
        .select({ email: users.email, name: users.name })
        .from(users)
        .where(eq(users.id, before.userId))
        .limit(1)
    )[0];
    if (creator?.email) {
      try {
        await sendWithdrawalPaidEmail({
          to: creator.email,
          creatorName: creator.name,
          receiptNumber: after.receiptNumber,
          netCents: after.netCents,
          grossCents: after.grossCents,
        });
        emailSent = true;
      } catch (err) {
        emailError = err instanceof Error ? err.message : String(err);
        console.error("[update-withdrawal] Paid email failed:", emailError);
      }
    } else {
      emailError = "creator has no email on file";
    }
  }

  return Response.json({ ok: true, withdrawal: after, emailSent, emailError });
}
