"use client";

import { useState } from "react";
import type { AdminRole } from "@/lib/auth/admin-role";

type Member = { id: string; email: string; name: string; role: AdminRole; roleLabel: string; joinedAt: string; lastSigninAt: string | null };
type Invite = { id: string; email: string; role: AdminRole; roleLabel: string; createdAt: string; expiresAt: string };

const INVITABLE: { value: AdminRole; label: string; desc: string }[] = [
  { value: "accelerator_admin", label: "Accelerator Admin",  desc: "Sees Accelerator Leads + Chatroom. Cannot see creators, withdrawals, or finance." },
  { value: "am_lead",           label: "AM Lead",             desc: "Leads only. Read + manage the CRM. Cannot see chatroom." },
  { value: "chat_only",         label: "Chatroom Only",       desc: "Answers chatroom threads. Nothing else." },
];

function fmt(iso: string | null) {
  if (!iso) return "—";
  return new Date(iso).toLocaleString("en-US", { month: "short", day: "numeric", year: "numeric", hour: "numeric", minute: "2-digit" });
}

export default function TeamClient({ members, pending }: { members: Member[]; pending: Invite[] }) {
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<AdminRole>("accelerator_admin");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);

  async function sendInvite(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim() || busy) return;
    setBusy(true); setMsg(null);
    try {
      const r = await fetch("/api/admin/team/invite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim().toLowerCase(), role }),
      });
      const j = await r.json();
      if (!j.ok) throw new Error(j.error || "Invite failed");
      setMsg({ ok: true, text: `Invite sent to ${email}` });
      setEmail("");
      setTimeout(() => window.location.reload(), 900);
    } catch (err) {
      setMsg({ ok: false, text: err instanceof Error ? err.message : "Invite failed" });
    } finally { setBusy(false); }
  }

  async function revoke(kind: "invite" | "member", id: string) {
    if (!confirm(kind === "invite" ? "Revoke this pending invite?" : "Remove this teammate's admin access?")) return;
    const r = await fetch("/api/admin/team/revoke", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ kind, id }),
    });
    const j = await r.json();
    if (j.ok) window.location.reload();
    else alert(j.error || "Failed");
  }

  return (
    <div className="admin-page">
      <div className="admin-page-head">
        <div>
          <h1>Team</h1>
          <p className="admin-page-sub">Invite teammates and set what each can see. Only you (the Owner) can manage this list.</p>
        </div>
      </div>

      <div className="team-invite-card">
        <div className="team-invite-title">Invite teammate</div>
        <form onSubmit={sendInvite} className="team-invite-form">
          <input
            type="email"
            required
            placeholder="teammate@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="team-input"
          />
          <select value={role} onChange={(e) => setRole(e.target.value as AdminRole)} className="team-select">
            {INVITABLE.map((r) => (<option key={r.value} value={r.value}>{r.label}</option>))}
          </select>
          <button type="submit" disabled={busy || !email.trim()} className="team-send">
            {busy ? "Sending…" : "Send invite"}
          </button>
        </form>
        <p className="team-role-desc">{INVITABLE.find((r) => r.value === role)?.desc}</p>
        {msg && <p className={`team-msg team-msg-${msg.ok ? "ok" : "err"}`}>{msg.text}</p>}
      </div>

      {pending.length > 0 && (
        <>
          <h2 className="team-section-title">Pending invites</h2>
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr><th>Email</th><th>Role</th><th>Sent</th><th>Expires</th><th></th></tr>
              </thead>
              <tbody>
                {pending.map((p) => (
                  <tr key={p.id}>
                    <td>{p.email}</td>
                    <td><span className="admin-pill admin-pill-warm">{p.roleLabel}</span></td>
                    <td className="admin-td-when">{fmt(p.createdAt)}</td>
                    <td className="admin-td-sub">{fmt(p.expiresAt)}</td>
                    <td><button className="team-revoke" onClick={() => revoke("invite", p.id)}>Revoke</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      <h2 className="team-section-title">Teammates ({members.length})</h2>
      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead>
            <tr><th>Email</th><th>Name</th><th>Role</th><th>Joined</th><th>Last sign-in</th><th></th></tr>
          </thead>
          <tbody>
            {members.map((m) => (
              <tr key={m.id}>
                <td>{m.email}</td>
                <td>{m.name}</td>
                <td>
                  <span className={`admin-pill admin-pill-${m.role === "owner" ? "hot" : "warm"}`}>{m.roleLabel}</span>
                </td>
                <td className="admin-td-when">{fmt(m.joinedAt)}</td>
                <td className="admin-td-sub">{fmt(m.lastSigninAt)}</td>
                <td>
                  {m.role === "owner" ? (
                    <span className="admin-td-sub">Owner · locked</span>
                  ) : (
                    <button className="team-revoke" onClick={() => revoke("member", m.id)}>Remove</button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
