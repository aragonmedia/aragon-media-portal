import Link from "next/link";
import { desc, eq } from "drizzle-orm";
import { db } from "@/db";
import { agreements } from "@/db/schema";
import { getCurrentUser } from "@/lib/auth/session";
import AgreementBody from "./AgreementBody";
import SignForm from "./SignForm";
import { CONTRACT_VERSION } from "./constants";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Operations Agreement — Aragon Media",
};

export default async function AgreementPage() {
  const user = await getCurrentUser();
  if (!user) return null;

  // Already signed? Pull the most recent agreement row to show the receipt.
  const signed = user.contractSignedAt
    ? (
        await db
          .select()
          .from(agreements)
          .where(eq(agreements.userId, user.id))
          .orderBy(desc(agreements.signedAt))
          .limit(1)
      )[0]
    : null;

  const unlocked = !!user.contractUnlocked;

  return (
    <main className="dash-content">
      <header className="dash-page-head">
        <div>
          <p className="dash-eyebrow">Legal · Operations Agreement</p>
          <h1>Your agreement with Aragon Media</h1>
          <p className="dash-page-sub">
            One mutually-binding document that secures your right to receive
            commissions and the Agency&apos;s right to collect its 20% fee. Read
            it carefully before signing.
          </p>
        </div>
        <Link href="/dashboard" className="dash-cta ghost">
          ← Back to dashboard
        </Link>
      </header>

      {/* STATE 3 — already signed. Show receipt-style confirmation. */}
      {signed && (
        <section className="dash-card agr-signed-card">
          <div className="agr-signed-pill">✓ Signed</div>
          <h2 className="agr-signed-title">You signed this agreement</h2>
          <div className="agr-signed-grid">
            <div className="agr-signed-field">
              <div className="agr-field-label">Signature</div>
              <div className="agr-field-value">{signed.signature}</div>
            </div>
            <div className="agr-signed-field">
              <div className="agr-field-label">Signed on</div>
              <div className="agr-field-value">
                {new Date(signed.signedAt).toLocaleString("en-US", {
                  dateStyle: "long",
                  timeStyle: "short",
                })}
              </div>
            </div>
            <div className="agr-signed-field">
              <div className="agr-field-label">Contract version</div>
              <div className="agr-field-value">{signed.contractVersion}</div>
            </div>
          </div>
          <p className="agr-signed-foot">
            A copy of this agreement is on file with Aragon Media. The full text
            you agreed to ({signed.contractVersion}) is shown below for your
            records.
          </p>
        </section>
      )}

      {/* STATE 1 — locked, not yet unlocked by AM team */}
      {!signed && !unlocked && (
        <section className="dash-card agr-locked-card">
          <div className="agr-locked-pill">🔒 Locked</div>
          <h2 className="agr-locked-title">
            Your Operations Agreement isn&apos;t open yet
          </h2>
          <p className="agr-locked-body">
            The Agency unlocks this agreement once your TikTok account is fully
            verified and your verification screenshots are on file. The full
            text is shown below so you know what to expect — but the{" "}
            <strong>Sign</strong> button stays inactive until the team flips
            this open in the portal.
          </p>
          <Link href="/dashboard/chat" className="dash-cta">
            Notify AM Team in chat →
          </Link>
        </section>
      )}

      {/* STATE 2 — unlocked, ready to sign */}
      {!signed && unlocked && (
        <section className="dash-card agr-ready-card">
          <div className="agr-ready-pill">Ready to sign</div>
          <h2 className="agr-ready-title">
            Read the agreement, then sign at the bottom
          </h2>
          <p className="agr-ready-body">
            The Agency has confirmed your account is verified and unlocked your
            agreement. Read each section carefully. Once you sign, your
            withdrawals form opens and you can request payouts at any time.
          </p>
        </section>
      )}

      {/* Contract body — always visible so the creator can read the text
          regardless of state. */}
      <section className="dash-card agr-doc">
        <AgreementBody creatorName={user.name} />
      </section>

      {/* Sign form — only renders for state 2 (unlocked + unsigned). */}
      {!signed && unlocked && (
        <section className="dash-card agr-sign-card">
          <SignForm
            defaultName={user.name}
            contractVersion={CONTRACT_VERSION}
          />
        </section>
      )}

      {/* Locked state's disabled mock so the creator sees what the
          signing flow will look like once unlocked. */}
      {!signed && !unlocked && (
        <section className="dash-card agr-sign-card agr-sign-card-locked">
          <div className="agr-sign-locked-banner">
            🔒 Sign panel is locked. The AM Team will unlock this once your
            account is verified.
          </div>
          <SignForm
            defaultName={user.name}
            contractVersion={CONTRACT_VERSION}
            disabled
          />
        </section>
      )}
    </main>
  );
}
