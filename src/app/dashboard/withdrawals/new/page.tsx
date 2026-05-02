import { desc, eq } from "drizzle-orm";
import Link from "next/link";
import { db } from "@/db";
import { accounts } from "@/db/schema";
import { getCurrentUser } from "@/lib/auth/session";
import WithdrawalFormClient from "./WithdrawalFormClient";

export const dynamic = "force-dynamic";

export default async function WithdrawalNewPage() {
  const user = await getCurrentUser();
  if (!user) return null;

  const myAccounts = await db
    .select({ id: accounts.id, handle: accounts.tiktokHandle, status: accounts.status })
    .from(accounts)
    .where(eq(accounts.userId, user.id))
    .orderBy(desc(accounts.createdAt));

  const contractSigned = !!user.contractSignedAt || !!user.isExistingCreator;

  return (
    <main className="dash-content">
      <header className="dash-page-head">
        <div>
          <p className="dash-eyebrow">Withdrawals</p>
          <h1>Submit a withdrawal request</h1>
          <p className="dash-page-sub">Submit every time you have earnings ready · AM processes payouts Mon to Fri.</p>
        </div>
        <Link href="/dashboard/withdrawals" className="dash-cta ghost">← Back to history</Link>
      </header>

      {!contractSigned && (
        <div className="dash-card preview-banner">
          <div className="preview-banner-pill">Preview · locked until contract signed</div>
          <div className="preview-banner-body">This is what the withdrawal form looks like. It only goes live once you&apos;ve earned your first commission, notified the AM team in chat, and signed the operations agreement. Until then, submit attempts won&apos;t process.</div>
        </div>
      )}

      <WithdrawalFormClient
        userEmail={user.email}
        userName={user.name}
        accounts={myAccounts.map((a) => ({ id: a.id, label: `@${a.handle}`, status: a.status }))}
        gated={!contractSigned}
      />
    </main>
  );
}
