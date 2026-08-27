-- Accelerator P2: verification chatroom (public, email + cookie keyed)
--
-- Threads persist per (email + browser_key). Cookie identifies the
-- browser; email identifies the person. Same email + same browser →
-- same thread. Different browser or cleared cookie → new thread.
--
-- All CREATE IF NOT EXISTS so re-running is safe.

CREATE TABLE IF NOT EXISTS "chatroom_threads" (
    "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
    "email" varchar(320) NOT NULL,
    "name" varchar(200) NOT NULL,
    "browser_key" varchar(64) NOT NULL,
    "status" varchar(30) NOT NULL DEFAULT 'open',
    "created_at" timestamp with time zone DEFAULT now() NOT NULL,
    "last_message_at" timestamp with time zone DEFAULT now() NOT NULL,
    "last_user_message_at" timestamp with time zone,
    "last_admin_message_at" timestamp with time zone
);--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "chatroom_threads_email_key_uniq" ON "chatroom_threads" ("email", "browser_key");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "chatroom_threads_last_message_idx" ON "chatroom_threads" ("last_message_at");--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "chatroom_messages" (
    "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
    "thread_id" uuid NOT NULL REFERENCES "chatroom_threads"("id") ON DELETE CASCADE,
    "sender" varchar(10) NOT NULL,
    "body" text NOT NULL DEFAULT '',
    "attachments" jsonb NOT NULL DEFAULT '[]'::jsonb,
    "created_at" timestamp with time zone DEFAULT now() NOT NULL
);--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "chatroom_messages_thread_idx" ON "chatroom_messages" ("thread_id");--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "chatroom_credentials" (
    "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
    "thread_id" uuid NOT NULL REFERENCES "chatroom_threads"("id") ON DELETE CASCADE,
    "ciphertext" text NOT NULL,
    "iv" varchar(48) NOT NULL,
    "auth_tag" varchar(48) NOT NULL,
    "submitted_at" timestamp with time zone DEFAULT now() NOT NULL,
    "viewed_by_admin_at" timestamp with time zone
);--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "chatroom_credentials_thread_idx" ON "chatroom_credentials" ("thread_id");
