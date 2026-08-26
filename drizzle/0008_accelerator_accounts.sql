-- Accelerator: Discord-sourced account listings (P1)
--
-- Cached rows parsed from the daily-edited Discord channel message.
-- Idempotent so the migration runner can re-apply without error.

CREATE TABLE IF NOT EXISTS "accelerator_accounts" (
    "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
    "handle" varchar(200) NOT NULL,
    "tiktok_url" varchar(500) NOT NULL,
    "account_type" varchar(100) NOT NULL DEFAULT 'USA Shop Affiliate',
    "followers" integer,
    "price_cents" integer NOT NULL,
    "original_price_cents" integer,
    "raw_line" text NOT NULL,
    "position" integer NOT NULL DEFAULT 0,
    "last_seen_at" timestamp with time zone DEFAULT now() NOT NULL,
    "created_at" timestamp with time zone DEFAULT now() NOT NULL
);--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "accelerator_accounts_handle_uniq" ON "accelerator_accounts" ("handle");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "accelerator_accounts_position_idx" ON "accelerator_accounts" ("position");--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "accelerator_syncs" (
    "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
    "source" varchar(50) NOT NULL DEFAULT 'manual',
    "rows_parsed" integer NOT NULL DEFAULT 0,
    "rows_upserted" integer NOT NULL DEFAULT 0,
    "rows_removed" integer NOT NULL DEFAULT 0,
    "error" text,
    "created_at" timestamp with time zone DEFAULT now() NOT NULL
);
