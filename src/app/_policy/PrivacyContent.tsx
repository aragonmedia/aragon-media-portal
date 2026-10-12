import type { Brand } from "./PolicyChrome";

export default function PrivacyContent({ brand }: { brand: Brand }) {
  return (
    <>
      <p>
        This Privacy Policy explains what information we collect when you interact with the <strong>{brand.programName}</strong> program and website, how we use it, who we share it with, and your rights. The Program is operated by <strong>Aragon Media LLC</strong>.
      </p>

      <h2>1. Who we are</h2>
      <p>Aragon Media LLC. Contact: <a href="mailto:aragonkevin239@gmail.com">aragonkevin239@gmail.com</a>.</p>

      <h2>2. What we collect</h2>
      <p>We collect the following categories of information:</p>
      <ul>
        <li><strong>Identity data:</strong> your name and the name you use publicly as a creator</li>
        <li><strong>Contact data:</strong> email address, and (if provided) phone number</li>
        <li><strong>Creator profile data:</strong> your TikTok handle, follower count, country of residence</li>
        <li><strong>Payment data:</strong> processed by Square. We do not store full card numbers or bank details on our servers. We retain only the transaction confirmation and a token Square returns to us.</li>
        <li><strong>Communications data:</strong> messages you send through the private chatroom, support emails, and any attachments or screenshots you upload</li>
        <li><strong>TikTok Shop account credentials:</strong> for Education + Verified Account tier members, the login credentials to the TikTok Shop account you are assigned, stored encrypted at rest</li>
        <li><strong>Usage data:</strong> which pages you visit on our site, which Program modules you watch, when you watch them, approximate location based on IP, and device/browser information</li>
      </ul>

      <h2>3. How we collect it</h2>
      <ul>
        <li><strong>Landing page forms:</strong> you provide name + email when you unlock pricing on the Program lander, and when you open a verification chat</li>
        <li><strong>Checkout:</strong> Square collects payment details on our behalf</li>
        <li><strong>Skool community:</strong> when you join, Skool collects profile info governed by its own policy</li>
        <li><strong>Chatroom:</strong> you submit account details, screenshots, and messages voluntarily</li>
        <li><strong>Discord:</strong> when you join a partner Discord server, Discord collects profile info governed by its own policy. We separately read account listings from a specific channel (see Section 7 below).</li>
        <li><strong>Automatically:</strong> standard web analytics on page visits via our hosting provider</li>
      </ul>

      <h2>4. How we use your information</h2>
      <ul>
        <li>To deliver the Program (enrollment, account activation, support, community access, payouts)</li>
        <li>To send transactional emails (receipts, chatroom reply notifications, program updates)</li>
        <li>To send marketing emails about related Programs or new campaigns (only to opt-in subscribers; you may unsubscribe at any time)</li>
        <li>To improve the Program (anonymized analytics, feedback aggregation)</li>
        <li>To comply with legal obligations (tax reporting, responding to legal process)</li>
        <li>To prevent fraud and abuse (payment fraud detection, Program conduct enforcement)</li>
      </ul>

      <h2>5. Third-party sharing</h2>
      <p>We share your information with the following service providers, each of whom processes it only on our behalf for the stated purpose:</p>
      <ul>
        <li><strong>Square</strong> — payment processing</li>
        <li><strong>Skool</strong> — community hosting and course delivery</li>
        <li><strong>Resend</strong> — transactional and marketing emails</li>
        <li><strong>Vercel</strong> — website hosting and infrastructure</li>
        <li><strong>Neon</strong> — database hosting</li>
        <li><strong>Airtable</strong> — internal CRM for lead tracking (only member-facing data: name, email, enrollment status)</li>
        <li><strong>TikTok Shop</strong> — for Education + Verified Account tier members, your account is created in TikTok Shop and governed by TikTok's own data practices</li>
      </ul>
      <p>We do <strong>not</strong> sell your personal information. We do not share it with advertisers, data brokers, or any party not listed above.</p>

      <h2>6. Legal basis</h2>
      <p>For members in jurisdictions subject to the GDPR (EU/UK), our legal bases for processing are:</p>
      <ul>
        <li><strong>Contract performance:</strong> we need your data to deliver the Program you purchased</li>
        <li><strong>Legitimate interest:</strong> for fraud prevention, service improvement, and operational analytics</li>
        <li><strong>Consent:</strong> for marketing emails (opt-in, revocable at any time)</li>
        <li><strong>Legal obligation:</strong> tax reporting and compliance with lawful requests</li>
      </ul>

      <h2>7. Discord bot and third-party integrations</h2>
      <p>We operate a read-only Discord application called <strong>"Kevin × Affiliate Accelerator"</strong> (application ID <code>1544430620946604184</code>) inside servers operated by our TikTok Accelerator partners. Its sole function is to read publicly-posted account-listing messages from a single channel per server so that current inventory can be surfaced on <a href={brand.accountsHref}>{brand.accountsHref}</a>.</p>

      <h3>What the bot reads</h3>
      <p>Only the text content of messages posted in the authorized listings channel(s). The bot cannot access, and we do not store, log, or transmit: any other channel, any direct messages, any member identity, any private ticket thread, or any content from servers where the bot has not been explicitly installed with channel-level permissions.</p>

      <h3>What we store from Discord</h3>
      <p>Only structured, non-personal listing data parsed out of those public messages: TikTok handle, follower count, listed price. We do not store Discord user IDs, message IDs, message authors, timestamps, or the raw message text beyond the current active snapshot.</p>

      <h3>Retention and deletion</h3>
      <p>The listing cache is refreshed on a scheduled cadence — old entries that no longer appear in the source channel are deleted automatically. Server owners can revoke the bot's access at any time from Discord Server Settings, which will freeze further reads immediately; email us at <a href="mailto:aragonkevin239@gmail.com">aragonkevin239@gmail.com</a> and we will purge any cached listings within 24 hours on request.</p>

      <h3>Discord's own policies</h3>
      <p>Use of the bot is also subject to <a href="https://discord.com/terms" target="_blank" rel="noopener noreferrer">Discord's Terms of Service</a> and <a href="https://discord.com/privacy" target="_blank" rel="noopener noreferrer">Discord's Privacy Policy</a>.</p>

      <h2>8. Cookies and tracking</h2>
      <p>We use first-party cookies for essential functions (session management, remembering form input, saving your gate-reveal state). We do not use advertising cookies or cross-site tracking. We use minimal server-side analytics for page view counts and sync status monitoring — nothing that identifies individual visitors beyond IP address.</p>

      <h2>9. Data retention</h2>
      <p>We retain your data for the following periods:</p>
      <ul>
        <li><strong>Program enrollment data:</strong> for the duration of your enrollment plus 7 years for tax and legal record-keeping</li>
        <li><strong>Chatroom messages:</strong> retained indefinitely as part of your support history, deleted on request</li>
        <li><strong>Credentials for Education + Verified Account tier:</strong> encrypted at rest for the duration of your account access, deleted within 30 days of account revocation</li>
        <li><strong>Marketing contact list:</strong> until you unsubscribe</li>
        <li><strong>Payment records:</strong> 7 years for tax compliance</li>
        <li><strong>Analytics data:</strong> aggregated anonymously after 90 days</li>
      </ul>

      <h2>10. Your rights</h2>
      <p>You have the right to:</p>
      <ul>
        <li>Access the personal data we hold about you</li>
        <li>Correct inaccurate data</li>
        <li>Request deletion of your data (subject to legal retention obligations)</li>
        <li>Export your data in a portable format</li>
        <li>Withdraw consent for marketing communications at any time</li>
        <li>Lodge a complaint with your local data protection authority (EU/UK members only)</li>
      </ul>
      <p>To exercise any of these rights, email <a href="mailto:aragonkevin239@gmail.com">aragonkevin239@gmail.com</a>. We respond within 30 days.</p>

      <h2>11. Children</h2>
      <p>The Program is not intended for anyone under 18. We do not knowingly collect personal data from minors. If you believe we have collected data from a minor, email us and we will delete it promptly.</p>

      <h2>12. International transfers</h2>
      <p>Aragon Media LLC is a US-based company. Your data is processed in the United States and may be transferred to other countries where our service providers operate. By using the Program, you consent to this transfer.</p>

      <h2>13. Security</h2>
      <p>We use industry-standard security measures to protect your data, including encryption in transit (TLS) and at rest for sensitive fields (TikTok Shop credentials). No system is perfectly secure — if a data breach affecting your data occurs, we will notify you within 72 hours of discovery as required by law.</p>

      <h2>14. Changes to this policy</h2>
      <p>We may update this policy. Material changes will be announced via email to enrolled members and posted at the top of this page. Your continued use of the Program after the effective date constitutes acceptance.</p>

      <h2>15. Contact</h2>
      <p>Questions about this Privacy Policy, or wish to exercise your rights? Email <a href="mailto:aragonkevin239@gmail.com">aragonkevin239@gmail.com</a>.</p>
    </>
  );
}
