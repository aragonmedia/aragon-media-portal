-- Demo/reviewer support for TikTok Shop Partner Center App Review.
-- Adds password_hash + is_demo columns to users. Real users get NULL for
-- password_hash and false for is_demo, so behavior is unchanged for them.
--
-- Reviewer accounts (is_demo=true) log in via /login (email + password)
-- and are locked to the /review/** shell by src/middleware.ts.

ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "password_hash" varchar(500);--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "is_demo" boolean DEFAULT false NOT NULL;
