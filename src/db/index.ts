/**
 * Drizzle DB client for Aragon Media Portal.
 * Uses @neondatabase/serverless HTTP driver — works in Vercel serverless &
 * edge runtimes without connection pool overhead.
 *
 * Lazy proxy: the client is built on first property access, not at import
 * time, so `next build` page-data collection (where DATABASE_URL isn't
 * present) doesn't crash.
 */

import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "./schema";

type Db = ReturnType<typeof drizzle<typeof schema>>;

const globalCache = globalThis as unknown as { __aragon_db?: Db };

function buildClient(): Db {
  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error("DATABASE_URL is not set. Connect Neon via Vercel Storage tab.");
  }
  const sql = neon(url);
  return drizzle(sql, { schema });
}

function getDb(): Db {
  return globalCache.__aragon_db ?? (globalCache.__aragon_db = buildClient());
}

// Lazy proxy — only instantiates on first property access (e.g. db.select(...))
export const db = new Proxy({} as Db, {
  get(_t, prop, recv) {
    const real = getDb() as unknown as Record<string | symbol, unknown>;
    const v = real[prop as string];
    return typeof v === "function" ? (v as (...a: unknown[]) => unknown).bind(real) : v;
  },
});

export { schema };
