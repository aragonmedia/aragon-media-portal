"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function AdminAddAccount({ userId, creatorName }: { userId: string; creatorName: string }) {
  const router = useRouter();
  const [handle, setHandle] = useState("");
  const [status, setStatus] = useState("verified");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ kind: "ok" | "err"; text: string } | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (busy) return;
    const cleaned = handle.replace(/^@+/, "").trim();
    if (cleaned.length < 2) {
      setMsg({ kind: "err", text: "Type the TikTok username (without @)." });
      return;
    }
    setBusy(true);
    setMsg(null);
    try {
      const res = await fetch("/api/admin/actions/add-account", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, tiktokHandle: cleaned, status }),
      });
      const j = (await res.json()) as { ok: boolean; error?: string; already?: boolean };
      if (!res.ok || !j.ok) {
        setMsg({ kind: "err", text: j.error ?? "Failed to add account." });
        setBusy(false);
        return;
      }
      setMsg({
        kind: "ok",
        text: j.already
          ? `@${cleaned} was already on ${creatorName}'s profile.`
          : `Added @${cleaned} (${status}) to ${creatorName}'s profile.`,
      });
      setHandle("");
      router.refresh();
    } catch (err) {
      setMsg({ kind: "err", text: err instanceof Error ? err.message : "Network error." });
    } finally {
      setBusy(false);
    }
  }

  return (
    <form className="acct-add-form" onSubmit={submit}>
      <div className="acct-add-row">
        <span className="acct-add-prefix">@</span>
        <input
          type="text"
          className="settings-input acct-add-input"
          placeholder="tiktok-username"
          value={handle}
          onChange={(e) => setHandle(e.target.value)}
          disabled={busy}
          autoComplete="off"
          spellCheck={false}
        />
        <select
          className="settings-input acct-add-status"
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          disabled={busy}
        >
          <option value="verified">Verified</option>
          <option value="active">Active</option>
          <option value="pending">Pending</option>
          <option value="credentials_received">Creds received</option>
          <option value="two_factor_pending">2FA pending</option>
        </select>
        <button
          type="submit"
          className="admin-row-btn admin-row-btn-primary"
          disabled={busy || handle.trim().length < 2}
        >
          {busy ? "Adding…" : "+ Add account"}
        </button>
      </div>
      <span className="field-note">
        Adds to {creatorName}&apos;s profile directly. Use this for grandfathered
        accounts that were running before the portal launched, or to bypass
        the standard verification flow.
      </span>
      {msg && (
        <div className={`settings-msg ${msg.kind === "ok" ? "ok" : "err"}`}>
          {msg.text}
        </div>
      )}
    </form>
  );
}
