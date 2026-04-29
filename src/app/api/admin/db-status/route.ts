/**
 * Read-only DB inspection. Returns the public-schema tables, row counts, and
 * the enum types defined. Bearer-secret protected (same secret as migrate).
 *
 * Usage: GET /api/admin/db-status?secret=<MIGRATION_SECRET>
 */

import { NextRequest } from "next/server";
import { neon } from "@neondatabase/serverless";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type TableRow = { table_name: string };
type EnumRow = { enum_name: string; values: string };
type CountRow = { count: string };

export async function GET(req: NextRequest) {
  const secret = process.env.MIGRATION_SECRET;
  const querySecret = new URL(req.url).searchParams.get("secret");

  if (!secret) {
    return Response.json(
      { ok: false, error: "MIGRATION_SECRET not set" },
      { status: 500 }
    );
  }
  if (querySecret !== secret) {
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

    const tables = (await sql`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
      ORDER BY table_name
    `) as TableRow[];

    const enums = (await sql`
      SELECT t.typname AS enum_name,
             string_agg(e.enumlabel, ',' ORDER BY e.enumsortorder) AS values
      FROM pg_type t
      JOIN pg_enum e ON t.oid = e.enumtypid
      JOIN pg_namespace n ON n.oid = t.typnamespace
      WHERE n.nspname = 'public'
      GROUP BY t.typname
      ORDER BY t.typname
    `) as EnumRow[];

    const counts: Record<string, number> = {};
    for (const t of tables) {
      if (t.table_name.startsWith("__drizzle")) continue;
      const rows = (await sql(
        `SELECT count(*)::text AS count FROM "${t.table_name}"`
      )) as CountRow[];
      counts[t.table_name] = Number(rows[0]?.count ?? 0);
    }

    return Response.json({
      ok: true,
      tables: tables.map((t) => t.table_name),
      counts,
      enums: enums.map((e) => ({
        name: e.enum_name,
        values: e.values.split(","),
      })),
    });
  } catch (err) {
    console.error("[db-status] failed:", err);
    return Response.json(
      { ok: false, error: err instanceof Error ? err.message : String(err) },
      { status: 500 }
    );
  }
}
