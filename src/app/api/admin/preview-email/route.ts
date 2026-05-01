/**
 * GET /api/admin/preview-email?secret=<MIGRATION_SECRET>
 *
 * Sends a sample 'Paid' withdrawal-status email to aragonkevin239@gmail.com
 * so Kevin can see the live template in his inbox. Bearer-secret to prevent
 * accidental flooding.
 */

import { NextRequest } from "next/server";
import { sendWithdrawalStatusEmail } from "@/lib/email/send";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const secret = process.env.MIGRATION_SECRET;
  if (!secret) {
    return Response.json(
      { ok: false, error: "MIGRATION_SECRET not set" },
      { status: 500 }
    );
  }
  if (url.searchParams.get("secret") !== secret) {
    return Response.json({ ok: false, error: "unauthorized" }, { status: 401 });
  }

  await sendWithdrawalStatusEmail({
    to: "aragonkevin239@gmail.com",
    creatorName: "Kevin Aragon",
    receiptNumber: "AM-WDR-PREVIEW",
    status: "paid",
    netCents: 107360,   // $1,073.60
    grossCents: 134200, // $1,342.00
  });

  return Response.json({
    ok: true,
    sentTo: "aragonkevin239@gmail.com",
    template: "withdrawal_status_paid",
  });
}
