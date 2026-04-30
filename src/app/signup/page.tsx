"use client";

import Link from "next/link";
import { useState } from "react";

type Role = "creator" | "brand" | "other";

export default function SignupPage() {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [role, setRole] = useState<Role | null>(null);
  const [otherText, setOtherText] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [handle, setHandle] = useState("");
  const [code, setCode] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [verifyNote, setVerifyNote] = useState<string | null>(null);

  const canAdvanceStep1 = role !== null && (role !== "other" || otherText.trim().length > 1);
  const canAdvanceStep2 =
    name.trim().length >= 2 &&
    /^\S+@\S+\.\S+$/.test(email.trim()) &&
    (role === "other" ? true : handle.trim().length >= 2);

  const handleLabel =
    role === "brand" ? "Brand name" : role === "creator" ? "TikTok handle" : "Handle or identifier";
  const handlePlaceholder =
    role === "brand" ? "Acme Apparel" : role === "creator" ? "@yourhandle" : "@yourhandle";

  async function submitOnboarding() {
    if (!canAdvanceStep2 || submitting) return;
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          role,
          otherText: role === "other" ? otherText.trim() : null,
          name: name.trim(),
          email: email.trim().toLowerCase(),
          handle: handle.trim(),
        }),
      });
      const data = (await res.json()) as { ok: boolean; error?: string };
      if (!res.ok || !data.ok) throw new Error(data.error || "Signup failed");
      setStep(3);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Signup failed");
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
        body: JSON.stringify({ email: email.trim().toLowerCase(), code, purpose: "signup" }),
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
          <span className={`step-dot ${step >= 3 ? "on" : ""}`} />
        </div>
      </header>

      {step === 1 && (
        <section className="auth-panel">
          <h1 className="auth-title">What describes you best?</h1>
          <p className="auth-sub">Help us tailor your Aragon Media onboarding.</p>

          <div className="role-grid">
            <button
              type="button"
              className={`role-card ${role === "creator" ? "selected" : ""}`}
              onClick={() => setRole("creator")}
            >
              <div className="role-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="8" r="4" />
                  <path d="M4 21v-2a6 6 0 0 1 6-6h4a6 6 0 0 1 6 6v2" />
                </svg>
              </div>
              <h3>Creator</h3>
              <p>I create content and want to earn commissions through TikTok Shop.</p>
            </button>

            <button
              type="button"
              className={`role-card ${role === "brand" ? "selected" : ""}`}
              onClick={() => setRole("brand")}
            >
              <div className="role-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M3 9l9-6 9 6v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                  <path d="M9 22V12h6v10" />
                </svg>
              </div>
              <h3>Brand</h3>
              <p>I run or represent a brand and want to partner with verified creators.</p>
            </button>

            <button
              type="button"
              className={`role-card ${role === "other" ? "selected" : ""}`}
              onClick={() => setRole("other")}
            >
              <div className="role-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="9" />
                  <path d="M9.5 9a2.5 2.5 0 1 1 3 2.4c-.9.3-1.5 1-1.5 2" />
                  <circle cx="11.95" cy="16.5" r="0.75" fill="currentColor" />
                </svg>
              </div>
              <h3>Other</h3>
              <p>Something else &mdash; tell us a bit about yourself.</p>
            </button>
          </div>

          {role === "other" && (
            <input
              type="text"
              className="auth-input"
              placeholder="Briefly: what do you do? (e.g. agency, affiliate, etc.)"
              value={otherText}
              onChange={(e) => setOtherText(e.target.value)}
              maxLength={140}
            />
          )}

          <div className="auth-actions">
            <button
              type="button"
              className="btn-primary"
              disabled={!canAdvanceStep1}
              onClick={() => setStep(2)}
            >
              Continue
            </button>
            <Link href="/" className="btn-ghost">Back to home</Link>
          </div>
        </section>
      )}

      {step === 2 && (
        <section className="auth-panel">
          <h1 className="auth-title">Tell us about yourself</h1>
          <p className="auth-sub">Quick details so we can set up your account.</p>

          <form
            className="auth-form"
            onSubmit={(e) => {
              e.preventDefault();
              submitOnboarding();
            }}
          >
            <label className="auth-field">
              <span>Full name</span>
              <input
                type="text"
                className="auth-input"
                placeholder="Jane Doe"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                autoComplete="name"
              />
            </label>

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
              />
            </label>

            <label className="auth-field">
              <span>{handleLabel}</span>
              <input
                type="text"
                className="auth-input"
                placeholder={handlePlaceholder}
                value={handle}
                onChange={(e) => setHandle(e.target.value)}
                autoComplete="off"
              />
            </label>

            {error && <div className="auth-error">{error}</div>}

            <div className="auth-actions">
              <button type="submit" className="btn-primary" disabled={!canAdvanceStep2 || submitting}>
                {submitting ? "Sending..." : "Send verification code"}
              </button>
              <button type="button" className="btn-ghost" onClick={() => setStep(1)}>
                &larr; Back
              </button>
            </div>

            <p className="auth-legal">
              By continuing you agree to the{" "}
              <a href="/terms" className="auth-legal-link">Terms of Service</a> and{" "}
              <a href="/privacy" className="auth-legal-link">Privacy Policy</a>. Aragon Media will never share
              your info or post to your accounts without permission.
            </p>
          </form>
        </section>
      )}

      {step === 3 && (
        <section className="auth-panel">
          <h1 className="auth-title">Check your email</h1>
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
              <span>Enter your 6-digit code</span>
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
                {submitting ? "Verifying..." : "Verify & continue"}
              </button>
              <Link href="/book-a-demo" className="btn-ghost">
                Book a demo instead (optional)
              </Link>
            </div>

            <p className="auth-legal">
              Didn&apos;t get the email? Check spam, or{" "}
              <button
                type="button"
                className="auth-legal-link"
                onClick={() => setStep(2)}
              >
                re-enter your email
              </button>
              .
            </p>
          </form>
        </section>
      )}
    </main>
  );
}
