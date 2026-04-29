/**
 * Drizzle DB client for Aragon Media Portal.
 * Uses @neondatabase/serverless HTTP driver — works in Vercel serverless &
 * edge runtimes without connection pool overhead.
 *
 * Reads DATABASE_URL injected by Vercel/Neon Storage. Re-uses one client
 * across hot lambdas via the global symbol cache.
 */

import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "./schema";

const globalCache = globalThis as unknown as {
  __aragon_db?: ReturnType<typeof drizzle<typeof schema>>;
};

function buildClient() {
  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error(
      "DATABASE_URL is not set. Connect Neon via Vercel Storage tab."
    );
  }
  const sql = neon(url);
  return drizzle(sql, { schema });
}

export const db = globalCache.__aragon_db ?? (globalCache.__aragon_db = buildClient());
export { schema };
