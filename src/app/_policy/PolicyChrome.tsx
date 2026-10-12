import Link from "next/link";
import type { ReactNode } from "react";

export type Brand = {
  slug: "roni" | "colt";
  programName: string;
  partnerLine: string;
  logoSrc: string;
  logoAlt: string;
  landerHref: string;
  accountsHref: string;
  chatroomHref: string;
  termsHref: string;
  privacyHref: string;
};

const BRANDS: Record<"roni" | "colt", Brand> = {
  roni: {
    slug: "roni",
    programName: "TikTok Affiliate Accelerator",
    partnerLine: "Powered by Aragon Media × Accelerator (Roni)",
    logoSrc: "/accelerator/wolf-transparent.png",
    logoAlt: "TikTok Affiliate Accelerator",
    landerHref: "/accelerator",
    accountsHref: "/accounts",
    chatroomHref: "/chatroom",
    termsHref: "/accelerator/terms",
    privacyHref: "/accelerator/privacy",
  },
  colt: {
    slug: "colt",
    programName: "TTSUnlocked — Powered by COLT",
    partnerLine: "Powered by COLT × TTSUnlocked",
    logoSrc: "/colt/logo-tu.png",
    logoAlt: "TTSUnlocked",
    landerHref: "/colt",
    accountsHref: "/colt/accounts",
    chatroomHref: "/colt/chatroom",
    termsHref: "/colt/terms",
    privacyHref: "/colt/privacy",
  },
};

export function getBrand(slug: "roni" | "colt"): Brand {
  return BRANDS[slug];
}

export default function PolicyChrome({ brand, title, lastUpdated, children }: {
  brand: Brand;
  title: string;
  lastUpdated: string;
  children: ReactNode;
}) {
  return (
    <div className={`policy-shell ${brand.slug === "colt" ? "policy-colt" : "policy-roni"}`}>
      <header className="policy-header">
        <Link href={brand.landerHref} className="policy-brand">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={brand.logoSrc} alt={brand.logoAlt} width={40} height={40} />
          <span>{brand.programName}</span>
        </Link>
        <nav className="policy-nav">
          <Link href={brand.landerHref}>Home</Link>
          <Link href={brand.accountsHref}>Accounts</Link>
          <Link href={brand.chatroomHref}>Chatroom</Link>
        </nav>
      </header>

      <main className="policy-main">
        <p className="policy-eyebrow">LEGAL</p>
        <h1 className="policy-title">{title}</h1>
        <p className="policy-updated">Last updated: {lastUpdated}</p>

        <div className="policy-content">{children}</div>
      </main>

      <footer className="policy-footer">
        <div>{brand.partnerLine}</div>
        <div className="policy-footer-links">
          <Link href={brand.termsHref}>Terms</Link>
          <Link href={brand.privacyHref}>Privacy</Link>
          <a href="mailto:aragonkevin239@gmail.com">Contact</a>
        </div>
      </footer>

      <style>{`
        .policy-shell { min-height: 100vh; background: #050810; color: #F5F8FF; font-family: 'Inter Tight', system-ui, sans-serif; line-height: 1.7; }
        .policy-colt { background: #050810; }
        .policy-roni { background: #050505; }

        .policy-header { position: sticky; top: 0; z-index: 10; display: flex; justify-content: space-between; align-items: center; padding: 18px 40px; background: #000000; border-bottom: 1px solid rgba(255,255,255,0.08); backdrop-filter: blur(10px); }
        .policy-brand { display: inline-flex; align-items: center; gap: 14px; color: #FFFFFF; text-decoration: none; font-size: 14px; font-weight: 800; letter-spacing: 0.02em; text-transform: uppercase; }
        .policy-brand img { border-radius: 8px; }
        .policy-nav { display: inline-flex; gap: 24px; }
        .policy-nav a { color: #7A8AA0; font-size: 12.5px; font-weight: 700; letter-spacing: 0.06em; text-transform: uppercase; text-decoration: none; }
        .policy-colt .policy-nav a:hover { color: #00E5FF; }
        .policy-roni .policy-nav a:hover { color: #DC1E2E; }

        .policy-main { max-width: 820px; margin: 0 auto; padding: 60px 40px 80px; }
        .policy-eyebrow { font-size: 11px; letter-spacing: 0.24em; font-weight: 700; text-transform: uppercase; margin: 0 0 14px; }
        .policy-colt .policy-eyebrow { color: #00E5FF; }
        .policy-roni .policy-eyebrow { color: #DC1E2E; }
        .policy-title { margin: 0 0 10px; font-size: clamp(32px, 5vw, 48px); font-weight: 900; letter-spacing: -0.02em; line-height: 1.1; color: #FFFFFF; }
        .policy-updated { margin: 0 0 48px; color: #7A8AA0; font-size: 13.5px; }

        .policy-content { font-size: 15px; color: #D1D5DB; }
        .policy-content h2 { margin: 42px 0 14px; font-size: 22px; font-weight: 800; color: #FFFFFF; letter-spacing: -0.01em; }
        .policy-content h3 { margin: 28px 0 10px; font-size: 16px; font-weight: 700; color: #FFFFFF; }
        .policy-content p { margin: 0 0 16px; }
        .policy-content ul, .policy-content ol { margin: 0 0 16px; padding-left: 22px; }
        .policy-content li { margin: 0 0 8px; }
        .policy-content strong { color: #FFFFFF; font-weight: 700; }
        .policy-content code { background: rgba(255,255,255,0.06); padding: 2px 7px; border-radius: 4px; font-size: 13px; font-family: ui-monospace, SFMono-Regular, Menlo, monospace; color: #FAF7EE; }
        .policy-content a { font-weight: 600; text-decoration: underline; text-underline-offset: 2px; }
        .policy-colt .policy-content a { color: #00E5FF; }
        .policy-roni .policy-content a { color: #DC1E2E; }

        .policy-footer { max-width: 1180px; margin: 0 auto; padding: 32px 40px 48px; border-top: 1px solid rgba(255,255,255,0.08); display: flex; justify-content: space-between; align-items: center; color: #7A8AA0; font-size: 12.5px; flex-wrap: wrap; gap: 14px; }
        .policy-footer-links { display: inline-flex; gap: 18px; }
        .policy-footer-links a { color: #7A8AA0; text-decoration: underline; text-underline-offset: 3px; opacity: 0.85; }
        .policy-footer-links a:hover { opacity: 1; }
        .policy-colt .policy-footer-links a:hover { color: #00E5FF; }
        .policy-roni .policy-footer-links a:hover { color: #DC1E2E; }

        @media (max-width: 700px) {
          .policy-header { padding: 14px 18px; flex-direction: column; align-items: flex-start; gap: 10px; }
          .policy-nav { gap: 16px; }
          .policy-main { padding: 40px 20px 60px; }
          .policy-footer { padding: 24px 20px 40px; flex-direction: column; align-items: flex-start; }
        }
      `}</style>
    </div>
  );
}
