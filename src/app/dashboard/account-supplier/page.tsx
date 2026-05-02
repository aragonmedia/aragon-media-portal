import Link from "next/link";
import { getCurrentUser } from "@/lib/auth/session";
import AccountSupplierClient from "./AccountSupplierClient";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Account Supplier — Aragon Media",
};

const DISCORD_INVITE = "https://discord.gg/nC4n35rcxW";
const REFERRAL_CODE = "YTPXBOQMC";

export default async function AccountSupplierPage() {
  const user = await getCurrentUser();
  if (!user) return null;

  return (
    <main className="dash-content">
      <header className="dash-page-head">
        <div>
          <p className="dash-eyebrow">Account Supplier</p>
          <h1>Buy verified TikTok accounts from our trusted supplier</h1>
          <p className="dash-page-sub">
            Need more accounts to scale your TikTok Shop work? Aragon Media
            partners with a vetted supplier to keep your account pipeline
            stocked. Use the referral code below before you check out so your
            order is tracked under our partnership.
          </p>
        </div>
      </header>

      <AccountSupplierClient
        discordInvite={DISCORD_INVITE}
        referralCode={REFERRAL_CODE}
      />

      <section className="dash-card">
        <div className="dash-card-head">
          <h2>How it works</h2>
        </div>
        <ol className="supplier-steps">
          <li>
            <span className="supplier-step-num">1</span>
            <div>
              <strong>Join the supplier&apos;s Discord</strong> using the
              invite link above. Membership is free.
            </div>
          </li>
          <li>
            <span className="supplier-step-num">2</span>
            <div>
              <strong>Apply the referral code</strong> {" "}
              <code>{REFERRAL_CODE}</code> at checkout so the supplier knows
              you came from Aragon Media.
            </div>
          </li>
          <li>
            <span className="supplier-step-num">3</span>
            <div>
              <strong>Once your new account arrives</strong>, head over to{" "}
              <Link href="/dashboard/add-account">Add Accounts</Link> and start
              the activation flow with Aragon Media.
            </div>
          </li>
          <li>
            <span className="supplier-step-num">4</span>
            <div>
              <strong>Aragon Media takes it from here.</strong> Verification,
              ongoing operations, payouts — all handled inside this portal as
              usual.
            </div>
          </li>
        </ol>
      </section>

      <section className="dash-card">
        <div className="dash-card-head">
          <h2>Why this supplier?</h2>
        </div>
        <div className="supplier-why">
          <div className="supplier-why-item">
            <div className="supplier-why-eyebrow">Vetted</div>
            <p>
              Every account this supplier sells has been hand-checked. No
              recycled bans, no shadowbanned accounts that&apos;ll trip TikTok
              Shop verification on day one.
            </p>
          </div>
          <div className="supplier-why-item">
            <div className="supplier-why-eyebrow">Aragon Media partner</div>
            <p>
              We use this supplier ourselves. Your referral code keeps the
              partnership healthy and gets you priority support if anything
              goes sideways with an order.
            </p>
          </div>
          <div className="supplier-why-item">
            <div className="supplier-why-eyebrow">No lock-in</div>
            <p>
              You own the accounts you buy outright. Aragon Media just runs
              ops on them once you&apos;re ready. Walk away any time per the
              opt-out clause in your Operations Agreement.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
