/**
 * /review/profile — Profile & Settings for the reviewer creator.
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
    <div className="pf-wrap">
      <header className="pf-head">
        <p className="pf-eyebrow">Account</p>
        <h1>Profile &amp; Settings</h1>
        <p className="pf-sub">Your Aragon Media Creator Portal profile.</p>
      </header>

      <section className="pf-card">
        <h2>Profile</h2>
        <dl className="pf-dl">
          <div><dt>Full name</dt><dd>{user.name || "—"}</dd></div>
          <div><dt>Email</dt><dd>{user.email}</dd></div>
          <div><dt>Role</dt><dd>Creator</dd></div>
          <div><dt>TikTok handle</dt><dd>{user.handle ? `@${user.handle}` : "—"}</dd></div>
          <div><dt>Member since</dt><dd>{fmtDate(user.createdAt)}</dd></div>
          <div>
            <dt>Operations Agreement</dt>
            <dd>{user.contractSignedAt ? `Signed ${fmtDate(user.contractSignedAt)}` : "Not signed"}</dd>
          </div>
        </dl>
      </section>

      <section className="pf-card">
        <h2>Notifications</h2>
        <div className="pf-setting">
          <div>
            <p className="pf-setting-title">Email notifications</p>
            <p className="pf-setting-sub">You&apos;ll receive chat, withdrawal, and system updates by email.</p>
          </div>
          <span className="pf-toggle on">On</span>
        </div>
        <div className="pf-setting">
          <div>
            <p className="pf-setting-title">Weekly performance digest</p>
            <p className="pf-setting-sub">Summary of GMV, orders, and top videos every Monday.</p>
          </div>
          <span className="pf-toggle on">On</span>
        </div>
        <div className="pf-setting">
          <div>
            <p className="pf-setting-title">TikTok connection alerts</p>
            <p className="pf-setting-sub">Ping me when a connected account needs re-authorization.</p>
          </div>
          <span className="pf-toggle on">On</span>
        </div>
        <p className="pf-note">Notification preferences are read-only in preview mode.</p>
      </section>

      <section className="pf-card">
        <h2>Session</h2>
        <p className="pf-body">
          Signed in as <strong>{user.email}</strong>. Sign out ends this
          preview session and returns you to the login screen.
        </p>
        <div className="pf-row"><LogoutButton /></div>
      </section>

      <style>{`
        .pf-wrap { display: flex; flex-direction: column; gap: 18px; max-width: 820px; }
        .pf-head { display: flex; flex-direction: column; gap: 4px; }
        .pf-eyebrow { margin: 0; font-size: 11px; letter-spacing: 0.18em; text-transform: uppercase; color: var(--rv-gold); font-weight: 700; }
        .pf-head h1 { margin: 0; font-size: 30px; font-weight: 700; letter-spacing: -0.02em; color: var(--rv-text); }
        .pf-sub { margin: 4px 0 0; font-size: 13px; color: var(--rv-muted); }

        .pf-card {
          background: var(--rv-card-bg);
          border: 1px solid var(--rv-border);
          border-radius: 14px;
          padding: 22px 24px;
          box-shadow: var(--rv-shadow);
        }
        .pf-card h2 {
          margin: 0 0 14px;
          font-size: 12px; font-weight: 700;
          letter-spacing: 0.16em; text-transform: uppercase;
          color: var(--rv-gold);
        }
        .pf-dl { display: grid; grid-template-columns: 1fr 1fr; gap: 14px 24px; margin: 0; }
        .pf-dl > div { display: flex; flex-direction: column; gap: 3px; }
        .pf-dl dt { font-size: 11px; letter-spacing: 0.12em; text-transform: uppercase; color: var(--rv-muted-2); font-weight: 600; }
        .pf-dl dd { margin: 0; font-size: 14.5px; color: var(--rv-text); font-weight: 500; }

        .pf-setting {
          display: flex; justify-content: space-between; align-items: center;
          gap: 20px; padding: 14px 0;
          border-top: 1px solid var(--rv-border);
        }
        .pf-setting:first-of-type { border-top: none; padding-top: 0; }
        .pf-setting-title { margin: 0; font-size: 14px; font-weight: 600; color: var(--rv-text); }
        .pf-setting-sub { margin: 3px 0 0; font-size: 12.5px; color: var(--rv-muted); }
        .pf-toggle {
          padding: 6px 12px; border-radius: 20px;
          font-size: 11.5px; font-weight: 700;
          text-transform: uppercase; letter-spacing: 0.08em;
          background: rgba(43, 165, 103, 0.12);
          color: var(--rv-good);
          border: 1px solid rgba(43, 165, 103, 0.28);
        }
        .pf-note { margin: 12px 0 0; font-size: 12px; color: var(--rv-muted-2); font-style: italic; }
        .pf-body { margin: 0 0 16px; font-size: 13.5px; color: var(--rv-muted); line-height: 1.6; }
        .pf-body strong { color: var(--rv-text); }
        .pf-row { display: flex; }

        @media (max-width: 640px) { .pf-dl { grid-template-columns: 1fr; } }
      `}</style>
    </div>
  );
}
