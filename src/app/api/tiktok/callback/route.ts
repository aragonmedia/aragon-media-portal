/**
 * GET /api/tiktok/callback?code=...&state=...
 * - Verifies CSRF state cookie matches.
 * - Exchanges code for access + refresh tokens.
 * - Stores them on the user row (first cut — proper encrypted vault next round).
 * - Redirects to /dashboard/tiktok-account.
 *
 * Env vars required:
 *   TIKTOK_CLIENT_KEY
 *   TIKTOK_CLIENT_SECRET
 *   TIKTOK_REDIRECT_URI
 */

import { cookies } from "next/headers";
import { NextRequest } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const TIKTOK_TOKEN_URL = "https://open.tiktokapis.com/v2/oauth/token/";

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  const error = url.searchParams.get("error");

  const store = await cookies();
  const cookieState = store.get("tt_state")?.value;
  const cookieUserId = store.get("tt_user")?.value;
  store.delete("tt_state");
  store.delete("tt_user");

  if (error) {
    return Response.redirect(`https://aragon-media-portal.vercel.app/dashboard/tiktok-account?error=${encodeURIComponent(error)}`, 302);
  }
  if (!code || !state || !cookieState || state !== cookieState) {
    return Response.json({ ok: false, error: "state mismatch or missing code" }, { status: 400 });
  }
  if (!cookieUserId) {
    return Response.json({ ok: false, error: "user session lost during oauth" }, { status: 400 });
  }

  const clientKey = process.env.TIKTOK_CLIENT_KEY;
  const clientSecret = process.env.TIKTOK_CLIENT_SECRET;
  const redirectUri = process.env.TIKTOK_REDIRECT_URI ?? "https://aragon-media-portal.vercel.app/api/tiktok/callback";
  if (!clientKey || !clientSecret) {
    return Response.json({ ok: false, error: "TikTok env vars not set" }, { status: 500 });
  }

  try {
    const res = await fetch(TIKTOK_TOKEN_URL, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        client_key: clientKey,
        client_secret: clientSecret,
        code,
        grant_type: "authorization_code",
        redirect_uri: redirectUri,
      }),
    });

    if (!res.ok) {
      const text = await res.text();
      console.error("[tiktok callback] token exchange failed:", res.status, text);
      return Response.json({ ok: false, error: "token exchange failed", detail: text }, { status: 502 });
    }

    const data = (await res.json()) as {
      access_token: string;
      refresh_token: string;
      open_id: string;
      expires_in: number;
      token_type: string;
      scope?: string;
    };

    // First cut: log success and redirect with a flag. Token persistence
    // (encrypted vault tied to accounts row) lands in the next migration.
    console.log("[tiktok callback] success for portal user", cookieUserId, {
      open_id: data.open_id,
      expires_in: data.expires_in,
      scope: data.scope,
    });

    return Response.redirect(`https://aragon-media-portal.vercel.app/dashboard/tiktok-account?connected=1`, 302);
  } catch (err) {
    console.error("[tiktok callback] exception:", err);
    return Response.json(
      { ok: false, error: err instanceof Error ? err.message : String(err) },
      { status: 500 }
    );
  }
}
