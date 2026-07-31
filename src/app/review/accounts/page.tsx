/**
 * /review/accounts — Connected TikTok Shop accounts (demo).
 *
 * Shows the demo user's TikTok Shop connections. In demo mode we render
 * pre-seeded verified accounts. A "Connect another account" button is
 * shown but disabled with a tooltip — real OAuth requires production
 * Partner Center credentials.
 */

import { asc, eq } from "drizzle-orm";
import { db } from "@/db";
import { accounts } from "@/db/schema";
import { getCurrentReviewer } from "@/lib/auth/review-session";

export const dynamic = "force-dynamic";

const STATUS_LABEL: Record<string, string> = {
  pending: "Pending",
  credentials_received: "Credentials received",
  two_factor_pending: "2FA pending",
  verified: "Verified",
  active: "Active",
  suspended: "Suspended",
  cancelled: "Cancelled",
};

export default async function AccountsPage() {
  const user = (await getCurrentReviewer())!;
  const rows = await db
    .select()
    .from(accounts)
    .where(eq(accounts.userId, user.id))
    .orderBy(asc(accounts.createdAt));

  return (
    <div className="rv-accts">
      <header className="rv-accts-head">
        <div>
          <p className="rv-eyebrow">TikTok Shop</p>
          <h1>Connected Accounts</h1>
          <p className="rv-sub">
            Accounts linked to your Aragon Media profile. Each connection
            authorizes the TikTok Shop Analytics API via TikTok Partner Center OAuth.
          </p>
        </div>
        <button className="rv-connect" disabled title="Available after TikTok Partner Center production approval">
          + Connect another
        </button>
      </header>

      {rows.length === 0 ? (
        <div className="rv-empty">
          <p>No TikTok accounts linked yet.</p>
          <p className="rv-empty-hint">Run the seed script to populate a demo account.</p>
        </div>
      ) : (
        <ul className="rv-acct-list">
          {rows.map((a) => (
            <li key={a.id} className={`rv-acct rv-acct-${a.status}`}>
              <div className="rv-acct-mark" aria-hidden="true">
                <span>@</span>
              </div>
              <div className="rv-acct-body">
                <p className="rv-acct-handle">@{a.tiktokHandle}</p>
                <p className="rv-acct-meta">
                  <span className="rv-acct-status">{STATUS_LABEL[a.status] ?? a.status}</span>
                  <span>·</span>
                  <span>
                    Connected {new Date(a.verifiedAt || a.createdAt).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </span>
                  <span>·</span>
                  <span>Cycle #{a.cycleNumber}, position {a.cyclePosition}</span>
                </p>
                {a.notes && <p className="rv-acct-notes">{a.notes}</p>}
              </div>
            </li>
          ))}
        </ul>
      )}

      <div className="rv-oauth-info">
        <p className="rv-eyebrow">OAuth integration</p>
        <p>
          Aragon Media uses TikTok Partner Center OAuth 2.0 to link Shop accounts:
          creators authorize <code>shop.analytics.read</code> and{" "}
          <code>shop.products.read</code>, and the portal never sees passwords or
          long-lived credentials — only refresh tokens scoped to the granted permissions.
        </p>
      </div>

      <style>{`
        .rv-accts { display: flex; flex-direction: column; gap: 22px; max-width: 900px; }
        .rv-accts-head {
          display: flex;
          justify-content: space-between;
          align-items: flex-end;
          gap: 20px;
        }
        .rv-eyebrow {
          margin: 0 0 6px;
          font-size: 11px;
          letter-spacing: 0.18em;
          text-transform: uppercase;
          color: #C9A84C;
          font-weight: 700;
        }
        .rv-accts h1 {
          margin: 0;
          font-size: 26px;
          font-weight: 700;
          letter-spacing: -0.02em;
        }
        .rv-sub { margin: 6px 0 0; font-size: 13px; color: #9A9590; max-width: 620px; }
        .rv-connect {
          background: transparent;
          border: 1px solid #2A2A2A;
          color: #9A9590;
          font-family: inherit;
          font-size: 12.5px;
          padding: 9px 16px;
          border-radius: 8px;
          cursor: not-allowed;
        }
        .rv-empty {
          background: #141414;
          border: 1px dashed #2A2A2A;
          border-radius: 12px;
          padding: 32px;
          text-align: center;
          color: #9A9590;
        }
        .rv-empty-hint { font-size: 12.5px; color: #6B6660; margin-top: 4px; }
        .rv-acct-list { list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: 12px; }
        .rv-acct {
          display: grid;
          grid-template-columns: 52px 1fr;
          gap: 16px;
          background: #141414;
          border: 1px solid #1F1F1F;
          border-radius: 12px;
          padding: 16px 18px;
          align-items: center;
        }
        .rv-acct-mark {
          width: 52px;
          height: 52px;
          border-radius: 12px;
          background: #0B0B0B;
          border: 1px solid #C9A84C;
          color: #C9A84C;
          font-size: 22px;
          font-weight: 700;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .rv-acct-handle {
          margin: 0;
          font-size: 15px;
          font-weight: 700;
          color: #F5F1E6;
        }
        .rv-acct-meta {
          margin: 4px 0 0;
          font-size: 12.5px;
          color: #9A9590;
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
        }
        .rv-acct-status {
          color: #2BA567;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.08em;
          font-size: 11px;
        }
        .rv-acct-verified .rv-acct-status,
        .rv-acct-active .rv-acct-status { color: #2BA567; }
        .rv-acct-pending .rv-acct-status,
        .rv-acct-two_factor_pending .rv-acct-status { color: #C9A84C; }
        .rv-acct-notes {
          margin: 8px 0 0;
          font-size: 12.5px;
          color: #9A9590;
          font-style: italic;
        }
        .rv-oauth-info {
          background: rgba(201, 168, 76, 0.05);
          border: 1px solid rgba(201, 168, 76, 0.18);
          border-radius: 12px;
          padding: 18px 20px;
          font-size: 13px;
          color: #9A9590;
          line-height: 1.65;
        }
        .rv-oauth-info code {
          font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
          font-size: 12.5px;
          color: #C9A84C;
          background: rgba(201, 168, 76, 0.08);
          padding: 1px 6px;
          border-radius: 4px;
        }

        @media (max-width: 900px) {
          .rv-accts-head { flex-direction: column; align-items: flex-start; }
        }
      `}</style>
    </div>
  );
}
