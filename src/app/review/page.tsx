/**
 * /review — Creator Overview.
 * Server wrapper: pulls the current reviewer's linked TikTok accounts
 * so the client can populate the View dropdown + per-account earnings.
 */

import { asc, eq } from "drizzle-orm";
import { db } from "@/db";
import { accounts } from "@/db/schema";
import { getCurrentReviewer } from "@/lib/auth/review-session";
import CreatorOverviewClient from "./CreatorOverviewClient";

export const dynamic = "force-dynamic";

export default async function OverviewPage() {
  const user = (await getCurrentReviewer())!;
  const rows = await db
    .select({ id: accounts.id, handle: accounts.tiktokHandle, status: accounts.status })
    .from(accounts)
    .where(eq(accounts.userId, user.id))
    .orderBy(asc(accounts.createdAt));
  return <CreatorOverviewClient accounts={rows} />;
}
