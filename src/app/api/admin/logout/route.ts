import { clearAdminCookie } from "@/lib/auth/admin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST() {
  await clearAdminCookie();
  return Response.json({ ok: true });
}
