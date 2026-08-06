"use client";

/**
 * Reviewer sidebar — uses the exact same `.dash-*` classes as the
 * real /dashboard sidebar so the visual matches 1:1 in both light and
 * dark modes (styling lives in dashboard.css). Scope is locked to the
 * four creator-facing routes the TikTok Partner Center reviewer needs:
 *
 *   Overview · Chat with AM Team · Add TikTok Accounts · Profile & Settings
 *
 * Bottom of the foot holds a Day/Night toggle (same `.theme-card`
 * pattern the real portal's Settings uses).
 */

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

type NavItem = { href: string; label: string; icon: React.ReactNode };

const NAV: NavItem[] = [
  { href: "/review", label: "Overview", icon: <DashIcon /> },
  { href: "/review/chat", label: "Chat with AM Team", icon: <ChatIcon /> },
  { href: "/review/accounts", label: "Add TikTok Accounts", icon: <PlusIcon /> },
  { href: "/review/profile", label: "Profile & Settings", icon: <SettingsIcon /> },
];

type Theme = "light" | "dark";

export default function ReviewSidebar({
  userName,
  userEmail,
}: {
  userName: string;
  userEmail: string;
}) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [theme, setTheme] = useState<Theme>("dark");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const stored =
      (typeof window !== "undefined" && localStorage.getItem("am_theme")) || "dark";
    const t: Theme = stored === "light" ? "light" : "dark";
    setTheme(t);
    document.documentElement.setAttribute("data-theme", t);
  }, []);

  function pick(t: Theme) {
    setTheme(t);
    try { localStorage.setItem("am_theme", t); } catch {}
    document.documentElement.setAttribute("data-theme", t);
  }

  async function signOut() {
    try { await fetch("/api/review/logout", { method: "POST" }); }
    finally { window.location.href = "/login"; }
  }

  const initials =
    (userName || userEmail)
      .split(/\s+/)
      .map((p) => p[0]?.toUpperCase() ?? "")
      .slice(0, 2)
      .join("") || "AM";
  const firstName = (userName || userEmail).split(/\s+/)[0] || "Creator";
  const activeTheme: Theme = mounted ? theme : "dark";

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
        <Link href="/review" className="dash-brand" onClick={() => setOpen(false)}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo-am.svg" alt="" width={32} height={32} />
          <div>
            <div className="dash-brand-name">Aragon Media</div>
            <div className="dash-brand-sub">Creator Portal</div>
          </div>
        </Link>

        <Link
          href="/review/profile"
          className="dash-profile-chip"
          onClick={() => setOpen(false)}
        >
          <div className="dash-profile-avatar">{initials}</div>
          <div className="dash-profile-meta">
            <div className="dash-profile-name">{firstName}</div>
            <div className="dash-profile-status">
              <span className="dash-profile-dot" />
              Active
            </div>
          </div>
        </Link>

        <nav className="dash-nav" aria-label="Reviewer navigation">
          <div className="dash-nav-section">
            <div className="dash-nav-section-label">Dashboard</div>
            {NAV.map((item) => {
              const active =
                item.href === "/review"
                  ? pathname === "/review"
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
                </Link>
              );
            })}
          </div>
        </nav>

        <div className="dash-foot">
          {/* Day / Night — same .theme-card visual pattern as Settings */}
          <div className="theme-toggle rv-theme-compact" role="group" aria-label="Theme">
            <button
              type="button"
              className={`theme-card${activeTheme === "light" ? " active" : ""}`}
              onClick={() => pick("light")}
              aria-pressed={activeTheme === "light"}
              aria-label="Light mode"
            >
              <SunIcon />
              <div className="theme-card-label">Day</div>
            </button>
            <button
              type="button"
              className={`theme-card${activeTheme === "dark" ? " active" : ""}`}
              onClick={() => pick("dark")}
              aria-pressed={activeTheme === "dark"}
              aria-label="Dark mode"
            >
              <MoonIcon />
              <div className="theme-card-label">Night</div>
            </button>
          </div>

          <div className="dash-foot-email" title={userEmail}>{userEmail}</div>
          <div className="dash-foot-row">
            <button onClick={signOut} className="dash-logout" aria-label="Sign out">
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

      <style jsx global>{`
        /* Compact theme cards inside the sidebar foot — scale down the
           full-size Settings variant so it fits at the bottom */
        .rv-theme-compact.theme-toggle { padding: 0 0 10px; gap: 8px; }
        .rv-theme-compact .theme-card {
          padding: 10px 8px;
          gap: 4px;
          border-radius: 8px;
        }
        .rv-theme-compact .theme-card svg { width: 16px; height: 16px; }
        .rv-theme-compact .theme-card-label { font-size: 11px; letter-spacing: 0.08em; }
      `}</style>
    </>
  );
}

function DashIcon() { return (<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="9"/><rect x="14" y="3" width="7" height="5"/><rect x="14" y="12" width="7" height="9"/><rect x="3" y="16" width="7" height="5"/></svg>); }
function ChatIcon() { return (<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/></svg>); }
function PlusIcon() { return (<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="9"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/></svg>); }
function SettingsIcon() { return (<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>); }
function SignOutIcon() { return (<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>); }
function SunIcon() { return (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2"/><path d="M12 20v2"/><path d="m4.93 4.93 1.41 1.41"/><path d="m17.66 17.66 1.41 1.41"/><path d="M2 12h2"/><path d="M20 12h2"/><path d="m6.34 17.66-1.41 1.41"/><path d="m19.07 4.93-1.41 1.41"/></svg>); }
function MoonIcon() { return (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>); }
