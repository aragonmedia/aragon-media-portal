/**
 * /chatroom — Verify with the Accelerator team.
 *
 * Public entry point. No login. Users pick email + name, get a thread
 * that persists per (email + browser cookie). Book-a-call button,
 * TikTok credentials submission modal, drag-drop screenshots.
 */

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import ChatroomClient from "./ChatroomClient";
import { TOKEN_COOKIE, verifyToken } from "@/lib/chatroom/magic-link";

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

export default async function ChatroomPage({
  searchParams,
}: {
  searchParams: Promise<{ t?: string }>;
}) {
  const sp = await searchParams;
  const token = typeof sp.t === "string" ? sp.t : "";
  let hasToken = false;
  if (token) {
    const verified = verifyToken(token);
    if (verified) {
      // Persist the token on this browser then bounce to the clean URL
      const jar = await cookies();
      jar.set(TOKEN_COOKIE, token, {
        path: "/",
        maxAge: 90 * 24 * 60 * 60,
        sameSite: "lax",
        httpOnly: true,
        secure: true,
      });
      redirect("/chatroom");
    }
  }
  const jar = await cookies();
  hasToken = !!jar.get(TOKEN_COOKIE)?.value && !!verifyToken(jar.get(TOKEN_COOKIE)!.value);
  return <ChatroomClient calendlyUrl={CALENDLY_URL} hasMagicToken={hasToken} />;
}
