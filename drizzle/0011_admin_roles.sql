-- 0011_admin_roles.sql
-- Team roles + invite system for /admin
-- ============================================================
-- Adds admin_role to users so we can scope what each teammate sees.
-- Creates admin_invites for the email-based team invite flow.
--
-- Default backfill: every existing admin gets 'owner' (Kevin today).
-- New admins start null until an invite lands.

ALTER TABLE users ADD COLUMN IF NOT EXISTS admin_role varchar(40);
--> statement-breakpoint
UPDATE users SET admin_role = 'owner' WHERE is_admin = true AND admin_role IS NULL;
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS admin_invites (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email varchar(320) NOT NULL,
  role varchar(40) NOT NULL,
  token varchar(64) NOT NULL UNIQUE,
  invited_by uuid,
  status varchar(20) NOT NULL DEFAULT 'pending',
  expires_at timestamptz NOT NULL DEFAULT (now() + interval '7 days'),
  created_at timestamptz NOT NULL DEFAULT now(),
  claimed_at timestamptz
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS admin_invites_email_idx ON admin_invites (lower(email));
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS admin_invites_pending_uniq ON admin_invites (lower(email)) WHERE status = 'pending';
