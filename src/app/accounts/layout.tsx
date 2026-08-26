/**
 * /accounts shell — separate from the Aragon Media dashboard shell.
 *
 * Imports its own CSS (accelerator.css). No sidebar, no theme toggle,
 * no dashboard.css — this is the wolf-branded accelerator surface.
 */

import "./accelerator.css";

export const dynamic = "force-dynamic";

export default function AcceleratorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Force dark on this route regardless of what the visitor picked in
  // the portal — the design assumes dark backdrop.
  return <div data-theme="dark">{children}</div>;
}
