"use client";

import { useEffect, useRef, useState } from "react";

type Message = {
  id: string;
  sender: "user" | "am_team" | "system" | string;
  body: string;
  createdAt: string;
};

const POLL_MS = 5000;

function fmtTime(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export default function ChatRoomClient({
  chatId,
  viewer,
  viewerName,
  initialMessages,
}: {
  chatId: string;
  viewer: "user" | "admin";
  viewerName: string;
  initialMessages: Message[];
}) {
  const [msgs, setMsgs] = useState<Message[]>(initialMessages);
  const [draft, setDraft] = useState("");
  const [sending, setSending] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const lastIdRef = useRef<string>(
    initialMessages.length > 0
      ? initialMessages[initialMessages.length - 1].id
      : ""
  );

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [msgs.length]);

  // Polling — fetch any messages newer than the last one we have
  useEffect(() => {
    let cancelled = false;
    let timer: ReturnType<typeof setTimeout> | null = null;

    async function poll() {
      try {
        const since =
          msgs.length > 0
            ? encodeURIComponent(msgs[msgs.length - 1].createdAt)
            : "";
        const res = await fetch(
          `/api/chat/messages?chatId=${chatId}&since=${since}`,
          { cache: "no-store" }
        );
        if (!res.ok) return;
        const json = (await res.json()) as { ok: boolean; messages?: Message[] };
        if (cancelled || !json.ok || !json.messages) return;
        if (json.messages.length > 0) {
          // Dedupe by id
          setMsgs((cur) => {
            const have = new Set(cur.map((m) => m.id));
            const fresh = json.messages!.filter((m) => !have.has(m.id));
            if (fresh.length === 0) return cur;
            const next = [...cur, ...fresh];
            lastIdRef.current = next[next.length - 1].id;
            return next;
          });
        }
      } catch {
        // swallow — next tick will retry
      } finally {
        if (!cancelled) timer = setTimeout(poll, POLL_MS);
      }
    }

    timer = setTimeout(poll, POLL_MS);
    return () => {
      cancelled = true;
      if (timer) clearTimeout(timer);
    };
  }, [chatId, msgs]);

  async function send(e: React.FormEvent) {
    e.preventDefault();
    const body = draft.trim();
    if (!body || sending) return;
    setSending(true);
    setErr(null);
    try {
      const res = await fetch("/api/chat/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ chatId, body }),
      });
      const json = (await res.json()) as {
        ok: boolean;
        error?: string;
        message?: Message;
      };
      if (!res.ok || !json.ok || !json.message) {
        setErr(json.error ?? "Send failed");
        setSending(false);
        return;
      }
      setMsgs((cur) => [...cur, json.message!]);
      setDraft("");
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Network error");
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="chat-room">
      <div className="chat-stream" ref={scrollRef}>
        {msgs.length === 0 ? (
          <div className="chat-empty">
            No messages yet. Drop the first one below.
          </div>
        ) : (
          msgs.map((m) => {
            const fromMe =
              (viewer === "user" && m.sender === "user") ||
              (viewer === "admin" && m.sender === "am_team");
            const fromSystem = m.sender === "system";
            const senderLabel = fromSystem
              ? "System"
              : m.sender === "am_team"
                ? "Aragon Media"
                : "Creator";
            return (
              <div
                key={m.id}
                className={`chat-msg ${
                  fromSystem
                    ? "chat-msg-system"
                    : fromMe
                      ? "chat-msg-mine"
                      : "chat-msg-theirs"
                }`}
              >
                {!fromSystem && (
                  <div className="chat-msg-meta">
                    <span className="chat-msg-sender">{senderLabel}</span>
                    <span className="chat-msg-time">{fmtTime(m.createdAt)}</span>
                  </div>
                )}
                <div className="chat-msg-body">{m.body}</div>
              </div>
            );
          })
        )}
      </div>

      <form className="chat-composer" onSubmit={send}>
        <textarea
          className="chat-input"
          rows={3}
          placeholder={`Write as ${viewerName}…`}
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
              e.preventDefault();
              send(e);
            }
          }}
          disabled={sending}
        />
        <div className="chat-composer-foot">
          <span className="chat-hint">⌘/Ctrl + Enter to send</span>
          {err && <span className="chat-err">{err}</span>}
          <button
            type="submit"
            className="chat-send-btn"
            disabled={sending || draft.trim().length === 0}
          >
            {sending ? "Sending…" : "Send →"}
          </button>
        </div>
      </form>
    </div>
  );
}
