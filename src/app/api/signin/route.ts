import { NextResponse } from "next/server";

// Stub — signin sends a 6-digit code to an existing user's email.
// Full Neon lookup + Resend send lands in the next deploy.
export async function POST(req: Request) {
  try {
    const body = await req.json();
    if (!body?.email) {
      return NextResponse.json({ ok: false, error: "Email required" }, { status: 400 });
    }
    // TODO(next-deploy):
    //   1. look up user by email in Neon
    //   2. if not found, still return ok to avoid email enumeration
    //   3. generate + hash + store 6-digit code, 15-min expiry
    //   4. send via Resend
    console.log("[signin] inbound:", JSON.stringify({ email: body.email, t: new Date().toISOString() }));
    return NextResponse.json({ ok: true, pending: true });
  } catch (e) {
    return NextResponse.json(
      { ok: false, error: e instanceof Error ? e.message : "Bad request" },
      { status: 400 },
    );
  }
}
