ALTER TYPE "public"."withdrawal_status" ADD VALUE IF NOT EXISTS 'late_retained';--> statement-breakpoint
CREATE SEQUENCE IF NOT EXISTS "withdrawal_receipt_seq" START 1;--> statement-breakpoint
ALTER TABLE "withdrawals" ADD COLUMN IF NOT EXISTS "receipt_number" varchar(20);--> statement-breakpoint
UPDATE "withdrawals" SET "receipt_number" = 'AM-WDR-' || lpad(nextval('withdrawal_receipt_seq')::text, 5, '0') WHERE "receipt_number" IS NULL;--> statement-breakpoint
ALTER TABLE "withdrawals" ALTER COLUMN "receipt_number" SET DEFAULT ('AM-WDR-' || lpad(nextval('withdrawal_receipt_seq')::text, 5, '0'));--> statement-breakpoint
ALTER TABLE "withdrawals" ALTER COLUMN "receipt_number" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "withdrawals" ADD CONSTRAINT "withdrawals_receipt_number_unique" UNIQUE ("receipt_number");--> statement-breakpoint
ALTER TABLE "withdrawals" ADD COLUMN IF NOT EXISTS "withdrawal_date" date;--> statement-breakpoint
ALTER TABLE "withdrawals" ADD COLUMN IF NOT EXISTS "source_account" varchar(200);
