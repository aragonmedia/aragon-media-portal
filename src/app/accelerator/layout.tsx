/**
 * /accelerator shell — the paid-program sales lander.
 * Reuses accelerator.css tokens; forced dark theme.
 */
import "../accounts/accelerator.css";
export const dynamic = "force-dynamic";
export default function AcceleratorLayout({ children }: { children: React.ReactNode }) {
  return <div data-theme="dark">{children}</div>;
}
