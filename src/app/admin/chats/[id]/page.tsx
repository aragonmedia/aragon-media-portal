import Link from "next/link";
import { notFound } from "next/navigation";
import { asc, eq } from "drizzle-orm";
import { db } from "@/db";
import { chats, messages, users } from "@/db/schema";
import ChatRoomClient from "@/app/components/ChatRoomClient";

export const dynamic = "force-dynamic";

function parseAttachments(raw: string | null): string[] {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed)
      ? parsed.filter((u): u is string => typeof u === "string")
      : [];
  } catch {
    return [];
  }
}
export const revalidate = 0;

export default async function AdminChatRoom({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const row = (
    await db
      .select({
        id: chats.id,
        subject: chats.subject,
        userId: chats.userId,
        creatorEmail: users.email,
        creatorName: users.name,
      })
      .from(chats)
      .leftJoin(users, eq(users.id, chats.userId))
      .where(eq(chats.id, id))
      .limit(1)
  )[0];
  if (!row) notFound();

  const initial = await db
    .select({
      id: messages.id,
      sender: messages.sender,
      body: messages.body,
      attachmentUrls: messages.attachmentUrls,
      createdAt: messages.createdAt,
    })
    .from(messages)
    .where(eq(messages.chatId, row.id))
    .orderBy(asc(messages.createdAt));

  return (
    <main className="admin-shell admin-shell-nested">
      <header className="admin-header">
        <div>
          <p className="admin-eyebrow">Chat with {row.creatorName ?? "creator"}</p>
          <h1>{row.creatorName ?? "Unknown creator"}</h1>
          <p className="admin-page-sub">
            {row.creatorEmail ?? "—"} · Replies fire a notification email to
            the creator (throttled to one per 5 minutes per side).
          </p>
        </div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <Link
            href={`/admin/withdrawals?creator=${row.userId}`}
            className="admin-row-btn"
          >
            Receipts →
          </Link>
          <Link href="/admin/chats" className="admin-row-btn">
            ← All chats
          </Link>
        </div>
      </header>

      <section className="admin-section admin-chat-section">
        <ChatRoomClient
          chatId={row.id}
          viewer="admin"
          viewerName="Aragon Media (you)"
          initialMessages={initial.map((m) => ({
            id: m.id,
            sender: m.sender,
            body: m.body,
            attachmentUrls: parseAttachments(m.attachmentUrls),
            createdAt:
              typeof m.createdAt === "string"
                ? m.createdAt
                : m.createdAt.toISOString(),
          }))}
        />
      </section>
    </main>
  );
}
