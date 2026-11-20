-- Multi-step qualifier adds Scott-Kelly-style 3-question funnel fields
-- (stage, monthly income, 90-day goal) + VSL engagement tracking so we
-- know which qualified leads actively watched the thank-you video.
ALTER TABLE accelerator_intents ADD COLUMN IF NOT EXISTS lead_stage varchar(40);
--> statement-breakpoint
ALTER TABLE accelerator_intents ADD COLUMN IF NOT EXISTS monthly_income varchar(40);
--> statement-breakpoint
ALTER TABLE accelerator_intents ADD COLUMN IF NOT EXISTS goal_text text;
--> statement-breakpoint
ALTER TABLE accelerator_intents ADD COLUMN IF NOT EXISTS vsl_viewed boolean DEFAULT false NOT NULL;
--> statement-breakpoint
ALTER TABLE accelerator_intents ADD COLUMN IF NOT EXISTS vsl_viewed_at timestamp with time zone;
