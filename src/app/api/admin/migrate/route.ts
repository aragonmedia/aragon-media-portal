/**
 * One-shot migration runner. Reads ./drizzle/*.sql files and applies them.
 *
 * Auth: Authorization: Bearer <MIGRATION_SECRET>
 *
 * Usage (after env vars set on Vercel + redeploy):
 *   curl -X POST https://aragon-media-portal.vercel.app/api/admin/migrate \
 *        -H "Authorization: Bearer <secret>"
 *
 * This route is idempotent — Drizzle's migrator tracks applied migrations in
 * its __drizzle_migrations table so re-running is safe.
 */

import { NextRequest } from "next/server";
import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { migrate } from "drizzle-orm/neon-http/migrator";
import path from "node:path";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const auth = req.headers.get("authorization") ?? "";
  const secret = process.env.MIGRATION_SECRET;

  if (!secret) {
    return Response.json(
      { ok: false, error: "MIGRATION_SECRET not set on this deployment" },
      { status: 500 }
    );
  }
  if (auth !== `Bearer ${secret}`) {
    return Response.json({ ok: false, error: "unauthorized" }, { status: 401 });
  }
  if (!process.env.DATABASE_URL) {
    return Response.json(
      { ok: false, error: "DATABASE_URL not set" },
      { status: 500 }
    );
  }

  try {
    const sql = neon(process.env.DATABASE_URL);
    const db = drizzle(sql);
    const migrationsFolder = path.join(process.cwd(), "drizzle");
    await migrate(db, { migrationsFolder });
    return Response.json({
      ok: true,
      message: "migration applied",
      folder: migrationsFolder,
    });
  } catch (err) {
    console.error("[migrate] failed:", err);
    return Response.json(
      {
        ok: false,
        error: err instanceof Error ? err.message : String(err),
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  return Response.json({
    ok: true,
    hint: "POST with Authorization: Bearer <MIGRATION_SECRET> to run migrations",
  });
}
