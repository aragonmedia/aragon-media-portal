"use client";

import { useState } from "react";

export default function LogoutButton() {
  const [loading, setLoading] = useState(false);
  async function signOut() {
    if (loading) return;
    setLoading(true);
    try {
      await fetch("/api/review/logout", { method: "POST" });
    } finally {
      window.location.href = "/login";
    }
  }
  return (
    <button className="rv-logout-btn" onClick={signOut} disabled={loading}>
      {loading ? "Signing out..." : "Sign out"}
      <style jsx>{`
        .rv-logout-btn {
          background: transparent;
          border: 1px solid var(--rv-border);
          color: var(--rv-text);
          font-family: inherit; font-size: 12.5px;
          padding: 8px 14px; border-radius: 8px;
          cursor: pointer;
          transition: border-color 120ms ease, color 120ms ease;
        }
        .rv-logout-btn:hover:not(:disabled) { border-color: var(--rv-gold); color: var(--rv-gold); }
        .rv-logout-btn:disabled { opacity: 0.6; cursor: not-allowed; }
      `}</style>
    </button>
  );
}
