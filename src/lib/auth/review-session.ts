/**
 * getCurrentReviewer() — server-only resolver for the active demo user
 * from the am_review cookie. Returns null if missing/invalid, or if the
 * cookie points to a non-demo user (defense in depth).
 */

import { and, eq } from "drizzle-orm";
import { db } from "@/db";
import { users } from "@/db/schema";
import { getReviewUserId } from "./review";

export type CurrentReviewer = {
  id: string;
  email: string;
  name: string;
  role: "creator" | "brand" | "other";
  handle: string | null;
  isAdmin: boolean;
  isDemo: boolean;
  createdAt: Date | string;
  contractSignedAt: Date | string | null;
};

export async function getCurrentReviewer(): Promise<CurrentReviewer | null> {
  const userId = await getReviewUserId();
  if (!userId) return null;

  const rows = await db
    .select({
      id: users.id,
      email: users.email,
      name: users.name,
      role: users.role,
      handle: users.handle,
      isAdmin: users.isAdmin,
      isDemo: users.isDemo,
      createdAt: users.createdAt,
      contractSignedAt: users.contractSignedAt,
    })
    .from(users)
    .where(and(eq(users.id, userId), eq(users.isDemo, true)))
    .limit(1);

  return (rows[0] as CurrentReviewer | undefined) ?? null;
}
