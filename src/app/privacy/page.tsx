import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy — Aragon Media",
  description:
    "How Aragon Media collects, stores, and protects creator data inside the Creator Partner Program.",
};

export default function PrivacyPage() {
  return (
    <main className="legal-page">
      <header className="legal-topbar">
        <Link href="/" className="logo" style={{ textDecoration: "none" }}>
          Aragon Media<span>Creator Partner Program</span>
        </Link>
        <nav className="legal-topbar-nav" aria-label="Legal">
          <Link href="/privacy" className="active">Privacy</Link>
          <Link href="/terms">Terms</Link>
          <Link href="/signin">Sign in</Link>
          <Link href="/">&larr; Home</Link>
        </nav>
      </header>

      <article className="legal-shell">
        <div className="legal-eyebrow">Legal · Privacy</div>
        <h1 className="legal-h1">Privacy Policy</h1>
        <p className="legal-effective">Effective date: April 30, 2026 · Version 1.0</p>

        <p className="legal-intro">
          Aragon Media (&ldquo;we,&rdquo; &ldquo;us,&rdquo; the &ldquo;Agency&rdquo;) operates the
          Creator Partner Program at kevin-aragon.com and aragon-media-portal.vercel.app
          (the &ldquo;Portal&rdquo;). This policy explains exactly what creator data we collect,
          where it lives, who can see it, and what control you have over it. We wrote this in
          plain English on purpose — if anything is unclear, email{" "}
          <strong>aragonkevin239@gmail.com</strong>.
        </p>

        <section className="legal-section">
          <h2 className="legal-h2"><span className="legal-h2-num">01</span>What we collect</h2>
          <p>To operate the verification, payout, and chat workflow, we collect:</p>
          <ul>
            <li><strong>Account info:</strong> your email address, first/last name, country, time zone.</li>
            <li><strong>TikTok handles:</strong> @username and follower-count for each account you submit for verification.</li>
            <li><strong>TikTok login credentials</strong> (when you submit them on an order): email/phone, password. Encrypted at rest in our database.</li>
            <li><strong>Payment references:</strong> Square payment ID, amount, tier, fee snapshot. We never see your full card number — Square handles that on their hosted checkout.</li>
            <li><strong>Withdrawal-form submissions:</strong> withdrawal amount, date, source account, screenshot proof, your bank or payout details (so we can pay you).</li>
            <li><strong>Contract audit log:</strong> when you click-to-sign the operations agreement, we record the timestamp, your IP address, browser/device fingerprint, and the contract version you signed. This is required to make the contract legally enforceable.</li>
            <li><strong>Chat messages</strong> between you and the Aragon Media team inside the Portal.</li>
            <li><strong>Operational metadata:</strong> session tokens (hashed), one-time verification codes (hashed, 15-minute TTL), basic request logs from Vercel.</li>
          </ul>
        </section>

        <section className="legal-section">
          <h2 className="legal-h2"><span className="legal-h2-num">02</span>What we do NOT collect</h2>
          <ul>
            <li>We do not collect or store full credit-card or banking-PAN data — Square is the merchant of record.</li>
            <li>We do not run third-party advertising trackers, Google Analytics, Facebook Pixel, or session-replay tools on the Portal.</li>
            <li>We do not sell, rent, or trade creator data to third parties. Ever.</li>
          </ul>
        </section>

        <section className="legal-section">
          <h2 className="legal-h2"><span className="legal-h2-num">03</span>Where it lives</h2>
          <p>Creator data is stored across a small set of trusted infrastructure providers:</p>
          <ul>
            <li><strong>Database:</strong> Postgres on Neon (US East). All TikTok credentials are encrypted at rest.</li>
            <li><strong>File uploads</strong> (e.g., screenshot proofs on withdrawal forms): Cloudflare R2.</li>
            <li><strong>App hosting:</strong> Vercel (edge + serverless functions, US regions).</li>
            <li><strong>Transactional email</strong> (verification codes, receipts): Resend.</li>
            <li><strong>Payments:</strong> Square (PCI-DSS Level 1 certified).</li>
            <li><strong>TikTok Shop API:</strong> we exchange OAuth tokens with TikTok Shop Partner Center to read your shop&apos;s GMV and order data on your behalf. We never gain write access to your TikTok account.</li>
          </ul>
        </section>

        <section className="legal-section">
          <h2 className="legal-h2"><span className="legal-h2-num">04</span>Who can see your data</h2>
          <p>
            Inside Aragon Media, only Kevin Aragon (Head Manager) and team members
            holding the <strong>admin</strong> role inside the Portal can view your account
            data. Admin access is logged. We do not share creator data with other creators,
            advertisers, or external agencies.
          </p>
          <p>
            We will only disclose your data to law enforcement or government agencies if
            compelled by valid legal process (subpoena, court order). If we receive such a
            request, we will notify you unless legally prohibited from doing so.
          </p>
        </section>

        <section className="legal-section">
          <h2 className="legal-h2"><span className="legal-h2-num">05</span>How we use it</h2>
          <ul>
            <li><strong>Verification:</strong> log into your TikTok Shop account once, perform the agency verification handshake, then sign out. Credentials are not used after verification.</li>
            <li><strong>Payouts:</strong> match your withdrawal-form submissions to TikTok Shop balances tied to our agency account, then send your share to the bank info you provide.</li>
            <li><strong>Communication:</strong> the in-Portal chat with the AM team, plus transactional email (verification codes, receipts, payout confirmations).</li>
            <li><strong>Contract enforcement:</strong> the audit log on your click-to-sign operations agreement.</li>
            <li><strong>Service operation:</strong> debugging, abuse prevention, fraud detection.</li>
          </ul>
        </section>

        <section className="legal-section">
          <h2 className="legal-h2"><span className="legal-h2-num">06</span>TikTok credentials — special handling</h2>
          <div className="legal-callout">
            We strongly recommend you change your TikTok password as soon as we mark your
            account as verified and you sign our device out. After that point, any
            credential we have on file is dead and useless.
          </div>
          <p>
            While credentials are on file, they are encrypted at rest with AES-256-GCM,
            with the key held in Vercel&apos;s environment variable store (separate from the
            database). Credentials are only decrypted in-memory during the verification
            session and never logged.
          </p>
        </section>

        <section className="legal-section">
          <h2 className="legal-h2"><span className="legal-h2-num">07</span>Retention</h2>
          <ul>
            <li><strong>Account + chat history:</strong> retained as long as your relationship with Aragon Media is active, plus 24 months after offboarding (for tax + dispute records).</li>
            <li><strong>TikTok credentials:</strong> can be deleted by you at any time from the Portal. Otherwise retained while your TikTok account is under management.</li>
            <li><strong>Withdrawal-form records:</strong> retained for 7 years (tax recordkeeping).</li>
            <li><strong>Verification codes + session tokens:</strong> auto-purged after expiry (15 minutes / 30 days respectively).</li>
            <li><strong>Server logs:</strong> 30 days on Vercel, then auto-rotated.</li>
          </ul>
        </section>

        <section className="legal-section">
          <h2 className="legal-h2"><span className="legal-h2-num">08</span>Your rights</h2>
          <p>You can, at any time:</p>
          <ul>
            <li>Request a copy of all data we hold on you (we&apos;ll send it within 30 days).</li>
            <li>Request correction of any inaccurate data via Settings or by emailing us.</li>
            <li>Request deletion of your account and associated data, subject to the retention requirements above.</li>
            <li>Withdraw your consent and end your relationship with Aragon Media at any time per the Terms of Service.</li>
          </ul>
          <p>
            Email <strong>aragonkevin239@gmail.com</strong> with the subject line
            &ldquo;Data request — [your name]&rdquo; to exercise any of these rights.
          </p>
        </section>

        <section className="legal-section">
          <h2 className="legal-h2"><span className="legal-h2-num">09</span>Cookies</h2>
          <p>
            We use one cookie: <code>am_session</code> — a hashed session token tied to
            your account. It is HTTP-only, Secure, SameSite=Lax, and expires after 30
            days of inactivity. We do not use any other cookies, trackers, or fingerprints
            for advertising or analytics.
          </p>
        </section>

        <section className="legal-section">
          <h2 className="legal-h2"><span className="legal-h2-num">10</span>Children</h2>
          <p>
            The Portal is intended for creators 18 years of age or older. We do not
            knowingly collect data from anyone under 18. If we learn we have, we will
            delete it.
          </p>
        </section>

        <section className="legal-section">
          <h2 className="legal-h2"><span className="legal-h2-num">11</span>Changes to this policy</h2>
          <p>
            If we make material changes, we will email every active creator at least 14
            days before they take effect, and post the change history on this page. The
            current version is shown at the top.
          </p>
        </section>

        <div className="legal-foot">
          <span><strong>Aragon Media</strong> · 1309 Coffeen Ave, Sheridan, WY 82801</span>
          <span>Questions? <a href="mailto:aragonkevin239@gmail.com">aragonkevin239@gmail.com</a></span>
          <span>See also: <Link href="/terms">Terms of Service</Link></span>
        </div>
      </article>
    </main>
  );
}
