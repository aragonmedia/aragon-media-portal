"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

const PAYOUT_METHODS = [
  "ACH Bank Transfer (Same Day)",
  "Wire Transfer (3–5 Business Days)",
  "Crypto ($20 Minimum + Gas Fees)",
  "PayPal — Email or Phone (Instant)",
];

export default function WithdrawalFormClient({
  userEmail,
  userName,
  accounts,
  gated,
}: {
  userEmail: string;
  userName: string;
  accounts: { id: string; label: string; status: string }[];
  gated: boolean;
}) {
  const router = useRouter();
  const [email, setEmail] = useState(userEmail);
  const [name, setName] = useState(userName);
  const [accountId, setAccountId] = useState(accounts[0]?.id ?? "");
  const [amount, setAmount] = useState("");
  const [withdrawalDate, setWithdrawalDate] = useState("");
  const [sourceAccount, setSourceAccount] = useState("");
  const [payoutMethod, setPayoutMethod] = useState("");
  const [bankDetails, setBankDetails] = useState("");
  const [notes, setNotes] = useState("");
  const [fileName, setFileName] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [msg, setMsg] = useState<{ kind: "ok" | "err"; text: string } | null>(null);

  function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    setFileName(f ? f.name : null);
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (submitting) return;
    setMsg(null);
    if (gated) {
      setMsg({ kind: "err", text: "This is a preview. The form goes live once your contract is signed." });
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch("/api/withdrawals/submit", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          accountId,
          amount,
          withdrawalDate,
          sourceAccount,
          payoutMethod,
          bankDetails,
          notes,
          fileName,
        }),
      });
      const json = (await res.json()) as {
        ok: boolean;
        error?: string;
        redirect?: string;
        receiptNumber?: string;
      };
      if (!res.ok || !json.ok || !json.redirect) {
        const errMap: Record<string, string> = {
          unauthorized: "Your session expired. Please sign in again.",
          invalid_amount: "Enter a withdrawal amount greater than $0.",
          invalid_withdrawal_date: "Pick the date you withdrew from TikTok.",
          missing_source_account: "Tell us which Aragon account it came from.",
          missing_payout_method: "Choose a payout method.",
        };
        setMsg({ kind: "err", text: errMap[json.error ?? ""] ?? `Submission failed${json.error ? ` (${json.error})` : ""}.` });
        setSubmitting(false);
        return;
      }
      setMsg({ kind: "ok", text: `Submitted as ${json.receiptNumber}. Redirecting to your receipt…` });
      router.push(json.redirect);
    } catch (err) {
      setMsg({ kind: "err", text: `Network error — ${err instanceof Error ? err.message : "try again"}.` });
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={submit} className={`dash-card withdraw-form${gated ? " withdraw-form-gated" : ""}`}>
      <div className="form-grid">
        <label>
          <span>Email Address *</span>
          <input className="settings-input" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        </label>
        <label>
          <span>Full Name *</span>
          <input className="settings-input" type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Your legal name" required />
        </label>
      </div>

      <div className="form-grid">
        <label>
          <span>TikTok Account *</span>
          <select className="settings-input" value={accountId} onChange={(e) => setAccountId(e.target.value)} required>
            <option value="">Select your TikTok account</option>
            {accounts.map((a) => (
              <option key={a.id} value={a.id}>{a.label} ({a.status.replace("_", " ")})</option>
            ))}
            {accounts.length === 0 && <option value="" disabled>No accounts yet — add one in Settings</option>}
          </select>
        </label>
        <label>
          <span>Amount Withdrawn *</span>
          <input className="settings-input" type="text" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="$0.00" required />
          <span className="field-note">Exact amount shown on your TikTok withdrawal screen</span>
        </label>
      </div>

      <div className="form-grid">
        <label>
          <span>Date Withdrawn from TikTok *</span>
          <input className="settings-input" type="date" value={withdrawalDate} onChange={(e) => setWithdrawalDate(e.target.value)} required />
          <span className="field-note">The date you initiated the withdrawal in TikTok Shop. Required to enforce the 48-hour window.</span>
        </label>
        <label>
          <span>Aragon Source Account *</span>
          <input className="settings-input" type="text" value={sourceAccount} onChange={(e) => setSourceAccount(e.target.value)} placeholder="Which Aragon Media account it landed in" required />
          <span className="field-note">If unsure, name the bank or write the last 4 digits the AM team shared with you.</span>
        </label>
      </div>

      <div className="form-divider" />

      <div className="example-block">
        <div className="example-label">Example — what your TikTok withdrawal screenshot looks like</div>
        <div className="example-single">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/media/withdrawal-examples/example-1-details.png" alt="Example TikTok withdrawal screenshot" loading="lazy" />
        </div>
        <div className="example-note">Capture the screen showing the withdrawal amount + status. AM uses this to verify the payout request.</div>
      </div>

      <label className="upload-block">
        <span>Your TikTok Withdrawal Screenshot *</span>
        <div className="upload-drop">
          <input type="file" accept="image/*" onChange={onFile} className="upload-input" />
          <div className="upload-cta">{fileName ?? "Click or drop your TikTok withdrawal screen capture"}</div>
        </div>
        <span className="field-note">Required proof — screenshot of the withdrawal confirmation in your TikTok Shop dashboard.</span>
      </label>

      <div className="form-divider" />

      <div className="form-grid">
        <label>
          <span>Payout Method *</span>
          <select className="settings-input" value={payoutMethod} onChange={(e) => setPayoutMethod(e.target.value)} required>
            <option value="">Select an option</option>
            {PAYOUT_METHODS.map((m) => <option key={m} value={m}>{m}</option>)}
          </select>
          <span className="field-note">Submit once unless you want it changed</span>
        </label>
      </div>

      <label>
        <span>Bank / Payout Details *</span>
        <textarea className="settings-input" rows={4} value={bankDetails} onChange={(e) => setBankDetails(e.target.value)} placeholder="Write out your payment details — Name + Email, Account Numbers, Swift Codes or Crypto Wallet Addresses." required />
      </label>

      <div className="form-divider" />

      <label>
        <span>Notes (optional)</span>
        <textarea className="settings-input" rows={3} value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Anything the AM team should know about this withdrawal…" />
      </label>

      <div className="form-divider" />

      <div className="settings-actions">
        <button type="submit" className="dash-cta" disabled={submitting}>
          {submitting ? "Submitting…" : "Submit Withdrawal Request →"}
        </button>
        {msg && <span className={`settings-msg ${msg.kind === "ok" ? "ok" : "err"}`}>{msg.text}</span>}
      </div>
    </form>
  );
}
