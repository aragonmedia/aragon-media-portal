"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function CreatorRowActions({
  userId,
  email,
  contractUnlocked,
  contractSigned,
}: {
  userId: string;
  email: string;
  contractUnlocked: boolean;
  contractSigned: boolean;
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

  // Already signed → no actionable state.
  if (contractSigned) {
    return <span className="dim small">No actions</span>;
  }
  // Unlocked but not signed → waiting on creator.
  if (contractUnlocked) {
    return <span className="dim small">Awaiting signature</span>;
  }
  // Locked → admin can unlock from here.
  return (
    <div className="admin-row-actions">
      <button
        onClick={unlock}
        disabled={busy}
        className="admin-row-btn admin-row-btn-primary"
        title="Unlocks the agreement so this creator can sign it"
      >
        {busy ? "Unlocking…" : "Unlock agreement"}
      </button>
      {msg && <span className="admin-row-err">{msg}</span>}
    </div>
  );
}
