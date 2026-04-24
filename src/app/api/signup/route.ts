import { NextResponse } from "next/server";

// Stub — full Neon + Resend wire-up follows in the next deploy.
// For now we log the payload to Vercel runtime logs so the Aragon Media
// team can already observe inbound signups while the DB is being provisioned.
export async function POST(req: Request) {
  try {
    const body = await req.json();
    // Basic shape validation — keep rejections cheap.
    if (!body?.role || !body?.name || !body?.email) {
      return NextResponse.json(
        { ok: false, error: "Missing required fields" },
        { status: 400 },
      );
    }
    // TODO(next-deploy):
    //   1. insert pending user into Neon users table (status: 'pending_email')
    //   2. generate 6-digit code, hash with SHA-256 + salt, store with 15-min expiry
    //   3. send code via Resend to body.email
    console.log("[signup] inbound:", JSON.stringify({
      role: body.role,
      otherText: body.otherText ?? null,
      name: body.name,
      email: body.email,
      handle: body.handle ?? null,
      t: new Date().toISOString(),
    }));
    return NextResponse.json({ ok: true, pending: true });
  } catch (e) {
    return NextResponse.json(
      { ok: false, error: e instanceof Error ? e.message : "Bad request" },
      { status: 400 },
    );
  }
}
