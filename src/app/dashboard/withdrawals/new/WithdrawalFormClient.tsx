"use client";

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
  const [email, setEmail] = useState(userEmail);
  const [name, setName] = useState(userName);
  const [accountId, setAccountId] = useState(accounts[0]?.id ?? "");
  const [amount, setAmount] = useState("");
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
    // Real wire-up comes next round when /api/withdrawals POST exists
    setTimeout(() => {
      setMsg({ kind: "ok", text: "Submitted. AM team will review and process Mon–Fri. (Backend wire-up coming next round.)" });
      setSubmitting(false);
    }, 700);
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

      <div className="form-divider" />

      <div className="example-block">
        <div className="example-label">Example — what your TikTok withdrawal screenshot looks like</div>
        <div className="example-grid">
          {[1, 2, 3].map((n) => (
            <div key={n} className="example-tile">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={`/media/withdrawal-examples/example-${n}-${["details","history","progress"][n-1]}.png`} alt={`Withdrawal example ${n}`} loading="lazy" />
            </div>
          ))}
        </div>
        <div className="example-note">Capture the exact screen showing the withdrawal amount + status. AM uses this to verify the payout request.</div>
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
