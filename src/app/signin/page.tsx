"use client";

import Link from "next/link";
import { useState } from "react";

export default function SigninPage() {
  const [step, setStep] = useState<1 | 2>(1);
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [verifyNote, setVerifyNote] = useState<string | null>(null);

  const canSendCode = /^\S+@\S+\.\S+$/.test(email.trim());

  async function requestCode() {
    if (!canSendCode || submitting) return;
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/signin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim().toLowerCase() }),
      });
      const data = (await res.json()) as { ok: boolean; error?: string };
      if (!res.ok || !data.ok) throw new Error(data.error || "Could not send code");
      setStep(2);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not send code");
    } finally {
      setSubmitting(false);
    }
  }

  async function submitCode() {
    if (code.length !== 6 || submitting) return;
    setSubmitting(true);
    setError(null);
    setVerifyNote(null);
    try {
      const res = await fetch("/api/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim().toLowerCase(), code }),
      });
      const data = (await res.json()) as { ok: boolean; pending?: boolean; message?: string; error?: string };
      if (data.ok) {
        window.location.href = "/dashboard";
        return;
      }
      if (data.pending) {
        setVerifyNote(data.message || "Verification is pending a backend deploy.");
      } else {
        setError(data.error || "Verification failed");
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Verification failed");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="auth-page">
      <header className="auth-header">
        <Link href="/" className="logo">
          Aragon Media<span>Creator Partner Program</span>
        </Link>
        <div className="auth-stepper">
          <span className={`step-dot ${step >= 1 ? "on" : ""}`} />
          <span className={`step-dot ${step >= 2 ? "on" : ""}`} />
        </div>
      </header>

      {step === 1 && (
        <section className="auth-panel">
          <h1 className="auth-title">Sign in to Aragon Media</h1>
          <p className="auth-sub">Enter your email and we&apos;ll send you a 6-digit code.</p>

          <form
            className="auth-form"
            onSubmit={(e) => {
              e.preventDefault();
              requestCode();
            }}
          >
            <label className="auth-field">
              <span>Email</span>
              <input
                type="email"
                className="auth-input"
                placeholder="you@domain.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
                autoFocus
              />
            </label>

            {error && <div className="auth-error">{error}</div>}

            <div className="auth-actions">
              <button type="submit" className="btn-primary" disabled={!canSendCode || submitting}>
                {submitting ? "Sending..." : "Send me a code"}
              </button>
              <Link href="/signup" className="btn-ghost">
                New here? Create an account
              </Link>
            </div>
          </form>
        </section>
      )}

      {step === 2 && (
        <section className="auth-panel">
          <h1 className="auth-title">Enter your code</h1>
          <p className="auth-sub">
            We sent a 6-digit code to <strong>{email}</strong>. It expires in 15 minutes.
          </p>

          <form
            className="auth-form"
            onSubmit={(e) => {
              e.preventDefault();
              submitCode();
            }}
          >
            <label className="auth-field">
              <span>6-digit code</span>
              <input
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={6}
                className="auth-input auth-otp"
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                placeholder="------"
                autoFocus
              />
            </label>

            {error && <div className="auth-error">{error}</div>}
            {verifyNote && <div className="auth-note">{verifyNote}</div>}

            <div className="auth-actions">
              <button type="submit" className="btn-primary" disabled={code.length !== 6 || submitting}>
                {submitting ? "Verifying..." : "Verify & sign in"}
              </button>
              <button type="button" className="btn-ghost" onClick={() => setStep(1)}>
                &larr; Use a different email
              </button>
            </div>
          </form>
        </section>
      )}
    </main>
  );
}
