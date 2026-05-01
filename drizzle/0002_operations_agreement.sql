ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "contract_unlocked" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "contract_unlocked_at" timestamp with time zone;--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "agreements" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"signature" varchar(200) NOT NULL,
	"contract_version" varchar(20) NOT NULL,
	"signed_at" timestamp with time zone DEFAULT now() NOT NULL
);--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "agreements" ADD CONSTRAINT "agreements_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "agreements_user_idx" ON "agreements" ("user_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "agreements_signed_at_idx" ON "agreements" ("signed_at");
