/**
 * /chatroom shell — same wolf/red/black dark aesthetic as /accounts.
 * Public, no login. OG image + favicon inherit via file convention.
 */

import "../accounts/accelerator.css";

export const dynamic = "force-dynamic";

export default function ChatroomLayout({ children }: { children: React.ReactNode }) {
  return <div data-theme="dark">{children}</div>;
}
