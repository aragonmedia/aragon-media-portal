/**
 * /review/profile — Profile & Settings for demo/reviewer accounts.
 *
 * Read-only display of the reviewer's account details plus a sign-out
 * button. All write actions (change email, change password, delete
 * account) are demo-disabled — no external side effects allowed.
 */

import { getCurrentReviewer } from "@/lib/auth/review-session";
import LogoutButton from "../LogoutButton";

export const dynamic = "force-dynamic";

function fmtDate(d: Date | string | null): string {
  if (!d) return "—";
  const dt = d instanceof Date ? d : new Date(d);
  return dt.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
}

export default async function ProfilePage() {
  const user = (await getCurrentReviewer())!;

  return (
    <div className="rv-profile">
      <header className="rv-profile-head">
        <p className="rv-eyebrow">Account</p>
        <h1>Profile &amp; Settings</h1>
        <p className="rv-sub">Your Aragon Media portal profile.</p>
      </header>

      <section className="rv-card">
        <h2>Profile</h2>
        <dl className="rv-dl">
          <div><dt>Full name</dt><dd>{user.name || "—"}</dd></div>
          <div><dt>Email</dt><dd>{user.email}</dd></div>
          <div><dt>Role</dt><dd>{user.role === "creator" ? "Creator" : user.role === "brand" ? "Brand" : "Other"}</dd></div>
          <div><dt>TikTok handle</dt><dd>{user.handle ? `@${user.handle}` : "—"}</dd></div>
          <div><dt>Member since</dt><dd>{fmtDate(user.createdAt)}</dd></div>
          <div><dt>Operations Agreement</dt><dd>{user.contractSignedAt ? `Signed ${fmtDate(user.contractSignedAt)}` : "Not signed"}</dd></div>
        </dl>
      </section>

      <section className="rv-card">
        <h2>Settings</h2>
        <div className="rv-setting">
          <div>
            <p className="rv-setting-title">Email notifications</p>
            <p className="rv-setting-sub">You&apos;ll receive chat, withdrawal, and system updates by email.</p>
          </div>
          <span className="rv-toggle on" aria-label="On">On</span>
        </div>
        <div className="rv-setting">
          <div>
            <p className="rv-setting-title">Weekly performance digest</p>
            <p className="rv-setting-sub">Summary of GMV, orders, and top products every Monday.</p>
          </div>
          <span className="rv-toggle on" aria-label="On">On</span>
        </div>
        <div className="rv-setting">
          <div>
            <p className="rv-setting-title">Two-factor authentication</p>
            <p className="rv-setting-sub">Enabled by default on the Aragon Media portal.</p>
          </div>
          <span className="rv-toggle on" aria-label="Enabled">Enabled</span>
        </div>
        <p className="rv-setting-note">Setting toggles are disabled in demo mode.</p>
      </section>

      <section className="rv-card">
        <h2>Session</h2>
        <p className="rv-body">
          You&apos;re signed in on this device. Signing out will end this
          session and return you to the login page.
        </p>
        <div className="rv-logout-row">
          <LogoutButton />
        </div>
      </section>

      <style>{`
        .rv-profile { display: flex; flex-direction: column; gap: 22px; max-width: 780px; }
        .rv-profile-head { display: flex; flex-direction: column; gap: 4px; }
        .rv-eyebrow {
          margin: 0;
          font-size: 11px;
          letter-spacing: 0.18em;
          text-transform: uppercase;
          color: #C9A84C;
          font-weight: 700;
        }
        .rv-profile-head h1 {
          margin: 0;
          font-size: 26px;
          font-weight: 700;
          letter-spacing: -0.02em;
        }
        .rv-sub { margin: 4px 0 0; font-size: 13px; color: #9A9590; }
        .rv-card {
          background: #141414;
          border: 1px solid #1F1F1F;
          border-radius: 12px;
          padding: 22px;
        }
        .rv-card h2 {
          margin: 0 0 16px;
          font-size: 15px;
          text-transform: uppercase;
          letter-spacing: 0.14em;
          color: #C9A84C;
          font-weight: 700;
        }
        .rv-dl {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 14px 24px;
          margin: 0;
        }
        .rv-dl > div { display: flex; flex-direction: column; gap: 3px; }
        .rv-dl dt {
          font-size: 11px;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          color: #6B6660;
          font-weight: 600;
        }
        .rv-dl dd {
          margin: 0;
          font-size: 14.5px;
          color: #F5F1E6;
          font-weight: 500;
        }
        .rv-setting {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 20px;
          padding: 14px 0;
          border-top: 1px solid #1F1F1F;
        }
        .rv-setting:first-of-type { border-top: none; padding-top: 0; }
        .rv-setting-title {
          margin: 0;
          font-size: 14px;
          font-weight: 600;
          color: #F5F1E6;
        }
        .rv-setting-sub {
          margin: 3px 0 0;
          font-size: 12.5px;
          color: #9A9590;
        }
        .rv-toggle {
          padding: 6px 12px;
          border-radius: 20px;
          font-size: 11.5px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.08em;
        }
        .rv-toggle.on {
          background: rgba(43, 165, 103, 0.12);
          color: #2BA567;
          border: 1px solid rgba(43, 165, 103, 0.28);
        }
        .rv-setting-note {
          margin: 12px 0 0;
          font-size: 12px;
          color: #6B6660;
          font-style: italic;
        }
        .rv-body {
          margin: 0 0 16px;
          font-size: 13.5px;
          color: #9A9590;
          line-height: 1.6;
        }
        .rv-logout-row { display: flex; }

        @media (max-width: 640px) {
          .rv-dl { grid-template-columns: 1fr; }
        }
      `}</style>
    </div>
  );
}
