/**
 * /admin/accelerator-leads — internal CRM view of every accelerator
 * landing-page intent captured in `accelerator_intents`.
 *
 * Parallel place to Airtable so Kevin + AM team can view leads without
 * leaving the portal. Read-only for now; add-status + notes come next.
 */

import { desc } from "drizzle-orm";
import { requireAdminRole } from "@/lib/auth/admin-role";
import { db } from "@/db";
import { acceleratorIntents } from "@/db/schema";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const TIER_LABEL: Record<string, string> = {
  edu_only: "Education only ($997)",
  edu_plus_account: "Education + Account ($1,997)",
  browse: "Browse accounts only",
};

function fmt(d: Date) {
  return d.toLocaleString("en-US", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" });
}

export default async function AdminAcceleratorLeadsPage() {
  await requireAdminRole(["owner", "accelerator_admin", "am_lead"]);

  const rows = await db
    .select()
    .from(acceleratorIntents)
    .orderBy(desc(acceleratorIntents.createdAt))
    .limit(500);

  const revealed = rows.length;
  const clicked = rows.filter((r) => r.clickedTier).length;
  const hot = rows.filter((r) => r.clickedTier === "edu_plus_account").length;

  return (
    <div className="admin-page">
      <div className="admin-page-head">
        <div>
          <h1>Accelerator leads</h1>
          <p className="admin-page-sub">Every lead captured from the /accelerator landing page. Live from Neon.</p>
        </div>
        <div className="admin-page-actions">
          <div className="admin-stat-row">
            <div className="admin-stat"><div className="admin-stat-num">{revealed}</div><div className="admin-stat-label">Revealed</div></div>
            <div className="admin-stat"><div className="admin-stat-num">{clicked}</div><div className="admin-stat-label">Clicked a tier</div></div>
            <div className="admin-stat"><div className="admin-stat-num">{hot}</div><div className="admin-stat-label">$1,997 tier</div></div>
          </div>
          <a
            href="/api/admin/accelerator-leads.csv"
            download
            className="admin-export-btn"
            aria-label="Export leads as CSV"
          >
            <span aria-hidden="true">⇩</span> Export CSV
          </a>
        </div>
      </div>

      {rows.length === 0 ? (
        <div className="admin-empty">
          <p><strong>No leads yet.</strong></p>
          <p>New leads land here the moment someone submits their name + email on the /accelerator gate.</p>
        </div>
      ) : (
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>When</th>
                <th>Name</th>
                <th>Email</th>
                <th>Tier clicked</th>
                <th>Referrer</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id}>
                  <td className="admin-td-when">
                    <div>{fmt(r.createdAt)}</div>
                    {r.clickedAt && (
                      <div className="admin-td-sub">clicked {fmt(r.clickedAt)}</div>
                    )}
                  </td>
                  <td>{r.name || "—"}</td>
                  <td><a href={`mailto:${r.email}`}>{r.email}</a></td>
                  <td>
                    {r.clickedTier ? (
                      <span className={`admin-pill admin-pill-${r.clickedTier === "edu_plus_account" ? "hot" : "warm"}`}>
                        {TIER_LABEL[r.clickedTier] ?? r.clickedTier}
                      </span>
                    ) : (
                      <span className="admin-td-sub">revealed only</span>
                    )}
                  </td>
                  <td className="admin-td-referrer">{r.referrer || "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
