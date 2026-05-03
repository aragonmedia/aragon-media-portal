import type { Metadata, Viewport } from "next";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import "./globals.css";

const SITE_URL = "https://portal.kevin-aragon.com";
const SITE_TITLE = "Aragon Media · Creator Partner Program";
const SITE_DESCRIPTION =
  "Your TikTok business, professionally managed. We activate your creator account, track your GMV, and move your commissions into your bank — USD income from anywhere in the world.";

export const metadata: Metadata = {
  // metadataBase makes Next.js resolve the auto-generated /opengraph-image
  // and /twitter-image to absolute URLs. Without it, link previews break.
  metadataBase: new URL(SITE_URL),
  title: {
    default: SITE_TITLE,
    template: "%s · Aragon Media",
  },
  description: SITE_DESCRIPTION,
  applicationName: "Aragon Media",
  keywords: [
    "TikTok Shop",
    "creator commission",
    "creator partner program",
    "GMV tracking",
    "TikTok affiliate",
    "Aragon Media",
  ],
  authors: [{ name: "Aragon Media" }],
  openGraph: {
    type: "website",
    locale: "en_US",
    url: SITE_URL,
    siteName: "Aragon Media",
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
  },
  twitter: {
    card: "summary_large_image",
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export const viewport: Viewport = {
  themeColor: "#0F0F0F",
  width: "device-width",
  initialScale: 1,
};

// Inline script — runs before React hydration. Reads localStorage and sets
// data-theme on <html> so there's no flash of wrong theme on first paint.
const themeBootstrap = `
(function(){
  try {
    var t = localStorage.getItem('am_theme');
    if (t === 'light' || t === 'dark') {
      document.documentElement.setAttribute('data-theme', t);
    } else {
      // default = dark (current Aragon brand)
      document.documentElement.setAttribute('data-theme', 'dark');
    }
  } catch (e) {
    document.documentElement.setAttribute('data-theme', 'dark');
  }
})();
`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" data-theme="dark">
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeBootstrap }} />
      </head>
      <body>
        {children}
        {/*
          Vercel Analytics + Speed Insights — both free on hobby tier.
          Analytics: page views, top pages, referrers, devices.
          Speed Insights: real-user Core Web Vitals (LCP, CLS, FID).
          Kevin needs to flip ON in Vercel dashboard → Project → Analytics
          + Speed Insights tabs after the next deploy.
        */}
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
