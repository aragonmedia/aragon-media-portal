"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";

type Msg = { id: string; sender: string; body: string; attachments: string[]; createdAt: string; };
type Thread = { id: string; email: string; name: string; createdAt: string; };
type Cred = { id: string; submittedAt: string; viewedByAdminAt: string | null; };

type DecryptedCreds = {
  tiktokUsername: string;
  tiktokEmail: string;
  password: string;
  backupCode: string;
  notes: string;
};

export default function ThreadClient({
  thread,
  initialMessages,
  credentials,
}: {
  thread: Thread;
  initialMessages: Msg[];
  credentials: Cred[];
}) {
  const [messages, setMessages] = useState<Msg[]>(initialMessages);
  const [reply, setReply] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [decrypted, setDecrypted] = useState<Record<string, DecryptedCreds | "loading" | "error">>({});
  const feedRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    feedRef.current?.scrollTo({ top: feedRef.current.scrollHeight, behavior: "smooth" });
  }, [messages.length]);

  async function send(e: React.FormEvent) {
    e.preventDefault();
    if (sending || !reply.trim()) return;
    setSending(true); setError(null);
    try {
      const res = await fetch("/api/admin/chatroom/reply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ threadId: thread.id, body: reply.trim() }),
      });
      const j = await res.json();
      if (!j.ok) throw new Error(j.error || "Send failed.");
      setMessages((cur) => [...cur, j.message]);
      setReply("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Send failed.");
    } finally {
      setSending(false);
    }
  }

  async function decrypt(id: string) {
    setDecrypted((d) => ({ ...d, [id]: "loading" }));
    try {
      const res = await fetch("/api/admin/chatroom/decrypt", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      const j = await res.json();
      if (!j.ok) throw new Error(j.error || "Decrypt failed.");
      setDecrypted((d) => ({ ...d, [id]: j.credentials }));
    } catch {
      setDecrypted((d) => ({ ...d, [id]: "error" }));
    }
  }

  return (
    <div className="acrx-wrap">
      <header className="acrx-head">
        <div>
          <Link href="/admin/chatroom" className="acrx-back">← All threads</Link>
          <h1>{thread.name}</h1>
          <p className="acrx-sub">
            {thread.email} · opened {new Date(thread.createdAt).toLocaleString()}
          </p>
        </div>
      </header>

      {credentials.length > 0 && (
        <section className="acrx-creds">
          <h2>🔒 Encrypted TikTok credentials ({credentials.length})</h2>
          <p className="acrx-creds-note">
            Click <b>Decrypt</b> to view. Payload is decrypted on the server
            and streamed to your browser — never stored decrypted anywhere.
          </p>
          <ul>
            {credentials.map((c) => {
              const d = decrypted[c.id];
              return (
                <li key={c.id}>
                  <div className="acrx-cred-head">
                    <span className="acrx-cred-when">Submitted {new Date(c.submittedAt).toLocaleString()}</span>
                    {typeof d === "object" && d !== null ? null : (
                      <button
                        type="button"
                        onClick={() => decrypt(c.id)}
                        disabled={d === "loading"}
                      >
                        {d === "loading" ? "Decrypting…" : d === "error" ? "Retry decrypt" : "Decrypt"}
                      </button>
                    )}
                  </div>
                  {typeof d === "object" && d !== null && (
                    <div className="acrx-cred-body">
                      {d.tiktokUsername && (<div><b>Username</b><span>{d.tiktokUsername}</span></div>)}
                      {d.tiktokEmail && (<div><b>Email</b><span>{d.tiktokEmail}</span></div>)}
                      {d.password && (<div><b>Password</b><span className="acrx-cred-secret">{d.password}</span></div>)}
                      {d.backupCode && (<div><b>Backup code</b><span>{d.backupCode}</span></div>)}
                      {d.notes && (<div><b>Notes</b><span>{d.notes}</span></div>)}
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        </section>
      )}

      <div className="acrx-thread">
        <div ref={feedRef} className="acrx-feed">
          {messages.length === 0 ? (
            <div className="acrx-empty">No messages yet.</div>
          ) : (
            messages.map((m) => (
              <div key={m.id} className={`acrx-msg acrx-msg-${m.sender}`}>
                <div className="acrx-msg-body">
                  {m.body && <p>{m.body}</p>}
                  {m.attachments.length > 0 && (
                    <div className="acrx-msg-attach">
                      {m.attachments.map((url) => (
                        <a key={url} href={url} target="_blank" rel="noopener noreferrer">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={url} alt="attachment" />
                        </a>
                      ))}
                    </div>
                  )}
                </div>
                <div className="acrx-msg-meta">
                  <span>{m.sender === "user" ? thread.name : "AM Team"}</span>
                  <span>·</span>
                  <span>{new Date(m.createdAt).toLocaleString()}</span>
                </div>
              </div>
            ))
          )}
        </div>

        <form onSubmit={send} className="acrx-composer">
          <textarea
            value={reply}
            onChange={(e) => setReply(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault(); send(e as unknown as React.FormEvent);
              }
            }}
            placeholder="Reply to the creator…"
            rows={3}
            disabled={sending}
          />
          <button type="submit" disabled={sending || !reply.trim()}>
            {sending ? "Sending…" : "Send reply"}
          </button>
          {error && <p className="acrx-error">{error}</p>}
        </form>
      </div>

      <style jsx>{`
        .acrx-wrap { max-width: 900px; margin: 40px auto; padding: 0 32px 80px; font-family: 'Inter Tight', system-ui, sans-serif; color: #F5F1E6; }
        .acrx-back { color: #C9A84C; font-size: 12px; text-decoration: none; letter-spacing: 0.06em; }
        .acrx-back:hover { text-decoration: underline; }
        .acrx-head h1 { margin: 10px 0 4px; font-size: 26px; font-weight: 700; letter-spacing: -0.01em; }
        .acrx-sub { margin: 0; color: #9A9590; font-size: 13px; }

        .acrx-creds { margin-top: 22px; padding: 20px 22px; background: #141414; border: 1px solid rgba(220, 30, 46, 0.28); border-left: 3px solid #DC1E2E; border-radius: 12px; }
        .acrx-creds h2 { margin: 0 0 6px; font-size: 13px; font-weight: 700; letter-spacing: 0.14em; text-transform: uppercase; color: #E07A6E; }
        .acrx-creds-note { margin: 0 0 12px; font-size: 12.5px; color: #9A9590; }
        .acrx-creds ul { list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: 10px; }
        .acrx-creds li { background: #0B0B0B; border: 1px solid #262626; border-radius: 8px; padding: 12px 14px; }
        .acrx-cred-head { display: flex; justify-content: space-between; align-items: center; }
        .acrx-cred-when { font-size: 12px; color: #9A9590; }
        .acrx-cred-head button {
          background: #DC1E2E; border: none; color: #FFFFFF;
          font: inherit; font-size: 11px; font-weight: 700;
          padding: 6px 12px; border-radius: 6px; cursor: pointer;
          letter-spacing: 0.06em; text-transform: uppercase;
        }
        .acrx-cred-head button:hover:not(:disabled) { background: #FF3542; }
        .acrx-cred-head button:disabled { opacity: 0.6; cursor: progress; }
        .acrx-cred-body { margin-top: 12px; display: grid; grid-template-columns: 100px 1fr; row-gap: 8px; column-gap: 12px; font-size: 13px; }
        .acrx-cred-body div { display: contents; }
        .acrx-cred-body b { color: #6B6660; font-size: 10.5px; letter-spacing: 0.14em; text-transform: uppercase; font-weight: 700; padding-top: 2px; }
        .acrx-cred-body span { color: #F5F1E6; font-family: ui-monospace, Menlo, monospace; word-break: break-all; }
        .acrx-cred-secret { color: #E07A6E !important; }

        .acrx-thread { margin-top: 22px; background: #141414; border: 1px solid #1F1F1F; border-radius: 12px; display: flex; flex-direction: column; overflow: hidden; }
        .acrx-feed { padding: 20px; max-height: 520px; overflow-y: auto; display: flex; flex-direction: column; gap: 14px; }
        .acrx-empty { text-align: center; padding: 40px; color: #6B6660; }
        .acrx-msg { max-width: 78%; padding: 12px 14px; border-radius: 12px; }
        .acrx-msg-user { background: #0B0B0B; border: 1px solid #262626; }
        .acrx-msg-am { margin-left: auto; background: rgba(201, 168, 76, 0.12); border: 1px solid rgba(201, 168, 76, 0.32); }
        .acrx-msg-body p { margin: 0; font-size: 14px; line-height: 1.55; color: #F5F1E6; white-space: pre-wrap; word-break: break-word; }
        .acrx-msg-meta { margin-top: 6px; font-size: 10.5px; letter-spacing: 0.08em; text-transform: uppercase; color: #6B6660; font-weight: 700; display: flex; gap: 5px; }
        .acrx-msg-attach { display: flex; gap: 8px; flex-wrap: wrap; margin-top: 8px; }
        .acrx-msg-attach img { max-width: 140px; max-height: 140px; border-radius: 8px; border: 1px solid #262626; }

        .acrx-composer { padding: 14px 16px; border-top: 1px solid #1F1F1F; background: #0B0B0B; display: flex; flex-direction: column; gap: 10px; }
        .acrx-composer textarea {
          width: 100%;
          background: #141414;
          border: 1px solid #262626;
          border-radius: 8px;
          color: #F5F1E6;
          padding: 10px 14px;
          font: inherit; font-size: 14px;
          resize: vertical;
          min-height: 60px;
          outline: none;
          box-sizing: border-box;
        }
        .acrx-composer textarea:focus { border-color: #C9A84C; }
        .acrx-composer button {
          align-self: flex-end;
          background: #C9A84C; border: 1px solid #C9A84C;
          color: #0B0B0B; font: inherit; font-size: 13px; font-weight: 700;
          padding: 10px 22px; border-radius: 8px; cursor: pointer;
          letter-spacing: 0.06em; text-transform: uppercase;
        }
        .acrx-composer button:hover:not(:disabled) { transform: translateY(-1px); box-shadow: 0 6px 14px -4px rgba(201,168,76,0.4); }
        .acrx-composer button:disabled { opacity: 0.5; cursor: not-allowed; }
        .acrx-error { margin: 4px 0 0; color: #DC4444; font-size: 12.5px; }
      `}</style>
    </div>
  );
}
