/**
 * /review/profile — Profile & Settings for the reviewer creator.
 * Read-only creator profile + real client-side notification toggles +
 * "Add TikTok Account" jump-off from the TikTok handles section.
 */

import { asc, eq } from "drizzle-orm";
import { db } from "@/db";
import { accounts } from "@/db/schema";
import { getCurrentReviewer } from "@/lib/auth/review-session";
import LogoutButton from "../LogoutButton";
import ProfileClient from "./ProfileClient";

export const dynamic = "force-dynamic";

function fmtDate(d: Date | string | null): string {
  if (!d) return "—";
  const dt = d instanceof Date ? d : new Date(d);
  return dt.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
}

export default async function ProfilePage() {
  const user = (await getCurrentReviewer())!;
  const linked = await db
    .select()
    .from(accounts)
    .where(eq(accounts.userId, user.id))
    .orderBy(asc(accounts.createdAt));
  const extraHandles = linked.map((a) => a.tiktokHandle).filter((h) => h !== user.handle);

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

      <ProfileClient handle={user.handle} extraHandles={extraHandles} />

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
        .pf-eyebrow { margin: 0; font-size: 11px; letter-spacing: 0.18em; text-transform: uppercase; color: var(--gold); font-weight: 700; }
        .pf-head h1 { margin: 0; font-size: 30px; font-weight: 700; letter-spacing: -0.02em; color: var(--text); }
        .pf-sub { margin: 4px 0 0; font-size: 13px; color: var(--text-muted); }

        .pf-card {
          background: var(--bg-2);
          border: 1px solid var(--border-soft);
          border-radius: 14px;
          padding: 22px 24px;
          box-shadow: var(--shadow-card);
        }
        .pf-card h2 {
          margin: 0 0 14px;
          font-size: 12px; font-weight: 700;
          letter-spacing: 0.16em; text-transform: uppercase;
          color: var(--gold);
        }
        .pf-dl { display: grid; grid-template-columns: 1fr 1fr; gap: 14px 24px; margin: 0; }
        .pf-dl > div { display: flex; flex-direction: column; gap: 3px; }
        .pf-dl dt { font-size: 11px; letter-spacing: 0.12em; text-transform: uppercase; color: var(--text-sub); font-weight: 600; }
        .pf-dl dd { margin: 0; font-size: 14.5px; color: var(--text); font-weight: 500; }

        .pf-body { margin: 0 0 16px; font-size: 13.5px; color: var(--text-muted); line-height: 1.6; }
        .pf-body strong { color: var(--text); }
        .pf-row { display: flex; }

        @media (max-width: 640px) { .pf-dl { grid-template-columns: 1fr; } }
      `}</style>
    </div>
  );
}
