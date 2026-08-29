/**
 * /chatroom — Verify with the Accelerator team.
 *
 * Public entry point. No login. Users pick email + name, get a thread
 * that persists per (email + browser cookie). Book-a-call button,
 * TikTok credentials submission modal, drag-drop screenshots.
 */

import ChatroomClient from "./ChatroomClient";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Verify with the Accelerator · TikTok Affiliate Accelerator",
  description:
    "Chat directly with the Aragon Media × Accelerator team to verify and activate your TikTok Shop affiliate account.",
  openGraph: {
    title: "Verify with the Accelerator · US TikTok Shop From Anywhere",
    description:
      "Direct line to AM Team + Accelerator for TikTok Shop verification, login submission, and activation support.",
    type: "website",
    siteName: "TikTok Affiliate Accelerator",
  },
  twitter: {
    card: "summary_large_image",
    title: "Verify with the Accelerator",
    description:
      "Direct line to AM Team + Accelerator for TikTok Shop verification & activation.",
  },
};

const CALENDLY_URL =
  process.env.ACCELERATOR_CALENDLY_URL ??
  "https://calendly.com/itskevinaragon/30min";

export default function ChatroomPage() {
  return <ChatroomClient calendlyUrl={CALENDLY_URL} />;
}
