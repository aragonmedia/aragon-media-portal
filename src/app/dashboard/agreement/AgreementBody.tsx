// Pure JSX block — renders the v2.0.0 Operations Agreement.
// Faithful port of Kevin's official PDF with the following deltas:
//  - Governing law: Wyoming (not Washington)
//  - Per-account verification fee: framed as "base rate of $100, starting
//    rate subject to change" so the on-portal copy stays correct as
//    pricing evolves
//  - Section 9 (Service Re-Invite + Hold Policy) added verbatim
//  - Section 11 (Opt-Out Clause) added verbatim
//  - "Legal Binding and Entire Agreement" header renamed to
//    "Mutual Operations Establishment" per Kevin's language preference
//    (avoid "binding" / "contract" / "linking" framing)
//
// Kept in its own component so the same body renders on the live page,
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

      <p className="agr-intro">
        This Operations Agreement (the &ldquo;Agreement&rdquo;) is made between{" "}
        <strong>{creatorName ? creatorName : "the undersigned"}</strong>,
        hereinafter referred to as &ldquo;Content Creator&rdquo;, and{" "}
        <strong>Aragon Media</strong>, hereinafter referred to as
        &ldquo;Agency&rdquo;.
      </p>

      <h3>Purpose of Agreement</h3>

      <p>
        <strong>1.</strong> The Agency agrees to provide the service of
        verifying the Content Creator&apos;s TikTok Account. This Agreement is
        limited to verification services only and does not establish any
        further obligations related to brand partnerships or campaign
        management.
      </p>

      <p>
        <strong>2.</strong> This Agreement constitutes a single-service
        operational relationship and is independent from any brand, affiliate,
        or creative campaign arrangement.
      </p>

      <p>
        <strong>3. Enforceability of Rules:</strong> These terms are
        non-negotiable and enforced uniformly. The Agency is not responsible
        for payment delays caused by non-compliance.
      </p>

      <h3>Operations Terms and Service Scope</h3>

      <p>
        <strong>4.</strong> The Agency will assist in the verification of the
        Content Creator&apos;s TikTok Page using the necessary operational
        processes.
      </p>

      <p>
        <strong>5. Independent Contractor Status:</strong> The Content Creator
        acknowledges they are engaging in this Agreement as an independent
        contractor, not as an employee or representative of the Agency. Before
        completion of the required verification process, a per-account
        verification fee is collected — <strong>base rate of $100 per
        account · starting rate, subject to change</strong> based on the
        Content Creator&apos;s selected tier and any active promotional
        pricing at the time of purchase.
      </p>

      <p>
        <strong>6. Transaction Fee Deduction:</strong> The Agency will deduct a{" "}
        <strong>20% fee from each transaction</strong> originating from
        &ldquo;TikTok&rdquo; as compensation for operations and banking
        services. This 20% fee shall be deemed all-inclusive, meaning it
        incorporates and fully covers all applicable U.S. taxes, regulatory
        obligations, and operational expenses related to such transactions.
        The Content Creator shall not be subject to any additional fees,
        deductions, or charges beyond the stated 20% transaction fee.
      </p>

      <p>
        <strong>7. Proof of Fund Submission:</strong> The Content Creator must
        complete and submit the designated Withdrawal Form inside the Aragon
        Media portal within <strong>48 hours</strong> of each TikTok
        withdrawal as proof of compliance and fund verification.
      </p>

      <p>
        <strong>8. Grace Period Policy:</strong> If the required form is not
        submitted within 48 hours, the Agency reserves the right to retain the
        full value of the associated transaction. This does not affect future
        withdrawals assuming compliance continues.
      </p>

      <p>
        <strong>9. Service Re-Invite and Hold Policy:</strong> For the first{" "}
        <strong>sixty (60) days</strong> after your account is verified, our
        team will send you a new TikTok invitation to keep your service
        active. If the invitation is not accepted, your operations and
        payouts will be placed on a temporary service hold until you accept.
        This same re-invite process will repeat once per year every{" "}
        <strong>(365) days</strong> to maintain compliance and continued
        access to services.
      </p>

      <h3>Mutual Operations Establishment</h3>

      <p>
        <strong>10.</strong> This Agreement shall be governed by and construed
        in accordance with the laws of the <strong>State of Wyoming</strong>,
        United States of America.
      </p>

      <p>
        <strong>11. Opt-Out Clause:</strong> The Content Creator may opt out
        of operational services with written notice. Upon opting out, the
        Creator may use their own credentials for verification. The Agency
        service fees will cease to apply, but prior obligations remain agreed
        upon between both parties.
      </p>

      <p>
        <strong>12.</strong> By signing this Agreement, the Content Creator
        acknowledges and agrees to all the terms and conditions stated by the
        Agency herein, ensuring full compliance with security, operational,
        and anti-fraud measures. The Agreement is a mutual operating
        understanding that establishes good business between both parties.
      </p>

      <p className="agr-witness">
        <strong>IN WITNESS WHEREOF</strong>, the Content Creator acknowledges
        that they have read, understood, and agree to operate under the terms
        and conditions of this Operations Agreement.
      </p>

      <div className="agr-signers">
        <div className="agr-signer">
          <div className="agr-signer-label">Content Creator</div>
          <div className="agr-signer-line">
            {creatorName ? creatorName : "_________________________"}
          </div>
        </div>
        <div className="agr-signer">
          <div className="agr-signer-label">Agency · Aragon Media</div>
          <div className="agr-signer-line agr-signer-kevin">Kevin Aragon</div>
        </div>
      </div>
    </div>
  );
}
