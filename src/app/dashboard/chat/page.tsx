import { and, asc, eq } from "drizzle-orm";
import { getCurrentUser } from "@/lib/auth/session";
import { db } from "@/db";
import { chats, messages } from "@/db/schema";
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

export default async function ChatPage() {
  const user = await getCurrentUser();
  if (!user) return null;

  // Find or create the creator's single open chat thread.
  let row = (
    await db
      .select()
      .from(chats)
      .where(and(eq(chats.userId, user.id), eq(chats.status, "open")))
      .limit(1)
  )[0];

  if (!row) {
    const inserted = await db
      .insert(chats)
      .values({
        userId: user.id,
        subject: "Aragon Media support",
        status: "open",
      })
      .returning();
    row = inserted[0];
    // Seed a system welcome message so the room isn't empty
    await db.insert(messages).values({
      chatId: row.id,
      sender: "system",
      body: "Welcome — this is your private channel with the Aragon Media team. Drop us a note any time and we'll respond ASAP.",
    });
  }

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
    <main className="dash-content">
      <header className="dash-page-head">
        <div>
          <p className="dash-eyebrow">Chat with AM team</p>
          <h1>Your direct line</h1>
          <p className="dash-page-sub">
            Every message lives here. The Aragon Media team gets an email
            whenever you reply, so we&apos;ll get back to you fast.
          </p>
        </div>
      </header>

      <ChatRoomClient
        chatId={row.id}
        viewer="user"
        viewerName={user.name}
        initialMessages={initial.map((m) => ({
          id: m.id,
          sender: m.sender,
          body: m.body,
          attachmentUrls: parseAttachments(m.attachmentUrls),
          createdAt: typeof m.createdAt === "string"
            ? m.createdAt
            : m.createdAt.toISOString(),
        }))}
      />
    </main>
  );
}
