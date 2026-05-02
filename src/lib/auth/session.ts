/**
 * getCurrentUser() — server-only helper that resolves the active creator
 * from the am_session cookie. Returns null if missing/invalid/expired.
 */

import { cookies } from "next/headers";
import { and, eq, gt, isNull } from "drizzle-orm";
import { db } from "@/db";
import { sessions, users } from "@/db/schema";
import { hashSessionToken, SESSION_COOKIE } from "./sessions";

export type CurrentUser = {
  id: string;
  email: string;
  name: string;
  role: "creator" | "brand" | "other";
  handle: string | null;
  isAdmin: boolean;
  createdAt: Date | string;
  verifiedAt: Date | string | null;
  contractSignedAt: Date | string | null;
  contractVersion: string | null;
  contractUnlocked: boolean;
  isExistingCreator: boolean;
};

export async function getCurrentUser(): Promise<CurrentUser | null> {
  const store = await cookies();
  const token = store.get(SESSION_COOKIE)?.value;
  if (!token) return null;

  const tokenHash = hashSessionToken(token);

  const rows = await db
    .select({
      id: users.id,
      email: users.email,
      name: users.name,
      role: users.role,
      handle: users.handle,
      isAdmin: users.isAdmin,
      createdAt: users.createdAt,
      verifiedAt: users.verifiedAt,
      contractSignedAt: users.contractSignedAt,
      contractVersion: users.contractVersion,
      contractUnlocked: users.contractUnlocked,
      isExistingCreator: users.isExistingCreator,
    })
    .from(sessions)
    .innerJoin(users, eq(users.id, sessions.userId))
    .where(
      and(
        eq(sessions.tokenHash, tokenHash),
        isNull(sessions.revokedAt),
        gt(sessions.expiresAt, new Date())
      )
    )
    .limit(1);

  return (rows[0] as CurrentUser | undefined) ?? null;
}
