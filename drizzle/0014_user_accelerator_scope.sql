-- Per-tenant role scoping for admin roles
-- ============================================================
-- Non-owner admins can be bound to a single accelerator so they only see
-- that tenant's data. Owner always sees everything.
--
-- Also adds the same column to admin_invites so an invite can pre-set
-- the scope that applies when the user signs in and claims it.

ALTER TABLE users ADD COLUMN IF NOT EXISTS scoped_accelerator varchar(40);
--> statement-breakpoint
ALTER TABLE admin_invites ADD COLUMN IF NOT EXISTS scoped_accelerator varchar(40);
