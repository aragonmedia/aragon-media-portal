/**
 * Aragon Media Portal — Drizzle Schema v1
 *
 * Locked 2026-04-29.
 * - users / verification_codes / sessions = auth foundation
 * - accounts = TikTok creator accounts under a user (1 user, up to 4 per cycle)
 * - purchases = Square checkout records (with fee_cents column for auditability)
 * - chats / messages = AM team <-> creator thread (replaces Discord ops)
 * - withdrawals = manual payout requests with 20% AM fee captured
 *
 * 20% AM fee is locked at contract signing per customer (contract_signed_at on
 * users) and recorded per-purchase in fee_cents and per-withdrawal in fee_cents.
 */

import {
  pgTable,
  text,
  integer,
  timestamp,
  boolean,
  varchar,
  uuid,
  pgEnum,
  index,
  uniqueIndex,
} from "drizzle-orm/pg-core";

// ===== Enums =====
export const roleEnum = pgEnum("role", ["creator", "brand", "other"]);
export const accountStatusEnum = pgEnum("account_status", [
  "pending",
  "credentials_received",
  "two_factor_pending",
  "verified",
  "active",
  "suspended",
  "cancelled",
]);
export const purchaseTierEnum = pgEnum("purchase_tier", [
  "path_a_1",
  "path_b_1",
  "path_b_2",
  "path_b_3",
  "path_b_4",
]);
export const purchaseStatusEnum = pgEnum("purchase_status", [
  "pending",
  "paid",
  "refunded",
  "failed",
]);
export const codePurposeEnum = pgEnum("code_purpose", [
  "signup",
  "signin",
  "withdrawal_confirm",
]);
export const messageSenderEnum = pgEnum("message_sender", [
  "user",
  "am_team",
  "system",
]);
export const withdrawalStatusEnum = pgEnum("withdrawal_status", [
  "requested",
  "approved",
  "paid",
  "rejected",
]);

// ===== users =====
export const users = pgTable(
  "users",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    email: varchar("email", { length: 254 }).notNull(),
    name: varchar("name", { length: 200 }).notNull(),
    role: roleEnum("role").notNull(),
    handle: varchar("handle", { length: 200 }),
    otherDetails: text("other_details"),
    isAdmin: boolean("is_admin").default(false).notNull(),
    contractSignedAt: timestamp("contract_signed_at", { withTimezone: true }),
    contractVersion: varchar("contract_version", { length: 20 }),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    verifiedAt: timestamp("verified_at", { withTimezone: true }),
    lastSigninAt: timestamp("last_signin_at", { withTimezone: true }),
  },
  (t) => ({
    emailIdx: uniqueIndex("users_email_idx").on(t.email),
  })
);

// ===== verification_codes =====
export const verificationCodes = pgTable(
  "verification_codes",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id").references(() => users.id, { onDelete: "cascade" }),
    email: varchar("email", { length: 254 }).notNull(),
    codeHash: varchar("code_hash", { length: 200 }).notNull(),
    purpose: codePurposeEnum("purpose").notNull(),
    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
    consumedAt: timestamp("consumed_at", { withTimezone: true }),
    attempts: integer("attempts").default(0).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => ({
    emailPurposeIdx: index("vc_email_purpose_idx").on(t.email, t.purpose),
  })
);

// ===== sessions =====
export const sessions = pgTable("sessions", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id")
    .references(() => users.id, { onDelete: "cascade" })
    .notNull(),
  tokenHash: varchar("token_hash", { length: 200 }).notNull().unique(),
  expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
  ipAddress: varchar("ip_address", { length: 45 }),
  userAgent: text("user_agent"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  revokedAt: timestamp("revoked_at", { withTimezone: true }),
});

// ===== accounts (TikTok creator accounts) =====
export const accounts = pgTable("accounts", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id")
    .references(() => users.id, { onDelete: "cascade" })
    .notNull(),
  tiktokHandle: varchar("tiktok_handle", { length: 200 }).notNull(),
  status: accountStatusEnum("status").default("pending").notNull(),
  cyclePosition: integer("cycle_position").notNull(),
  cycleNumber: integer("cycle_number").default(1).notNull(),
  notes: text("notes"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  credentialsReceivedAt: timestamp("credentials_received_at", { withTimezone: true }),
  twoFactorAt: timestamp("two_factor_at", { withTimezone: true }),
  verifiedAt: timestamp("verified_at", { withTimezone: true }),
  activatedAt: timestamp("activated_at", { withTimezone: true }),
});

// ===== purchases =====
export const purchases = pgTable("purchases", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id").references(() => users.id, { onDelete: "set null" }),
  tier: purchaseTierEnum("tier").notNull(),
  amountCents: integer("amount_cents").notNull(),
  feeCents: integer("fee_cents").default(0).notNull(),
  squarePaymentId: varchar("square_payment_id", { length: 200 }),
  squareCheckoutUrl: varchar("square_checkout_url", { length: 500 }),
  status: purchaseStatusEnum("status").default("pending").notNull(),
  paidAt: timestamp("paid_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

// ===== chats =====
export const chats = pgTable("chats", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id")
    .references(() => users.id, { onDelete: "cascade" })
    .notNull(),
  subject: varchar("subject", { length: 300 }),
  status: varchar("status", { length: 20 }).default("open").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  lastMessageAt: timestamp("last_message_at", { withTimezone: true }).defaultNow().notNull(),
});

// ===== messages =====
export const messages = pgTable(
  "messages",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    chatId: uuid("chat_id")
      .references(() => chats.id, { onDelete: "cascade" })
      .notNull(),
    sender: messageSenderEnum("sender").notNull(),
    body: text("body").notNull(),
    attachmentUrls: text("attachment_urls"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => ({
    chatIdx: index("messages_chat_idx").on(t.chatId, t.createdAt),
  })
);

// ===== withdrawals =====
export const withdrawals = pgTable("withdrawals", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id")
    .references(() => users.id, { onDelete: "set null" })
    .notNull(),
  accountId: uuid("account_id").references(() => accounts.id, {
    onDelete: "set null",
  }),
  grossCents: integer("gross_cents").notNull(),
  feeCents: integer("fee_cents").notNull(),
  netCents: integer("net_cents").notNull(),
  status: withdrawalStatusEnum("status").default("requested").notNull(),
  payoutMethod: varchar("payout_method", { length: 50 }),
  payoutRef: varchar("payout_ref", { length: 200 }),
  notes: text("notes"),
  proofUrl: varchar("proof_url", { length: 500 }),
  requestedAt: timestamp("requested_at", { withTimezone: true }).defaultNow().notNull(),
  approvedAt: timestamp("approved_at", { withTimezone: true }),
  paidAt: timestamp("paid_at", { withTimezone: true }),
});
