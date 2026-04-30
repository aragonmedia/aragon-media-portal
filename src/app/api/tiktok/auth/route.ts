/**
 * GET /api/tiktok/auth
 *
 * Redirects creator to TikTok Shop Partner Center authorization page.
 * After they approve, TikTok redirects back to /api/tiktok/callback with
 * an auth_code which we exchange for tokens.
 *
 * Env vars required:
 *   TIKTOK_SERVICE_ID  - service_id from your Partner Center app
 *
 * Authorization URL pattern (US market):
 *   https://services.tiktokshops.us/open/authorize?service_id=XXXX
 *
 * Other markets use slightly different domains; we default to US.
 */

import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/session";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) redirect("/signin");

  const serviceId = process.env.TIKTOK_SERVICE_ID;
  if (!serviceId) {
    return Response.json(
      { ok: false, error: "TIKTOK_SERVICE_ID not set. Get it from Partner Center → App & Service → your app." },
      { status: 500 }
    );
  }

  const url = `https://services.tiktokshops.us/open/authorize?service_id=${encodeURIComponent(serviceId)}`;
  redirect(url);
}
