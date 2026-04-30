import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Service — Aragon Media",
  description:
    "The Aragon Media Creator Partner Program terms covering verification, pricing, the 20% commission fee, withdrawal flow, and contract enforcement.",
};

export default function TermsPage() {
  return (
    <main className="legal-page">
      <header className="legal-topbar">
        <Link href="/" className="logo" style={{ textDecoration: "none" }}>
          Aragon Media<span>Creator Partner Program</span>
        </Link>
        <nav className="legal-topbar-nav" aria-label="Legal">
          <Link href="/privacy">Privacy</Link>
          <Link href="/terms" className="active">Terms</Link>
          <Link href="/signin">Sign in</Link>
          <Link href="/">&larr; Home</Link>
        </nav>
      </header>

      <article className="legal-shell">
        <div className="legal-eyebrow">Legal · Terms</div>
        <h1 className="legal-h1">Terms of Service</h1>
        <p className="legal-effective">Effective date: April 30, 2026 · Version 1.0</p>

        <p className="legal-intro">
          These Terms govern your use of the Aragon Media Creator Partner Program
          (the &ldquo;Program&rdquo;) and the Portal at kevin-aragon.com and
          aragon-media-portal.vercel.app. By creating an account, paying an activation
          fee, or signing the Operations Agreement, you agree to these Terms. Read them
          carefully — they cover real money, payouts, and your TikTok Shop account.
        </p>

        <section className="legal-section">
          <h2 className="legal-h2"><span className="legal-h2-num">01</span>What we do</h2>
          <p>
            Aragon Media is a TikTok Shop creator-management agency. We register as the
            Approved Partner on your TikTok Shop, perform the verification handshake, and
            then handle commission collection and payouts on your behalf so you can focus
            on content. We are not a TikTok product, not a Square product, and not
            affiliated with either company beyond standard developer access.
          </p>
        </section>

        <section className="legal-section">
          <h2 className="legal-h2"><span className="legal-h2-num">02</span>Eligibility</h2>
          <ul>
            <li>You are at least 18 years old.</li>
            <li>You own or fully control the TikTok account(s) you submit for verification.</li>
            <li>You are legally able to receive payments in the country and currency you provide.</li>
            <li>Your TikTok content does not violate TikTok&apos;s Community Guidelines or applicable law.</li>
          </ul>
        </section>

        <section className="legal-section">
          <h2 className="legal-h2"><span className="legal-h2-num">03</span>Account creation &amp; verification flow</h2>
          <p>The order lifecycle inside the Portal is:</p>
          <ul>
            <li>Sign up free with email + 6-digit verification code.</li>
            <li>Pay the activation fee per account via Square.</li>
            <li>An order opens automatically with a 1-on-1 chat thread between you and the AM team.</li>
            <li>Submit your TikTok login credentials in the dedicated form on the order.</li>
            <li>Share the live 6-digit TikTok 2FA code in chat when prompted.</li>
            <li>The AM team performs verification and uploads four screenshots confirming success.</li>
            <li>You sign out / remove our device, and click-to-sign the Operations Agreement.</li>
            <li>The Withdrawal Form unlocks. You report commissions and request payouts.</li>
          </ul>
          <p>
            You agree to participate in this loop in good faith. Submitting fake credentials,
            blocking access, or refusing to sign the Operations Agreement after the AM team
            has invested time in verification may result in forfeiture of the activation fee.
          </p>
        </section>

        <section className="legal-section">
          <h2 className="legal-h2"><span className="legal-h2-num">04</span>Pricing &amp; the 4-account cycle</h2>
          <p>
            The Program is structured in <strong>cycles of four accounts</strong>. Within
            each cycle, two purchase paths are available:
          </p>
          <ul>
            <li><strong>Path A (incremental):</strong> $103.72 → $125 → $150 → $175 (per the next account in the cycle).</li>
            <li><strong>Path B (pre-order bundle):</strong> 1 acct $103.72 · 2 accts $225 · 3 accts $350 · 4 accts $475.</li>
          </ul>
          <p>
            Once you have completed the fourth account in a cycle, the counter resets to
            zero and pricing restarts at $103.72 for the next cycle. Path B is unavailable
            mid-cycle to prevent loophole stacking; switch to Path A for the remaining
            slots in your current cycle.
          </p>
          <div className="legal-callout">
            All prices are in USD, charged via Square at checkout. <strong>Activation
            fees are non-refundable</strong> once the AM team has begun the verification
            process (i.e., once you have submitted credentials or your 2FA code in chat).
          </div>
        </section>

        <section className="legal-section">
          <h2 className="legal-h2"><span className="legal-h2-num">05</span>Commission fee — 20%, locked for life</h2>
          <p>
            Aragon Media&apos;s service fee is <strong>20% of TikTok Shop commissions
            collected on your behalf</strong>. For all creators signing the Operations
            Agreement on or after April 21, 2026, this rate is locked permanently and
            will never increase for the life of your relationship with the Agency. The
            exact fee percentage is recorded on each signed contract version, so each
            creator carries their own rate forward.
          </p>
        </section>

        <section className="legal-section">
          <h2 className="legal-h2"><span className="legal-h2-num">06</span>Withdrawals — the 48-hour rule</h2>
          <p>How payouts work:</p>
          <ul>
            <li>Commissions accumulate on TikTok&apos;s side, tied to the Aragon Media banking info used during verification.</li>
            <li>You initiate the withdrawal from inside TikTok Shop. Funds land in our account.</li>
            <li>Within <strong>48 hours of that TikTok withdrawal</strong>, you must submit the Withdrawal Form in the Portal: amount, date, source account, screenshot proof, and your bank/payout info.</li>
            <li>We process payouts manually Monday through Friday and send your share (commission minus 20% fee) to the payout method you provided.</li>
            <li>There is no minimum balance — withdraw any positive amount.</li>
          </ul>
          <div className="legal-callout">
            <strong>Grace Period Policy:</strong> If a Withdrawal Form is submitted more
            than 48 hours after the TikTok-side withdrawal, the Agency reserves the right
            to retain the full value of that transaction. The Portal will flag late
            submissions but still allow them; whether to honor or retain is at the
            Agency&apos;s discretion. This rule exists because late or missing forms make
            it nearly impossible to reconcile incoming funds with the right creator.
          </div>
        </section>

        <section className="legal-section">
          <h2 className="legal-h2"><span className="legal-h2-num">07</span>Your responsibilities</h2>
          <ul>
            <li><strong>Change your TikTok password</strong> once verification is complete and we&apos;ve confirmed our device is signed out. We strongly recommend it.</li>
            <li>Keep your portal email + payout info up to date.</li>
            <li>Submit Withdrawal Forms on time, with accurate screenshots.</li>
            <li>Do not share your portal account, your TikTok credentials, or the 1-on-1 chat thread with anyone outside Aragon Media.</li>
            <li>Do not attempt to circumvent the cycle pricing structure (e.g., creating multiple portal accounts to reset pricing).</li>
            <li>Comply with all TikTok Community Guidelines, FTC disclosure requirements (#ad, #sponsored), and applicable tax law.</li>
          </ul>
        </section>

        <section className="legal-section">
          <h2 className="legal-h2"><span className="legal-h2-num">08</span>Operations Agreement</h2>
          <p>
            After the AM team confirms verification, you will be prompted to click-to-sign
            the Operations Agreement inside the Portal. Until you sign, your Withdrawal
            Form remains locked. The signed agreement records the timestamp, your IP
            address, browser/device fingerprint, and the contract version, and is the
            controlling document for the commercial relationship. These Terms continue to
            apply alongside the Operations Agreement; if there is a conflict, the
            Operations Agreement controls.
          </p>
        </section>

        <section className="legal-section">
          <h2 className="legal-h2"><span className="legal-h2-num">09</span>Termination</h2>
          <p>
            Either party may terminate the relationship at any time:
          </p>
          <ul>
            <li><strong>You can leave</strong> by emailing aragonkevin239@gmail.com with the subject &ldquo;Offboarding — [your name]&rdquo;. We will pay out any verified outstanding balances within 30 days.</li>
            <li><strong>We may terminate</strong> for material breach (fraud, fake credentials, FTC violation, repeated late Withdrawal Forms, abuse of the AM team, or violation of TikTok&apos;s Terms). Material-breach termination forfeits unpaid balances tied to the breach.</li>
          </ul>
          <p>
            On termination, we stop accepting new orders, sign out of your TikTok Shop
            account if still connected, and process the final withdrawal.
          </p>
        </section>

        <section className="legal-section">
          <h2 className="legal-h2"><span className="legal-h2-num">10</span>Disclaimers &amp; limitation of liability</h2>
          <p>
            We do not guarantee any level of TikTok Shop revenue, follower growth, or
            verification turnaround. TikTok controls its platform and may change rules,
            commission rates, or eligibility at any time. The Portal is provided
            &ldquo;as is.&rdquo; To the maximum extent permitted by law, Aragon Media&apos;s
            total liability for any claim arising from these Terms is capped at the total
            activation fees you have paid to us in the 12 months preceding the claim.
          </p>
        </section>

        <section className="legal-section">
          <h2 className="legal-h2"><span className="legal-h2-num">11</span>Governing law &amp; disputes</h2>
          <p>
            These Terms are governed by the laws of the State of Wyoming, USA, without
            regard to conflict-of-laws rules. Any dispute will be resolved in the state
            or federal courts of Sheridan County, Wyoming. You and we both waive jury
            trial and may not bring claims as part of a class action.
          </p>
        </section>

        <section className="legal-section">
          <h2 className="legal-h2"><span className="legal-h2-num">12</span>Changes to these Terms</h2>
          <p>
            If we make material changes, we will email every active creator at least 14
            days before they take effect, and post the change history on this page. If you
            disagree, you may terminate per Section 9 before the change takes effect.
          </p>
        </section>

        <div className="legal-foot">
          <span><strong>Aragon Media</strong> · 1309 Coffeen Ave, Sheridan, WY 82801</span>
          <span>Questions? <a href="mailto:aragonkevin239@gmail.com">aragonkevin239@gmail.com</a></span>
          <span>See also: <Link href="/privacy">Privacy Policy</Link></span>
        </div>
      </article>
    </main>
  );
}
