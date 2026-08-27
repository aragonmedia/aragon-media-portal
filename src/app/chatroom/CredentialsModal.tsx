"use client";

import { useState } from "react";

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

  return (
    <div className="cred-overlay" onClick={onClose}>
      <div className="cred-modal" onClick={(e) => e.stopPropagation()}>
        <div className="cred-head">
          <div>
            <div className="cred-eyebrow">SECURE SUBMISSION</div>
            <h2>Submit your TikTok login</h2>
            <p>
              Encrypted at rest with AES-256-GCM. Only Kevin + Roni can
              decrypt it inside the admin console. Never emailed in plain
              text, never logged.
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
            <strong>Heads up:</strong> TikTok will email a 6-digit
            verification code to your TikTok email when we sign in.
            Watch that inbox and just type the code back to us as a
            reply in this chat.
          </div>

          {error && <div className="cred-error">{error}</div>}

          <div className="cred-actions">
            <button type="button" className="cred-cancel" onClick={onClose}>Cancel</button>
            <button type="submit" className="cred-submit" disabled={submitting}>
              {submitting ? "Encrypting + Sending…" : "🔒 Submit login securely"}
            </button>
          </div>
        </form>

        <style jsx>{`
          .cred-overlay {
            position: fixed; inset: 0;
            background: rgba(0, 0, 0, 0.72);
            backdrop-filter: blur(6px);
            display: flex; align-items: center; justify-content: center;
            z-index: 200; padding: 20px;
          }
          .cred-modal {
            background: var(--taa-bg-elev);
            border: 1px solid var(--taa-border-strong);
            border-radius: 14px;
            width: 100%;
            max-width: 540px;
            max-height: 92vh;
            overflow-y: auto;
            box-shadow: 0 20px 60px rgba(0, 0, 0, 0.6), 0 0 40px rgba(220, 30, 46, 0.12);
          }
          .cred-head {
            display: flex; justify-content: space-between; align-items: flex-start;
            padding: 26px 28px 18px;
            border-bottom: 1px solid var(--taa-border);
            gap: 16px;
          }
          .cred-eyebrow {
            font-size: 10.5px; letter-spacing: 0.24em;
            color: var(--taa-red); font-weight: 700;
            text-transform: uppercase; margin-bottom: 6px;
          }
          .cred-head h2 {
            margin: 0; font-size: 20px; font-weight: 800;
            color: var(--taa-white); letter-spacing: -0.01em;
          }
          .cred-head p {
            margin: 8px 0 0; font-size: 12.5px; color: var(--taa-muted);
            line-height: 1.5;
          }
          .cred-close {
            background: transparent; border: none;
            color: var(--taa-muted); font-size: 26px; cursor: pointer;
            padding: 0 4px; line-height: 1;
          }
          .cred-close:hover { color: var(--taa-red); }

          .cred-form {
            padding: 22px 28px 26px;
            display: flex; flex-direction: column; gap: 16px;
          }
          .cred-row { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
          .cred-form label {
            display: flex; flex-direction: column; gap: 6px;
            font-size: 11.5px; color: var(--taa-muted);
            font-weight: 700; letter-spacing: 0.08em; text-transform: uppercase;
          }
          .cred-form input, .cred-form textarea {
            background: var(--taa-bg-card);
            border: 1px solid var(--taa-border-strong);
            border-radius: 8px;
            color: var(--taa-text);
            padding: 10px 14px;
            font-family: inherit;
            font-size: 13.5px;
            letter-spacing: normal;
            text-transform: none;
            outline: none;
          }
          .cred-form input:focus, .cred-form textarea:focus { border-color: var(--taa-red); }
          .cred-form textarea { resize: vertical; min-height: 60px; }
          .cred-password { display: flex; gap: 8px; }
          .cred-password input { flex: 1; }
          .cred-eye {
            background: var(--taa-bg-card);
            border: 1px solid var(--taa-border-strong);
            color: var(--taa-muted); font-family: inherit;
            font-size: 11px; font-weight: 700;
            padding: 0 14px; border-radius: 8px; cursor: pointer;
            letter-spacing: 0.06em; text-transform: uppercase;
          }
          .cred-eye:hover { color: var(--taa-red); border-color: var(--taa-red); }

          .cred-warning {
            background: rgba(220, 30, 46, 0.06);
            border: 1px solid rgba(220, 30, 46, 0.28);
            border-left: 3px solid var(--taa-red);
            border-radius: 8px;
            padding: 12px 14px;
            font-size: 12.5px; color: var(--taa-muted);
            line-height: 1.55;
          }
          .cred-warning strong { color: var(--taa-white); font-weight: 700; }

          .cred-error {
            color: var(--taa-red); font-size: 13px; font-weight: 600;
            padding: 8px 12px;
            background: rgba(220, 30, 46, 0.08);
            border-radius: 6px;
          }

          .cred-actions { display: flex; gap: 10px; justify-content: flex-end; }
          .cred-cancel {
            background: transparent; border: 1px solid var(--taa-border-strong);
            color: var(--taa-muted); font: inherit;
            font-size: 12.5px; font-weight: 700;
            padding: 10px 16px; border-radius: 8px; cursor: pointer;
            letter-spacing: 0.06em; text-transform: uppercase;
          }
          .cred-cancel:hover { color: var(--taa-white); border-color: var(--taa-white); }
          .cred-submit {
            background: var(--taa-red); border: 1px solid var(--taa-red);
            color: var(--taa-white); font: inherit;
            font-size: 12.5px; font-weight: 700;
            padding: 10px 18px; border-radius: 8px; cursor: pointer;
            letter-spacing: 0.06em; text-transform: uppercase;
            transition: transform 120ms ease, box-shadow 120ms ease, opacity 120ms ease;
          }
          .cred-submit:hover:not(:disabled) {
            transform: translateY(-1px);
            box-shadow: 0 8px 24px -8px var(--taa-red-glow);
            background: var(--taa-red-bright);
          }
          .cred-submit:disabled { opacity: 0.6; cursor: progress; }

          @media (max-width: 640px) {
            .cred-row { grid-template-columns: 1fr; }
          }
        `}</style>
      </div>
    </div>
  );
}
