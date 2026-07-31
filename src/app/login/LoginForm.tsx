"use client";

/**
 * Client form for /login. Posts to /api/login, then hard-navigates to
 * /review on success so the Server Component layout picks up the new
 * am_review cookie.
 */

import { useState } from "react";

export default function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canSubmit = /^\S+@\S+\.\S+$/.test(email.trim()) && password.length >= 8 && !submitting;

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!canSubmit) return;
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim().toLowerCase(), password }),
      });
      const data = (await res.json()) as { ok: boolean; next?: string; error?: string };
      if (!res.ok || !data.ok) throw new Error(data.error || "Sign in failed");
      window.location.href = data.next || "/review";
    } catch (err) {
      setError(err instanceof Error ? err.message : "Sign in failed");
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="lg-form" autoComplete="on">
      <label className="lg-field">
        <span>Email</span>
        <input
          type="email"
          name="email"
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@company.com"
          required
          disabled={submitting}
        />
      </label>

      <label className="lg-field">
        <span>Password</span>
        <input
          type="password"
          name="password"
          autoComplete="current-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="••••••••"
          required
          minLength={8}
          disabled={submitting}
        />
      </label>

      {error && <p className="lg-error" role="alert">{error}</p>}

      <button type="submit" className="lg-cta" disabled={!canSubmit}>
        {submitting ? "Signing in..." : "SIGN IN"}
      </button>

      <style>{`
        .lg-form {
          display: flex;
          flex-direction: column;
          gap: 14px;
          text-align: left;
          margin-bottom: 6px;
        }
        .lg-field {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }
        .lg-field span {
          font-size: 11px;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          color: #9A9590;
          font-weight: 600;
        }
        .lg-field input {
          background: #0B0B0B;
          border: 1px solid #2A2A2A;
          border-radius: 8px;
          color: #F5F1E6;
          font-size: 14.5px;
          font-family: inherit;
          padding: 12px 14px;
          outline: none;
          transition: border-color 120ms ease, box-shadow 120ms ease;
        }
        .lg-field input:focus {
          border-color: #C9A84C;
          box-shadow: 0 0 0 3px rgba(201, 168, 76, 0.15);
        }
        .lg-field input:disabled {
          opacity: 0.55;
          cursor: not-allowed;
        }
        .lg-error {
          margin: 0;
          font-size: 13px;
          color: #E38A8A;
          background: rgba(227, 138, 138, 0.08);
          border: 1px solid rgba(227, 138, 138, 0.25);
          border-radius: 8px;
          padding: 10px 12px;
        }
        .lg-cta {
          margin-top: 8px;
          width: 100%;
          padding: 13px 22px;
          border-radius: 8px;
          border: 1px solid #C9A84C;
          background: #C9A84C;
          color: #0F0F0F;
          font-family: inherit;
          font-size: 13px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          cursor: pointer;
          transition: transform 80ms ease, opacity 120ms ease;
        }
        .lg-cta:hover:not(:disabled) { opacity: 0.94; }
        .lg-cta:active:not(:disabled) { transform: translateY(1px); }
        .lg-cta:disabled { opacity: 0.4; cursor: not-allowed; }
      `}</style>
    </form>
  );
}
