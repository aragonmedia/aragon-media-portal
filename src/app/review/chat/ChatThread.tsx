"use client";

import { useEffect, useRef, useState } from "react";

type Msg = {
  id: string;
  sender: "user" | "am_team" | "system";
  body: string;
  createdAt: string;
};

export default function ChatThread({
  chatId,
  initialMessages,
}: {
  chatId: string;
  initialMessages: Msg[];
}) {
  const [msgs, setMsgs] = useState<Msg[]>(initialMessages);
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const feed = useRef<HTMLDivElement>(null);

  useEffect(() => {
    feed.current?.scrollTo({ top: feed.current.scrollHeight, behavior: "smooth" });
  }, [msgs.length]);

  async function send(e: React.FormEvent) {
    e.preventDefault();
    const body = text.trim();
    if (!body || sending) return;
    setSending(true);
    setError(null);
    const optimistic: Msg = {
      id: `tmp-${Date.now()}`,
      sender: "user",
      body,
      createdAt: new Date().toISOString(),
    };
    setMsgs((m) => [...m, optimistic]);
    setText("");
    try {
      const res = await fetch(`/api/review/chat/send`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ chatId, body }),
      });
      if (!res.ok) throw new Error(`Send failed (${res.status})`);
      const data = (await res.json()) as { ok: boolean; message?: Msg };
      if (data.message) {
        setMsgs((m) => m.map((x) => (x.id === optimistic.id ? data.message! : x)));
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Send failed");
      setMsgs((m) => m.filter((x) => x.id !== optimistic.id));
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="rv-chat">
      <div ref={feed} className="rv-chat-feed">
        {msgs.map((m) => (
          <div key={m.id} className={`rv-msg ${m.sender === "user" ? "mine" : m.sender === "system" ? "sys" : "them"}`}>
            <p className="rv-msg-body">{m.body}</p>
            <p className="rv-msg-meta">
              <span>{m.sender === "user" ? "You" : m.sender === "am_team" ? "AM Team" : "System"}</span>
              <span>·</span>
              <span>{new Date(m.createdAt).toLocaleString()}</span>
            </p>
          </div>
        ))}
      </div>

      <form onSubmit={send} className="rv-chat-input">
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              send(e as unknown as React.FormEvent);
            }
          }}
          rows={2}
          placeholder="Type a message... (Enter to send, Shift+Enter for newline)"
          disabled={sending}
        />
        <button type="submit" disabled={!text.trim() || sending}>
          {sending ? "Sending..." : "Send"}
        </button>
      </form>

      {error && <p className="rv-chat-err">{error}</p>}

      <style jsx>{`
        .rv-chat {
          background: var(--bg-2);
          border: 1px solid var(--border-soft);
          border-radius: 14px;
          overflow: hidden;
          box-shadow: var(--shadow-card);
          display: flex; flex-direction: column;
        }
        .rv-chat-feed {
          max-height: 460px;
          overflow-y: auto;
          padding: 20px;
          display: flex; flex-direction: column;
          gap: 14px;
        }
        .rv-msg { max-width: 78%; padding: 12px 14px; border-radius: 12px; }
        .rv-msg.mine {
          margin-left: auto;
          background: rgba(201, 168, 76, 0.14);
          border: 1px solid rgba(201, 168, 76, 0.32);
        }
        .rv-msg.them {
          background: var(--bg-deep);
          border: 1px solid var(--border-soft);
        }
        .rv-msg.sys {
          background: transparent; text-align: center;
          color: var(--text-sub); font-size: 11.5px;
          border: none; max-width: 100%;
        }
        .rv-msg-body {
          margin: 0; font-size: 14px; line-height: 1.5;
          color: var(--text); white-space: pre-wrap;
        }
        .rv-msg-meta {
          margin: 6px 0 0; font-size: 11px;
          color: var(--text-sub);
          display: flex; gap: 5px;
        }
        .rv-chat-input {
          display: flex; gap: 10px; padding: 14px;
          border-top: 1px solid var(--border-soft);
          background: var(--bg-2);
        }
        .rv-chat-input textarea {
          flex: 1;
          background: var(--bg-deep);
          border: 1px solid var(--border);
          border-radius: 8px;
          color: var(--text);
          padding: 10px 12px;
          font-family: inherit;
          font-size: 13.5px;
          resize: vertical;
          min-height: 46px;
          outline: none;
        }
        .rv-chat-input textarea:focus { border-color: var(--gold); }
        .rv-chat-input button {
          background: var(--gold);
          color: #0B0B0B;
          border: none;
          border-radius: 8px;
          font-weight: 700;
          padding: 0 20px;
          cursor: pointer;
          font-family: inherit;
          font-size: 13px;
          letter-spacing: 0.08em;
          text-transform: uppercase;
        }
        .rv-chat-input button:disabled { opacity: 0.4; cursor: not-allowed; }
        .rv-chat-err {
          margin: 8px 14px 14px;
          font-size: 12.5px;
          color: var(--red);
        }
      `}</style>
    </div>
  );
}
