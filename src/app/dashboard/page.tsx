import { and, desc, eq } from "drizzle-orm";
import { getCurrentUser } from "@/lib/auth/session";
import { db } from "@/db";
import { accounts, purchases } from "@/db/schema";
import OverviewClient from "./OverviewClient";
import { chats, messages } from "@/db/schema";

export const dynamic = "force-dynamic";

export default async function DashboardLanding() {
  const user = await getCurrentUser();
  if (!user) return null;

  const myAccounts = await db
    .select()
    .from(accounts)
    .where(eq(accounts.userId, user.id))
    .orderBy(desc(accounts.createdAt));

  const myPurchases = await db
    .select()
    .from(purchases)
    .where(eq(purchases.userId, user.id))
    .orderBy(desc(purchases.createdAt));

  // Determine current activation step (1-7)
  // 1: Pay activation fee  | 2: Create portal account
  // 3: Submit TikTok login | 4: AM verifies (up to 24h)
  // 5: Start selling on TikTok Shop | 6: Contact AM for payout setup
  // 7: Withdrawal form unlocked
  const hasPaid = myPurchases.some((p) => p.status === "paid");
  const hasActive = myAccounts.some(
    (a) => a.status === "active" || a.status === "verified"
  );
  const hasCredentials = myAccounts.some(
    (a) => a.status === "credentials_received" || a.status === "two_factor_pending" || a.status === "verified" || a.status === "active"
  );
  const hasContract = !!user.contractSignedAt;

  let currentStep = 1; // signed up but unpaid → step 1 (Activate 1st Account) is active
  if (hasPaid) currentStep = 3; // payment done, account auto-created → ready for credentials
  if (hasCredentials) currentStep = 4;
  if (hasActive) currentStep = 5;
  if (hasActive && hasContract) currentStep = 6;
  if (hasActive && hasContract && hasContract) currentStep = 7;
  // Step 8 = first withdrawal paid; we'll wire this off withdrawals.status='paid' once that flow lands

  const firstName = user.name.split(/\s+/)[0] || user.name;
  const activationFeeCents = myPurchases
    .filter((p) => p.status === "paid")
    .reduce((sum, p) => sum + p.amountCents, 0);

  // Grab the latest 5 messages from this creator's chat (if any) so the
  // Overview's inline chat panel reflects the real thread instead of mocks.
  const myChat = (
    await db
      .select({ id: chats.id })
      .from(chats)
      .where(and(eq(chats.userId, user.id), eq(chats.status, "open")))
      .limit(1)
  )[0];
  const recentChatMessages = myChat
    ? (
        await db
          .select({
            id: messages.id,
            sender: messages.sender,
            body: messages.body,
            createdAt: messages.createdAt,
          })
          .from(messages)
          .where(eq(messages.chatId, myChat.id))
          .orderBy(desc(messages.createdAt))
          .limit(5)
      )
        .reverse()
        .map((m) => ({
          id: m.id,
          sender: m.sender,
          body: m.body,
          createdAt:
            typeof m.createdAt === "string"
              ? m.createdAt
              : m.createdAt.toISOString(),
        }))
    : [];

  // Grandfathered creators bypass the activation roadmap entirely — they
  // already have accounts running with AM. Force step 8 (final state) so
  // the roadmap shows complete, and pass an explicit flag so the client
  // can render a 'Welcome back' state instead of the verification cred form.
  const isExisting = !!user.isExistingCreator;
  if (isExisting) currentStep = 8;

  return (
    <OverviewClient
      firstName={firstName}
      currentStep={currentStep}
      hasPaid={hasPaid || isExisting}
      activationFeeCents={activationFeeCents}
      isExistingCreator={isExisting}
      recentChatMessages={recentChatMessages}
    />
  );
}
