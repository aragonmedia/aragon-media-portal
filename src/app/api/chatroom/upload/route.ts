/**
 * POST /api/chatroom/upload
 *
 * Vercel Blob client-upload token minting — same shape as
 * /api/blob/client-upload but the auth gate accepts an active chatroom
 * browser cookie (must resolve to at least one thread for that key).
 * Prevents random visitors from spamming Blob storage.
 */

import { handleUpload, type HandleUploadBody } from "@vercel/blob/client";
import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { chatroomThreads } from "@/db/schema";
import { getOrCreateBrowserKey } from "@/lib/chatroom/session";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MAX_BYTES = 25 * 1024 * 1024; // 25MB — enough for phone screenshots
const ALLOWED_TYPES = [
  "image/png", "image/jpeg", "image/jpg", "image/webp",
  "image/heic", "image/heif", "image/gif",
];

export async function POST(request: Request): Promise<NextResponse> {
  const { key } = await getOrCreateBrowserKey();
  const existing = await db
    .select({ id: chatroomThreads.id })
    .from(chatroomThreads)
    .where(eq(chatroomThreads.browserKey, key))
    .limit(1);
  if (existing.length === 0) {
    return NextResponse.json({ ok: false, error: "no active thread" }, { status: 401 });
  }

  try {
    const body = (await request.json()) as HandleUploadBody;
    const jsonResponse = await handleUpload({
      body,
      request,
      onBeforeGenerateToken: async (pathname) => {
        const safe = pathname.replace(/[^a-zA-Z0-9._\-/]+/g, "_").slice(0, 120);
        return {
          allowedContentTypes: ALLOWED_TYPES,
          maximumSizeInBytes: MAX_BYTES,
          tokenPayload: JSON.stringify({ key, path: `chatroom/${key.slice(0, 12)}/${safe}` }),
          addRandomSuffix: true,
        };
      },
      onUploadCompleted: async () => {},
    });
    return NextResponse.json(jsonResponse);
  } catch (err) {
    return NextResponse.json(
      { ok: false, error: err instanceof Error ? err.message : "upload failed" },
      { status: 500 }
    );
  }
}
