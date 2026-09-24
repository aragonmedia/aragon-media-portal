/**
 * /admin/accelerator — manual paste-in bridge until the Discord bot
 * is authorized in Roni's server. Kevin (or an AM operator) copies the
 * daily-edited channel message from Discord, pastes it here, hits
 * Sync, and the public /accounts page updates instantly.
 *
 * Admin-only route (am_admin cookie). Also visible to reviewers only
 * behind the admin cookie — no leakage.
 */

import { desc } from "drizzle-orm";
import { db } from "@/db";
import { acceleratorAccounts, acceleratorSyncs } from "@/db/schema";
import PasteClient from "./PasteClient";
import { requireAdminRole } from "@/lib/auth/admin-role";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export default async function AdminAcceleratorPage() {
  await requireAdminRole(["owner"]);
  const [rows, recentSyncs] = await Promise.all([
    db.select().from(acceleratorAccounts).orderBy(desc(acceleratorAccounts.lastSeenAt)),
    db.select().from(acceleratorSyncs).orderBy(desc(acceleratorSyncs.createdAt)).limit(10),
  ]);

  return (
    <PasteClient
      currentCount={rows.length}
      recentSyncs={recentSyncs.map((s) => ({
        id: s.id,
        source: s.source,
        rowsParsed: s.rowsParsed,
        rowsUpserted: s.rowsUpserted,
        rowsRemoved: s.rowsRemoved,
        error: s.error,
        createdAt: s.createdAt.toISOString(),
      }))}
    />
  );
}
