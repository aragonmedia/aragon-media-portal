"use client";

import Link from "next/link";
import { useState } from "react";
import ThemeToggle from "./ThemeToggle";

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

  return (
    <main className="dash-content">
      <header className="dash-page-head">
        <div>
          <p className="dash-eyebrow">Account</p>
          <h1>Settings</h1>
          <p className="dash-page-sub">Update your profile and view every TikTok account linked to your portal. Email + role are locked. Need them changed? Message AM team in chat.</p>
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

      {/* TikTok accounts (read-only) */}
      <div className="dash-card" style={{ marginTop: 16 }}>
        <div className="dash-card-head">
          <h2>Your TikTok accounts</h2>
          <span className="dash-meta">{tiktokAccounts.length} verified or in progress</span>
        </div>

        {tiktokAccounts.length === 0 ? (
          <div className="dash-empty">
            <div className="dash-empty-body">
              No TikTok accounts linked yet. New accounts are added via the Add Accounts page after activation payment is received and the AM team begins verification.
            </div>
            <Link href="/dashboard/add-account" className="dash-cta">Go to Add Accounts →</Link>
          </div>
        ) : (
          <div className="settings-account-list">
            {tiktokAccounts.map((a) => (
              <div key={a.id} className="settings-account-row">
                <div>
                  <div className="settings-account-handle">@{a.handle}</div>
                  <div className="settings-account-meta">{a.cycleLabel} · added {a.createdAt}{a.verifiedAt ? ` · verified ${a.verifiedAt}` : ""}</div>
                </div>
                <div className="settings-account-actions">
                  <span className={`account-pill account-${a.status}`}>{a.status.replace("_", " ")}</span>
                  <button type="button" className="mini-btn ghost" disabled title="TikTok OAuth coming next session">
                    Connect via TikTok OAuth
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        <p className="settings-hint">To add another TikTok account, visit Add Accounts and complete activation. Once paid + verified, it will appear here automatically.</p>
      </div>

      {/* Appearance / Theme */}
      <div className="dash-card" style={{ marginTop: 16 }}>
        <div className="dash-card-head">
          <h2>Appearance</h2>
          <span className="dash-meta">Pick the look that suits your eyes.</span>
        </div>
        <ThemeToggle />
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
