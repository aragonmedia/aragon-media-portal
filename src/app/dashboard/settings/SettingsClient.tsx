"use client";

import { useState } from "react";

type ProfileShape = {
  email: string;
  name: string;
  handle: string;
  role: "creator" | "brand" | "other";
  verifiedAt: string | null;
  createdAt: string;
  contractSignedAt: string | null;
};

type TiktokAccount = {
  id: string;
  handle: string;
  status: string;
  cycleLabel: string;
  createdAt: string;
  verifiedAt: string | null;
};

export default function SettingsClient({
  initial,
  tiktokAccounts,
}: {
  initial: ProfileShape;
  tiktokAccounts: TiktokAccount[];
}) {
  const [name, setName] = useState(initial.name);
  const [savingName, setSavingName] = useState(false);
  const [nameMsg, setNameMsg] = useState<{ kind: "ok" | "err"; text: string } | null>(null);

  const [newHandle, setNewHandle] = useState("");
  const [addingHandle, setAddingHandle] = useState(false);
  const [addMsg, setAddMsg] = useState<{ kind: "ok" | "err"; text: string } | null>(null);

  const dirtyName = name.trim() !== initial.name;

  async function saveName(e: React.FormEvent) {
    e.preventDefault();
    if (!dirtyName || savingName) return;
    setSavingName(true);
    setNameMsg(null);
    try {
      const res = await fetch("/api/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim(), handle: initial.handle }),
      });
      const data = (await res.json()) as { ok: boolean; error?: string };
      if (data.ok) {
        setNameMsg({ kind: "ok", text: "Saved." });
        setTimeout(() => window.location.reload(), 600);
      } else {
        setNameMsg({ kind: "err", text: data.error || "Couldn't save" });
      }
    } catch (err) {
      setNameMsg({ kind: "err", text: err instanceof Error ? err.message : "Couldn't save" });
    } finally {
      setSavingName(false);
    }
  }

  async function addAccount(e: React.FormEvent) {
    e.preventDefault();
    if (!newHandle.trim() || addingHandle) return;
    setAddingHandle(true);
    setAddMsg(null);
    try {
      const res = await fetch("/api/accounts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tiktokHandle: newHandle.trim() }),
      });
      const data = (await res.json()) as { ok: boolean; error?: string };
      if (data.ok) {
        setAddMsg({ kind: "ok", text: "Account added — AM team notified." });
        setNewHandle("");
        setTimeout(() => window.location.reload(), 700);
      } else {
        setAddMsg({ kind: "err", text: data.error || "Couldn't add" });
      }
    } catch (err) {
      setAddMsg({ kind: "err", text: err instanceof Error ? err.message : "Couldn't add" });
    } finally {
      setAddingHandle(false);
    }
  }

  return (
    <main className="dash-content">
      <header className="dash-page-head">
        <div>
          <p className="dash-eyebrow">Account</p>
          <h1>Settings</h1>
          <p className="dash-page-sub">Update your profile and manage every TikTok account linked to your portal. Email + role are locked. Need them changed? Message AM team in chat.</p>
        </div>
      </header>

      {/* Profile name */}
      <div className="dash-card">
        <div className="dash-card-head">
          <h2>Profile</h2>
          <span className="dash-meta">Visible to the AM team and used in chat / emails.</span>
        </div>
        <form onSubmit={saveName} className="settings-form">
          <div className="settings-row">
            <label>
              <span>Full name *</span>
              <input
                className="settings-input"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your legal name"
                required
                maxLength={200}
              />
            </label>
            <label>
              <span>Email (locked)</span>
              <input className="settings-input" type="email" value={initial.email} disabled />
            </label>
          </div>
          <div className="settings-row settings-row-locked">
            <label>
              <span>Role (locked)</span>
              <input className="settings-input" type="text" value={initial.role} disabled />
            </label>
          </div>
          <div className="settings-actions">
            <button type="submit" className="dash-cta" disabled={!dirtyName || savingName}>
              {savingName ? "Saving…" : dirtyName ? "Save name" : "No changes"}
            </button>
            {nameMsg && <span className={`settings-msg ${nameMsg.kind === "ok" ? "ok" : "err"}`}>{nameMsg.text}</span>}
          </div>
        </form>
      </div>

      {/* TikTok accounts */}
      <div className="dash-card" style={{ marginTop: 16 }}>
        <div className="dash-card-head">
          <h2>Your TikTok accounts</h2>
          <span className="dash-meta">{tiktokAccounts.length} of 4 in current cycle</span>
        </div>

        {tiktokAccounts.length === 0 ? (
          <div className="dash-empty">
            <div className="dash-empty-body">No TikTok accounts linked yet. Add one below and the AM team will start verification within 24 hours.</div>
          </div>
        ) : (
          <div className="settings-account-list">
            {tiktokAccounts.map((a) => (
              <div key={a.id} className="settings-account-row">
                <div>
                  <div className="settings-account-handle">@{a.handle}</div>
                  <div className="settings-account-meta">{a.cycleLabel} · added {a.createdAt}{a.verifiedAt ? ` · verified ${a.verifiedAt}` : ""}</div>
                </div>
                <span className={`account-pill account-${a.status}`}>{a.status.replace("_", " ")}</span>
              </div>
            ))}
          </div>
        )}

        <form onSubmit={addAccount} className="settings-add-account">
          <label>
            <span>Add another TikTok account</span>
            <div className="settings-add-row">
              <input
                className="settings-input"
                type="text"
                value={newHandle}
                onChange={(e) => setNewHandle(e.target.value)}
                placeholder="@yourhandle (no @ needed)"
                maxLength={200}
              />
              <button type="submit" className="dash-cta" disabled={!newHandle.trim() || addingHandle}>
                {addingHandle ? "Adding…" : "Add account"}
              </button>
            </div>
          </label>
          {addMsg && <span className={`settings-msg ${addMsg.kind === "ok" ? "ok" : "err"}`}>{addMsg.text}</span>}
          <p className="settings-hint">Up to 4 accounts per cycle. After 4, the next account starts a new cycle. Activation fees apply per account from the Add Accounts page.</p>
        </form>
      </div>

      {/* Account history */}
      <div className="dash-card" style={{ marginTop: 16 }}>
        <div className="dash-card-head">
          <h2>Account history</h2>
        </div>
        <dl className="settings-meta">
          <div>
            <dt>Portal account</dt>
            <dd>{initial.createdAt}</dd>
          </div>
          <div>
            <dt>Email verified</dt>
            <dd>{initial.verifiedAt ?? "—"}</dd>
          </div>
          <div>
            <dt>Operations agreement</dt>
            <dd>{initial.contractSignedAt ?? "Not signed yet"}</dd>
          </div>
          {tiktokAccounts.map((a) => (
            <div key={a.id}>
              <dt>@{a.handle}</dt>
              <dd>{a.verifiedAt ? `Verified ${a.verifiedAt}` : `Added ${a.createdAt} · ${a.status.replace("_", " ")}`}</dd>
            </div>
          ))}
        </dl>
      </div>
    </main>
  );
}
