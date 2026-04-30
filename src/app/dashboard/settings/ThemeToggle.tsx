"use client";

import { useEffect, useState } from "react";

type Theme = "light" | "dark";

export default function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>("dark");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const stored = (typeof window !== "undefined" && localStorage.getItem("am_theme")) || "dark";
    setTheme((stored === "light" ? "light" : "dark") as Theme);
  }, []);

  function pick(t: Theme) {
    setTheme(t);
    try {
      localStorage.setItem("am_theme", t);
    } catch {}
    document.documentElement.setAttribute("data-theme", t);
  }

  // Until mounted, render the dark default to avoid hydration mismatch
  const active: Theme = mounted ? theme : "dark";

  return (
    <div className="theme-toggle">
      <button
        type="button"
        className={`theme-card${active === "light" ? " active" : ""}`}
        onClick={() => pick("light")}
        aria-pressed={active === "light"}
      >
        <SunIcon />
        <div className="theme-card-label">Light</div>
        <div className="theme-card-sub">Bright + airy</div>
      </button>
      <button
        type="button"
        className={`theme-card${active === "dark" ? " active" : ""}`}
        onClick={() => pick("dark")}
        aria-pressed={active === "dark"}
      >
        <MoonIcon />
        <div className="theme-card-label">Dark</div>
        <div className="theme-card-sub">Aragon default</div>
      </button>
    </div>
  );
}

function SunIcon() {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2" />
      <path d="M12 20v2" />
      <path d="m4.93 4.93 1.41 1.41" />
      <path d="m17.66 17.66 1.41 1.41" />
      <path d="M2 12h2" />
      <path d="M20 12h2" />
      <path d="m6.34 17.66-1.41 1.41" />
      <path d="m19.07 4.93-1.41 1.41" />
    </svg>
  );
}

function MoonIcon() {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
    </svg>
  );
}
