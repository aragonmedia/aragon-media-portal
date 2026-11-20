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

const SAFE_FIELDS = new Set(["Name", "Email", "Portal ID", "Lead Source", "Stage", "Tier Interest", "Notes"]);

function stripToSafeFields(fields: Record<string, unknown>): Record<string, unknown> {
  const safe: Record<string, unknown> = {};
  for (const k of Object.keys(fields)) if (SAFE_FIELDS.has(k)) safe[k] = fields[k];
  return safe;
}

async function createLead(env: { token: string; baseId: string; tableId: string }, fields: Record<string, unknown>): Promise<string | null> {
  const url = `https://api.airtable.com/v0/${env.baseId}/${env.tableId}`;
  const attempt = async (f: Record<string, unknown>) => {
    const r = await fetch(url, {
      method: "POST",
      headers: { Authorization: `Bearer ${env.token}`, "Content-Type": "application/json" },
      body: JSON.stringify({ fields: f, typecast: true }),
    });
    if (!r.ok) {
      const errTxt = await r.text().catch(() => "");
      console.error("[airtable] createLead failed:", r.status, errTxt.slice(0, 300));
      return { ok: false as const, status: r.status, body: errTxt };
    }
    const j = (await r.json()) as { id?: string };
    return { ok: true as const, id: j.id ?? null };
  };
  const first = await attempt(fields);
  if (first.ok) return first.id;
  // Fall back to safe fields only (likely UNKNOWN_FIELD_NAME because custom fields don't exist in base yet)
  if (first.status === 422 || /UNKNOWN_FIELD_NAME/i.test(first.body)) {
    console.warn("[airtable] retrying createLead with safe fields only");
    const retry = await attempt(stripToSafeFields(fields));
    return retry.ok ? retry.id : null;
  }
  return null;
}

async function patchLead(env: { token: string; baseId: string; tableId: string }, recordId: string, fields: Record<string, unknown>): Promise<boolean> {
  const url = `https://api.airtable.com/v0/${env.baseId}/${env.tableId}/${recordId}`;
  const attempt = async (f: Record<string, unknown>) => {
    const r = await fetch(url, {
      method: "PATCH",
      headers: { Authorization: `Bearer ${env.token}`, "Content-Type": "application/json" },
      body: JSON.stringify({ fields: f, typecast: true }),
    });
    if (!r.ok) {
      const errTxt = await r.text().catch(() => "");
      console.error("[airtable] patchLead failed:", r.status, errTxt.slice(0, 300));
      return { ok: false as const, status: r.status, body: errTxt };
    }
    return { ok: true as const };
  };
  const first = await attempt(fields);
  if (first.ok) return true;
  if (first.status === 422 || /UNKNOWN_FIELD_NAME/i.test(first.body)) {
    console.warn("[airtable] retrying patchLead with safe fields only");
    const retry = await attempt(stripToSafeFields(fields));
    return retry.ok;
  }
  return false;
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
  whatsapp?: string | null;
  country?: string | null;
  source?: string | null;
  leadSourceLabel?: string;
  leadStage?: string | null;
  monthlyIncome?: string | null;
  goalText?: string | null;
  vslViewed?: boolean;
}): Promise<string | null> {
  const slug = input.accelerator ?? "roni";
  const env = airtableEnv(slug);
  if (!env) return null;
  try {
    const existing = await findByPortalId(env, input.portalId);
    // Priority derivation: 🔥 Hot if UGC-with-deals + $5K+, 🟡 Warm if any paid stage, 🔵 Nurture otherwise
    let priority = "🔵 Nurture";
    if (input.leadStage === "ugc-with-deals" && input.monthlyIncome === "5k-plus") priority = "🔥 Hot";
    else if (input.monthlyIncome === "5k-plus" || input.monthlyIncome === "1k-5k") priority = "🟡 Warm";

    const STAGE_LABEL: Record<string, string> = {
      "ugc-with-deals": "UGC + active brand deals",
      "creator-no-deals": "Creating, no deals yet",
      "growing": "Growing audience",
      "new": "Just getting started",
    };
    const INCOME_LABEL: Record<string, string> = {
      "5k-plus": "$5K+/mo",
      "1k-5k": "$1K – $5K/mo",
      "under-1k": "Under $1K/mo",
      "zero": "$0 (starting)",
    };

    const fields: Record<string, unknown> = {
      "Name": input.name || "(no name)",
      "Email": input.email,
      "Portal ID": input.portalId,
      "Lead Source": input.leadSourceLabel || SOURCE_LANDING,
    };
    if (input.clickedTier) fields["Tier Interest"] = TIER_INTEREST[input.clickedTier];
    // Structured qualifier fields — typecast means Airtable creates them as single-selects if missing
    if (input.leadStage) fields["Lead Stage"] = STAGE_LABEL[input.leadStage] || input.leadStage;
    if (input.monthlyIncome) fields["Monthly Income"] = INCOME_LABEL[input.monthlyIncome] || input.monthlyIncome;
    if (input.goalText) fields["90-Day Goal"] = input.goalText;
    if (input.leadStage || input.monthlyIncome) fields["Priority"] = priority;
    if (typeof input.vslViewed === "boolean") fields["VSL Viewed"] = input.vslViewed;
    // Dump extras into Notes so a VA has everything in one field even if the structured fields haven't been created yet.
    const noteBits: string[] = [];
    if (input.whatsapp) noteBits.push(`WhatsApp: ${input.whatsapp}`);
    if (input.country) noteBits.push(`Country: ${input.country}`);
    if (input.source) noteBits.push(`Heard about us via: ${input.source}`);
    if (input.leadStage) noteBits.push(`Stage: ${STAGE_LABEL[input.leadStage] || input.leadStage}`);
    if (input.monthlyIncome) noteBits.push(`Income: ${INCOME_LABEL[input.monthlyIncome] || input.monthlyIncome}`);
    if (input.goalText) noteBits.push(`Goal: ${input.goalText}`);
    if (input.vslViewed) noteBits.push(`VSL watched ✓`);
    if (noteBits.length > 0) fields["Notes"] = noteBits.join(" | ");
    if (!existing) fields["Stage"] = STAGE_NEW;
    if (existing) return (await patchLead(env, existing, fields)) ? existing : null;
    return await createLead(env, fields);
  } catch {
    return null;
  }
}
