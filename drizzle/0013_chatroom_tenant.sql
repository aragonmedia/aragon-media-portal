-- Multi-tenant chatroom threads
ALTER TABLE chatroom_threads ADD COLUMN IF NOT EXISTS accelerator_slug varchar(40) NOT NULL DEFAULT 'roni';
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS chatroom_threads_slug_idx ON chatroom_threads (accelerator_slug);
