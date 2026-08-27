/**
 * /admin/chatroom — thread list. Admin-only.
 * Shows all chatroom threads with unread markers + last-message peek.
 */

import Link from "next/link";
import { redirect } from "next/navigation";
import { desc, eq, sql } from "drizzle-orm";
import { isAdminSession } from "@/lib/auth/admin";
import { db } from "@/db";
import { chatroomThreads, chatroomMessages, chatroomCredentials } from "@/db/schema";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

function fmt(d: Date | null | undefined) {
  if (!d) return "—";
  return new Date(d).toLocaleString();
}

export default async function AdminChatroomList() {
  if (!(await isAdminSession())) redirect("/admin");

  const threads = await db
    .select({
      id: chatroomThreads.id,
      email: chatroomThreads.email,
      name: chatroomThreads.name,
      lastMessageAt: chatroomThreads.lastMessageAt,
      lastUserMessageAt: chatroomThreads.lastUserMessageAt,
      lastAdminMessageAt: chatroomThreads.lastAdminMessageAt,
    })
    .from(chatroomThreads)
    .orderBy(desc(chatroomThreads.lastMessageAt));

  // For each thread, get message count + creds count
  const summary = await Promise.all(
    threads.map(async (t) => {
      const [{ count }] = await db
        .select({ count: sql<number>`count(*)::int` })
        .from(chatroomMessages)
        .where(eq(chatroomMessages.threadId, t.id));
      const [{ credsCount }] = await db
        .select({ credsCount: sql<number>`count(*)::int` })
        .from(chatroomCredentials)
        .where(eq(chatroomCredentials.threadId, t.id));
      const unread =
        !!t.lastUserMessageAt &&
        (!t.lastAdminMessageAt ||
          new Date(t.lastUserMessageAt).getTime() >
            new Date(t.lastAdminMessageAt).getTime());
      return { ...t, count, credsCount, unread };
    })
  );

  return (
    <div className="acr-wrap">
      <header className="acr-head">
        <p className="acr-eyebrow">Accelerator</p>
        <h1>Chatroom threads</h1>
        <p className="acr-sub">
          Verification chats coming through <code>/chatroom</code>. Threads
          persist per (email + browser). Unread badge = user replied since your
          last message.
        </p>
      </header>

      {threads.length === 0 ? (
        <div className="acr-empty">
          <p>No chatroom threads yet.</p>
          <p className="acr-empty-sub">
            When someone opens <a href="/chatroom">/chatroom</a> and sends a
            message, it&apos;ll appear here.
          </p>
        </div>
      ) : (
        <ul className="acr-list">
          {summary.map((t) => (
            <li key={t.id} className={`acr-item${t.unread ? " unread" : ""}`}>
              <Link href={`/admin/chatroom/${t.id}`}>
                <div className="acr-item-main">
                  <div className="acr-item-name">
                    {t.name}
                    {t.credsCount > 0 && <span className="acr-creds-badge">🔒 {t.credsCount}</span>}
                    {t.unread && <span className="acr-unread-dot" aria-label="Unread" />}
                  </div>
                  <div className="acr-item-email">{t.email}</div>
                </div>
                <div className="acr-item-meta">
                  <div>{t.count} msg{t.count === 1 ? "" : "s"}</div>
                  <div className="acr-item-time">Last: {fmt(t.lastMessageAt)}</div>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}

      <style>{`
        .acr-wrap { max-width: 960px; margin: 40px auto; padding: 0 32px 80px; font-family: 'Inter Tight', system-ui, sans-serif; color: #F5F1E6; }
        .acr-head { margin-bottom: 22px; }
        .acr-eyebrow { margin: 0 0 6px; font-size: 11px; letter-spacing: 0.18em; text-transform: uppercase; color: #C9A84C; font-weight: 700; }
        .acr-head h1 { margin: 0; font-size: 28px; font-weight: 700; letter-spacing: -0.01em; }
        .acr-sub { margin: 8px 0 0; font-size: 13.5px; color: #9A9590; line-height: 1.6; }
        .acr-sub code { background: #141414; border: 1px solid #262626; padding: 1px 6px; border-radius: 4px; font-size: 12px; color: #C9A84C; }
        .acr-sub a { color: #C9A84C; }
        .acr-empty { padding: 40px; text-align: center; background: #141414; border: 1px dashed #262626; border-radius: 12px; color: #9A9590; }
        .acr-empty p { margin: 0; }
        .acr-empty-sub { margin-top: 6px !important; font-size: 12.5px; color: #6B6660; }
        .acr-empty a { color: #C9A84C; }
        .acr-list { list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: 8px; }
        .acr-item a { display: flex; justify-content: space-between; align-items: center; padding: 14px 18px; background: #141414; border: 1px solid #1F1F1F; border-radius: 10px; text-decoration: none; color: inherit; transition: border-color 120ms ease, transform 120ms ease; }
        .acr-item a:hover { border-color: #C9A84C; transform: translateY(-1px); }
        .acr-item.unread a { border-left: 3px solid #DC1E2E; }
        .acr-item-name { font-size: 14.5px; font-weight: 700; color: #F5F1E6; display: flex; align-items: center; gap: 8px; }
        .acr-item-email { margin-top: 3px; font-size: 12px; color: #9A9590; }
        .acr-item-meta { text-align: right; font-size: 12px; color: #9A9590; }
        .acr-item-time { margin-top: 3px; font-size: 11px; color: #6B6660; }
        .acr-creds-badge {
          font-size: 10.5px; font-weight: 700;
          background: rgba(220, 30, 46, 0.12);
          color: #E07A6E;
          border: 1px solid rgba(220, 30, 46, 0.4);
          padding: 2px 8px; border-radius: 999px;
        }
        .acr-unread-dot { width: 8px; height: 8px; border-radius: 50%; background: #DC1E2E; box-shadow: 0 0 0 3px rgba(220,30,46,0.24); }
      `}</style>
    </div>
  );
}
