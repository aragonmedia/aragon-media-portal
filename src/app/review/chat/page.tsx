/**
 * /review/chat — Direct line between the creator and the Aragon Media
 * team. Read-only in demo mode. Attachments blocked via middleware.
 */

import { asc, eq } from "drizzle-orm";
import { db } from "@/db";
import { chats, messages } from "@/db/schema";
import { getCurrentReviewer } from "@/lib/auth/review-session";
import ChatThread from "./ChatThread";

export const dynamic = "force-dynamic";

export default async function ChatPage() {
  const user = (await getCurrentReviewer())!;

  const threads = await db
    .select()
    .from(chats)
    .where(eq(chats.userId, user.id))
    .orderBy(asc(chats.createdAt))
    .limit(5);

  const thread = threads[0];

  if (!thread) {
    return (
      <div className="ch-empty">
        <h1>Chat with the AM Team</h1>
        <p>No thread yet. Once the seed script runs, a welcome thread will appear here.</p>
        <style>{`
          .ch-empty { padding: 24px; color: var(--text-muted); }
          .ch-empty h1 { color: var(--text); margin: 0 0 8px; }
        `}</style>
      </div>
    );
  }

  const rows = await db
    .select()
    .from(messages)
    .where(eq(messages.chatId, thread.id))
    .orderBy(asc(messages.createdAt));

  return (
    <div className="ch-wrap">
      <header className="ch-head">
        <p className="ch-eyebrow">Direct line</p>
        <h1>{thread.subject || "Chat with the AM Team"}</h1>
        <p className="ch-sub">
          A creator&apos;s direct line to their Aragon Media operator.
          Replies land in your inbox within business hours. Attachments
          are disabled in preview mode.
        </p>
      </header>

      <ChatThread
        chatId={thread.id}
        initialMessages={rows.map((m) => ({
          id: m.id,
          sender: m.sender,
          body: m.body,
          createdAt: (m.createdAt instanceof Date ? m.createdAt : new Date(m.createdAt)).toISOString(),
        }))}
      />

      <style>{`
        .ch-wrap { display: flex; flex-direction: column; gap: 18px; max-width: 820px; }
        .ch-head { display: flex; flex-direction: column; gap: 4px; }
        .ch-eyebrow { margin: 0; font-size: 11px; letter-spacing: 0.18em; text-transform: uppercase; color: var(--gold); font-weight: 700; }
        .ch-head h1 { margin: 0; font-size: 26px; font-weight: 700; letter-spacing: -0.02em; color: var(--text); }
        .ch-sub { margin: 0; font-size: 13px; color: var(--text-muted); line-height: 1.55; }
      `}</style>
    </div>
  );
}
