-- Multi-tenant support for intent capture
ALTER TABLE accelerator_intents ADD COLUMN IF NOT EXISTS accelerator_slug varchar(40) NOT NULL DEFAULT 'roni';
--> statement-breakpoint
ALTER TABLE accelerator_intents ADD COLUMN IF NOT EXISTS action varchar(32);
--> statement-breakpoint
UPDATE accelerator_intents SET action = CASE WHEN clicked_tier IS NOT NULL THEN 'click' ELSE 'reveal' END WHERE action IS NULL;
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS accelerator_intents_slug_idx ON accelerator_intents (accelerator_slug);
