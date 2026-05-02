/**
 * POST /api/admin/actions/mark-existing-creator
 * Body: { userId, value: boolean }
 *
 * Authed via am_admin cookie. Toggles users.is_existing_creator.
 *
 * On flipping TRUE we also:
 *   - set contract_unlocked = true + stamp contract_unlocked_at
 *   - if no agreement row exists yet, insert one with version
 *     'v0_grandfathered' and signature 'Grandfathered (pre-portal)'
 *     so the audit trail records the grandfathering.
 *   - stamp users.contract_signed_at + contract_version on the user row
 *     so the withdrawal-form gate opens immediately.
 *
 * On flipping FALSE we just clear the boolean — historical agreement
 * row stays in place (don't rewrite history).
 */

import { NextRequest } from "next/server";
import { and, eq } from "drizzle-orm";
import { db } from "@/db";
import { users, agreements } from "@/db/schema";
import { isAdminSession } from "@/lib/auth/admin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const GRANDFATHERED_VERSION = "v0_grandfathered";
const GRANDFATHERED_SIGNATURE = "Grandfathered (pre-portal)";

export async function POST(req: NextRequest) {
  if (!(await isAdminSession())) {
    return Response.json({ ok: false, error: "unauthorized" }, { status: 401 });
  }

  let body: { userId?: string; value?: boolean };
  try {
    body = (await req.json()) as { userId?: string; value?: boolean };
  } catch {
    return Response.json({ ok: false, error: "invalid_json" }, { status: 400 });
  }

  if (!body.userId || typeof body.value !== "boolean") {
    return Response.json(
      { ok: false, error: "userId_and_value_required" },
      { status: 400 }
    );
  }

  const now = new Date();
  if (body.value) {
    // Promote to grandfathered
    await db
      .update(users)
      .set({
        isExistingCreator: true,
        existingCreatorMarkedAt: now,
        contractUnlocked: true,
        contractUnlockedAt: now,
        contractSignedAt: now,
        contractVersion: GRANDFATHERED_VERSION,
      })
      .where(eq(users.id, body.userId));

    // Insert a grandfathered agreement row if none exists yet so the
    // /admin/agreements list reflects this creator.
    const existing = await db
      .select({ id: agreements.id })
      .from(agreements)
      .where(
        and(
          eq(agreements.userId, body.userId),
          eq(agreements.contractVersion, GRANDFATHERED_VERSION)
        )
      )
      .limit(1);
    if (existing.length === 0) {
      await db.insert(agreements).values({
        userId: body.userId,
        signature: GRANDFATHERED_SIGNATURE,
        contractVersion: GRANDFATHERED_VERSION,
        signedAt: now,
      });
    }
  } else {
    // Demote — keep agreement row, clear the boolean only
    await db
      .update(users)
      .set({
        isExistingCreator: false,
        existingCreatorMarkedAt: null,
      })
      .where(eq(users.id, body.userId));
  }

  return Response.json({ ok: true });
}
