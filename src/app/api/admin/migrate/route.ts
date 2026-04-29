/**
 * One-shot migration runner. Reads ./drizzle/*.sql files and applies them.
 *
 * Auth: Authorization: Bearer <MIGRATION_SECRET>  (POST)
 *       OR  ?secret=<MIGRATION_SECRET>             (GET, for tools without
 *                                                   header support)
 *
 * Idempotent — Drizzle tracks applied migrations server-side.
 */

import { NextRequest } from "next/server";
import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { migrate } from "drizzle-orm/neon-http/migrator";
import path from "node:path";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

async function runMigration() {
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

export async function POST(req: NextRequest) {
  const auth = req.headers.get("authorization") ?? "";
  const secret = process.env.MIGRATION_SECRET;
  if (!secret) {
    return Response.json(
      { ok: false, error: "MIGRATION_SECRET not set" },
      { status: 500 }
    );
  }
  if (auth !== `Bearer ${secret}`) {
    return Response.json({ ok: false, error: "unauthorized" }, { status: 401 });
  }
  return runMigration();
}

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const querySecret = url.searchParams.get("secret");
  const secret = process.env.MIGRATION_SECRET;

  if (!querySecret) {
    return Response.json({
      ok: true,
      hint: "POST with Authorization: Bearer <MIGRATION_SECRET>, or GET with ?secret=...",
    });
  }
  if (!secret) {
    return Response.json(
      { ok: false, error: "MIGRATION_SECRET not set" },
      { status: 500 }
    );
  }
  if (querySecret !== secret) {
    return Response.json({ ok: false, error: "unauthorized" }, { status: 401 });
  }
  return runMigration();
}
