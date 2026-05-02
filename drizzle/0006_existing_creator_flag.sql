ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "is_existing_creator" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "existing_creator_marked_at" timestamp with time zone;
