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

export default function SettingsClient({ initial }: { initial: ProfileShape }) {
  const [name, setName] = useState(initial.name);
  const [handle, setHandle] = useState(initial.handle);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<{ kind: "ok" | "err"; text: string } | null>(null);

  const dirty = name.trim() !== initial.name || handle.trim() !== initial.handle;

  async function save(e: React.FormEvent) {
    e.preventDefault();
    if (!dirty || saving) return;
    setSaving(true);
    setMsg(null);
    try {
      const res = await fetch("/api/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim(), handle: handle.trim() }),
      });
      const data = (await res.json()) as { ok: boolean; error?: string };
      if (data.ok) {
        setMsg({ kind: "ok", text: "Saved." });
        // Soft-refresh so the sidebar avatar/name pick up the change
        setTimeout(() => window.location.reload(), 700);
      } else {
        setMsg({ kind: "err", text: data.error || "Couldn't save" });
      }
    } catch (err) {
      setMsg({ kind: "err", text: err instanceof Error ? err.message : "Couldn't save" });
    } finally {
      setSaving(false);
    }
  }

  return (
    <main className="dash-content">
      <header className="dash-page-head">
        <div>
          <p className="dash-eyebrow">Account</p>
          <h1>Settings</h1>
          <p className="dash-page-sub">Update your profile details. Email + role are locked. Need them changed? Message AM team in chat.</p>
        </div>
      </header>

      <div className="dash-card">
        <div className="dash-card-head">
          <h2>Profile</h2>
          <span className="dash-meta">Visible to the AM team and used in chat / emails.</span>
        </div>

        <form onSubmit={save} className="settings-form">
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
              <span>{initial.role === "creator" ? "TikTok handle" : initial.role === "brand" ? "Brand name" : "Identifier"}</span>
              <input
                className="settings-input"
                type="text"
                value={handle}
                onChange={(e) => setHandle(e.target.value)}
                placeholder={initial.role === "creator" ? "@yourhandle" : "Brand / identifier"}
                maxLength={200}
              />
            </label>
          </div>

          <div className="settings-row settings-row-locked">
            <label>
              <span>Email (locked)</span>
              <input className="settings-input" type="email" value={initial.email} disabled />
            </label>
            <label>
              <span>Role (locked)</span>
              <input className="settings-input" type="text" value={initial.role} disabled />
            </label>
          </div>

          <div className="settings-actions">
            <button type="submit" className="dash-cta" disabled={!dirty || saving}>
              {saving ? "Saving…" : dirty ? "Save changes" : "No changes"}
            </button>
            {msg && <span className={`settings-msg ${msg.kind === "ok" ? "ok" : "err"}`}>{msg.text}</span>}
          </div>
        </form>
      </div>

      <div className="dash-card" style={{ marginTop: 16 }}>
        <div className="dash-card-head">
          <h2>Account history</h2>
        </div>
        <dl className="settings-meta">
          <div>
            <dt>Account created</dt>
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
        </dl>
      </div>
    </main>
  );
}
