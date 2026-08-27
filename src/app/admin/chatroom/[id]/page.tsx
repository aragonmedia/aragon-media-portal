import { redirect } from "next/navigation";
import { asc, desc, eq } from "drizzle-orm";
import { isAdminSession } from "@/lib/auth/admin";
import { db } from "@/db";
import { chatroomThreads, chatroomMessages, chatroomCredentials } from "@/db/schema";
import ThreadClient from "./ThreadClient";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export default async function AdminChatroomThread({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  if (!(await isAdminSession())) redirect("/admin");
  const { id } = await params;

  const [thread] = await db
    .select()
    .from(chatroomThreads)
    .where(eq(chatroomThreads.id, id))
    .limit(1);
  if (!thread) redirect("/admin/chatroom");

  const [msgs, creds] = await Promise.all([
    db.select().from(chatroomMessages).where(eq(chatroomMessages.threadId, id)).orderBy(asc(chatroomMessages.createdAt)),
    db.select().from(chatroomCredentials).where(eq(chatroomCredentials.threadId, id)).orderBy(desc(chatroomCredentials.submittedAt)),
  ]);

  return (
    <ThreadClient
      thread={{
        id: thread.id,
        email: thread.email,
        name: thread.name,
        createdAt: thread.createdAt.toISOString(),
      }}
      initialMessages={msgs.map((m) => ({
        id: m.id,
        sender: m.sender,
        body: m.body,
        attachments: m.attachments,
        createdAt: m.createdAt.toISOString(),
      }))}
      credentials={creds.map((c) => ({
        id: c.id,
        submittedAt: c.submittedAt.toISOString(),
        viewedByAdminAt: c.viewedByAdminAt?.toISOString() ?? null,
      }))}
    />
  );
}
