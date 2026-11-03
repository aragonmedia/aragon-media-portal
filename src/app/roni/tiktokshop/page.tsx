import type { Metadata } from "next";
import TikTokShopClient from "./TikTokShopClient";

export const metadata: Metadata = {
  title: "Celeste's $75K/Month Playbook · Free 1-on-1 Call — TikTok Affiliate Accelerator",
  description: "Book a free 1-on-1 with Kevin + Roni this week. Learn the exact system Celeste used to pay her college tuition in Spain making $75K/month on US TikTok Shop.",
  openGraph: {
    title: "Free 1-on-1 Call · US TikTok Shop From Anywhere",
    description: "Book your spot this week before prices increase Wednesday.",
    url: "https://ttsaccelerators.com/roni/tiktokshop",
    type: "website",
  },
  robots: { index: true, follow: true },
};

export default function RoniTikTokShopFunnelPage() {
  return <TikTokShopClient />;
}
