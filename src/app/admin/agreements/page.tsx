import { db } from "@/db";
import { agreements, users } from "@/db/schema";
import { desc, eq } from "drizzle-orm";
import Link from "next/link";

export const dynamic = "force-dynamic";
export const revalidate = 0;

function fmt(d: Date | string | null | undefined): string {
  if (!d) return "—";
  const date = typeof d === "string" ? new Date(d) : d;
  return date.toLocaleString("en-US", {
    dateStyle: "long",
    timeStyle: "short",
  });
}

export default async function AdminAgreementsPage() {
  const list = await db
    .select({
      id: agreements.id,
      signature: agreements.signature,
      contractVersion: agreements.contractVersion,
      signedAt: agreements.signedAt,
      creatorEmail: users.email,
      creatorName: users.name,
      userId: users.id,
    })
    .from(agreements)
    .leftJoin(users, eq(users.id, agreements.userId))
    .orderBy(desc(agreements.signedAt));

  return (
    <main className="admin-shell admin-shell-nested">
      <header className="admin-header">
        <div>
          <p className="admin-eyebrow">Aragon Media · Agreements</p>
          <h1>Signed Operations Agreements</h1>
          <p className="admin-page-sub">
            {list.length} signed agreement
            {list.length === 1 ? "" : "s"} on file. Each row is the immutable
            audit record — signature, version, timestamp. Click{" "}
            <strong>View text</strong> to see the exact agreement that creator
            signed at the version they accepted.
          </p>
        </div>
      </header>

      <section className="admin-section">
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Creator</th>
                <th>Signature</th>
                <th>Version</th>
                <th>Signed at</th>
                <th className="col-actions">View</th>
              </tr>
            </thead>
            <tbody>
              {list.length === 0 ? (
                <tr>
                  <td colSpan={5} className="admin-empty">
                    No signed agreements yet.
                  </td>
                </tr>
              ) : (
                list.map((a) => (
                  <tr key={a.id}>
                    <td>
                      <div>{a.creatorName ?? "—"}</div>
                      <div className="dim small">{a.creatorEmail ?? "—"}</div>
                    </td>
                    <td className="agr-signature-cell">{a.signature}</td>
                    <td className="mono">{a.contractVersion}</td>
                    <td className="dim">{fmt(a.signedAt)}</td>
                    <td className="col-actions">
                      <Link
                        href={`/admin/agreements/${a.id}`}
                        className="admin-row-btn"
                      >
                        View text →
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  );
}
