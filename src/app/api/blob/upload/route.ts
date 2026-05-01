/**
 * POST /api/blob/upload
 *
 * Streams a single image (the creator's TikTok withdrawal screenshot) to
 * Vercel Blob storage and returns the public URL the admin will preview.
 *
 * Auth: requires creator session (am_session cookie).
 * Body: multipart/form-data with a single 'file' field. Max 8MB.
 *       Allowed mimetypes: image/png, image/jpeg, image/webp, image/heic.
 *
 * Graceful degradation: when BLOB_READ_WRITE_TOKEN isn't set yet (e.g.,
 * the Vercel Blob store hasn't been provisioned in the project), this
 * endpoint returns 501 with a hint. The form falls back to recording
 * just the filename, same as the original behavior.
 */

import { NextRequest } from "next/server";
import { put } from "@vercel/blob";
import { getCurrentUser } from "@/lib/auth/session";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MAX_BYTES = 8 * 1024 * 1024; // 8MB
const ALLOWED_TYPES = new Set([
  "image/png",
  "image/jpeg",
  "image/webp",
  "image/heic",
  "image/jpg",
]);

export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) {
    return Response.json({ ok: false, error: "unauthorized" }, { status: 401 });
  }

  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    return Response.json(
      {
        ok: false,
        error: "storage_not_configured",
        hint: "BLOB_READ_WRITE_TOKEN env var not set on this deployment. Create a Blob store in Vercel and connect to this project.",
      },
      { status: 501 }
    );
  }

  let form: FormData;
  try {
    form = await req.formData();
  } catch {
    return Response.json(
      { ok: false, error: "invalid_form_data" },
      { status: 400 }
    );
  }

  const file = form.get("file");
  if (!(file instanceof File)) {
    return Response.json(
      { ok: false, error: "file_field_required" },
      { status: 400 }
    );
  }
  if (file.size === 0) {
    return Response.json(
      { ok: false, error: "empty_file" },
      { status: 400 }
    );
  }
  if (file.size > MAX_BYTES) {
    return Response.json(
      { ok: false, error: "file_too_large", maxBytes: MAX_BYTES },
      { status: 413 }
    );
  }
  if (!ALLOWED_TYPES.has(file.type)) {
    return Response.json(
      { ok: false, error: "unsupported_type", got: file.type },
      { status: 415 }
    );
  }

  // Path the file under the user's id so creators can never collide with
  // each other and admin can spot which folder maps to which row.
  const safeName = file.name.replace(/[^a-zA-Z0-9._-]+/g, "_").slice(0, 80);
  const stamp = Date.now();
  const key = `withdrawals/${user.id}/${stamp}-${safeName}`;

  try {
    const blob = await put(key, file, {
      access: "public",
      contentType: file.type,
      addRandomSuffix: false,
    });
    return Response.json({
      ok: true,
      url: blob.url,
      pathname: blob.pathname,
      contentType: file.type,
      size: file.size,
      filename: file.name,
    });
  } catch (err) {
    console.error("[blob/upload] put failed:", err);
    return Response.json(
      {
        ok: false,
        error: "upload_failed",
        detail: err instanceof Error ? err.message : String(err),
      },
      { status: 500 }
    );
  }
}
