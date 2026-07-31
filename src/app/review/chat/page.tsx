/**
 * /review/chat — AM Team ↔ creator chat, read-only send in demo mode.
 *
 * Reads from the existing chats + messages tables so reviewers see the
 * real production chat UX. The seed script populates one thread with a
 * short back-and-forth. Sending new messages IS allowed (writes are
 * safe — nothing external triggers). Attachments are demo-blocked by
 * middleware since they'd hit Vercel Blob.
 */

import { asc, eq } from "drizzle-orm";
import { db } from "@/db";
import { chats, messages } from "@/db/schema";
import { getCurrentReviewer } from "@/lib/auth/review-session";
import ChatThread from "./ChatThread";

export const dynamic = "force-dynamic";

export default async function ChatPage() {
  const user = (await getCurrentReviewer())!;

  // Grab the newest thread for this reviewer.
  const threads = await db
    .select()
    .from(chats)
    .where(eq(chats.userId, user.id))
    .orderBy(asc(chats.createdAt))
    .limit(5);

  const thread = threads[0];

  if (!thread) {
    return (
      <div className="rv-chat-empty">
        <h1>Chat with the AM team</h1>
        <p>No thread yet. Once the seed script runs, a welcome thread will appear here.</p>
        <style>{`
          .rv-chat-empty { padding: 24px; color: #9A9590; }
          .rv-chat-empty h1 { color: #F5F1E6; margin: 0 0 8px; }
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
    <div className="rv-chat-page">
      <header className="rv-chat-head">
        <p className="rv-chat-eyebrow">Direct line</p>
        <h1>{thread.subject || "Chat with the AM team"}</h1>
        <p className="rv-chat-sub">
          Replies are answered by an Aragon Media operator within
          business hours. Attachments are disabled in demo mode.
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
        .rv-chat-page { display: flex; flex-direction: column; gap: 18px; max-width: 820px; }
        .rv-chat-head { display: flex; flex-direction: column; gap: 4px; }
        .rv-chat-eyebrow {
          margin: 0;
          font-size: 11px;
          letter-spacing: 0.18em;
          text-transform: uppercase;
          color: #C9A84C;
          font-weight: 700;
        }
        .rv-chat-head h1 {
          margin: 0;
          font-size: 26px;
          font-weight: 700;
          letter-spacing: -0.02em;
        }
        .rv-chat-sub {
          margin: 0;
          font-size: 13px;
          color: #9A9590;
        }
      `}</style>
    </div>
  );
}
