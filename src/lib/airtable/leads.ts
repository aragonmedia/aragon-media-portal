/**
 * Airtable → Accelerator Ops (Leads) sync — per-tenant.
 *
 * Routes to Roni's base by default. If accelerator="colt", routes to
 * COLT base. Each env group is independent so Roni never sees COLT
 * leads and vice versa.
 *
 * Env vars:
 *   AIRTABLE_TOKEN                  — shared PAT (works for both bases)
 *   AIRTABLE_BASE_ID                — Roni base id
 *   AIRTABLE_LEADS_TABLE_ID         — Roni leads table id
 *   AIRTABLE_COLT_BASE_ID           — COLT base id
 *   AIRTABLE_COLT_LEADS_TABLE_ID    — COLT leads table id
 *
 * No-ops silently if env vars missing.
 */

type TierClick = "edu_only" | "edu_plus_account" | "browse" | null | undefined;

const TIER_INTEREST: Record<string, string> = {
  edu_only: "Education ($997)",
  edu_plus_account: "Education + Account ($1,997)",
  browse: "Browse accounts only",
};

const SOURCE_LANDING = "Landing Page";
const STAGE_NEW = "New";

function airtableEnv(slug: string) {
  const token = process.env.AIRTABLE_TOKEN;
  if (!token) return null;
  if (slug === "colt") {
    const baseId = process.env.AIRTABLE_COLT_BASE_ID;
    const tableId = process.env.AIRTABLE_COLT_LEADS_TABLE_ID;
    if (!baseId || !tableId) return null;
    return { token, baseId, tableId };
  }
  const baseId = process.env.AIRTABLE_BASE_ID;
  const tableId = process.env.AIRTABLE_LEADS_TABLE_ID;
  if (!baseId || !tableId) return null;
  return { token, baseId, tableId };
}

async function findByPortalId(env: { token: string; baseId: string; tableId: string }, portalId: string): Promise<string | null> {
  const filter = encodeURIComponent(`{Portal ID} = "${portalId.replace(/"/g, '\\"')}"`);
  const url = `https://api.airtable.com/v0/${env.baseId}/${env.tableId}?filterByFormula=${filter}&maxRecords=1`;
  const r = await fetch(url, { headers: { Authorization: `Bearer ${env.token}` } });
  if (!r.ok) return null;
  const j = (await r.json()) as { records?: Array<{ id: string }> };
  return j.records?.[0]?.id ?? null;
}

async function createLead(env: { token: string; baseId: string; tableId: string }, fields: Record<string, unknown>): Promise<string | null> {
  const url = `https://api.airtable.com/v0/${env.baseId}/${env.tableId}`;
  const r = await fetch(url, {
    method: "POST",
    headers: { Authorization: `Bearer ${env.token}`, "Content-Type": "application/json" },
    body: JSON.stringify({ fields, typecast: true }),
  });
  if (!r.ok) return null;
  const j = (await r.json()) as { id?: string };
  return j.id ?? null;
}

async function patchLead(env: { token: string; baseId: string; tableId: string }, recordId: string, fields: Record<string, unknown>): Promise<boolean> {
  const url = `https://api.airtable.com/v0/${env.baseId}/${env.tableId}/${recordId}`;
  const r = await fetch(url, {
    method: "PATCH",
    headers: { Authorization: `Bearer ${env.token}`, "Content-Type": "application/json" },
    body: JSON.stringify({ fields, typecast: true }),
  });
  return r.ok;
}

/**
 * Upsert an intent into the matching tenant's Airtable Leads base.
 * Best-effort — never throws. Returns the Airtable record id or null.
 */
export async function upsertLead(input: {
  portalId: string;
  name: string;
  email: string;
  clickedTier?: TierClick;
  referrer?: string | null;
  userAgent?: string | null;
  accelerator?: string;
}): Promise<string | null> {
  const slug = input.accelerator ?? "roni";
  const env = airtableEnv(slug);
  if (!env) return null;
  try {
    const existing = await findByPortalId(env, input.portalId);
    const fields: Record<string, unknown> = {
      "Name": input.name || "(no name)",
      "Email": input.email,
      "Portal ID": input.portalId,
      "Lead Source": SOURCE_LANDING,
    };
    if (input.clickedTier) fields["Tier Interest"] = TIER_INTEREST[input.clickedTier];
    if (!existing) fields["Stage"] = STAGE_NEW;
    if (existing) return (await patchLead(env, existing, fields)) ? existing : null;
    return await createLead(env, fields);
  } catch {
    return null;
  }
}
