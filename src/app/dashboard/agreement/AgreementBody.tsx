// Pure JSX block — renders the v1.0.0 contract text.
// Kept in its own component so the same body is shown on the live page,
// the public preview, and (later) the PDF generator.
import { CONTRACT_VERSION } from "./constants";

export default function AgreementBody({ creatorName }: { creatorName?: string }) {
  return (
    <div className="agr-body">
      <div className="agr-meta-line">
        <span>
          Aragon Media Operations Agreement · <strong>{CONTRACT_VERSION}</strong>
        </span>
        <span>Effective from the date of signature below</span>
      </div>

      <p>
        This Operations Agreement (the &ldquo;Agreement&rdquo;) is entered into by
        and between <strong>Aragon Media</strong>, a creator-management agency
        (&ldquo;Agency&rdquo;), and{" "}
        <strong>{creatorName ? creatorName : "the undersigned creator"}</strong>{" "}
        (&ldquo;Creator&rdquo;), together the &ldquo;Parties.&rdquo;
      </p>

      <h3>1. Scope of services</h3>
      <p>
        The Agency will register as the Approved Partner on each TikTok Shop
        account the Creator submits for verification, perform the verification
        handshake on the Creator&apos;s behalf, and operate as the collection
        endpoint for TikTok Shop commissions earned through those accounts. The
        Agency does not create content, post on the Creator&apos;s behalf, or
        retain login access after verification is complete.
      </p>

      <h3>2. Mutual obligations</h3>
      <p>
        This Agreement is mutually binding. It secures the Creator&apos;s right
        to receive their commission balance (after the agreed fee) for any
        commissions collected by the Agency through the Creator&apos;s verified
        accounts. It also secures the Agency&apos;s right to collect that fee
        on those commissions for the duration of the relationship.
      </p>

      <h3>3. Service fee</h3>
      <p>
        The Agency&apos;s service fee is <strong>20% of TikTok Shop
        commissions</strong> collected on the Creator&apos;s behalf. This rate
        is locked permanently for the life of this Agreement and will not
        increase. Any future fee changes apply only to new agreements, not to
        rows already signed.
      </p>

      <h3>4. Withdrawal mechanics</h3>
      <p>
        The Creator initiates withdrawals from inside TikTok Shop. Funds land
        in the Agency&apos;s account. Within <strong>48 hours</strong> of each
        TikTok-side withdrawal, the Creator must submit a Withdrawal Form in
        the portal: amount, date, source account, screenshot proof, and
        payout details. The Agency processes payouts manually Monday through
        Friday. There is no minimum payout amount.
      </p>

      <h3>5. Grace Period Policy (48 hours)</h3>
      <p>
        If a Withdrawal Form is submitted more than 48 hours after the
        TikTok-side withdrawal, the Agency reserves the right to retain the
        full value of that transaction. The portal will flag late submissions
        but still record them; whether to honor or retain is at the
        Agency&apos;s discretion. This rule exists because late or missing
        forms make reconciliation impossible.
      </p>

      <h3>6. Creator responsibilities</h3>
      <ul>
        <li>Change the TikTok password promptly after verification is confirmed.</li>
        <li>Keep portal email and payout details up to date.</li>
        <li>Submit Withdrawal Forms on time, with accurate screenshots.</li>
        <li>Do not share portal credentials, TikTok credentials, or the 1-on-1 chat thread with anyone outside Aragon Media.</li>
        <li>Comply with TikTok Community Guidelines, FTC disclosure rules, and applicable tax law.</li>
      </ul>

      <h3>7. Termination</h3>
      <p>
        Either Party may terminate this Agreement at any time, in writing
        (email is sufficient). On termination, the Agency stops accepting new
        orders and processes the final outstanding-balance payout within 30
        days. Material breach (fraud, fake credentials, repeated late
        Withdrawal Forms, FTC violation) may result in forfeiture of unpaid
        balances tied to the breach.
      </p>

      <h3>8. Governing terms</h3>
      <p>
        This Agreement is read alongside the published{" "}
        <a href="/terms" target="_blank" rel="noreferrer">
          Aragon Media Terms of Service
        </a>{" "}
        and{" "}
        <a href="/privacy" target="_blank" rel="noreferrer">
          Privacy Policy
        </a>
        . If any term in this Agreement conflicts with the Terms, this
        Agreement controls. Governing law is the State of Wyoming, USA.
      </p>
    </div>
  );
}
