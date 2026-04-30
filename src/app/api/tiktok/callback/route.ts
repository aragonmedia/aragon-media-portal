/**
 * GET /api/tiktok/callback?code=...
 *
 * TikTok Shop Partner Center auth flow callback. Exchanges auth_code for
 * access_token + refresh_token via:
 *   GET https://auth.tiktok-shops.com/api/v2/token/get
 *     ?app_key=...&app_secret=...&auth_code=...&grant_type=authorized_code
 *
 * Stores tokens (first cut: logs them; encrypted vault wired in next round
 * with a tiktok_oauth_tokens table migration).
 *
 * Env vars required:
 *   TIKTOK_CLIENT_KEY     - app_key from Partner Center
 *   TIKTOK_CLIENT_SECRET  - app_secret from Partner Center
 */

import { NextRequest } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const TIKTOK_TOKEN_URL = "https://auth.tiktok-shops.com/api/v2/token/get";

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const code = url.searchParams.get("code");
  const error = url.searchParams.get("error");

  if (error) {
    return Response.redirect(
      `https://aragon-media-portal.vercel.app/dashboard/tiktok-account?error=${encodeURIComponent(error)}`,
      302
    );
  }
  if (!code) {
    return Response.json({ ok: false, error: "missing code" }, { status: 400 });
  }

  const user = await getCurrentUser();
  if (!user) {
    return Response.redirect("https://aragon-media-portal.vercel.app/signin", 302);
  }

  const appKey = process.env.TIKTOK_CLIENT_KEY;
  const appSecret = process.env.TIKTOK_CLIENT_SECRET;
  if (!appKey || !appSecret) {
    return Response.json(
      { ok: false, error: "TIKTOK_CLIENT_KEY / TIKTOK_CLIENT_SECRET not set" },
      { status: 500 }
    );
  }

  try {
    const tokenUrl = new URL(TIKTOK_TOKEN_URL);
    tokenUrl.searchParams.set("app_key", appKey);
    tokenUrl.searchParams.set("app_secret", appSecret);
    tokenUrl.searchParams.set("auth_code", code);
    tokenUrl.searchParams.set("grant_type", "authorized_code");

    const res = await fetch(tokenUrl.toString(), { method: "GET" });

    if (!res.ok) {
      const text = await res.text();
      console.error("[tiktok callback] token exchange failed:", res.status, text);
      return Response.json({ ok: false, error: "token exchange failed", detail: text }, { status: 502 });
    }

    type TikTokTokenResponse = {
      code: number;
      message: string;
      data?: {
        access_token: string;
        refresh_token: string;
        access_token_expire_in: number;
        refresh_token_expire_in: number;
        seller_name?: string;
        seller_base_region?: string;
        open_id?: string;
        granted_scopes?: string[];
      };
    };

    const data = (await res.json()) as TikTokTokenResponse;

    if (data.code !== 0 || !data.data) {
      console.error("[tiktok callback] non-zero code:", data);
      return Response.json({ ok: false, error: data.message || "tiktok rejected exchange" }, { status: 502 });
    }

    // First cut: log success. Token persistence (encrypted, tied to the
    // creator's accounts row) lands in the next migration.
    console.log("[tiktok callback] success for portal user", user.id, {
      seller_name: data.data.seller_name,
      open_id: data.data.open_id,
      access_expires_in: data.data.access_token_expire_in,
      scopes: data.data.granted_scopes,
    });

    return Response.redirect(
      `https://aragon-media-portal.vercel.app/dashboard/tiktok-account?connected=1`,
      302
    );
  } catch (err) {
    console.error("[tiktok callback] exception:", err);
    return Response.json(
      { ok: false, error: err instanceof Error ? err.message : String(err) },
      { status: 500 }
    );
  }
}
