import { eq, desc } from "drizzle-orm";
import { getCurrentUser } from "@/lib/auth/session";
import { db } from "@/db";
import { chats } from "@/db/schema";

export const dynamic = "force-dynamic";

export default async function ChatPage() {
  const user = await getCurrentUser();
  if (!user) return null;
  const myChats = await db
    .select()
    .from(chats)
    .where(eq(chats.userId, user.id))
    .orderBy(desc(chats.lastMessageAt));

  return (
    <main className="dash-content">
      <header className="dash-page-head">
        <div>
          <p className="dash-eyebrow">Chat</p>
          <h1>AM team thread</h1>
          <p className="dash-page-sub">Direct line to your dedicated AM operator. Replaces Discord, WhatsApp, email, and groupchats.</p>
        </div>
      </header>

      {myChats.length === 0 ? (
        <div className="dash-card dash-card-block">
          <div className="dash-empty-large">
            <div className="dash-empty-title">No active thread yet</div>
            <div className="dash-empty-body">A private chat with the AM team opens automatically the moment you complete your first activation. No setup needed.</div>
          </div>
        </div>
      ) : (
        <div className="dash-card">
          <ul className="dash-chat-list">
            {myChats.map((c) => (
              <li key={c.id} className="dash-chat-row">
                <div className="dash-chat-name">{c.subject ?? "Aragon Media support"}</div>
                <div className="dash-chat-meta">Last activity {new Date(c.lastMessageAt).toLocaleString()}</div>
                <span className={`status-pill status-${c.status}`}>{c.status}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </main>
  );
}
