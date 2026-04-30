import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Aragon Media · Creator Partner Program",
  description: "Your TikTok business, professionally managed. We activate your creator account, track your GMV, and move your commissions into your bank — USD income from anywhere in the world.",
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
      <body>{children}</body>
    </html>
  );
}
