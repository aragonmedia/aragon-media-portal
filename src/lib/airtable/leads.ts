/**
 * Airtable → Accelerator Ops (Leads) sync.
 *
 * Fires from the /api/accelerator/intent route on both `reveal`
 * (name+email gate submit) and `click` (tier CTA press). Idempotent:
 * we PATCH by matching Portal ID; only create if not found.
 *
 * Requires these env vars:
 *   AIRTABLE_TOKEN            - Personal Access Token (data.records:read + write)
 *   AIRTABLE_BASE_ID          - app4crT3UMHZVB6IR
 *   AIRTABLE_LEADS_TABLE_ID   - tblvE06iSnxnToDOV
 *
 * Field names match Kevin's live schema (Sep 2026):
 *   Name, Email, Stage, Lead Source, Tier Interest, Notes, Portal ID
 *
 * If the vars are missing we no-op silently — so this can ship before
 * the env is wired without breaking the landing page.
 */

type TierClick = "edu_only" | "edu_plus_account" | "browse" | null | undefined;

const TIER_INTEREST: Record<string, string> = {
  edu_only: "Education ($997)",
  edu_plus_account: "Education + Account ($1,997)",
  browse: "Browse accounts only",
};

const SOURCE_LANDING = "Landing Page";
const STAGE_NEW = "New";

function airtableEnv() {
  const token = process.env.AIRTABLE_TOKEN;
  const baseId = process.env.AIRTABLE_BASE_ID;
  const tableId = process.env.AIRTABLE_LEADS_TABLE_ID;
  if (!token || !baseId || !tableId) return null;
  return { token, baseId, tableId };
}

async function findByPortalId(env: NonNullable<ReturnType<typeof airtableEnv>>, portalId: string): Promise<string | null> {
  const filter = encodeURIComponent(`{Portal ID} = "${portalId.replace(/"/g, '\\"')}"`);
  const url = `https://api.airtable.com/v0/${env.baseId}/${env.tableId}?filterByFormula=${filter}&maxRecords=1`;
  const r = await fetch(url, { headers: { Authorization: `Bearer ${env.token}` } });
  if (!r.ok) return null;
  const j = (await r.json()) as { records?: Array<{ id: string }> };
  return j.records?.[0]?.id ?? null;
}

async function createLead(
  env: NonNullable<ReturnType<typeof airtableEnv>>,
  fields: Record<string, unknown>
): Promise<string | null> {
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

async function patchLead(
  env: NonNullable<ReturnType<typeof airtableEnv>>,
  recordId: string,
  fields: Record<string, unknown>
): Promise<boolean> {
  const url = `https://api.airtable.com/v0/${env.baseId}/${env.tableId}/${recordId}`;
  const r = await fetch(url, {
    method: "PATCH",
    headers: { Authorization: `Bearer ${env.token}`, "Content-Type": "application/json" },
    body: JSON.stringify({ fields, typecast: true }),
  });
  return r.ok;
}

/**
 * Upsert an intent into Airtable Leads. Best-effort — never throws.
 * Returns the Airtable record id (new or existing) or null on failure.
 */
export async function upsertLead(input: {
  portalId: string;
  name: string;
  email: string;
  clickedTier?: TierClick;
  referrer?: string | null;
  userAgent?: string | null;
}): Promise<string | null> {
  const env = airtableEnv();
  if (!env) return null; // no-op if not configured
  try {
    const existing = await findByPortalId(env, input.portalId);
    const fields: Record<string, unknown> = {
      "Name": input.name || "(no name)",
      "Email": input.email,
      "Portal ID": input.portalId,
      "Lead Source": SOURCE_LANDING,
    };
    // Only set Tier Interest when we actually have a tier click — otherwise
    // a slow reveal PATCH could overwrite a fast click's tier value.
    if (input.clickedTier) fields["Tier Interest"] = TIER_INTEREST[input.clickedTier];
    if (!existing) fields["Stage"] = STAGE_NEW;
    if (existing) return (await patchLead(env, existing, fields)) ? existing : null;
    return await createLead(env, fields);
  } catch {
    return null;
  }
}
