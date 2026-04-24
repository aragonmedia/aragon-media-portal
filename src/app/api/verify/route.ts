import { NextResponse } from "next/server";

// Stub — verifies the 6-digit code. Until Neon+Resend are wired, this
// returns a clear "pending" signal so the UI can surface a friendly note
// rather than pretend-succeed.
export async function POST(req: Request) {
  try {
    const body = await req.json();
    if (!body?.email || !body?.code || String(body.code).length !== 6) {
      return NextResponse.json(
        { ok: false, error: "Email and 6-digit code required" },
        { status: 400 },
      );
    }
    // TODO(next-deploy):
    //   1. hash body.code, compare to stored hash for body.email
    //   2. check expiry (15 min window)
    //   3. on success: flip user status to 'active', issue signed JWT cookie
    console.log("[verify] inbound:", JSON.stringify({ email: body.email, t: new Date().toISOString() }));
    return NextResponse.json({
      ok: false,
      pending: true,
      message: "Email-code verification activates in the next deploy. Your signup details were received \u2014 the Aragon Media team will reach out shortly.",
    });
  } catch (e) {
    return NextResponse.json(
      { ok: false, error: e instanceof Error ? e.message : "Bad request" },
      { status: 400 },
    );
  }
}
