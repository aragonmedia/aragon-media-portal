-- P3: Landing-page gate + tier-click intent capture.
-- Tracks every visitor who reveals pricing (viewed_tiers_at) AND every
-- one who clicks a checkout CTA (clicked_tier + clicked_at), so we can
-- see the funnel and follow up on drop-offs.
--
-- All CREATE IF NOT EXISTS for idempotency.

CREATE TABLE IF NOT EXISTS "accelerator_intents" (
    "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
    "email" varchar(320) NOT NULL,
    "name" varchar(200) NOT NULL,
    "browser_key" varchar(64),
    "viewed_tiers_at" timestamp with time zone,
    "clicked_tier" varchar(40),
    "clicked_tier_price_cents" integer,
    "clicked_at" timestamp with time zone,
    "referrer" varchar(500),
    "user_agent" varchar(500),
    "created_at" timestamp with time zone DEFAULT now() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT now() NOT NULL
);--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "accelerator_intents_email_idx" ON "accelerator_intents" ("email");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "accelerator_intents_clicked_at_idx" ON "accelerator_intents" ("clicked_at");
