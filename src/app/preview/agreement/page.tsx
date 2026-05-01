import Link from "next/link";
import AgreementBody from "@/app/dashboard/agreement/AgreementBody";
import { CONTRACT_VERSION } from "@/app/dashboard/agreement/constants";

export const dynamic = "force-static";

export const metadata = {
  title: "Operations Agreement preview — Aragon Media",
};

const SAMPLE_NAME = "Kevin Aragon";
const SAMPLE_SIGNED_AT = new Date("2026-04-30T18:14:00Z");

export default function PreviewAgreementPage() {
  return (
    <main className="dash-content">
      <header className="dash-page-head">
        <div>
          <p className="dash-eyebrow">Legal · Operations Agreement</p>
          <h1>Your agreement with Aragon Media</h1>
          <p className="dash-page-sub">
            One mutually-binding document that secures your right to receive
            commissions and the Agency&apos;s right to collect its 20% fee.
          </p>
        </div>
        <Link href="/" className="dash-cta ghost">
          ← Home
        </Link>
      </header>

      <div className="dash-card preview-banner">
        <div className="preview-banner-pill">Preview · all 3 states stacked</div>
        <div className="preview-banner-body">
          On the live page only one state appears at a time depending on
          whether the AM team has unlocked the agreement and whether the
          creator has signed it. Here all three are stacked so you can compare
          the look.
        </div>
      </div>

      {/* Top-of-page importance callout (always visible on real page). */}
      <div className="dash-card agr-importance">
        <span className="agr-importance-pill">Important</span>
        <p>
          This Operations Agreement <strong>must be signed before you can
          receive your first payment</strong>. Once it&apos;s signed, your
          withdrawal form unlocks immediately and you&apos;ll be able to
          submit your first request.
        </p>
      </div>

      {/* STATE 1 — locked */}
      <section className="dash-card agr-locked-card">
        <div className="agr-locked-pill">🔒 Locked</div>
        <h2 className="agr-locked-title">
          Your Operations Agreement isn&apos;t open yet
        </h2>
        <p className="agr-locked-body">
          The Agency unlocks this agreement once your TikTok account is fully
          verified and your verification screenshots are on file. The full text
          is shown below so you know what to expect — but the{" "}
          <strong>Sign</strong> button stays inactive until the team flips this
          open in the portal.
        </p>
        <span className="dash-cta" style={{ alignSelf: "flex-start" }}>
          Notify AM Team in chat →
        </span>
      </section>

      {/* STATE 2 — unlocked, ready to sign */}
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

      {/* STATE 3 — signed */}
      <section className="dash-card agr-signed-card">
        <div className="agr-signed-pill">✓ Signed</div>
        <h2 className="agr-signed-title">You signed this agreement</h2>
        <div className="agr-signed-grid">
          <div className="agr-signed-field">
            <div className="agr-field-label">Signature</div>
            <div className="agr-field-value">{SAMPLE_NAME}</div>
          </div>
          <div className="agr-signed-field">
            <div className="agr-field-label">Signed on</div>
            <div className="agr-field-value">
              {SAMPLE_SIGNED_AT.toLocaleString("en-US", {
                dateStyle: "long",
                timeStyle: "short",
              })}
            </div>
          </div>
          <div className="agr-signed-field">
            <div className="agr-field-label">Contract version</div>
            <div className="agr-field-value">{CONTRACT_VERSION}</div>
          </div>
        </div>
        <p className="agr-signed-foot">
          A copy of this agreement is on file with Aragon Media. The full text
          you agreed to ({CONTRACT_VERSION}) is shown below for your records.
        </p>
      </section>

      {/* The contract text itself — always visible regardless of state */}
      <section className="dash-card agr-doc">
        <AgreementBody creatorName={SAMPLE_NAME} />
      </section>

      {/* STATE 4 mock — what the creator sees right after they click sign */}
      <section className="dash-card agr-postsign-card">
        <div className="agr-postsign-pill">✓ All set — withdrawals unlocked</div>
        <h2 className="agr-postsign-title">You can now submit withdrawals</h2>
        <p className="agr-postsign-body">
          Your form is open. The AM Team has been notified you signed and is
          standing by for your first submission. If anything looks off,
          refresh the page and the new state should appear.
        </p>
        <div className="agr-postsign-actions">
          <Link href="/preview/receipt" className="dash-cta">
            Submit your 1st withdrawal →
          </Link>
          <Link href="/preview/withdrawals" className="dash-cta ghost">
            View receipts
          </Link>
        </div>
      </section>

      {/* Sign panel mock — shown unlocked here so Kevin can preview the field */}
      <section className="dash-card agr-sign-card">
        <div className="agr-sign-form">
          <label className="agr-sign-label">
            <span>Sign here — type your full legal name</span>
            <input
              className="settings-input agr-sign-input"
              type="text"
              defaultValue={SAMPLE_NAME}
              readOnly
            />
            <span className="field-note">
              This typed name is your legally enforceable mark on contract
              version <strong>{CONTRACT_VERSION}</strong>.
            </span>
          </label>
          <label className="agr-sign-confirm">
            <input type="checkbox" defaultChecked readOnly />
            <span>
              I&apos;ve read every section above and agree to be bound by this
              Operations Agreement.
            </span>
          </label>
          <div className="settings-actions">
            <span className="dash-cta" style={{ pointerEvents: "none" }}>
              Sign Operations Agreement
            </span>
          </div>
        </div>
      </section>
    </main>
  );
}
