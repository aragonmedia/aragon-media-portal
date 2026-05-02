"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function DeleteCreatorButton({
  userId,
  creatorName,
  creatorEmail,
  isAdmin,
}: {
  userId: string;
  creatorName: string;
  creatorEmail: string;
  isAdmin: boolean;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [confirmText, setConfirmText] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  if (isAdmin) return null; // can't delete admin rows

  async function doDelete() {
    if (busy) return;
    if (confirmText.trim().toLowerCase() !== "delete") {
      setErr("Type 'delete' exactly to confirm.");
      return;
    }
    setBusy(true);
    setErr(null);
    try {
      const res = await fetch("/api/admin/actions/delete-creator", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, confirm: confirmText.trim() }),
      });
      const j = (await res.json()) as { ok: boolean; error?: string };
      if (!res.ok || !j.ok) {
        setErr(j.error ?? "Delete failed");
        setBusy(false);
        return;
      }
      router.push("/admin/creators");
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Network error");
      setBusy(false);
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="admin-row-btn admin-row-btn-danger"
        title="Permanently remove this creator from the portal"
      >
        🗑 Delete creator
      </button>
      {open && (
        <div className="delete-modal-backdrop" onClick={() => !busy && setOpen(false)}>
          <div className="delete-modal" onClick={(e) => e.stopPropagation()}>
            <div className="delete-modal-pill">⚠ Permanent</div>
            <h2 className="delete-modal-title">
              Delete {creatorName}?
            </h2>
            <p className="delete-modal-body">
              This permanently removes <strong>{creatorEmail}</strong> from
              the portal. Their accounts, agreements, withdrawal receipts, chat
              messages, and sessions all cascade-delete with them. <strong>This
              cannot be undone.</strong>
            </p>
            <label className="delete-modal-label">
              Type <code>delete</code> to confirm
            </label>
            <input
              type="text"
              className="delete-modal-input"
              placeholder="delete"
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              autoFocus
              disabled={busy}
              autoComplete="off"
            />
            {err && <div className="delete-modal-err">{err}</div>}
            <div className="delete-modal-actions">
              <button
                type="button"
                onClick={() => setOpen(false)}
                disabled={busy}
                className="admin-row-btn"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={doDelete}
                disabled={busy || confirmText.trim().toLowerCase() !== "delete"}
                className="admin-row-btn admin-row-btn-danger"
              >
                {busy ? "Deleting…" : "Permanently delete creator"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
