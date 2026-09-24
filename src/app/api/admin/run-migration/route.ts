/**
 * GET /api/admin/run-migration
 *
 * Admin-authenticated migration runner. Runs the same Drizzle migrator
 * as /api/admin/migrate but auths via the admin session cookie (owner
 * role required) instead of the MIGRATION_SECRET bearer token.
 *
 * Convenience endpoint for the owner to run pending migrations from a
 * browser tab without having to fish the secret out of Vercel.
 */

import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { migrate } from "drizzle-orm/neon-http/migrator";
import path from "node:path";
import { getAdminRole } from "@/lib/auth/admin-role";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const session = await getAdminRole();
  if (!session) {
    return Response.json({ ok: false, error: "sign in as admin first" }, { status: 401 });
  }
  if (session.role !== "owner") {
    return Response.json({ ok: false, error: "owner-only" }, { status: 403 });
  }
  if (!process.env.DATABASE_URL) {
    return Response.json({ ok: false, error: "DATABASE_URL not set" }, { status: 500 });
  }
  try {
    const sql = neon(process.env.DATABASE_URL);
    const db = drizzle(sql);
    const migrationsFolder = path.join(process.cwd(), "drizzle");
    await migrate(db, { migrationsFolder });
    return Response.json({ ok: true, message: "migration applied", folder: migrationsFolder });
  } catch (err) {
    console.error("[run-migration] failed:", err);
    return Response.json(
      { ok: false, error: err instanceof Error ? err.message : String(err) },
      { status: 500 }
    );
  }
}
