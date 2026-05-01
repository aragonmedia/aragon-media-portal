"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function SignForm({
  defaultName,
  contractVersion,
  disabled,
}: {
  defaultName: string;
  contractVersion: string;
  disabled?: boolean;
}) {
  const router = useRouter();
  const [signature, setSignature] = useState(defaultName);
  const [confirmed, setConfirmed] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [msg, setMsg] = useState<{ kind: "ok" | "err"; text: string } | null>(
    null
  );

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (disabled || submitting) return;
    setMsg(null);
    if (signature.trim().length < 2) {
      setMsg({ kind: "err", text: "Type your full name to sign." });
      return;
    }
    if (!confirmed) {
      setMsg({ kind: "err", text: "Confirm you've read the agreement." });
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch("/api/agreement/sign", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ signature: signature.trim() }),
      });
      const json = (await res.json()) as { ok: boolean; error?: string };
      if (!res.ok || !json.ok) {
        const errMap: Record<string, string> = {
          unauthorized: "Your session expired. Sign in again.",
          contract_locked:
            "Your agreement isn't unlocked yet — message AM in chat.",
          invalid_signature: "Type your full name to sign.",
          already_signed: "You've already signed this agreement.",
        };
        setMsg({
          kind: "err",
          text:
            errMap[json.error ?? ""] ??
            `Couldn't save${json.error ? ` (${json.error})` : ""}.`,
        });
        setSubmitting(false);
        return;
      }
      setMsg({ kind: "ok", text: "Signed. Refreshing your record…" });
      router.refresh();
    } catch (err) {
      setMsg({
        kind: "err",
        text: `Network error — ${err instanceof Error ? err.message : "try again"}.`,
      });
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={submit} className="agr-sign-form">
      <label className="agr-sign-label">
        <span>Sign here — type your full legal name</span>
        <input
          className="settings-input agr-sign-input"
          type="text"
          value={signature}
          onChange={(e) => setSignature(e.target.value)}
          placeholder="e.g. Kevin Aragon"
          disabled={disabled || submitting}
          maxLength={200}
        />
        <span className="field-note">
          This typed name is your legally enforceable mark on contract version{" "}
          <strong>{contractVersion}</strong>.
        </span>
      </label>

      <label className="agr-sign-confirm">
        <input
          type="checkbox"
          checked={confirmed}
          onChange={(e) => setConfirmed(e.target.checked)}
          disabled={disabled || submitting}
        />
        <span>
          I&apos;ve read every section above and agree to be bound by this
          Operations Agreement.
        </span>
      </label>

      <div className="settings-actions">
        <button
          type="submit"
          className="dash-cta"
          disabled={disabled || submitting}
        >
          {submitting ? "Signing…" : "Sign Operations Agreement"}
        </button>
        {msg && (
          <span className={`settings-msg ${msg.kind === "ok" ? "ok" : "err"}`}>
            {msg.text}
          </span>
        )}
      </div>
    </form>
  );
}
