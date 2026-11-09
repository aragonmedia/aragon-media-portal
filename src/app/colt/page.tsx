import type { Metadata } from "next";
import ColtClient from "./ColtClient";
import SignupPopup from "../../components/SignupPopup";
import GuaranteeBand from "../../components/GuaranteeBand";
import LegalFooter from "../../components/LegalFooter";

export const metadata: Metadata = {
  title: "TTSUnlocked. Powered by COLT",
  description: "Unlock US TikTok Shop. From anywhere. In 7 days.",
  openGraph: {
    title: "TTSUnlocked. Powered by COLT",
    description: "US TikTok Shop. From anywhere. In 7 days.",
    url: "https://ttsaccelerators.com/colt",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "TTSUnlocked. Powered by COLT",
    description: "US TikTok Shop. From anywhere. In 7 days.",
    images: ["/colt/opengraph-image.png"],
  },
  robots: { index: true, follow: true },
};

export default function ColtPage() {
  return (
    <>
      <ColtClient />
      <GuaranteeBand brand="colt" />
      <LegalFooter brand="colt" />
      <SignupPopup brand="colt" />
    </>
  );
}
