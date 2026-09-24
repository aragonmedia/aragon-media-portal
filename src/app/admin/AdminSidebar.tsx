"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import type { AdminRole } from "@/lib/auth/admin-role";

type NavItem = { href: string; label: string; icon: string; roles: AdminRole[] };

const NAV: NavItem[] = [
  { href: "/admin",                    label: "Overview",           icon: "◈", roles: ["owner"] },
  { href: "/admin/creators",           label: "Creators",           icon: "◉", roles: ["owner"] },
  { href: "/admin/withdrawals",        label: "Withdrawals",        icon: "◎", roles: ["owner"] },
  { href: "/admin/chats",              label: "Chats",              icon: "✦", roles: ["owner"] },
  { href: "/admin/agreements",         label: "Agreements",         icon: "◇", roles: ["owner"] },
  { href: "/admin/accelerator",        label: "Accelerator",        icon: "▲", roles: ["owner"] },
  { href: "/admin/accelerator-leads",  label: "Accelerator Leads",  icon: "◆", roles: ["owner", "accelerator_admin", "am_lead"] },
  { href: "/admin/chatroom",           label: "Accelerator Chat",   icon: "◐", roles: ["owner", "accelerator_admin", "chat_only"] },
  { href: "/admin/team",               label: "Team",               icon: "◈", roles: ["owner"] },
];

export default function AdminSidebar({ role }: { role: AdminRole }) {
  const pathname = usePathname() ?? "/admin";
  const [open, setOpen] = useState(false);
  const items = NAV.filter((n) => n.roles.includes(role));

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
      <header className="admin-topbar">
        <button aria-label="Toggle navigation" className="admin-burger" onClick={() => setOpen((o) => !o)}>
          {open ? "✕" : "☰"}
        </button>
        <span className="admin-topbar-brand">
          Aragon Media · <strong>Admin</strong>
        </span>
      </header>
      {open && <div className="admin-drawer-dim" onClick={() => setOpen(false)} aria-hidden="true" />}
      <aside className={`admin-sidebar${open ? " is-open" : ""}`}>
        <div className="admin-brand">
          <div className="admin-brand-logo">AM</div>
          <div className="admin-brand-text">
            <div className="admin-brand-title">Aragon Media</div>
            <div className="admin-brand-sub">
              {role === "owner" ? "Operations console" : role === "accelerator_admin" ? "Accelerator team" : "Team access"}
            </div>
          </div>
        </div>
        <nav className="admin-nav" aria-label="Admin navigation">
          <div className="admin-nav-section">
            <div className="admin-nav-label">Manage</div>
            {items.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`admin-nav-item${isActive(item.href) ? " is-active" : ""}`}
                onClick={() => setOpen(false)}
              >
                <span className="admin-nav-icon" aria-hidden="true">{item.icon}</span>
                <span>{item.label}</span>
              </Link>
            ))}
          </div>
        </nav>
        <div className="admin-foot">
          <button onClick={logout} className="admin-foot-logout">Sign out</button>
          <div className="admin-foot-meta">Live data from Neon · Refresh to update</div>
        </div>
      </aside>
    </>
  );
}
