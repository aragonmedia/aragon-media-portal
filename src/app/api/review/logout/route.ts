/**
 * POST /api/review/logout — clears the am_review cookie.
 * Returns { ok: true }. Client should navigate to /login.
 */

import { clearReviewCookie } from "@/lib/auth/review";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST() {
  await clearReviewCookie();
  return Response.json({ ok: true });
}
