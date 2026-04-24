import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Aragon Media · Creator Partner Program",
  description: "Your TikTok business, professionally managed. We activate your creator account, track your GMV, and move your commissions into your bank — USD income from anywhere in the world.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
