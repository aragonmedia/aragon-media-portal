"use client";

import { useEffect, useRef, useState } from "react";
import "./chat-room.css";

type Message = {
  id: string;
  sender: "user" | "am_team" | "system" | string;
  body: string;
  attachmentUrls?: string[] | null;
  createdAt: string;
};

type Pending = {
  file: File;
  preview: string;
  uploaded?: { url: string; pathname: string };
  uploading?: boolean;
  error?: string;
};

const POLL_MS = 5000;
const MAX_ATTACHMENTS = 4;

function fmtTime(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function parseUrls(raw: string | string[] | null | undefined): string[] {
  if (!raw) return [];
  if (Array.isArray(raw)) return raw.filter((x) => typeof x === "string");
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed)
      ? parsed.filter((x): x is string => typeof x === "string")
      : [];
  } catch {
    return [];
  }
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
  const [pending, setPending] = useState<Pending[]>([]);
  const [sending, setSending] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [focused, setFocused] = useState(false);
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Auto-scroll
  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [msgs.length]);

  // Polling
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
          setMsgs((cur) => {
            const have = new Set(cur.map((m) => m.id));
            const fresh = json.messages!.filter((m) => !have.has(m.id));
            if (fresh.length === 0) return cur;
            return [...cur, ...fresh];
          });
        }
      } catch {
        /* swallow */
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

  function addFiles(picked: FileList | null) {
    if (!picked) return;
    const remaining = MAX_ATTACHMENTS - pending.length;
    if (remaining <= 0) {
      setErr(`Max ${MAX_ATTACHMENTS} images per message.`);
      return;
    }
    const next: Pending[] = [];
    for (let i = 0; i < picked.length && next.length < remaining; i++) {
      const f = picked[i];
      if (!f.type.startsWith("image/")) continue;
      next.push({ file: f, preview: URL.createObjectURL(f) });
    }
    if (picked.length > remaining) {
      setErr(`Only the first ${remaining} image(s) added — max ${MAX_ATTACHMENTS} per message.`);
    }
    setPending((cur) => [...cur, ...next]);
    // Reset the file input so picking the same file again still fires onChange
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  function removePending(idx: number) {
    setPending((cur) => {
      const tile = cur[idx];
      if (tile && tile.preview) URL.revokeObjectURL(tile.preview);
      return cur.filter((_, i) => i !== idx);
    });
  }

  async function uploadOne(p: Pending): Promise<string | null> {
    const fd = new FormData();
    fd.append("file", p.file);
    const res = await fetch("/api/blob/upload", { method: "POST", body: fd });
    const json = (await res.json()) as { ok: boolean; url?: string; error?: string };
    if (!res.ok || !json.ok || !json.url) {
      throw new Error(json.error ?? "upload_failed");
    }
    return json.url;
  }

  async function send(e: React.FormEvent) {
    e.preventDefault();
    const body = draft.trim();
    if ((!body && pending.length === 0) || sending) return;
    setSending(true);
    setErr(null);

    // Upload any pending attachments first
    let attachmentUrls: string[] = [];
    if (pending.length > 0) {
      try {
        const urls = await Promise.all(pending.map((p) => uploadOne(p)));
        attachmentUrls = urls.filter((u): u is string => typeof u === "string");
      } catch (e) {
        setErr(`Attachment upload failed — ${e instanceof Error ? e.message : "try again"}.`);
        setSending(false);
        return;
      }
    }

    try {
      const res = await fetch("/api/chat/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ chatId, body, attachmentUrls }),
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
      // Normalize attachmentUrls in case server returns it as JSON string
      const normalized = {
        ...json.message,
        attachmentUrls: parseUrls(
          (json.message as Message).attachmentUrls as unknown as string | string[] | null
        ),
      };
      setMsgs((cur) => [...cur, normalized]);
      setDraft("");
      // Cleanup pending blob URLs
      pending.forEach((p) => p.preview && URL.revokeObjectURL(p.preview));
      setPending([]);
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Network error");
    } finally {
      setSending(false);
    }
  }

  const canSend =
    !sending && (draft.trim().length > 0 || pending.length > 0);

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
            const urls = parseUrls(m.attachmentUrls);
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
                {m.body && <div className="chat-msg-body">{m.body}</div>}
                {urls.length > 0 && (
                  <div className={`chat-attach-grid${urls.length === 1 ? " one" : ""}`}>
                    {urls.map((u) => (
                      <a
                        key={u}
                        href={u}
                        target="_blank"
                        rel="noreferrer"
                        className="chat-attach-thumb"
                        title="Click to open full-size"
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={u} alt="attachment" loading="lazy" />
                      </a>
                    ))}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      <form className="chat-composer" onSubmit={send}>
        <div className={`chat-composer-box${focused ? " is-focused" : ""}`}>
          {pending.length > 0 && (
            <div className="chat-attach-preview">
              {pending.map((p, i) => (
                <div key={i} className="chat-attach-preview-tile">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={p.preview} alt={p.file.name} />
                  <button
                    type="button"
                    className="chat-attach-preview-x"
                    onClick={() => removePending(i)}
                    aria-label="Remove attachment"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}
          <textarea
            className="chat-input"
            rows={3}
            placeholder={`Write as ${viewerName}…`}
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
                e.preventDefault();
                send(e);
              }
            }}
            disabled={sending}
          />
          <div className="chat-composer-bar">
            <div className="chat-composer-tools">
              <button
                type="button"
                className="chat-tool-btn"
                onClick={() => fileInputRef.current?.click()}
                disabled={sending || pending.length >= MAX_ATTACHMENTS}
                title={`Attach up to ${MAX_ATTACHMENTS} images`}
              >
                📎 Attach{pending.length > 0 ? ` (${pending.length}/${MAX_ATTACHMENTS})` : ""}
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/png,image/jpeg,image/webp,image/heic"
                multiple
                className="chat-attach-input"
                onChange={(e) => addFiles(e.target.files)}
              />
              <span className="chat-hint">⌘/Ctrl + Enter to send</span>
            </div>
            {err && <span className="chat-err">{err}</span>}
            <button
              type="submit"
              className="chat-send-btn"
              disabled={!canSend}
              title="Send message"
              aria-label="Send"
            >
              →
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
