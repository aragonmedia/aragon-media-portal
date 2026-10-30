/**
 * /colt/accounts. TTSUnlocked-branded accounts marketplace.
 *
 * Same backend as /accounts (same bot, same Neon cache, same
 * accelerator_accounts table). The only differences:
 *   - Wrapped in .colt-shell so the palette turns neon blue
 *   - Attribution tags leads with accelerator=colt before Discord
 *
 * Shares Nick G's Discord ticket URL. one bot, one inventory,
 * two branded surfaces.
 */

import { asc, desc, isNull } from "drizzle-orm";
import { db } from "@/db";
import { acceleratorAccounts, acceleratorSyncs } from "@/db/schema";
import AccountsClient from "../../accounts/AccountsClient";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export const metadata = {
  title: "TTSUnlocked · Live Accounts",
  description: "Live TikTok Shop account inventory for TTSUnlocked members. Powered by COLT.",
};

const TICKET_URL = process.env.ACCELERATOR_TICKET_URL ??
  "https://discord.com/channels/1244370367493963837/1382956924303183933";
const LIVE_LIST_URL = process.env.ACCELERATOR_LIVE_LIST_URL ??
  "https://discord.com/channels/1244370367493963837/1244789011109642330";

export default async function ColtAccountsPage() {
  const [rows, lastSuccess] = await Promise.all([
    db.select().from(acceleratorAccounts)
      .orderBy(asc(acceleratorAccounts.position), asc(acceleratorAccounts.handle)),
    db.select().from(acceleratorSyncs)
      .where(isNull(acceleratorSyncs.error))
      .orderBy(desc(acceleratorSyncs.createdAt)).limit(1),
  ]);

  return (
    <AccountsClient
      initialAccounts={rows.map((r) => ({
        id: r.id, handle: r.handle, tiktokUrl: r.tiktokUrl,
        accountType: r.accountType, followers: r.followers,
        priceCents: r.priceCents, originalPriceCents: r.originalPriceCents,
      }))}
      lastSyncedAt={lastSuccess[0]?.createdAt?.toISOString() ?? null}
      ticketUrl={TICKET_URL}
      liveListUrl={LIVE_LIST_URL}
    />
  );
}
