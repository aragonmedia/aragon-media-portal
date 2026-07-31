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
    <button className="rv-logout" onClick={signOut} disabled={loading}>
      {loading ? "Signing out..." : "Sign out"}
      <style jsx>{`
        .rv-logout {
          background: transparent;
          border: 1px solid #2A2A2A;
          color: #F5F1E6;
          font-family: inherit;
          font-size: 12.5px;
          padding: 8px 14px;
          border-radius: 8px;
          cursor: pointer;
          transition: border-color 120ms ease, color 120ms ease;
        }
        .rv-logout:hover:not(:disabled) { border-color: #C9A84C; color: #C9A84C; }
        .rv-logout:disabled { opacity: 0.6; cursor: not-allowed; }
      `}</style>
    </button>
  );
}
