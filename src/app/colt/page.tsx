import type { Metadata } from "next";
import ColtClient from "./ColtClient";
import CreatorIntro from "../../components/CreatorIntro";
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

const COLT_INTRO_PARAGRAPHS = [
  "I'm Colton from Toronto, Canada. I did $1.4M CAD on US TikTok Shop starting from nothing. Not a legacy following, not a US address, not a cheat code. Just a Canadian with a phone, Kevin's guidance, the right system, and the stubbornness to not quit when the first videos flopped.",
  "TTSUnlocked is the exact 7-day playbook I wish someone had handed me when I started. Every step I missed, every mistake I made, every tool I use today. Account setup, shipping, approvals, first product pick, first commission. Documented and shippable.",
  "I teach TikTok Shop for free on my channels. The 7-day unlock, the hands-on account + verification walkthrough, the private community of creators actually doing this. That's what you're paying for. Everything else, I give away. The free 1-on-1 call below is how we start. 30 minutes on where you're stuck and whether TTSUnlocked is the right move for you.",
];

export default function ColtPage() {
  return (
    <>
      <ColtClient />
      <CreatorIntro
        brand="colt"
        name="Colton"
        location="Toronto, Canada"
        photoSrc="/colt/colton.jpg"
        paragraphs={COLT_INTRO_PARAGRAPHS}
        pullQuote="$1.4M CAD on US TikTok Shop, from Toronto. The 7-day playbook I teach is the one I ran myself."
      />
      <GuaranteeBand brand="colt" />
      <LegalFooter brand="colt" />
      <SignupPopup brand="colt" />
    </>
  );
}
