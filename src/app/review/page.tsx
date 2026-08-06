/**
 * /review — Creator Overview.
 *
 * Landing surface for TikTok Partner Center reviewers. Mirrors the real
 * /dashboard "connected" preview state to demonstrate exactly what a
 * creator sees once their TikTok Shop account is added to the portal.
 */

import CreatorOverviewClient from "./CreatorOverviewClient";

export const dynamic = "force-dynamic";

export default function OverviewPage() {
  return <CreatorOverviewClient />;
}
