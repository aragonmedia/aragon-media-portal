"use client";

import { useState } from "react";

type Step = "email" | "code";

export default function AdminLogin() {
  const [step, setStep] = useState<Step>("email");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);

  function startCooldown() {
    setResendCooldown(60);
    const id = setInterval(() => {
      setResendCooldown((s) => {
        if (s <= 1) {
          clearInterval(id);
          return 0;
        }
        return s - 1;
      });
    }, 1000);
  }

  async function requestCode(e?: React.FormEvent) {
    e?.preventDefault();
    if (submitting) return;
    setSubmitting(true);
    setError(null);
    setInfo(null);
    try {
      const res = await fetch("/api/admin/request-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim().toLowerCase() }),
      });
      const data = (await res.json()) as { ok: boolean; error?: string };
      if (!res.ok || !data.ok) {
        setError(data.error || "Couldn't send code. Try again.");
        return;
      }
      setStep("code");
      setInfo("If this email is on the admin list, a 6-digit code is on its way. Check your inbox.");
      startCooldown();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Network error.");
    } finally {
      setSubmitting(false);
    }
  }

  async function verifyCode(e: React.FormEvent) {
    e.preventDefault();
    if (submitting) return;
    setSubmitting(true);
    setError(null);
    setInfo(null);
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim().toLowerCase(), code }),
      });
      const data = (await res.json()) as { ok: boolean; error?: string };
      if (!res.ok || !data.ok) {
        setError(data.error || "Couldn't sign in. Check the code and try again.");
        return;
      }
      window.location.reload();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Network error.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="admin-gate">
      <div className="admin-gate-card">
        <p className="admin-eyebrow">Aragon Media · Internal</p>
        <h1>Operations console</h1>

        {step === "email" && (
          <>
            <p className="admin-gate-sub">
              Enter your admin email. We&apos;ll send a 6-digit code to your
              inbox to sign in. No password needed.
            </p>
            <form onSubmit={requestCode}>
              <input
                type="email"
                placeholder="you@aragon.media"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="admin-input"
                autoFocus
                autoComplete="email"
                required
              />
              {error && <div className="admin-error">{error}</div>}
              <button
                type="submit"
                className="admin-submit"
                disabled={submitting || !email}
              >
                {submitting ? "Sending code…" : "Email me a sign-in code"}
              </button>
            </form>
          </>
        )}

        {step === "code" && (
          <>
            <p className="admin-gate-sub">
              Enter the 6-digit code we just emailed to{" "}
              <strong>{email}</strong>. The code expires in 15 minutes.
            </p>
            <form onSubmit={verifyCode}>
              <input
                type="text"
                inputMode="numeric"
                pattern="\d{6}"
                maxLength={6}
                placeholder="••••••"
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                className="admin-input admin-input-otp"
                autoFocus
                autoComplete="one-time-code"
                required
              />
              {info && <div className="admin-info">{info}</div>}
              {error && <div className="admin-error">{error}</div>}
              <button
                type="submit"
                className="admin-submit"
                disabled={submitting || code.length !== 6}
              >
                {submitting ? "Verifying…" : "Verify & sign in"}
              </button>
              <div className="admin-gate-foot">
                <button
                  type="button"
                  className="admin-link"
                  onClick={() => {
                    setStep("email");
                    setCode("");
                    setError(null);
                    setInfo(null);
                  }}
                >
                  ← Use a different email
                </button>
                <button
                  type="button"
                  className="admin-link"
                  onClick={requestCode}
                  disabled={submitting || resendCooldown > 0}
                >
                  {resendCooldown > 0
                    ? `Resend code in ${resendCooldown}s`
                    : "Didn't get it? Resend"}
                </button>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
