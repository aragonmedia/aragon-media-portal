import type { Brand } from "./PolicyChrome";

export default function TermsContent({ brand, prices }: {
  brand: Brand;
  prices: { eduOnly: string; eduPlus: string; accountRefund: string };
}) {
  return (
    <>
      <p>
        These Terms of Service ("Terms") govern your enrollment in and use of the <strong>{brand.programName}</strong> program (the "Program"), operated by <strong>Aragon Media LLC</strong>. By completing checkout and enrolling, you confirm that you have read, understood, and agreed to these Terms.
      </p>

      <h2>1. What the Program is</h2>
      <p>The Program is a 7-day done-with-you system designed to help creators earn USD commissions on TikTok Shop. It is delivered through:</p>
      <ul>
        <li>A private Skool community with ongoing access</li>
        <li>Weekly live workshops with the team</li>
        <li>A dedicated support team available via the private chatroom</li>
        <li>A full resource vault of playbooks, scripts, and templates</li>
        <li>Optional: a verified US TikTok Shop account (Education + Verified Account tier)</li>
      </ul>

      <h2>2. Pricing and tiers</h2>
      <p>Three tiers are offered:</p>
      <ul>
        <li><strong>Education Only ({prices.eduOnly}):</strong> community access, 7-day fast track, weekly workshops, resource vault. You source your own TikTok Shop account.</li>
        <li><strong>Education + Verified Account ({prices.eduPlus}):</strong> everything in Education Only, plus a verified US TikTok Shop account activated within 24 hours of enrollment, a 1-on-1 kickoff call, and priority support.</li>
        <li><strong>Accounts Only:</strong> browse and purchase a verified account via the Nick G Discord marketplace. This tier is handled directly by Nick G and is not part of Aragon Media's Program.</li>
      </ul>
      <p>Payment is processed via Square. All prices are listed in USD. By completing checkout you authorize Square to charge your payment method for the stated amount.</p>

      <h2>3. 7-Day Activation Guarantee</h2>
      <p>If you complete the full 7-day fast track and submit your account details on time, we guarantee your TikTok Shop account will be activated within 24 hours of submission.</p>
      <p>"Complete" means:</p>
      <ul>
        <li>Watch all required modules of the 7-day fast track</li>
        <li>Submit your account details via the private chatroom within your enrollment window</li>
        <li>Respond to the team's verification request within 48 hours</li>
      </ul>
      <p>If you complete every step and your account is not activated within the guarantee window, we will make it right by either:</p>
      <ol>
        <li>Issuing a replacement account at no extra cost, OR</li>
        <li>Refunding the account-tier portion of your purchase ({prices.accountRefund}) for the Education + Verified Account tier.</li>
      </ol>
      <p>The guarantee does <strong>not</strong> cover:</p>
      <ul>
        <li>Failure to complete the 7-day fast track within the enrollment window</li>
        <li>Account issues caused by the member's own violation of TikTok's Community Guidelines</li>
        <li>Market conditions, product availability, or commission rates (which are set by TikTok Shop, not Aragon Media)</li>
        <li>The amount of commissions you earn (which depends entirely on your content, niche, posting cadence, and market factors)</li>
      </ul>

      <h2>4. Refund policy</h2>
      <p>Due to the digital nature of the Program and immediate access to community resources, all sales are final after 24 hours of enrollment. Refund requests within 24 hours may be submitted to <a href="mailto:aragonkevin239@gmail.com">aragonkevin239@gmail.com</a> and are at Aragon Media's sole discretion.</p>
      <p>The 7-Day Activation Guarantee (Section 3) provides the only path to a partial refund after 24 hours, and only for the Education + Verified Account tier.</p>

      <h2>5. Verified Account tier specifics</h2>
      <p>If you purchase the Education + Verified Account tier, the following applies:</p>
      <ul>
        <li>The TikTok Shop account is registered to an Aragon Media team member who is a US citizen (as required by TikTok Shop's US creator eligibility rules).</li>
        <li>Commissions earned through the account are paid to Aragon Media's US bank account under matching tax information.</li>
        <li>You, the member, operate the account's content and are paid as an independent contractor on Aragon Media's standard payout cycle.</li>
        <li>You are responsible for your own tax obligations in your country of residence.</li>
        <li>Account access may be revoked for violation of TikTok's Community Guidelines or Aragon Media's Code of Conduct (Section 6).</li>
      </ul>

      <h2>6. Code of Conduct</h2>
      <p>By enrolling, you agree to:</p>
      <ul>
        <li>Keep Skool community discussions confidential and respect other members' privacy</li>
        <li>Not share account credentials or Program materials with any third party</li>
        <li>Not engage in content that violates TikTok's Community Guidelines</li>
        <li>Not resell or redistribute Program materials, in whole or in part</li>
        <li>Treat other members and the team with respect at all times</li>
      </ul>
      <p>Violation results in removal from the Program without refund.</p>

      <h2>7. Independent contractor relationship</h2>
      <p>Nothing in these Terms creates an employer-employee, partnership, or joint venture relationship between you and Aragon Media. You are an independent contractor responsible for your own content, tax obligations, and compliance with the laws of your country of residence.</p>

      <h2>8. Earnings disclaimer</h2>
      <p>Case studies, testimonials, and example earnings shown on our landing pages represent individual results. Specific creator earnings (such as the figures publicly attributed to Dylan, Don, Celeste, or any other named creator) reflect their own effort, content, niche, posting cadence, and market factors.</p>
      <p>The amount you earn depends entirely on your own content, effort, niche, and factors outside Aragon Media's control. We make no guarantee or representation of specific earnings for your enrollment.</p>

      <h2>9. TikTok Shop and third-party platform policies</h2>
      <p>Your use of TikTok Shop is governed by TikTok's own Terms of Service, Community Guidelines, and Creator Policies. Aragon Media operates within TikTok's authorized partnership framework as a TikTok Affiliate Partnership (TAP) partner.</p>
      <p>Your use of Skool, Discord, Square, and any other third-party platform referenced in the Program is governed by those platforms' own terms. Aragon Media is not responsible for the policies, availability, or actions of any third-party service.</p>

      <h2>10. Intellectual property</h2>
      <p>Program content (course modules, workshop recordings, playbooks, templates, scripts, and all other instructional materials) is the intellectual property of Aragon Media LLC. You receive a limited, non-transferable, non-exclusive license to use these materials for your own creator business while enrolled.</p>
      <p>Content you create (videos, posts, UGC, your own earnings screenshots) remains your property. By being enrolled, you grant Aragon Media a non-exclusive, worldwide license to feature your public TikTok Shop content and documented earnings in our marketing materials (testimonials, case studies, social proof), unless you opt out in writing by emailing <a href="mailto:aragonkevin239@gmail.com">aragonkevin239@gmail.com</a>.</p>

      <h2>11. Changes to the Program</h2>
      <p>Aragon Media reserves the right to modify the Program's structure, module order, workshop schedule, pricing for new enrollments, and community rules at any time. Existing members at the time of a change retain access to the core Program as originally structured for the duration of their enrollment term.</p>

      <h2>12. Suspension and termination</h2>
      <p>We may suspend or terminate your access to the Program at our discretion for:</p>
      <ul>
        <li>Violation of these Terms or the Code of Conduct</li>
        <li>Violation of TikTok's Community Guidelines resulting in account restrictions</li>
        <li>Non-payment of any outstanding fees</li>
        <li>Behavior that materially harms other members or the Program</li>
      </ul>
      <p>Suspension or termination does not entitle you to a refund.</p>

      <h2>13. Limitation of liability</h2>
      <p>To the maximum extent permitted by law, Aragon Media's total liability to you under these Terms is limited to the amount you paid for the Program in the 12 months preceding the claim. Aragon Media is not liable for any lost profits, lost commissions, opportunity costs, or consequential damages.</p>

      <h2>14. Governing law and dispute resolution</h2>
      <p>These Terms are governed by the laws of the State of Florida, United States, without regard to conflict of law principles. Any dispute arising from these Terms or your participation in the Program will be resolved through binding arbitration administered by the American Arbitration Association in accordance with its Commercial Arbitration Rules, except that either party may seek injunctive relief in court for violations of intellectual property or confidentiality obligations.</p>

      <h2>15. Changes to these Terms</h2>
      <p>We may update these Terms from time to time. Material changes will be announced via email to enrolled members at least 14 days before the effective date. Continued participation in the Program after the effective date constitutes acceptance of the updated Terms.</p>

      <h2>16. Contact</h2>
      <p>Questions about these Terms? Email <a href="mailto:aragonkevin239@gmail.com">aragonkevin239@gmail.com</a>.</p>
    </>
  );
}
