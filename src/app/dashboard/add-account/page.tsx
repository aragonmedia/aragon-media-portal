import { eq, and } from "drizzle-orm";
import { db } from "@/db";
import { purchases } from "@/db/schema";
import { getCurrentUser } from "@/lib/auth/session";
import AddAccountClient from "./AddAccountClient";

export const dynamic = "force-dynamic";

export default async function AddAccountPage() {
  const user = await getCurrentUser();
  if (!user) return null;

  // Count paid purchases that count toward the current cycle.
  // Path A purchases (path_a_1) and Path B bundle purchases all count.
  // For simplicity in v1: total paid count modulo 4 = current position.
  // Once 4 reached, cycle resets visually via the "cycle complete" state.
  const allPaid = await db
    .select({ tier: purchases.tier, amount: purchases.amountCents })
    .from(purchases)
    .where(and(eq(purchases.userId, user.id), eq(purchases.status, "paid")));

  // Path A counts as 1 account each; Path B bundles count as their tier number.
  let totalAccounts = 0;
  for (const p of allPaid) {
    if (p.tier === "path_b_4") totalAccounts += 4;
    else if (p.tier === "path_b_3") totalAccounts += 3;
    else if (p.tier === "path_b_2") totalAccounts += 2;
    else if (p.tier === "path_b_1") totalAccounts += 1;
    else if (p.tier === "path_a_1") totalAccounts += 1;
  }

  // Cycle position 1..4. After 4, we wrap back to 1 for the next cycle.
  const cyclePosition = totalAccounts % 4; // 0..3
  const cycleNumber = Math.floor(totalAccounts / 4) + 1;
  const cycleComplete = totalAccounts > 0 && totalAccounts % 4 === 0;

  return (
    <AddAccountClient
      paidInCycle={cyclePosition}      // 0..3 (how many of the current cycle's 4 are paid)
      cycleNumber={cycleNumber}
      cycleComplete={cycleComplete}
      totalAccounts={totalAccounts}
    />
  );
}
