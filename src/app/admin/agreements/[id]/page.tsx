import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "@/db";
import { agreements, users } from "@/db/schema";
import { eq } from "drizzle-orm";
import AgreementBody from "@/app/dashboard/agreement/AgreementBody";

export const dynamic = "force-dynamic";

function fmt(d: Date | string | null | undefined): string {
  if (!d) return "—";
  const date = typeof d === "string" ? new Date(d) : d;
  return date.toLocaleString("en-US", {
    dateStyle: "long",
    timeStyle: "long",
  });
}

export default async function AdminAgreementDetail({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const rows = await db
    .select({
      id: agreements.id,
      signature: agreements.signature,
      contractVersion: agreements.contractVersion,
      signedAt: agreements.signedAt,
      userId: agreements.userId,
      creatorEmail: users.email,
      creatorName: users.name,
    })
    .from(agreements)
    .leftJoin(users, eq(users.id, agreements.userId))
    .where(eq(agreements.id, id))
    .limit(1);

  const a = rows[0];
  if (!a) notFound();

  return (
    <main className="admin-shell admin-shell-nested">
      <header className="admin-header">
        <div>
          <p className="admin-eyebrow">Aragon Media · Agreement record</p>
          <h1>{a.contractVersion} · {a.creatorName}</h1>
          <p className="admin-page-sub">
            Immutable record of what {a.creatorName} ({a.creatorEmail}) signed.
            The text below is the exact contract version they agreed to.
          </p>
        </div>
        <Link href="/admin/agreements" className="admin-row-btn">
          ← Back to all agreements
        </Link>
      </header>

      <section className="admin-section">
        <div className="admin-record-grid">
          <div className="admin-record-field">
            <div className="admin-record-label">Creator</div>
            <div className="admin-record-value">{a.creatorName ?? "—"}</div>
          </div>
          <div className="admin-record-field">
            <div className="admin-record-label">Email</div>
            <div className="admin-record-value mono">
              {a.creatorEmail ?? "—"}
            </div>
          </div>
          <div className="admin-record-field">
            <div className="admin-record-label">Signature</div>
            <div className="admin-record-value agr-signature-cell">
              {a.signature}
            </div>
          </div>
          <div className="admin-record-field">
            <div className="admin-record-label">Contract version</div>
            <div className="admin-record-value mono">{a.contractVersion}</div>
          </div>
          <div className="admin-record-field">
            <div className="admin-record-label">Signed at</div>
            <div className="admin-record-value">{fmt(a.signedAt)}</div>
          </div>
          <div className="admin-record-field">
            <div className="admin-record-label">Agreement ID</div>
            <div className="admin-record-value mono dim">{a.id}</div>
          </div>
        </div>
      </section>

      <section className="admin-section">
        <div className="admin-section-head">
          <h2>Exact text agreed to</h2>
          <span className="admin-meta">Pulled from CONTRACT_VERSION = {a.contractVersion}</span>
        </div>
        <div className="admin-record-doc">
          <AgreementBody creatorName={a.creatorName ?? undefined} />
        </div>
      </section>
    </main>
  );
}
