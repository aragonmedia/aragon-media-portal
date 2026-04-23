import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Aragon Media Portal",
  description: "Creator verification, commission tracking, and payouts — all in one place.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased bg-[#0a0a0a] text-white font-sans">
        {children}
      </body>
    </html>
  );
}
