import { NextRequest } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { agreements, users } from "@/db/schema";
import { getCurrentUser } from "@/lib/auth/session";
import { CONTRACT_VERSION } from "@/app/dashboard/agreement/constants";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) {
    return Response.json({ ok: false, error: "unauthorized" }, { status: 401 });
  }
  if (!user.contractUnlocked) {
    return Response.json(
      { ok: false, error: "contract_locked" },
      { status: 403 }
    );
  }
  if (user.contractSignedAt) {
    return Response.json(
      { ok: false, error: "already_signed" },
      { status: 409 }
    );
  }

  let body: { signature?: string };
  try {
    body = (await req.json()) as { signature?: string };
  } catch {
    return Response.json({ ok: false, error: "invalid_json" }, { status: 400 });
  }

  const sig = (body.signature ?? "").trim();
  if (sig.length < 2) {
    return Response.json(
      { ok: false, error: "invalid_signature" },
      { status: 400 }
    );
  }

  const now = new Date();

  // Insert audit row + flip user's contract_signed_at + contract_version
  // in a single round-trip per side. Drizzle/neon-http doesn't support
  // multi-statement transactions over HTTP; the writes here are independent
  // (the agreement row + the user-flag flip) and the page re-fetches via
  // router.refresh, so any partial state recovers on the next request.
  const inserted = await db
    .insert(agreements)
    .values({
      userId: user.id,
      signature: sig.slice(0, 200),
      contractVersion: CONTRACT_VERSION,
      signedAt: now,
    })
    .returning({ id: agreements.id });

  await db
    .update(users)
    .set({
      contractSignedAt: now,
      contractVersion: CONTRACT_VERSION,
    })
    .where(eq(users.id, user.id));

  return Response.json({
    ok: true,
    id: inserted[0]?.id,
    signedAt: now.toISOString(),
    contractVersion: CONTRACT_VERSION,
  });
}
