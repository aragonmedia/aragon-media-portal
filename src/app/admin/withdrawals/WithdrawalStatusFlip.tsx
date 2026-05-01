"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

const OPTIONS = [
  "requested",
  "approved",
  "paid",
  "rejected",
  "late_retained",
] as const;

export default function WithdrawalStatusFlip({
  id,
  current,
  labels,
}: {
  id: string;
  current: string;
  labels: Record<string, string>;
}) {
  const router = useRouter();
  const [value, setValue] = useState(current);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function flip(next: string) {
    if (busy || next === value) return;
    setBusy(true);
    setErr(null);
    try {
      const res = await fetch("/api/admin/actions/set-withdrawal-status", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status: next }),
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
    <div className="admin-status-flip">
      <select
        className={`admin-status-select status-${value}`}
        value={value}
        onChange={(e) => flip(e.target.value)}
        disabled={busy}
      >
        {OPTIONS.map((o) => (
          <option key={o} value={o}>
            {labels[o] ?? o}
          </option>
        ))}
      </select>
      {err && <span className="admin-row-err">{err}</span>}
    </div>
  );
}
