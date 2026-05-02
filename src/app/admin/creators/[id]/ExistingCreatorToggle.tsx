"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function ExistingCreatorToggle({
  userId,
  initialValue,
  creatorName,
}: {
  userId: string;
  initialValue: boolean;
  creatorName: string;
}) {
  const router = useRouter();
  const [value, setValue] = useState(initialValue);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function flip(next: boolean) {
    if (busy) return;
    if (next === value) return;
    if (next) {
      if (
        !confirm(
          `Mark ${creatorName} as an EXISTING creator?\n\nThis will:\n• Bypass the activation roadmap on their dashboard\n• Auto-unlock the withdrawal form (no Square activation required)\n• Stamp a 'v0_grandfathered' agreement row for the audit trail\n\nUse this for creators who were already with you before the portal launched.`
        )
      )
        return;
    } else {
      if (
        !confirm(
          `Remove EXISTING creator status from ${creatorName}? They'll fall back to the standard activation flow. The grandfathered agreement row stays on file.`
        )
      )
        return;
    }
    setBusy(true);
    setErr(null);
    try {
      const res = await fetch(
        "/api/admin/actions/mark-existing-creator",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId, value: next }),
        }
      );
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
    <div className="exist-toggle">
      <button
        type="button"
        onClick={() => flip(!value)}
        disabled={busy}
        className={`exist-toggle-btn${value ? " is-on" : ""}`}
        title={
          value
            ? "Click to remove grandfathered status"
            : "Click to grandfather this creator past activation"
        }
      >
        <span className="exist-toggle-pip" aria-hidden="true" />
        <span className="exist-toggle-label">
          {value ? "Existing creator · ON" : "Existing creator · OFF"}
        </span>
      </button>
      {err && <span className="admin-row-err">{err}</span>}
    </div>
  );
}
