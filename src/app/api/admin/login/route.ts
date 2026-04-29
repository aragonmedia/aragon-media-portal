import { NextRequest } from "next/server";
import { setAdminCookie, expectedHash } from "@/lib/auth/admin";
import crypto from "node:crypto";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  let body: Record<string, unknown> = {};
  try {
    body = (await req.json()) as Record<string, unknown>;
  } catch {
    return Response.json({ ok: false, error: "invalid json" }, { status: 400 });
  }
  const password = typeof body.password === "string" ? body.password : "";
  const expected = expectedHash();
  if (!expected) {
    return Response.json(
      { ok: false, error: "ADMIN_PASSWORD not set on this deployment" },
      { status: 500 }
    );
  }
  const submitted = crypto.createHash("sha256").update(password).digest("hex");
  if (submitted !== expected) {
    return Response.json({ ok: false, error: "incorrect password" }, { status: 401 });
  }
  await setAdminCookie();
  return Response.json({ ok: true });
}
