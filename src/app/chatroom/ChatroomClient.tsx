"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { upload } from "@vercel/blob/client";
import CredentialsModal from "./CredentialsModal";

type Msg = {
  id: string;
  sender: "user" | "am";
  body: string;
  attachments: string[];
  createdAt: string;
};

type Thread = {
  id: string;
  email: string;
  name: string;
  createdAt: string;
};

const POLL_INTERVAL_MS = 15_000;
const MAX_ATTACHMENTS = 4;

export default function ChatroomClient({ calendlyUrl }: { calendlyUrl: string }) {
  const [gate, setGate] = useState({ email: "", name: "" });
  const [thread, setThread] = useState<Thread | null>(null);
  const [messages, setMessages] = useState<Msg[]>([]);
  const [composer, setComposer] = useState("");
  const [pending, setPending] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const [sending, setSending] = useState(false);
  const [showCreds, setShowCreds] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const feedRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Persist gate values so refresh doesn't kick you out
  useEffect(() => {
    try {
      const email = localStorage.getItem("am_chatroom_email") ?? "";
      const name = localStorage.getItem("am_chatroom_name") ?? "";
      if (email) setGate({ email, name });
    } catch {}
  }, []);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    feedRef.current?.scrollTo({ top: feedRef.current.scrollHeight, behavior: "smooth" });
  }, [messages.length]);

  const openThread = useCallback(async () => {
    setError(null);
    try {
      const res = await fetch("/api/chatroom/threads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: gate.email.trim(), name: gate.name.trim() }),
      });
      const j = await res.json();
      if (!j.ok) throw new Error(j.error || "Couldn't open the chat.");
      setThread(j.thread);
      setMessages(j.messages);
      try {
        localStorage.setItem("am_chatroom_email", gate.email.trim());
        localStorage.setItem("am_chatroom_name", gate.name.trim());
      } catch {}
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong.");
    }
  }, [gate.email, gate.name]);

  // Poll for admin replies while a thread is open
  useEffect(() => {
    if (!thread) return;
    const t = setInterval(async () => {
      try {
        const res = await fetch("/api/chatroom/threads", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: gate.email, name: gate.name }),
          cache: "no-store",
        });
        const j = await res.json();
        if (j.ok) setMessages(j.messages);
      } catch {}
    }, POLL_INTERVAL_MS);
    return () => clearInterval(t);
  }, [thread, gate.email, gate.name]);

  function addFiles(files: FileList | File[]) {
    const list = Array.from(files).filter((f) => f.type.startsWith("image/"));
    setPending((cur) => [...cur, ...list].slice(0, MAX_ATTACHMENTS));
  }

  function removePending(i: number) {
    setPending((cur) => cur.filter((_, idx) => idx !== i));
  }

  async function uploadPending(): Promise<string[]> {
    if (pending.length === 0) return [];
    setUploading(true);
    const urls: string[] = [];
    try {
      for (const file of pending) {
        const safeName = file.name.replace(/[^a-zA-Z0-9._-]+/g, "_");
        const path = `chatroom/${Date.now()}-${safeName}`;
        const blob = await upload(path, file, {
          access: "public",
          handleUploadUrl: "/api/chatroom/upload",
        });
        urls.push(blob.url);
      }
    } finally {
      setUploading(false);
    }
    return urls;
  }

  async function send(e?: React.FormEvent) {
    e?.preventDefault();
    if (!thread || sending) return;
    const text = composer.trim();
    if (!text && pending.length === 0) return;
    setSending(true);
    setError(null);
    try {
      const attachments = await uploadPending();
      const res = await fetch("/api/chatroom/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ threadId: thread.id, body: text, attachments }),
      });
      const j = await res.json();
      if (!j.ok) throw new Error(j.error || "Send failed.");
      setMessages((cur) => [...cur, j.message]);
      setComposer("");
      setPending([]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Send failed.");
    } finally {
      setSending(false);
    }
  }

  async function submitCredentials(payload: {
    tiktokUsername: string;
    tiktokEmail: string;
    password: string;
    backupCode: string;
    notes: string;
  }) {
    if (!thread) return;
    const res = await fetch("/api/chatroom/credentials", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ threadId: thread.id, ...payload }),
    });
    const j = await res.json();
    if (!j.ok) throw new Error(j.error || "Submission failed.");
    setMessages((cur) => [...cur, j.message]);
    setShowCreds(false);
  }

  // ============================================================
  // Pre-gate view — email + name capture
  // ============================================================
  if (!thread) {
    return (
      <div className="taa-shell">
        <div className="taa-bg" aria-hidden><div className="taa-grid" /><div className="taa-radar" /></div>

        <Header />

        <section className="taa-hero">
          <div className="taa-hero-eyebrow">VERIFY YOUR PURCHASE</div>
          <h1>
            Chat with{" "}
            <span className="taa-hero-accent">Aragon Media × Accelerator</span>
          </h1>
          <p className="taa-hero-sub">
            Bought an account through <b>Nick G&apos;s Discord</b>? The team
            handles activation, TikTok Shop onboarding, and payout setup
            with you here. Drop your email to start.
          </p>

          <form className="cr-gate" onSubmit={(e) => { e.preventDefault(); openThread(); }}>
            <div className="cr-gate-row">
              <label>
                <span>Your name</span>
                <input
                  type="text"
                  value={gate.name}
                  onChange={(e) => setGate((g) => ({ ...g, name: e.target.value }))}
                  placeholder="Full name"
                  required
                />
              </label>
              <label>
                <span>Your email</span>
                <input
                  type="email"
                  value={gate.email}
                  onChange={(e) => setGate((g) => ({ ...g, email: e.target.value }))}
                  placeholder="you@example.com"
                  required
                />
              </label>
            </div>
            <button type="submit" className="taa-cta" disabled={!gate.email || !gate.name}>
              <span>Open verification chat</span>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="M13 6l6 6-6 6"/></svg>
            </button>
            {error && <p className="cr-error">{error}</p>}
            <p className="cr-privacy">
              Your email + name are used to route the conversation. Any
              login info you share is encrypted at rest and only visible
              to authorized admins in the private console.
            </p>
          </form>
        </section>

        <Footer calendlyUrl={calendlyUrl} />
        <Styles />
      </div>
    );
  }

  // ============================================================
  // Thread view
  // ============================================================
  return (
    <div className="taa-shell">
      <div className="taa-bg" aria-hidden><div className="taa-grid" /><div className="taa-radar" /></div>
      <Header />

      <section className="cr-thread-wrap">
        <div className="cr-thread-head">
          <div>
            <p className="cr-thread-eyebrow">Verification chat · Thread open</p>
            <h1>
              Hi <span className="taa-hero-accent">{thread.name.split(/\s+/)[0]}</span>
            </h1>
            <p className="cr-thread-sub">
              We reply as soon as we see it. During verification TikTok
              emails a 6-digit code — just paste it back to us here when
              it arrives.
            </p>
          </div>
        </div>

        <div className="cr-thread-card">
          <div ref={feedRef} className="cr-feed">
            {messages.length === 0 ? (
              <div className="cr-feed-empty">
                <p>Say hi and we&apos;ll take it from there.</p>
                <p className="cr-feed-empty-sub">
                  Or use <b>Submit TikTok Login</b> below to send credentials
                  securely — encrypted, admin-only visibility.
                </p>
              </div>
            ) : (
              messages.map((m) => (
                <div key={m.id} className={`cr-msg cr-msg-${m.sender}`}>
                  <div className="cr-msg-body">
                    {m.body && <p>{m.body}</p>}
                    {m.attachments.length > 0 && (
                      <div className="cr-msg-attachments">
                        {m.attachments.map((url) => (
                          <a key={url} href={url} target="_blank" rel="noopener noreferrer">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src={url} alt="attachment" />
                          </a>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="cr-msg-meta">
                    <span>{m.sender === "user" ? "You" : "AM Team"}</span>
                    <span>·</span>
                    <span>{new Date(m.createdAt).toLocaleString()}</span>
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="cr-quicks">
            <a href={calendlyUrl} target="_blank" rel="noopener noreferrer" className="cr-quick">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="4" width="18" height="18" rx="2" />
                <path d="M16 2v4M8 2v4M3 10h18" />
              </svg>
              <span>Book a Call</span>
            </a>
            <button type="button" className="cr-quick" onClick={() => setShowCreds(true)}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="11" width="18" height="10" rx="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
              <span>Submit TikTok Login</span>
            </button>
          </div>

          <div className="cr-heads-up">
            <b>Heads up:</b> TikTok emails a 6-digit code when we sign in — paste it back here as a message.
          </div>

          <form
            className={`cr-composer${dragOver ? " drag" : ""}`}
            onSubmit={send}
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={(e) => {
              e.preventDefault();
              setDragOver(false);
              addFiles(e.dataTransfer.files);
            }}
          >
            {pending.length > 0 && (
              <div className="cr-pending">
                {pending.map((f, i) => (
                  <div key={i} className="cr-pending-item">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={URL.createObjectURL(f)} alt="pending upload" />
                    <button type="button" onClick={() => removePending(i)} aria-label="Remove">×</button>
                  </div>
                ))}
              </div>
            )}

            <textarea
              value={composer}
              onChange={(e) => setComposer(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  send();
                }
              }}
              placeholder="Type a message… (drag images anywhere in this box to attach up to 4)"
              rows={2}
              disabled={sending}
            />

            <div className="cr-composer-actions">
              <label className="cr-attach">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  hidden
                  onChange={(e) => { if (e.target.files) addFiles(e.target.files); }}
                />
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                  <path d="m21.44 11.05-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66L9.41 17.41a2 2 0 0 1-2.83-2.83l8.49-8.49" />
                </svg>
                <span>{pending.length}/{MAX_ATTACHMENTS}</span>
              </label>
              <div className="cr-composer-spacer" />
              <button
                type="submit"
                className="cr-send"
                disabled={sending || uploading || (!composer.trim() && pending.length === 0)}
              >
                {uploading ? "Uploading…" : sending ? "Sending…" : "Send"}
              </button>
            </div>
            {error && <p className="cr-error">{error}</p>}
          </form>
        </div>
      </section>

      <Footer calendlyUrl={calendlyUrl} />
      <Styles />

      {showCreds && (
        <CredentialsModal
          onClose={() => setShowCreds(false)}
          onSubmit={submitCredentials}
        />
      )}
    </div>
  );
}

function Header() {
  return (
    <header className="taa-header">
      <Link href="/chatroom" className="taa-brand">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/accelerator/wolf-transparent.png" alt="" width={44} height={44} />
        <div className="taa-brand-text">
          <span className="taa-brand-tag">TIKTOK AFFILIATE</span>
          <span className="taa-brand-name">ACCELERATOR</span>
        </div>
        <span className="cr-brand-x">×</span>
        <div className="taa-brand-text">
          <span className="taa-brand-tag">POWERED BY</span>
          <span className="taa-brand-name" style={{ color: "var(--taa-white)" }}>ARAGON MEDIA</span>
        </div>
      </Link>
      <div className="taa-header-actions">
        <Link href="/accounts" className="taa-view-live"><span>← Back to accounts</span></Link>
      </div>
    </header>
  );
}

function Footer({ calendlyUrl }: { calendlyUrl: string }) {
  return (
    <footer className="taa-footer">
      <div className="taa-footer-info">
        <span className="taa-footer-line">
          <span className="taa-footer-dot" /> Verification chat
        </span>
        <span className="taa-footer-powered">
          Powered by <b>Aragon Media</b> × <b>Accelerator</b>
        </span>
      </div>
      <a href={calendlyUrl} target="_blank" rel="noopener noreferrer">
        Book a call →
      </a>
    </footer>
  );
}

function Styles() {
  return (
    <style>{`
      .cr-brand-x {
        color: var(--taa-red);
        font-size: 22px;
        font-weight: 900;
        margin: 0 4px;
      }
      .cr-gate {
        display: flex; flex-direction: column; gap: 14px;
        margin-top: 26px;
        max-width: 620px;
      }
      .cr-gate-row { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
      .cr-gate label { display: flex; flex-direction: column; gap: 6px; font-size: 11px; letter-spacing: 0.16em; text-transform: uppercase; color: var(--taa-muted); font-weight: 700; }
      .cr-gate input {
        background: var(--taa-bg-card);
        border: 1px solid var(--taa-border-strong);
        border-radius: 8px;
        color: var(--taa-text);
        padding: 10px 14px;
        font: inherit; font-size: 14px;
        letter-spacing: normal; text-transform: none;
        outline: none;
      }
      .cr-gate input:focus { border-color: var(--taa-red); }
      .cr-gate .taa-cta { align-self: flex-start; }
      .cr-privacy { margin: 4px 0 0; font-size: 12px; color: var(--taa-sub); max-width: 560px; }
      .cr-error { color: var(--taa-red); font-size: 13px; font-weight: 600; margin: 8px 0 0; }

      /* Thread */
      .cr-thread-wrap { max-width: 900px; margin: 0 auto; padding: 40px 40px 30px; }
      .cr-thread-head { margin-bottom: 22px; }
      .cr-thread-eyebrow { margin: 0 0 6px; font-size: 11px; letter-spacing: 0.2em; color: var(--taa-red); font-weight: 700; text-transform: uppercase; }
      .cr-thread-head h1 { margin: 0; font-size: 36px; font-weight: 900; letter-spacing: -0.02em; text-transform: uppercase; color: var(--taa-white); }
      .cr-thread-sub { margin: 10px 0 0; color: var(--taa-muted); font-size: 13.5px; line-height: 1.6; max-width: 640px; }

      .cr-thread-card {
        background: var(--taa-bg-card);
        border: 1px solid var(--taa-border);
        border-radius: 14px;
        display: flex; flex-direction: column;
        overflow: hidden;
      }
      .cr-feed {
        padding: 20px 22px;
        max-height: 520px;
        overflow-y: auto;
        display: flex; flex-direction: column; gap: 14px;
      }
      .cr-feed-empty {
        padding: 40px 20px; text-align: center;
        color: var(--taa-muted);
      }
      .cr-feed-empty p { margin: 0; font-size: 14px; }
      .cr-feed-empty-sub { margin-top: 8px !important; font-size: 12.5px; color: var(--taa-sub); }
      .cr-feed-empty b { color: var(--taa-white); }

      .cr-msg { max-width: 78%; padding: 12px 14px; border-radius: 12px; }
      .cr-msg-user {
        margin-left: auto;
        background: rgba(220, 30, 46, 0.12);
        border: 1px solid rgba(220, 30, 46, 0.32);
      }
      .cr-msg-am {
        background: var(--taa-bg-elev);
        border: 1px solid var(--taa-border-strong);
      }
      .cr-msg-body p { margin: 0; font-size: 14px; line-height: 1.55; color: var(--taa-text); white-space: pre-wrap; word-break: break-word; }
      .cr-msg-meta { margin-top: 6px; font-size: 10.5px; letter-spacing: 0.08em; text-transform: uppercase; color: var(--taa-sub); font-weight: 700; display: flex; gap: 5px; }
      .cr-msg-attachments { display: flex; gap: 8px; flex-wrap: wrap; margin-top: 8px; }
      .cr-msg-attachments a { display: block; }
      .cr-msg-attachments img { max-width: 140px; max-height: 140px; border-radius: 8px; border: 1px solid var(--taa-border-strong); }

      .cr-quicks {
        display: flex; gap: 8px; padding: 10px 22px;
        border-top: 1px solid var(--taa-border);
        background: var(--taa-bg-2);
        flex-wrap: wrap;
      }
      .cr-quick {
        display: inline-flex; align-items: center; gap: 8px;
        padding: 9px 14px;
        background: transparent;
        border: 1px solid var(--taa-border-strong);
        color: var(--taa-text);
        font: inherit; font-size: 12px; font-weight: 700;
        letter-spacing: 0.06em; text-transform: uppercase;
        border-radius: 8px; cursor: pointer; text-decoration: none;
        transition: border-color 150ms ease, color 150ms ease, background 150ms ease;
      }
      .cr-quick:hover {
        border-color: var(--taa-red);
        color: var(--taa-red);
        background: rgba(220, 30, 46, 0.06);
      }

      .cr-heads-up {
        padding: 10px 22px;
        border-top: 1px solid var(--taa-border);
        background: rgba(220, 30, 46, 0.04);
        color: var(--taa-muted);
        font-size: 12px;
        line-height: 1.5;
      }
      .cr-heads-up b { color: var(--taa-white); }

      .cr-composer {
        padding: 14px 22px 18px;
        border-top: 1px solid var(--taa-border);
        background: var(--taa-bg-2);
        display: flex; flex-direction: column; gap: 10px;
        transition: background 150ms ease;
      }
      .cr-composer.drag { background: rgba(220, 30, 46, 0.06); }
      .cr-composer textarea {
        width: 100%;
        background: var(--taa-bg-card);
        border: 1px solid var(--taa-border-strong);
        border-radius: 8px;
        color: var(--taa-text);
        padding: 10px 14px;
        font: inherit; font-size: 14px;
        resize: vertical;
        min-height: 46px;
        outline: none;
        box-sizing: border-box;
      }
      .cr-composer textarea:focus { border-color: var(--taa-red); }

      .cr-pending { display: flex; gap: 8px; flex-wrap: wrap; }
      .cr-pending-item { position: relative; }
      .cr-pending-item img {
        width: 70px; height: 70px; border-radius: 8px; object-fit: cover;
        border: 1px solid var(--taa-border-strong);
      }
      .cr-pending-item button {
        position: absolute; top: -6px; right: -6px;
        background: var(--taa-red); border: none;
        width: 20px; height: 20px; border-radius: 50%;
        color: var(--taa-white); font-size: 14px; line-height: 1;
        cursor: pointer;
        display: flex; align-items: center; justify-content: center;
      }

      .cr-composer-actions { display: flex; align-items: center; gap: 8px; }
      .cr-attach {
        display: inline-flex; align-items: center; gap: 6px;
        padding: 8px 12px;
        background: transparent;
        border: 1px solid var(--taa-border-strong);
        color: var(--taa-muted);
        border-radius: 8px; cursor: pointer;
        font-size: 11.5px; font-weight: 700; letter-spacing: 0.06em;
      }
      .cr-attach:hover { color: var(--taa-red); border-color: var(--taa-red); }
      .cr-composer-spacer { flex: 1; }
      .cr-send {
        background: var(--taa-red); border: 1px solid var(--taa-red);
        color: var(--taa-white); font: inherit;
        font-size: 12.5px; font-weight: 700;
        padding: 10px 22px; border-radius: 8px; cursor: pointer;
        letter-spacing: 0.08em; text-transform: uppercase;
        transition: transform 120ms ease, box-shadow 120ms ease;
      }
      .cr-send:hover:not(:disabled) {
        transform: translateY(-1px);
        box-shadow: 0 8px 20px -8px var(--taa-red-glow);
        background: var(--taa-red-bright);
      }
      .cr-send:disabled { opacity: 0.5; cursor: not-allowed; }

      @media (max-width: 780px) {
        .cr-brand-x { display: none; }
        .taa-brand > .taa-brand-text:last-child { display: none; }
        .cr-gate-row { grid-template-columns: 1fr; }
        .cr-thread-wrap { padding: 32px 18px 24px; }
        .cr-thread-head h1 { font-size: 26px; }
        .cr-feed { padding: 16px 16px; max-height: 460px; }
        .cr-msg { max-width: 90%; }
        .cr-quicks, .cr-heads-up, .cr-composer { padding-left: 16px; padding-right: 16px; }
        .cr-quicks { flex-direction: column; }
        .cr-quick { justify-content: center; }
      }
    `}</style>
  );
}
