import Link from "next/link";
import { db } from "@/db";
import { chats, messages, users } from "@/db/schema";
import { desc, eq, sql } from "drizzle-orm";

export const dynamic = "force-dynamic";
export const revalidate = 0;

function fmt(d: Date | string | null | undefined): string {
  if (!d) return "—";
  const date = typeof d === "string" ? new Date(d) : d;
  return date.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export default async function AdminChatsListPage() {
  const list = await db
    .select({
      id: chats.id,
      subject: chats.subject,
      status: chats.status,
      lastMessageAt: chats.lastMessageAt,
      creatorEmail: users.email,
      creatorName: users.name,
      messageCount: sql<number>`(select count(*)::int from ${messages} m where m.chat_id = ${chats.id})`,
      lastSnippet: sql<string | null>`(
        select left(m.body, 140) from ${messages} m
        where m.chat_id = ${chats.id}
        order by m.created_at desc
        limit 1
      )`,
      lastSender: sql<string | null>`(
        select m.sender::text from ${messages} m
        where m.chat_id = ${chats.id}
        order by m.created_at desc
        limit 1
      )`,
    })
    .from(chats)
    .leftJoin(users, eq(users.id, chats.userId))
    .orderBy(desc(chats.lastMessageAt));

  return (
    <main className="admin-shell admin-shell-nested">
      <header className="admin-header">
        <div>
          <p className="admin-eyebrow">Aragon Media · Chats</p>
          <h1>All conversations</h1>
          <p className="admin-page-sub">
            {list.length} active thread{list.length === 1 ? "" : "s"}. Click
            into any row to reply. Replies trigger an email to the creator
            (throttled to one per 5 minutes per side).
          </p>
        </div>
      </header>

      <section className="admin-section">
        <div className="chat-list">
          {list.length === 0 ? (
            <div className="wdr-history-empty">
              No chat threads yet. Threads open automatically the moment a
              creator visits /dashboard/chat.
            </div>
          ) : (
            list.map((c) => (
              <Link
                key={c.id}
                href={`/admin/chats/${c.id}`}
                className="chat-list-card"
              >
                <div className="chat-list-top">
                  <div>
                    <div className="chat-list-name">
                      {c.creatorName ?? "Unknown creator"}
                    </div>
                    <div className="chat-list-email">{c.creatorEmail ?? "—"}</div>
                  </div>
                  <div className="chat-list-side">
                    <span className="chat-list-count">
                      {c.messageCount} msg{c.messageCount === 1 ? "" : "s"}
                    </span>
                    <span className="chat-list-time">
                      {fmt(c.lastMessageAt)}
                    </span>
                  </div>
                </div>
                {c.lastSnippet && (
                  <div className="chat-list-preview">
                    <span className={`chat-list-pill chat-list-pill-${c.lastSender ?? "system"}`}>
                      {c.lastSender === "am_team"
                        ? "AM"
                        : c.lastSender === "user"
                          ? "Creator"
                          : "System"}
                    </span>
                    <span className="chat-list-snippet">{c.lastSnippet}</span>
                  </div>
                )}
              </Link>
            ))
          )}
        </div>
      </section>
    </main>
  );
}
