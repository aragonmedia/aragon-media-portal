/**
 * GET  /api/accelerator/sync/discord  (Vercel Cron fires this)
 * POST /api/accelerator/sync/discord  (manual trigger for testing)
 *
 * Pulls the last 100 messages from ACCELERATOR_LISTINGS_CHANNEL_ID,
 * concatenates them chronologically, runs through the shared parser +
 * upsert. Handles Nick posting the listings as multiple messages (not
 * one editable message) — the parser skips non-matching lines, so
 * decorative / greeting messages don't affect the output.
 *
 * Auth: Vercel Cron sets an 'authorization: Bearer <CRON_SECRET>' header
 * automatically when configured, OR we accept our own
 * ACCELERATOR_SYNC_SECRET / MIGRATION_SECRET. The x-vercel-cron: 1
 * header is also accepted as a signal the call came from the platform.
 *
 * Feature is disabled until BOTH env vars are set:
 *   - DISCORD_BOT_TOKEN
 *   - ACCELERATOR_LISTINGS_CHANNEL_ID
 * If either is missing the endpoint returns 501 (Not Implemented) so
 * we can deploy this code before Nick's bot is authorized.
 */

import { NextResponse } from "next/server";
import { syncAccountsFromText } from "@/lib/accelerator/sync";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

function isAuthed(req: Request): boolean {
  // Vercel Cron adds this header on scheduled invocations
  if (req.headers.get("x-vercel-cron") === "1") return true;
  const auth = req.headers.get("authorization") ?? "";
  const cronSecret = process.env.CRON_SECRET;
  const acceleratorSecret = process.env.ACCELERATOR_SYNC_SECRET;
  const migrationSecret = process.env.MIGRATION_SECRET;
  if (cronSecret && auth === `Bearer ${cronSecret}`) return true;
  if (acceleratorSecret && auth === `Bearer ${acceleratorSecret}`) return true;
  if (migrationSecret && auth === `Bearer ${migrationSecret}`) return true;
  return false;
}

async function fetchDiscordChannelMessages(
  channelId: string,
  botToken: string,
  limit = 100
): Promise<Array<{ id: string; content: string; timestamp: string; author?: { id: string } }>> {
  const url = `https://discord.com/api/v10/channels/${channelId}/messages?limit=${limit}`;
  const res = await fetch(url, {
    headers: {
      Authorization: `Bot ${botToken}`,
      "User-Agent": "AragonMediaAcceleratorBot (portal.kevin-aragon.com, 1.0)",
    },
    cache: "no-store",
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`Discord API ${res.status}: ${text.slice(0, 200)}`);
  }
  return res.json();
}

async function run() {
  const channelId = process.env.ACCELERATOR_LISTINGS_CHANNEL_ID;
  const botToken = process.env.DISCORD_BOT_TOKEN;

  if (!channelId || !botToken) {
    return NextResponse.json(
      {
        ok: false,
        error: "bot not configured yet",
        missing: {
          DISCORD_BOT_TOKEN: !botToken,
          ACCELERATOR_LISTINGS_CHANNEL_ID: !channelId,
        },
      },
      { status: 501 }
    );
  }

  try {
    const messages = await fetchDiscordChannelMessages(channelId, botToken, 100);
    // Discord returns newest → oldest. Reverse so listings render in
    // Nick's actual posting order (top of channel first).
    const ordered = messages.slice().reverse();
    const combined = ordered
      .map((m) => (m.content ?? "").trim())
      .filter(Boolean)
      .join("\n");

    const result = await syncAccountsFromText(combined, "bot");
    return NextResponse.json({
      ...result,
      source: "bot",
      messagesFetched: messages.length,
    });
  } catch (err) {
    console.error("[accelerator/sync/discord]", err);
    return NextResponse.json(
      { ok: false, error: err instanceof Error ? err.message : "sync failed" },
      { status: 500 }
    );
  }
}

export async function GET(req: Request) {
  if (!isAuthed(req)) {
    return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  }
  return run();
}

export async function POST(req: Request) {
  if (!isAuthed(req)) {
    return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  }
  return run();
}
