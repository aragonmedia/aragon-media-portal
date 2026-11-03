-- 1-on-1 call RSVP flow adds WhatsApp number, country, and traffic source
-- so the admin email + Airtable sync carry the fields a VA needs to WhatsApp.
ALTER TABLE accelerator_intents ADD COLUMN IF NOT EXISTS whatsapp varchar(32);
--> statement-breakpoint
ALTER TABLE accelerator_intents ADD COLUMN IF NOT EXISTS country varchar(80);
--> statement-breakpoint
ALTER TABLE accelerator_intents ADD COLUMN IF NOT EXISTS source varchar(200);
