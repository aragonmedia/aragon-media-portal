/**
 * POST /api/auth/logout — clears am_session cookie and revokes the session row.
 */

import { cookies } from "next/headers";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { sessions } from "@/db/schema";
import { hashSessionToken, SESSION_COOKIE, clearSessionCookie } from "@/lib/auth/sessions";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST() {
  const store = await cookies();
  const token = store.get(SESSION_COOKIE)?.value;

  if (token) {
    try {
      await db
        .update(sessions)
        .set({ revokedAt: new Date() })
        .where(eq(sessions.tokenHash, hashSessionToken(token)));
    } catch (err) {
      console.error("[logout] failed to revoke session row:", err);
    }
  }

  await clearSessionCookie();
  return Response.json({ ok: true });
}
