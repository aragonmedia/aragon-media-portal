/**
 * /review — Creator Overview.
 * Thin server wrapper — all interaction lives in CreatorOverviewClient.
 */

import CreatorOverviewClient from "./CreatorOverviewClient";

export const dynamic = "force-dynamic";

export default function OverviewPage() {
  return <CreatorOverviewClient />;
}
