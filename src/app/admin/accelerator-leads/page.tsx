import Link from "next/link";
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

export default async function AdminAcceleratorLeadsPage({ searchParams }: { searchParams: Promise<{ tenant?: string }> }) {
  const session = await requireAdminRole(["owner", "accelerator_admin", "am_lead"]);

  const sp = await searchParams;
  // If the admin is tenant-scoped, FORCE filter to their tenant regardless of ?tenant= param
  const requested = (sp?.tenant === "roni" || sp?.tenant === "colt") ? sp.tenant : "all";
  const activeTenant = session.scope ?? requested;
  const canSwitchTenant = session.role === "owner";

  const allRows = await db
    .select()
    .from(acceleratorIntents)
    .orderBy(desc(acceleratorIntents.createdAt))
    .limit(500);

  const roniRows = allRows.filter((r) => (r.acceleratorSlug ?? "roni") === "roni");
  const coltRows = allRows.filter((r) => r.acceleratorSlug === "colt");
  const rows =
    activeTenant === "roni" ? roniRows :
    activeTenant === "colt" ? coltRows :
    allRows;

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
          {canSwitchTenant ? (
            <div className="admin-tenant-pills">
              <Link href="/admin/accelerator-leads" className={`admin-tenant-pill${activeTenant === "all" ? " is-active" : ""}`}>All <span>{allRows.length}</span></Link>
              <Link href="/admin/accelerator-leads?tenant=roni" className={`admin-tenant-pill${activeTenant === "roni" ? " is-active" : ""}`}>Roni <span>{roniRows.length}</span></Link>
              <Link href="/admin/accelerator-leads?tenant=colt" className={`admin-tenant-pill${activeTenant === "colt" ? " is-active" : ""}`}>COLT <span>{coltRows.length}</span></Link>
            </div>
          ) : (
            <div className="admin-tenant-pills">
              <span className="admin-tenant-pill is-active">{activeTenant === "colt" ? "COLT" : "Roni"} only <span>{rows.length}</span></span>
            </div>
          )}
          <div className="admin-stat-row">
            <div className="admin-stat"><div className="admin-stat-num">{revealed}</div><div className="admin-stat-label">Revealed</div></div>
            <div className="admin-stat"><div className="admin-stat-num">{clicked}</div><div className="admin-stat-label">Clicked a tier</div></div>
            <div className="admin-stat"><div className="admin-stat-num">{hot}</div><div className="admin-stat-label">$1,997 tier</div></div>
          </div>
          <a
            href={`/api/admin/accelerator-leads.csv${activeTenant === "all" ? "" : `?tenant=${activeTenant}`}`}
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
                <th>From</th>
                <th>Action</th>
                <th>Name</th>
                <th>Email</th>
                <th>Tier clicked</th>
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
                  <td><span className="admin-pill admin-pill-warm">{r.acceleratorSlug ?? "roni"}</span></td>
                  <td><span className="admin-td-sub">{r.action ?? "reveal"}</span></td>
                  <td>{r.name || "—"}</td>
                  <td><a href={`mailto:${r.email}`}>{r.email}</a></td>
                  <td>
                    {r.clickedTier ? (
                      <span className={`admin-pill admin-pill-${r.clickedTier === "edu_plus_account" ? "hot" : "warm"}`}>
                        {TIER_LABEL[r.clickedTier] ?? r.clickedTier}
                      </span>
                    ) : r.action === "outbound_accounts" ? (
                      <span className="admin-td-sub">→ Nick G Discord</span>
                    ) : (
                      <span className="admin-td-sub">revealed only</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
