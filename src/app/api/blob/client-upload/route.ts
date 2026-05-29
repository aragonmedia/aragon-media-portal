/**
 * POST /api/blob/client-upload
 *
 * Issues signed tokens for direct-to-Blob client uploads. Files stream
 * straight from the user's browser to Vercel Blob storage, bypassing
 * the 4.5MB serverless function body limit that breaks mobile video
 * uploads through the older /api/blob/upload multipart route.
 *
 * Auth: creator session OR admin session — same as the multipart route.
 *
 * Used by:
 *   - /dashboard/chat (creator uploads images + videos via paperclip)
 *   - /admin/chats/[id] (admin uploads images + videos)
 *
 * Wire on the client:
 *   import { upload } from "@vercel/blob/client";
 *   const blob = await upload(filename, file, {
 *     access: "public",
 *     handleUploadUrl: "/api/blob/client-upload",
 *   });
 */

import { handleUpload, type HandleUploadBody } from "@vercel/blob/client";
import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { isAdminSession } from "@/lib/auth/admin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MAX_BYTES = 100 * 1024 * 1024; // 100MB — fits a typical iPhone clip
const ALLOWED_TYPES = [
  "image/png",
  "image/jpeg",
  "image/jpg",
  "image/webp",
  "image/heic",
  "image/heif",
  "video/mp4",
  "video/quicktime",
  "video/webm",
  "video/x-m4v",
];

export async function POST(request: Request): Promise<NextResponse> {
  // Auth gate up front — fail before any token is minted
  const user = await getCurrentUser();
  const adminAuthed = await isAdminSession();
  if (!user && !adminAuthed) {
    return NextResponse.json(
      { ok: false, error: "unauthorized" },
      { status: 401 }
    );
  }
  const ownerSlug = user?.id ?? "admin";

  try {
    const body = (await request.json()) as HandleUploadBody;
    const jsonResponse = await handleUpload({
      body,
      request,
      onBeforeGenerateToken: async (pathname) => {
        // Path the file under the owner so files don't collide
        // (mirrors the multipart route's key scheme)
        const safe = pathname.replace(/[^a-zA-Z0-9._\-/]+/g, "_").slice(0, 120);
        return {
          allowedContentTypes: ALLOWED_TYPES,
          maximumSizeInBytes: MAX_BYTES,
          // Token payload is attached to the blob so onUploadCompleted
          // can see which creator/admin owned it (not used yet, but
          // future-proofs analytics + audit logging).
          tokenPayload: JSON.stringify({ ownerSlug, originalPath: safe }),
          addRandomSuffix: true,
        };
      },
      onUploadCompleted: async ({ blob, tokenPayload }) => {
        console.log(
          "[blob/client-upload] uploaded:",
          blob.pathname,
          blob.url,
          tokenPayload
        );
      },
    });
    return NextResponse.json(jsonResponse);
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    const name = err instanceof Error ? err.name : typeof err;
    console.error("[blob/client-upload] failed:", name, msg);
    return NextResponse.json(
      { ok: false, error: "upload_failed", detail: msg },
      { status: 500 }
    );
  }
}
