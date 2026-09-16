/**
 * /accelerator — TikTok Affiliate Accelerator × Aragon Media landing page.
 * Public sales page. Pricing tiers behind a name+email gate.
 */
import AcceleratorClient from "./AcceleratorClient";
export const dynamic = "force-dynamic";
export const metadata = {
  title: "TikTok Affiliate Accelerator · Aragon Media",
  description:
    "The operating system for creators outside the US to earn USD commissions on TikTok Shop. 7-day fast track. Skool community + verified accounts.",
  openGraph: {
    title: "US TikTok Shop from anywhere · TikTok Affiliate Accelerator",
    description:
      "7-day fast track to US TikTok Shop commissions. Skool community, live workshops, verified accounts. Built with Aragon Media.",
    type: "website",
    siteName: "TikTok Affiliate Accelerator",
  },
  twitter: {
    card: "summary_large_image",
    title: "US TikTok Shop from anywhere · TikTok Affiliate Accelerator",
    description: "7-day fast track to US TikTok Shop commissions. Enroll now.",
  },
};
export default function AcceleratorPage() { return <AcceleratorClient />; }
