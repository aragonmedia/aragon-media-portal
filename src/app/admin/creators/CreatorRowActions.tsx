"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function CreatorRowActions({
  userId,
  email,
  contractUnlocked,
  contractSigned,
  latestAgreementId,
  receiptsCount,
}: {
  userId: string;
  email: string;
  contractUnlocked: boolean;
  contractSigned: boolean;
  latestAgreementId: string | null;
  receiptsCount: number;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  async function unlock() {
    if (busy) return;
    if (!confirm(`Unlock the Operations Agreement for ${email}?`)) return;
    setBusy(true);
    setMsg(null);
    try {
      const res = await fetch("/api/admin/actions/unlock-creator", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId }),
      });
      const json = (await res.json()) as { ok: boolean; error?: string };
      if (!res.ok || !json.ok) {
        setMsg(json.error ?? "Failed");
        setBusy(false);
        return;
      }
      router.refresh();
    } catch (err) {
      setMsg(err instanceof Error ? err.message : "Network error");
      setBusy(false);
    }
  }

  return (
    <div className="admin-row-actions admin-row-actions-stack">
      {/* Unlock CTA — only shown when locked */}
      {!contractSigned && !contractUnlocked && (
        <button
          onClick={unlock}
          disabled={busy}
          className="admin-row-btn admin-row-btn-primary"
          title="Unlocks the agreement so this creator can sign it"
        >
          {busy ? "Unlocking…" : "Unlock agreement"}
        </button>
      )}

      {/* State labels for non-actionable rows */}
      {!contractSigned && contractUnlocked && (
        <span className="dim small">Awaiting signature</span>
      )}

      {/* Cross-links: agreement detail + filtered receipts */}
      <div className="admin-row-links">
        {latestAgreementId ? (
          <Link
            href={`/admin/agreements/${latestAgreementId}`}
            className="admin-row-btn"
            title="View the exact text this creator signed"
          >
            Agreement →
          </Link>
        ) : (
          <span className="admin-row-btn admin-row-btn-disabled" title="Not signed yet">
            Agreement —
          </span>
        )}
        <Link
          href={`/admin/withdrawals?creator=${userId}`}
          className="admin-row-btn"
          title={receiptsCount > 0 ? `View ${receiptsCount} receipt${receiptsCount === 1 ? "" : "s"}` : "No receipts yet"}
        >
          Receipts {receiptsCount > 0 ? `(${receiptsCount}) →` : "→"}
        </Link>
      </div>

      {msg && <span className="admin-row-err">{msg}</span>}
    </div>
  );
}
