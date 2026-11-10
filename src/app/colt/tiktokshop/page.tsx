import type { Metadata } from "next";
import TikTokShopClient from "./TikTokShopClient";
import SignupPopup from "../../../components/SignupPopup";
import GuaranteeBand from "../../../components/GuaranteeBand";
import LegalFooter from "../../../components/LegalFooter";

export const metadata: Metadata = {
  title: "Celeste's $75K/Month Playbook · Free 1-on-1 Call — TTSUnlocked × COLT",
  description:
    "Book a free 1-on-1 with Kevin + Colton this week. Learn the exact system Celeste used to pay her college tuition in Spain making $75K/month on US TikTok Shop.",
  openGraph: {
    title: "Free 1-on-1 Call · US TikTok Shop From Anywhere · TTSUnlocked",
    description: "Book your spot this week before prices increase Wednesday.",
    url: "https://ttsaccelerators.com/colt/tiktokshop",
    type: "website",
  },
  robots: { index: true, follow: true },
};

export default function ColtTikTokShopFunnelPage() {
  return (
    <>
      <TikTokShopClient />
      <GuaranteeBand brand="colt" />
      <LegalFooter brand="colt" />
      <SignupPopup brand="colt" />
    </>
  );
}
