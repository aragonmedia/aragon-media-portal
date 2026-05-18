"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

/**
 * Visible on /admin/creators/[id] when the creator has NOT yet opened
 * their /dashboard/chat page (so no chat row exists yet). Clicking it
 * find-or-creates the chat thread + system-seeded welcome message, then
 * navigates the admin straight into /admin/chats/{newChatId} where
 * they can fire the first real message.
 *
 * Idempotent server-side, so accidental double-clicks just re-fetch the
 * same chatId instead of creating duplicates.
 */
export default function InitiateChatButton({
  userId,
  creatorName,
}: {
  userId: string;
  creatorName: string;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function start() {
    if (busy) return;
    setErr(null);
    setBusy(true);
    try {
      const res = await fetch("/api/admin/actions/initiate-chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId }),
      });
      const j = (await res.json()) as {
        ok: boolean;
        chatId?: string;
        error?: string;
      };
      if (!res.ok || !j.ok || !j.chatId) {
        setErr(j.error ?? "Failed to start chat");
        setBusy(false);
        return;
      }
      router.push(`/admin/chats/${j.chatId}`);
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Network error");
      setBusy(false);
    }
  }

  return (
    <>
      <button
        onClick={start}
        disabled={busy}
        className="admin-row-btn admin-row-btn-primary"
        title={`Open or start a chat thread with ${creatorName}. Idempotent — won't create duplicates.`}
      >
        {busy ? "Starting…" : "Start chat with creator →"}
      </button>
      {err && (
        <span
          style={{
            color: "#E24B4A",
            fontSize: 12,
            marginLeft: 8,
            alignSelf: "center",
          }}
        >
          {err}
        </span>
      )}
    </>
  );
}
