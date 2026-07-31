"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV = [
  { href: "/review", label: "Overview" },
  { href: "/review/chat", label: "Chat with AM Team" },
  { href: "/review/accounts", label: "TikTok Accounts" },
  { href: "/review/profile", label: "Profile & Settings" },
];

export default function ReviewSidebar() {
  const path = usePathname();
  return (
    <nav className="rv-nav" aria-label="Reviewer sidebar">
      {NAV.map((item) => {
        const active = path === item.href || (item.href !== "/review" && path.startsWith(item.href));
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`rv-nav-link ${active ? "is-active" : ""}`}
          >
            {item.label}
          </Link>
        );
      })}

      <style jsx>{`
        .rv-nav {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }
        .rv-nav-link {
          display: block;
          padding: 10px 12px;
          border-radius: 8px;
          font-size: 13.5px;
          color: #9A9590;
          text-decoration: none;
          transition: background 120ms ease, color 120ms ease;
        }
        .rv-nav-link:hover { background: rgba(255,255,255,0.03); color: #F5F1E6; }
        .rv-nav-link.is-active {
          background: rgba(201, 168, 76, 0.1);
          color: #C9A84C;
          font-weight: 600;
        }
        @media (max-width: 900px) {
          .rv-nav { flex-direction: row; gap: 6px; margin-left: auto; }
          .rv-nav-link { padding: 6px 10px; font-size: 12.5px; white-space: nowrap; }
        }
      `}</style>
    </nav>
  );
}
