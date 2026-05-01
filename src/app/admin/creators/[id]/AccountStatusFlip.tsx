"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

const STATUS_LABELS: Record<string, string> = {
  pending: "Pending",
  credentials_received: "Creds received",
  two_factor_pending: "2FA pending",
  verified: "Verified",
  active: "Active",
  suspended: "Suspended",
  cancelled: "Cancelled",
};
const STATUSES = Object.keys(STATUS_LABELS);

export default function AccountStatusFlip({
  accountId,
  current,
  handle,
}: {
  accountId: string;
  current: string;
  handle: string;
}) {
  const router = useRouter();
  const [value, setValue] = useState(current);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function flip(next: string) {
    if (busy || next === value) return;
    if (
      ["suspended", "cancelled"].includes(next) &&
      !confirm(`Mark @${handle} as ${STATUS_LABELS[next]}?`)
    )
      return;
    setBusy(true);
    setErr(null);
    try {
      const res = await fetch("/api/admin/actions/set-account-status", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ accountId, status: next }),
      });
      const j = (await res.json()) as { ok: boolean; error?: string };
      if (!res.ok || !j.ok) {
        setErr(j.error ?? "Failed");
        setBusy(false);
        return;
      }
      setValue(next);
      router.refresh();
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Network error");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="acct-flip">
      <select
        className={`admin-status-select acct-flip-select acct-status-${value}`}
        value={value}
        onChange={(e) => flip(e.target.value)}
        disabled={busy}
      >
        {STATUSES.map((s) => (
          <option key={s} value={s}>
            {STATUS_LABELS[s]}
          </option>
        ))}
      </select>
      {value !== "verified" && value !== "active" && (
        <button
          type="button"
          onClick={() => flip("verified")}
          disabled={busy}
          className="admin-row-btn admin-row-btn-primary acct-quick-verify"
          title="Mark this account as verified now"
        >
          ✓ Verify now
        </button>
      )}
      {err && <span className="admin-row-err">{err}</span>}
    </div>
  );
}
