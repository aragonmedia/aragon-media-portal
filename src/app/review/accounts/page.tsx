/**
 * /review/accounts — "Add TikTok Accounts" (creator POV).
 * Creators can add + disconnect their own accounts inline.
 */

import Link from "next/link";
import { asc, eq } from "drizzle-orm";
import { db } from "@/db";
import { accounts } from "@/db/schema";
import { getCurrentReviewer } from "@/lib/auth/review-session";
import AddAccountButton from "./AddAccountButton";
import RemoveAccountButton from "./RemoveAccountButton";

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
    <div className="ac-wrap">
      <header className="ac-head">
        <div>
          <p className="ac-eyebrow">TikTok Shop</p>
          <h1>Add TikTok Accounts</h1>
          <p className="ac-sub">
            Link a TikTok account to your Aragon Media profile. Each
            connection authorizes the TikTok Shop Analytics API via
            TikTok Partner Center OAuth so your GMV + creator commission
            flow into <Link href="/review">Overview</Link> automatically.
          </p>
        </div>
        <AddAccountButton />
      </header>

      {rows.length === 0 ? (
        <div className="ac-empty">
          <div className="ac-empty-icon" aria-hidden>+</div>
          <p className="ac-empty-title">No TikTok accounts linked yet</p>
          <p className="ac-empty-sub">
            Once you add an account, its GMV, orders, and videos will
            appear on your Overview within minutes.
          </p>
          <div className="ac-empty-cta">
            <AddAccountButton label="+ Add your first TikTok account" />
          </div>
        </div>
      ) : (
        <ul className="ac-list">
          {rows.map((a) => (
            <li key={a.id} className={`ac-item ac-item-${a.status}`}>
              <div className="ac-mark" aria-hidden="true">@</div>
              <div className="ac-body">
                <p className="ac-handle">@{a.tiktokHandle}</p>
                <p className="ac-meta">
                  <span className="ac-status">{STATUS_LABEL[a.status] ?? a.status}</span>
                  <span>·</span>
                  <span>
                    Connected{" "}
                    {new Date(a.verifiedAt || a.createdAt).toLocaleDateString("en-US", {
                      month: "short", day: "numeric", year: "numeric",
                    })}
                  </span>
                </p>
                {a.notes && <p className="ac-notes">{a.notes}</p>}
              </div>
              <div className="ac-right">
                <span className="ac-pill">TikTok Shop</span>
                <RemoveAccountButton id={a.id} handle={a.tiktokHandle} />
              </div>
            </li>
          ))}
        </ul>
      )}

      <section className="ac-info">
        <p>
          <strong>How the OAuth handshake works.</strong> When you click
          <em> Add another account</em>, we redirect you to TikTok Shop
          Partner Center to authorize Aragon Media. TikTok returns a
          scoped token that lets us call{" "}
          <code>/analytics/v1/shop/performance</code> and{" "}
          <code>/analytics/v1/products/performance</code> for that shop.
          Tokens are stored encrypted per-account and revocable from this
          page at any time.
        </p>
      </section>

      <style>{`
        .ac-wrap { display: flex; flex-direction: column; gap: 18px; max-width: 1180px; }
        .ac-head { display: flex; justify-content: space-between; align-items: flex-end; gap: 18px; flex-wrap: wrap; }
        .ac-eyebrow {
          margin: 0 0 6px;
          font-size: 11px; letter-spacing: 0.18em;
          text-transform: uppercase;
          color: var(--gold); font-weight: 700;
        }
        .ac-head h1 {
          margin: 0;
          font-size: 30px; font-weight: 700;
          letter-spacing: -0.02em;
          color: var(--text);
        }
        .ac-sub {
          margin: 8px 0 0;
          font-size: 13px; color: var(--text-muted);
          max-width: 640px; line-height: 1.55;
        }
        .ac-sub a { color: var(--gold); text-decoration: none; border-bottom: 1px dashed rgba(201,168,76,0.34); }

        .ac-empty {
          background: var(--bg-2);
          border: 1px dashed var(--border);
          border-radius: 14px;
          padding: 40px 24px;
          text-align: center; color: var(--text-muted);
          box-shadow: var(--shadow-card);
        }
        .ac-empty-icon { font-size: 32px; color: var(--gold); font-weight: 300; margin-bottom: 6px; }
        .ac-empty-title { margin: 0 0 4px; color: var(--text); font-weight: 600; }
        .ac-empty-sub { margin: 0 0 18px; font-size: 13px; }
        .ac-empty-cta { display: inline-flex; }

        .ac-list { list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: 12px; }
        .ac-item {
          display: grid; grid-template-columns: 52px 1fr auto;
          gap: 16px;
          background: var(--bg-2);
          border: 1px solid var(--border-soft);
          border-radius: 14px;
          padding: 16px 18px;
          align-items: center;
          box-shadow: var(--shadow-card);
        }
        .ac-mark {
          width: 52px; height: 52px; border-radius: 12px;
          background: var(--bg-deep);
          border: 1px solid var(--gold);
          color: var(--gold);
          font-size: 22px; font-weight: 700;
          display: flex; align-items: center; justify-content: center;
        }
        .ac-handle { margin: 0; font-size: 15px; font-weight: 700; color: var(--text); }
        .ac-meta {
          margin: 4px 0 0;
          font-size: 12.5px; color: var(--text-muted);
          display: flex; gap: 8px; flex-wrap: wrap;
        }
        .ac-status {
          color: var(--green); font-weight: 700;
          text-transform: uppercase; letter-spacing: 0.08em;
          font-size: 11px;
        }
        .ac-item-pending .ac-status,
        .ac-item-two_factor_pending .ac-status { color: var(--gold); }
        .ac-notes {
          margin: 8px 0 0;
          font-size: 12.5px; color: var(--text-muted);
          font-style: italic;
        }
        .ac-right {
          display: flex; align-items: center; gap: 10px;
          flex-wrap: wrap;
          justify-content: flex-end;
        }
        .ac-pill {
          font-size: 10.5px;
          color: var(--gold);
          background: rgba(201, 168, 76, 0.08);
          border: 1px solid rgba(201, 168, 76, 0.28);
          padding: 5px 10px; border-radius: 999px;
          letter-spacing: 0.1em; text-transform: uppercase;
          font-weight: 700;
        }

        .ac-info {
          background: rgba(201, 168, 76, 0.06);
          border: 1px solid rgba(201, 168, 76, 0.28);
          border-radius: 14px;
          padding: 18px 22px;
          font-size: 13px; color: var(--text-muted);
          line-height: 1.65;
        }
        .ac-info strong { color: var(--text); }
        .ac-info em { color: var(--text); font-style: normal; font-weight: 600; }
        .ac-info code {
          font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
          font-size: 12.5px;
          color: var(--gold);
          background: rgba(201, 168, 76, 0.08);
          padding: 1px 6px; border-radius: 4px;
        }

        @media (max-width: 900px) {
          .ac-head { flex-direction: column; align-items: flex-start; }
          .ac-item { grid-template-columns: 44px 1fr; }
          .ac-item .ac-right { grid-column: 1 / -1; justify-content: flex-start; }
        }
      `}</style>
    </div>
  );
}
