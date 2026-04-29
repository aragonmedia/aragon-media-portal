"use client";

import { useState } from "react";

export default function AdminLogin() {
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (submitting) return;
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      const data = (await res.json()) as { ok: boolean; error?: string };
      if (data.ok) {
        window.location.reload();
      } else {
        setError(data.error || "Login failed");
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Login failed");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="admin-gate">
      <div className="admin-gate-card">
        <p className="admin-eyebrow">Aragon Media · Internal</p>
        <h1>Operations console</h1>
        <p className="admin-gate-sub">Enter the team password to continue.</p>
        <form onSubmit={submit}>
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="admin-input"
            autoFocus
          />
          {error && <div className="admin-error">{error}</div>}
          <button type="submit" className="admin-submit" disabled={submitting || !password}>
            {submitting ? "Signing in…" : "Sign in"}
          </button>
        </form>
      </div>
    </div>
  );
}
