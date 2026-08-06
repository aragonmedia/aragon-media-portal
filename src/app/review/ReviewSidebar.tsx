"use client";

/**
 * Reviewer sidebar — mirrors the real /dashboard Sidebar look (icon
 * nav + brand block + profile chip) but locked to the 4 creator-facing
 * routes the TikTok Partner Center reviewer needs to see:
 *   Overview · Chat with AM Team · Add TikTok Accounts · Profile & Settings
 *
 * Bottom-left holds a light/dark toggle so reviewers can preview both
 * themes (writes `data-theme` on <html> + persists in localStorage,
 * same key `am_theme` the real portal uses).
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
        className="rv-mobile-toggle"
        aria-label="Toggle menu"
        onClick={() => setOpen((v) => !v)}
      >
        <span /><span /><span />
      </button>

      <aside className={`rv-side${open ? " open" : ""}`}>
        <Link href="/review" className="rv-brand" onClick={() => setOpen(false)}>
          <span className="rv-mark">AM</span>
          <span className="rv-brand-text">
            Aragon Media
            <small>Creator Portal</small>
          </span>
        </Link>

        <Link
          href="/review/profile"
          className="rv-profile-chip"
          onClick={() => setOpen(false)}
        >
          <div className="rv-profile-avatar">{initials}</div>
          <div className="rv-profile-meta">
            <div className="rv-profile-name">{firstName}</div>
            <div className="rv-profile-status">
              <span className="rv-profile-dot" />
              Active
            </div>
          </div>
        </Link>

        <nav className="rv-nav" aria-label="Reviewer navigation">
          <div className="rv-nav-section">
            <div className="rv-nav-section-label">Dashboard</div>
            {NAV.map((item) => {
              const active =
                item.href === "/review"
                  ? pathname === "/review"
                  : pathname?.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`rv-nav-item${active ? " active" : ""}`}
                  onClick={() => setOpen(false)}
                >
                  <span className="rv-nav-icon" aria-hidden>{item.icon}</span>
                  <span className="rv-nav-label">{item.label}</span>
                </Link>
              );
            })}
          </div>
        </nav>

        <div className="rv-foot">
          <div className="rv-theme" role="group" aria-label="Theme">
            <button
              type="button"
              className={`rv-theme-btn${activeTheme === "light" ? " active" : ""}`}
              onClick={() => pick("light")}
              aria-pressed={activeTheme === "light"}
              aria-label="Light mode"
              title="Light mode"
            >
              <SunIcon /><span>Day</span>
            </button>
            <button
              type="button"
              className={`rv-theme-btn${activeTheme === "dark" ? " active" : ""}`}
              onClick={() => pick("dark")}
              aria-pressed={activeTheme === "dark"}
              aria-label="Dark mode"
              title="Dark mode"
            >
              <MoonIcon /><span>Night</span>
            </button>
          </div>
          <div className="rv-foot-email" title={userEmail}>{userEmail}</div>
          <button onClick={signOut} className="rv-logout" aria-label="Sign out">
            <SignOutIcon />
            <span>Sign out</span>
          </button>
        </div>
      </aside>

      <div
        className={`rv-overlay${open ? " visible" : ""}`}
        onClick={() => setOpen(false)}
        aria-hidden="true"
      />

      <style jsx>{`
        .rv-mobile-toggle {
          display: none;
          position: fixed;
          top: 14px; left: 14px;
          z-index: 60;
          width: 40px; height: 40px;
          border-radius: 10px;
          background: var(--rv-side-bg);
          border: 1px solid var(--rv-border);
          flex-direction: column;
          align-items: center; justify-content: center;
          gap: 4px; cursor: pointer;
        }
        .rv-mobile-toggle span {
          display: block; width: 18px; height: 2px;
          background: var(--rv-text); border-radius: 2px;
        }

        .rv-side {
          background: var(--rv-side-bg);
          border-right: 1px solid var(--rv-border);
          padding: 22px 18px 18px;
          display: flex; flex-direction: column;
          gap: 18px;
          position: sticky; top: 0;
          height: 100vh; width: 248px;
          box-sizing: border-box; overflow-y: auto;
        }

        .rv-brand {
          display: flex; align-items: center; gap: 12px;
          text-decoration: none; color: inherit;
          padding: 4px 6px 12px;
          border-bottom: 1px solid var(--rv-border);
        }
        .rv-mark {
          display: inline-flex; align-items: center; justify-content: center;
          width: 38px; height: 38px;
          background: var(--rv-mark-bg);
          border: 1px solid var(--rv-gold);
          border-radius: 9px;
          color: var(--rv-gold);
          font-weight: 800; font-size: 15px;
          letter-spacing: -0.5px;
        }
        .rv-brand-text {
          display: flex; flex-direction: column;
          font-size: 14px; font-weight: 700;
          letter-spacing: -0.01em;
        }
        .rv-brand-text small {
          font-size: 10.5px; color: var(--rv-muted);
          font-weight: 500; letter-spacing: 0.1em;
          text-transform: uppercase;
        }

        .rv-profile-chip {
          display: flex; align-items: center; gap: 12px;
          padding: 10px 10px;
          border-radius: 10px;
          border: 1px solid var(--rv-border);
          background: var(--rv-chip-bg);
          text-decoration: none; color: inherit;
          transition: border-color 120ms ease, background 120ms ease;
        }
        .rv-profile-chip:hover {
          border-color: var(--rv-gold-soft);
          background: var(--rv-chip-hover);
        }
        .rv-profile-avatar {
          width: 32px; height: 32px; border-radius: 50%;
          background: var(--rv-mark-bg);
          border: 1px solid var(--rv-gold);
          color: var(--rv-gold);
          font-size: 12px; font-weight: 700;
          display: inline-flex; align-items: center; justify-content: center;
        }
        .rv-profile-meta { display: flex; flex-direction: column; gap: 2px; }
        .rv-profile-name { font-size: 13.5px; font-weight: 600; color: var(--rv-text); }
        .rv-profile-status {
          font-size: 11px; color: var(--rv-good);
          display: inline-flex; align-items: center; gap: 5px;
          font-weight: 600;
        }
        .rv-profile-dot {
          width: 6px; height: 6px; border-radius: 50%;
          background: var(--rv-good);
        }

        .rv-nav {
          display: flex; flex-direction: column; gap: 4px;
          overflow-y: auto; min-height: 0;
        }
        .rv-nav-section { display: flex; flex-direction: column; gap: 2px; }
        .rv-nav-section-label {
          font-size: 10.5px; letter-spacing: 0.16em;
          text-transform: uppercase;
          color: var(--rv-muted);
          font-weight: 600;
          padding: 4px 12px 6px;
        }
        .rv-nav-item {
          display: flex; align-items: center; gap: 10px;
          padding: 9px 12px; border-radius: 8px;
          font-size: 13.5px; color: var(--rv-muted);
          text-decoration: none;
          transition: background 120ms ease, color 120ms ease;
        }
        .rv-nav-item:hover {
          background: var(--rv-nav-hover);
          color: var(--rv-text);
        }
        .rv-nav-item.active {
          background: rgba(201, 168, 76, 0.1);
          color: var(--rv-gold);
          font-weight: 600;
        }
        .rv-nav-icon {
          display: inline-flex; width: 18px; height: 18px;
          align-items: center; justify-content: center;
        }
        .rv-nav-label { flex: 1; }

        .rv-foot {
          margin-top: auto;
          display: flex; flex-direction: column; gap: 12px;
          padding-top: 14px;
          border-top: 1px solid var(--rv-border);
        }
        .rv-theme {
          display: grid; grid-template-columns: 1fr 1fr;
          gap: 6px; padding: 4px;
          border: 1px solid var(--rv-border);
          border-radius: 10px;
          background: var(--rv-chip-bg);
        }
        .rv-theme-btn {
          display: flex; align-items: center; justify-content: center;
          gap: 6px; padding: 7px 10px;
          font-size: 11.5px; font-weight: 600;
          border-radius: 7px; border: none;
          background: transparent;
          color: var(--rv-muted);
          font-family: inherit; cursor: pointer;
          transition: background 120ms ease, color 120ms ease;
        }
        .rv-theme-btn:hover { color: var(--rv-text); }
        .rv-theme-btn.active {
          background: var(--rv-mark-bg);
          color: var(--rv-gold);
        }
        .rv-theme-btn :global(svg) { width: 14px; height: 14px; }

        .rv-foot-email {
          font-size: 11.5px; color: var(--rv-muted);
          padding: 0 4px;
          overflow: hidden; text-overflow: ellipsis;
          white-space: nowrap;
        }
        .rv-logout {
          display: inline-flex; align-items: center; justify-content: center;
          gap: 8px; padding: 9px 12px;
          font-size: 12.5px; border-radius: 8px;
          background: transparent;
          border: 1px solid var(--rv-border);
          color: var(--rv-text);
          font-family: inherit; cursor: pointer;
          transition: border-color 120ms ease, color 120ms ease;
        }
        .rv-logout:hover { border-color: var(--rv-gold); color: var(--rv-gold); }
        .rv-logout :global(svg) { width: 14px; height: 14px; }

        .rv-overlay {
          position: fixed; inset: 0;
          background: rgba(0, 0, 0, 0.5);
          z-index: 40; opacity: 0;
          pointer-events: none;
          transition: opacity 200ms ease;
        }
        .rv-overlay.visible { opacity: 1; pointer-events: auto; }

        @media (max-width: 900px) {
          .rv-mobile-toggle { display: flex; }
          .rv-side {
            position: fixed; top: 0; left: 0;
            height: 100vh;
            transform: translateX(-100%);
            transition: transform 220ms ease;
            z-index: 50;
            box-shadow: 4px 0 24px rgba(0, 0, 0, 0.4);
          }
          .rv-side.open { transform: translateX(0); }
        }
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
