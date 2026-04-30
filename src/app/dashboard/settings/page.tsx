import { desc, eq } from "drizzle-orm";
import { db } from "@/db";
import { accounts } from "@/db/schema";
import { getCurrentUser } from "@/lib/auth/session";
import SettingsClient from "./SettingsClient";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const user = await getCurrentUser();
  if (!user) return null;

  const tiktokAccounts = await db
    .select({
      id: accounts.id,
      tiktokHandle: accounts.tiktokHandle,
      status: accounts.status,
      cycleNumber: accounts.cycleNumber,
      cyclePosition: accounts.cyclePosition,
      createdAt: accounts.createdAt,
      verifiedAt: accounts.verifiedAt,
    })
    .from(accounts)
    .where(eq(accounts.userId, user.id))
    .orderBy(desc(accounts.createdAt));

  return (
    <SettingsClient
      initial={{
        email: user.email,
        name: user.name,
        handle: user.handle ?? "",
        role: user.role,
        verifiedAt: user.verifiedAt ? new Date(user.verifiedAt).toLocaleDateString() : null,
        createdAt: new Date(user.createdAt).toLocaleDateString(),
        contractSignedAt: user.contractSignedAt
          ? new Date(user.contractSignedAt).toLocaleDateString()
          : null,
      }}
      tiktokAccounts={tiktokAccounts.map((a) => ({
        id: a.id,
        handle: a.tiktokHandle,
        status: a.status,
        cycleLabel: `Cycle ${a.cycleNumber} · #${a.cyclePosition}`,
        createdAt: new Date(a.createdAt).toLocaleDateString(),
        verifiedAt: a.verifiedAt ? new Date(a.verifiedAt).toLocaleDateString() : null,
      }))}
    />
  );
}
