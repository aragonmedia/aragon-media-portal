/**
 * POST /api/accounts/credentials
 * Body: { accountId?, username, password, code? }
 * - Marks account.status = 'credentials_received'
 * - Updates credentialsReceivedAt timestamp
 * - (TODO next round) encrypt+store creds OR just notify AM team via chat message
 *
 * For now we just flip the status and ack — actual credential persistence
 * comes when we wire the encrypted vault.
 */

import { NextRequest } from "next/server";
import { eq, and, desc } from "drizzle-orm";
import { db } from "@/db";
import { accounts } from "@/db/schema";
import { getCurrentUser } from "@/lib/auth/session";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return Response.json({ ok: false, error: "unauthorized" }, { status: 401 });

  let body: Record<string, unknown> = {};
  try { body = (await req.json()) as Record<string, unknown>; } catch {
    return Response.json({ ok: false, error: "invalid json" }, { status: 400 });
  }
  const username = typeof body.username === "string" ? body.username.trim() : "";
  const password = typeof body.password === "string" ? body.password : "";
  if (!username || !password) {
    return Response.json({ ok: false, error: "username + password required" }, { status: 400 });
  }

  try {
    // Find the most recent pending account; that's the one we apply credentials to
    const candidates = await db
      .select()
      .from(accounts)
      .where(and(eq(accounts.userId, user.id), eq(accounts.status, "pending")))
      .orderBy(desc(accounts.createdAt))
      .limit(1);

    if (candidates.length === 0) {
      return Response.json(
        { ok: false, error: "No pending account on file. Activate first via Add Accounts." },
        { status: 400 }
      );
    }

    const acct = candidates[0];
    await db
      .update(accounts)
      .set({ status: "credentials_received", credentialsReceivedAt: new Date() })
      .where(eq(accounts.id, acct.id));

    return Response.json({ ok: true, accountId: acct.id, message: "credentials received" });
  } catch (err) {
    console.error("[credentials] failed:", err);
    return Response.json(
      { ok: false, error: err instanceof Error ? err.message : String(err) },
      { status: 500 }
    );
  }
}
