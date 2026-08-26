/**
 * /accounts — TikTok Affiliate Accelerator — public account listings.
 *
 * Fully public. Renders from the accelerator_accounts cache. UI matches
 * the wolf-branded dark aesthetic (separate from the Aragon Media
 * portal styling — this is Roni's brand, futuristic + red/black).
 *
 * Refresh button re-reads the cache (no live Discord API hit).
 * Top-right CTA opens the Discord ticket channel in a new tab.
 */

import { asc } from "drizzle-orm";
import { db } from "@/db";
import { acceleratorAccounts, acceleratorSyncs } from "@/db/schema";
import { desc, isNull } from "drizzle-orm";
import AccountsClient from "./AccountsClient";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export const metadata = {
  title: "TikTok Affiliate Accelerator · Live Accounts",
  description:
    "Live listings of US TikTok Shop affiliate accounts available through the Accelerator program. Powered by Aragon Media × Accelerator.",
  openGraph: {
    title: "US TikTok Shop From Anywhere · TikTok Affiliate Accelerator",
    description:
      "The operating system for creators outside the US to earn USD commissions. 500+ creators activated. 100% activation rate. 24hr setup.",
    type: "website",
    siteName: "TikTok Affiliate Accelerator",
  },
  twitter: {
    card: "summary_large_image",
    title: "US TikTok Shop From Anywhere · TikTok Affiliate Accelerator",
    description:
      "The operating system for creators outside the US to earn USD commissions. 500+ creators activated. 100% activation rate.",
  },
};

// Ticket channel URL (Nick G's Discord). Env override wins so we
// don't have to redeploy if the channel moves.
const TICKET_URL =
  process.env.ACCELERATOR_TICKET_URL ??
  "https://discord.com/channels/1244370367493963837/1382956924303183933";
const LIVE_LIST_URL =
  process.env.ACCELERATOR_LIVE_LIST_URL ??
  "https://discord.com/channels/1244370367493963837/1244789011109642330";

export default async function AccountsPage() {
  const [rows, lastSuccess] = await Promise.all([
    db
      .select()
      .from(acceleratorAccounts)
      .orderBy(asc(acceleratorAccounts.position), asc(acceleratorAccounts.handle)),
    db
      .select()
      .from(acceleratorSyncs)
      .where(isNull(acceleratorSyncs.error))
      .orderBy(desc(acceleratorSyncs.createdAt))
      .limit(1),
  ]);

  return (
    <AccountsClient
      initialAccounts={rows.map((r) => ({
        id: r.id,
        handle: r.handle,
        tiktokUrl: r.tiktokUrl,
        accountType: r.accountType,
        followers: r.followers,
        priceCents: r.priceCents,
        originalPriceCents: r.originalPriceCents,
      }))}
      lastSyncedAt={lastSuccess[0]?.createdAt?.toISOString() ?? null}
      ticketUrl={TICKET_URL}
      liveListUrl={LIVE_LIST_URL}
    />
  );
}
