/**
 * Discord channel message parser for the accelerator account listings.
 *
 * Expected line format (one per row, blank/decorative lines skipped):
 *
 *   [@handle](https://www.tiktok.com/@handle) | USA Shop Affiliate | 120,800 followers | ~~$715~~ $665
 *
 * Fields, all pipe-separated:
 *   [markdown link to TikTok]  |  account type  |  followers count  |  price(s)
 *
 * The price segment may include an optional strikethrough original price
 * before the current price. Handle is always the markdown link text.
 */

export type ParsedAccount = {
  handle: string;             // "comedy.king858" (no @)
  tiktokUrl: string;
  accountType: string;        // "USA Shop Affiliate"
  followers: number | null;   // integer count, null if unknown
  priceCents: number;         // current price, always populated
  originalPriceCents: number | null; // strikethrough if any
  rawLine: string;
};

// Anchored on the markdown link at the start so decorative lines get skipped.
const LINE_RE =
  /^\s*\[@?([^\]]+)\]\((https?:\/\/[^)]+)\)\s*\|\s*([^|]+?)\s*\|\s*([\d,\.]+)\s*followers?\s*\|\s*(?:~~\s*\$([\d,\.]+)\s*~~\s*)?\$([\d,\.]+)/i;

function toInt(numLike: string): number {
  const n = Number(numLike.replace(/[,\s]/g, ""));
  return Number.isFinite(n) ? Math.round(n) : 0;
}

function toCents(dollars: string): number {
  const n = Number(dollars.replace(/[,\s]/g, ""));
  return Number.isFinite(n) ? Math.round(n * 100) : 0;
}

export function parseAccountLine(line: string): ParsedAccount | null {
  const m = line.match(LINE_RE);
  if (!m) return null;
  const [, rawHandle, url, type, followers, origPrice, currPrice] = m;
  return {
    handle: rawHandle.replace(/^@/, "").trim(),
    tiktokUrl: url.trim(),
    accountType: type.trim(),
    followers: toInt(followers) || null,
    priceCents: toCents(currPrice),
    originalPriceCents: origPrice ? toCents(origPrice) : null,
    rawLine: line.trim(),
  };
}

/**
 * Parse a full message body (multi-line) into an array of accounts.
 * Positional order is preserved so the UI renders in Discord order.
 */
export function parseAccountsMessage(body: string): ParsedAccount[] {
  const lines = body.split(/\r?\n/);
  const out: ParsedAccount[] = [];
  for (const line of lines) {
    const parsed = parseAccountLine(line);
    if (parsed) out.push(parsed);
  }
  return out;
}
