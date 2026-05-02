"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

type NavItem = { href: string; label: string; icon: React.ReactNode; badge?: number };
type NavSection = { label: string; items: NavItem[] };

const SECTIONS: NavSection[] = [
  {
    label: "Dashboard",
    items: [
      { href: "/dashboard", label: "Overview", icon: <DashIcon /> },
      { href: "/dashboard/tiktok-account", label: "TikTok Account & Revenue", icon: <TikTokIcon /> },
      { href: "/dashboard/withdrawals", label: "Withdrawals", icon: <PayoutIcon /> },
      { href: "/dashboard/chat", label: "Chat with AM Team", icon: <ChatIcon /> },
      { href: "/dashboard/settings", label: "Settings", icon: <SettingsIcon /> },
      { href: "/dashboard/accounts", label: "My Accounts", icon: <AccountsIcon /> },
      { href: "/dashboard/add-account", label: "Add Accounts", icon: <PlusIcon /> },
      { href: "/dashboard/account-supplier", label: "Account Supplier", icon: <SupplierIcon /> },
    ],
  },
];

export default function Sidebar({
  userName,
  userEmail,
  userRole,
  isAdmin,
}: {
  userName: string;
  userEmail: string;
  userRole: "creator" | "brand" | "other";
  isAdmin: boolean;
}) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    window.location.href = "/";
  }

  const initials =
    userName
      .split(/\s+/)
      .map((p) => p[0]?.toUpperCase() ?? "")
      .slice(0, 2)
      .join("") || "??";

  const firstName = userName.split(/\s+/)[0] || userName;

  return (
    <>
      <button
        type="button"
        className="dash-mobile-toggle"
        aria-label="Toggle menu"
        onClick={() => setOpen((v) => !v)}
      >
        <span /><span /><span />
      </button>

      <aside className={`dash-sidebar${open ? " open" : ""}`}>
        {/* Brand */}
        <div className="dash-brand">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo-am.svg" alt="" width={32} height={32} />
          <div>
            <div className="dash-brand-name">Aragon Media</div>
            <div className="dash-brand-sub">Creator Portal</div>
          </div>
        </div>

        {/* Profile chip — at TOP under brand per Kevin's reference */}
        <Link href="/dashboard/settings" className="dash-profile-chip" onClick={() => setOpen(false)}>
          <div className="dash-profile-avatar">{initials}</div>
          <div className="dash-profile-meta">
            <div className="dash-profile-name">{firstName}</div>
            <div className="dash-profile-status"><span className="dash-profile-dot" />Active</div>
          </div>
        </Link>

        {/* Nav — flush, tight, no gaps */}
        <nav className="dash-nav" aria-label="Dashboard navigation">
          {SECTIONS.map((sect) => (
            <div key={sect.label} className="dash-nav-section">
              <div className="dash-nav-section-label">{sect.label}</div>
              {sect.items.map((item) => {
                const active =
                  item.href === "/dashboard"
                    ? pathname === "/dashboard"
                    : pathname?.startsWith(item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`dash-nav-item${active ? " active" : ""}`}
                    onClick={() => setOpen(false)}
                  >
                    <span className="dash-nav-icon" aria-hidden>{item.icon}</span>
                    <span className="dash-nav-label">{item.label}</span>
                    {item.badge && <span className="dash-nav-badge">{item.badge}</span>}
                  </Link>
                );
              })}
            </div>
          ))}
          {isAdmin && (
            <div className="dash-nav-section">
              <div className="dash-nav-section-label">Admin</div>
              <Link
                href="/admin"
                className="dash-nav-item dash-nav-admin"
                onClick={() => setOpen(false)}
              >
                <span className="dash-nav-icon" aria-hidden><AdminIcon /></span>
                <span className="dash-nav-label">Admin console</span>
              </Link>
            </div>
          )}
        </nav>

        {/* Sign out + email at bottom */}
        <div className="dash-foot">
          <div className="dash-foot-email" title={userEmail}>{userEmail}</div>
          <div className="dash-foot-row">
            <span className={`role-pill role-${userRole}`}>{userRole}</span>
            <button onClick={logout} className="dash-logout" aria-label="Sign out" title="Sign out">
              <SignOutIcon /><span>Sign out</span>
            </button>
          </div>
        </div>
      </aside>

      <div
        className={`dash-overlay${open ? " visible" : ""}`}
        onClick={() => setOpen(false)}
        aria-hidden="true"
      />
    </>
  );
}

/* ---- inline SVG icons ---- */
function DashIcon() { return (<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="9"/><rect x="14" y="3" width="7" height="5"/><rect x="14" y="12" width="7" height="9"/><rect x="3" y="16" width="7" height="5"/></svg>); }
function AccountsIcon() { return (<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>); }
function ChatIcon() { return (<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/></svg>); }
function PayoutIcon() { return (<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>); }
function SettingsIcon() { return (<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>); }
function AdminIcon() { return (<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>); }
function SignOutIcon() { return (<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>); }
function TikTokIcon() { return (<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5"/></svg>); }
function PlusIcon() { return (<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="9"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/></svg>); }

function SupplierIcon() { return (<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg>); }
