"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

const NAV = [
  { href: "/admin", label: "Overview", icon: "◈" },
  { href: "/admin/creators", label: "Creators", icon: "◉" },
  { href: "/admin/withdrawals", label: "Withdrawals", icon: "◎" },
  { href: "/admin/chats", label: "Chats", icon: "✦" },
  { href: "/admin/agreements", label: "Agreements", icon: "◇" },
];

export default function AdminSidebar() {
  const pathname = usePathname() ?? "/admin";
  const [open, setOpen] = useState(false);

  function isActive(href: string) {
    if (href === "/admin") return pathname === "/admin";
    return pathname === href || pathname.startsWith(href + "/");
  }

  async function logout() {
    await fetch("/api/admin/logout", { method: "POST" });
    window.location.assign("/admin");
  }

  return (
    <>
      {/* Mobile top bar with hamburger */}
      <header className="admin-topbar">
        <button
          aria-label="Toggle navigation"
          className="admin-burger"
          onClick={() => setOpen((o) => !o)}
        >
          {open ? "✕" : "☰"}
        </button>
        <span className="admin-topbar-brand">
          Aragon Media · <strong>Admin</strong>
        </span>
      </header>

      {/* Mobile dim overlay when drawer is open */}
      {open && (
        <div
          className="admin-drawer-dim"
          onClick={() => setOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Sidebar — desktop sticky / mobile slide-in drawer */}
      <aside className={`admin-sidebar${open ? " is-open" : ""}`}>
        <div className="admin-brand">
          <div className="admin-brand-logo">AM</div>
          <div className="admin-brand-text">
            <div className="admin-brand-title">Aragon Media</div>
            <div className="admin-brand-sub">Operations console</div>
          </div>
        </div>

        <nav className="admin-nav" aria-label="Admin navigation">
          <div className="admin-nav-section">
            <div className="admin-nav-label">Manage</div>
            {NAV.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`admin-nav-item${
                  isActive(item.href) ? " is-active" : ""
                }`}
                onClick={() => setOpen(false)}
              >
                <span className="admin-nav-icon" aria-hidden="true">
                  {item.icon}
                </span>
                <span>{item.label}</span>
              </Link>
            ))}
          </div>
        </nav>

        <div className="admin-foot">
          <button onClick={logout} className="admin-foot-logout">
            Sign out
          </button>
          <div className="admin-foot-meta">
            Live data from Neon · Refresh to update
          </div>
        </div>
      </aside>
    </>
  );
}
