import type { Metadata } from "next";
import ColtClient from "./ColtClient";

export const metadata: Metadata = {
  title: "TTSUnlocked — Powered by COLT",
  description: "Unlock US TikTok Shop. From anywhere. In 7 days.",
  openGraph: {
    title: "TTSUnlocked — Powered by COLT",
    description: "US TikTok Shop. From anywhere. In 7 days.",
    url: "https://ttsaccelerators.com/colt",
    type: "website",
  },
  robots: { index: true, follow: true },
};

export default function ColtPage() {
  return <ColtClient />;
}
