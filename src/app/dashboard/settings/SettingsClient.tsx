"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
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

      {/* TikTok accounts (with inline 'request to add' form) */}
      <div className="dash-card" style={{ marginTop: 16 }}>
        <div className="dash-card-head">
          <h2>Your TikTok accounts</h2>
          <span className="dash-meta">{tiktokAccounts.length} on file</span>
        </div>

        <RequestAddAccountForm />

        {tiktokAccounts.length === 0 ? (
          <div className="dash-empty">
            <div className="dash-empty-body">
              No TikTok accounts linked yet. Submit a username above and the
              AM team will approve it within 24 hours.
            </div>
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

        <p className="settings-hint">
          Got an account that needs the full Aragon Media activation flow
          (Square payment + verification screenshots)? Use{" "}
          <Link href="/dashboard/add-account">Add Accounts</Link> instead.
        </p>
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


function RequestAddAccountForm() {
  const [handle, setHandle] = useState("");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ kind: "ok" | "err"; text: string } | null>(null);
  const router = useRouter();

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
      const res = await fetch("/api/accounts/request-add", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tiktokHandle: cleaned }),
      });
      const j = (await res.json()) as { ok: boolean; error?: string; already?: boolean; hint?: string };
      if (!res.ok || !j.ok) {
        setMsg({
          kind: "err",
          text: j.hint ?? j.error ?? "Couldn't submit — try again.",
        });
        setBusy(false);
        return;
      }
      setMsg({
        kind: "ok",
        text: j.already
          ? `@${cleaned} is already on your profile.`
          : `Submitted @${cleaned} for AM approval. We'll confirm in chat once it's verified.`,
      });
      setHandle("");
      router.refresh();
    } catch (err) {
      setMsg({
        kind: "err",
        text: err instanceof Error ? err.message : "Network error.",
      });
    } finally {
      setBusy(false);
    }
  }

  return (
    <form className="acct-add-form" onSubmit={submit}>
      <label className="acct-add-label">
        <span>Add a TikTok account by username</span>
        <div className="acct-add-row">
          <span className="acct-add-prefix">@</span>
          <input
            type="text"
            className="settings-input acct-add-input"
            placeholder="yourtiktokhandle"
            value={handle}
            onChange={(e) => setHandle(e.target.value)}
            disabled={busy}
            autoComplete="off"
            spellCheck={false}
          />
          <button
            type="submit"
            className="dash-cta"
            disabled={busy || handle.trim().length < 2}
          >
            {busy ? "Submitting…" : "Submit for approval"}
          </button>
        </div>
        <span className="field-note">
          AM team approves new handles within 24 hours. No payment required
          for grandfathered creators or repeat additions on accounts we
          already manage.
        </span>
      </label>
      {msg && (
        <div className={`settings-msg ${msg.kind === "ok" ? "ok" : "err"}`}>
          {msg.text}
        </div>
      )}
    </form>
  );
}
