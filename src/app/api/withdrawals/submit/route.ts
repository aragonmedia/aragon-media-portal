import { NextRequest } from "next/server";
import { sql } from "drizzle-orm";
import { db } from "@/db";
import { withdrawals } from "@/db/schema";
import { getCurrentUser } from "@/lib/auth/session";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Body = {
  accountId?: string | null;
  // amount is no longer collected from the creator — admin computes it
  // from the uploaded screenshot in /admin/withdrawals/[id].
  amount?: string;
  payoutMethod?: string;
  bankDetails?: string;        // free text — stored in notes for now
  notes?: string;
  fileName?: string | null;    // screenshot file name (always)
  proofUrl?: string | null;    // public Vercel Blob URL when upload succeeded
};

function parseAmountToCents(raw?: string): number | null {
  if (!raw) return null;
  const cleaned = raw.replace(/[^\d.]/g, "");
  if (!cleaned) return null;
  const num = Number.parseFloat(cleaned);
  if (!Number.isFinite(num) || num <= 0) return null;
  return Math.round(num * 100);
}

export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) {
    return Response.json({ ok: false, error: "unauthorized" }, { status: 401 });
  }

  let body: Body;
  try {
    body = (await req.json()) as Body;
  } catch {
    return Response.json({ ok: false, error: "invalid_json" }, { status: 400 });
  }

  // Creator no longer types an amount — admin computes it. We accept any
  // value the form might still send (legacy clients) but default to 0 so
  // the row inserts cleanly. Admin edits set the real numbers later.
  const parsed = parseAmountToCents(body.amount);
  const grossCents = parsed ?? 0;
  if (!body.payoutMethod || body.payoutMethod.trim().length < 2) {
    return Response.json({ ok: false, error: "missing_payout_method" }, { status: 400 });
  }

  // Fee snapshot: 20% locked default. Per-creator override lives on the user
  // record once contracts are live; for now we use 20% across the board.
  const feePct = 0.2;
  const feeCents = Math.round(grossCents * feePct);
  const netCents = grossCents - feeCents;

  // Combine bank details + freeform notes + screenshot filename into the
  // notes column until we have dedicated columns for each. The screenshot
  // upload to object storage lands in a follow-up phase.
  const noteLines = [
    body.bankDetails ? `Bank/payout details:\n${body.bankDetails.trim()}` : "",
    body.notes ? `Creator notes:\n${body.notes.trim()}` : "",
    body.fileName ? `Screenshot pending upload — filename: ${body.fileName}` : "Screenshot pending — please share in chat referencing the receipt #.",
  ].filter(Boolean).join("\n\n");

  // Generate the receipt number atomically via the Postgres sequence and
  // insert in a single statement so concurrent submissions can't collide.
  const inserted = await db
    .insert(withdrawals)
    .values({
      receiptNumber: sql<string>`'AM-WDR-' || lpad(nextval('withdrawal_receipt_seq')::text, 5, '0')`,
      userId: user.id,
      accountId: body.accountId && body.accountId.length > 0 ? body.accountId : null,
      grossCents,
      feeCents,
      netCents,
      status: "requested",
      payoutMethod: body.payoutMethod.trim().slice(0, 50),
      notes: noteLines.slice(0, 4000),
      proofUrl: body.proofUrl && body.proofUrl.length > 0 ? body.proofUrl.slice(0, 500) : null,
    })
    .returning({
      id: withdrawals.id,
      receiptNumber: withdrawals.receiptNumber,
    });

  const row = inserted[0];
  if (!row) {
    return Response.json({ ok: false, error: "insert_failed" }, { status: 500 });
  }

  return Response.json({
    ok: true,
    id: row.id,
    receiptNumber: row.receiptNumber,
    redirect: `/dashboard/withdrawals/receipt/${row.id}`,
  });
}
