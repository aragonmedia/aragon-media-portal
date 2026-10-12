/**
 * /colt/chatroom — TTSUnlocked verification chat.
 *
 * Same backend as /chatroom (shared threads + messages tables) but
 * wrapped in .colt-shell so the whole surface renders in COLT's blue
 * palette. BodyTenantMarker also fires so portal-rendered modals and
 * the floating widget pick up the right theme.
 */

import ChatroomClient from "../../chatroom/ChatroomClient";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Verify with TTSUnlocked",
  description: "Chat with the TTSUnlocked team to verify and activate your TikTok Shop account.",
};

const CALENDLY_URL = process.env.ACCELERATOR_CALENDLY_URL ?? "https://calendly.com/itskevinaragon/30min";

export default function ColtChatroomPage() {
  return <ChatroomClient calendlyUrl={CALENDLY_URL} />;
}
