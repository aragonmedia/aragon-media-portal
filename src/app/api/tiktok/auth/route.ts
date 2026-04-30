/**
 * GET /api/tiktok/auth
 * - Generates a CSRF state token, stores it in a short-lived cookie.
 * - Redirects user to TikTok's OAuth consent screen.
 *
 * Env vars required:
 *   TIKTOK_CLIENT_KEY      - app key from TikTok dev portal
 *   TIKTOK_REDIRECT_URI    - https://aragon-media-portal.vercel.app/api/tiktok/callback
 *
 * Scopes: user.info.basic + research.adlib.basic + video.list (adjust to
 * what we actually need from TikTok Shop / TAP Matchmaking).
 */

import crypto from "node:crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/session";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const TIKTOK_AUTH_URL = "https://www.tiktok.com/v2/auth/authorize/";
const SCOPES = "user.info.basic,user.info.profile,user.info.stats,video.list";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) redirect("/signin");

  const clientKey = process.env.TIKTOK_CLIENT_KEY;
  const redirectUri = process.env.TIKTOK_REDIRECT_URI ?? "https://aragon-media-portal.vercel.app/api/tiktok/callback";
  if (!clientKey) {
    return Response.json({ ok: false, error: "TIKTOK_CLIENT_KEY not set" }, { status: 500 });
  }

  const state = crypto.randomBytes(16).toString("hex");
  const store = await cookies();
  store.set("tt_state", state, {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    path: "/",
    maxAge: 600, // 10 min
  });
  store.set("tt_user", user.id, {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    path: "/",
    maxAge: 600,
  });

  const url = new URL(TIKTOK_AUTH_URL);
  url.searchParams.set("client_key", clientKey);
  url.searchParams.set("scope", SCOPES);
  url.searchParams.set("response_type", "code");
  url.searchParams.set("redirect_uri", redirectUri);
  url.searchParams.set("state", state);

  redirect(url.toString());
}
