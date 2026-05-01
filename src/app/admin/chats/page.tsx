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

      {(() => {
        // Split: UNREAD = creator-sent last (awaiting AM reply).
        //         REPLIED = AM-sent last (or system / no messages yet).
        const unread = list.filter((c) => c.lastSender === "user");
        const replied = list.filter((c) => c.lastSender !== "user");

        function Card({ c }: { c: (typeof list)[number] }) {
          return (
            <Link
              key={c.id}
              href={`/admin/chats/${c.id}`}
              className={`chat-list-card${c.lastSender === "user" ? " chat-list-card-unread" : ""}`}
            >
              <div className="chat-list-top">
                <div>
                  <div className="chat-list-name">
                    {c.creatorName ?? "Unknown creator"}
                    {c.lastSender === "user" && (
                      <span className="chat-list-dot" aria-hidden="true" />
                    )}
                  </div>
                  <div className="chat-list-email">{c.creatorEmail ?? "—"}</div>
                </div>
                <div className="chat-list-side">
                  <span className="chat-list-count">
                    {c.messageCount} msg{c.messageCount === 1 ? "" : "s"}
                  </span>
                  <span className="chat-list-time">{fmt(c.lastMessageAt)}</span>
                </div>
              </div>
              {c.lastSnippet && (
                <div className="chat-list-preview">
                  <span
                    className={`chat-list-pill chat-list-pill-${
                      c.lastSender ?? "system"
                    }`}
                  >
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
          );
        }

        return (
          <>
            <section className="admin-section">
              <div className="admin-section-head">
                <h2>
                  <span className="chat-section-label chat-section-label-unread">
                    Unread
                  </span>
                  <span className="chat-section-count">{unread.length}</span>
                </h2>
                <span className="admin-meta">
                  Awaiting an AM reply — sorted newest first.
                </span>
              </div>
              <div className="chat-list">
                {unread.length === 0 ? (
                  <div className="chats-empty-frame">
                    <strong>All caught up</strong> — no creators are waiting on a reply.
                  </div>
                ) : (
                  unread.map((c) => <Card key={c.id} c={c} />)
                )}
              </div>
            </section>

            <section className="admin-section">
              <div className="admin-section-head">
                <h2>
                  <span className="chat-section-label chat-section-label-replied">
                    Replied
                  </span>
                  <span className="chat-section-count">{replied.length}</span>
                </h2>
                <span className="admin-meta">
                  Threads where AM sent the last message (or no messages yet).
                </span>
              </div>
              <div className="chat-list">
                {replied.length === 0 ? (
                  <div className="wdr-history-empty">
                    No replied threads yet.
                  </div>
                ) : (
                  replied.map((c) => <Card key={c.id} c={c} />)
                )}
              </div>
            </section>
          </>
        );
      })()}
    </main>
  );
}
