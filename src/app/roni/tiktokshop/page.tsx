import type { Metadata } from "next";
import TikTokShopClient from "./TikTokShopClient";
import CreatorIntro from "../../../components/CreatorIntro";
import SignupPopup from "../../../components/SignupPopup";
import GuaranteeBand from "../../../components/GuaranteeBand";
import LegalFooter from "../../../components/LegalFooter";

export const metadata: Metadata = {
  title: "Celeste's $75K/Month Playbook · Free 1-on-1 Call — TikTok Affiliate Accelerator",
  description:
    "Book a free 1-on-1 with Kevin + Roni this week. Learn the exact system Celeste used to pay her college tuition in Spain making $75K/month on US TikTok Shop.",
  openGraph: {
    title: "Free 1-on-1 Call · US TikTok Shop From Anywhere",
    description: "Book your spot this week before prices increase Wednesday.",
    url: "https://ttsaccelerators.com/roni/tiktokshop",
    type: "website",
  },
  robots: { index: true, follow: true },
};

const RONI_INTRO_PARAGRAPHS = [
  "I'm Roni from Alberta, Canada. I found TikTok Shop through Kevin and Aragon Media. I picked live-stream selling as my lane and haven't put it down since. Hundreds of hours on live, consistent commissions every month, and a group of creators I now coach doing the same thing.",
  "Live-stream selling is where TikTok Shop is paying out the hardest right now, and nobody teaches it the way it actually works. Most courses hand you a VSL template and call it a day. I teach it like a job: how to warm up a room, how to read a buy signal, how to recover a dead stream, how to run a product show for 2 hours without losing the audience.",
  "The accelerator with Aragon Media is where I open all of it up. Live sessions I run myself, call reviews on your streams, the exact playbook I use. The free 1-on-1 call below is how we start. No pitch deck, no hard sell. 30 minutes on your setup, your goals, whether this is the right move for you.",
];

export default function RoniTikTokShopFunnelPage() {
  return (
    <>
      <TikTokShopClient />
      <CreatorIntro
        brand="roni"
        name="Roni"
        location="Alberta, Canada"
        paragraphs={RONI_INTRO_PARAGRAPHS}
        pullQuote="Hundreds of hours on live. The live-stream playbook I teach is the one I run myself every week."
      />
      <GuaranteeBand brand="roni" />
      <LegalFooter brand="roni" />
      <SignupPopup brand="roni" />
    </>
  );
}
