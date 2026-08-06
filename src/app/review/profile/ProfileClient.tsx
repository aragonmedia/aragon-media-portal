"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type ProfileClientProps = {
  handle: string | null;
  extraHandles: string[];
};

const PREF_KEYS = ["email_notifs", "weekly_digest", "connection_alerts"] as const;
type PrefKey = (typeof PREF_KEYS)[number];

const PREF_META: Record<
  PrefKey,
  { title: string; sub: string; defaultOn: boolean }
> = {
  email_notifs: {
    title: "Email notifications",
    sub: "You'll receive chat, withdrawal, and system updates by email.",
    defaultOn: true,
  },
  weekly_digest: {
    title: "Weekly performance digest",
    sub: "Summary of GMV, orders, and top videos every Monday.",
    defaultOn: true,
  },
  connection_alerts: {
    title: "TikTok connection alerts",
    sub: "Ping me when a connected account needs re-authorization.",
    defaultOn: true,
  },
};

function loadPrefs(): Record<PrefKey, boolean> {
  const out = {} as Record<PrefKey, boolean>;
  for (const k of PREF_KEYS) {
    let v = PREF_META[k].defaultOn;
    if (typeof window !== "undefined") {
      const raw = localStorage.getItem(`am_pref_${k}`);
      if (raw === "on") v = true;
      else if (raw === "off") v = false;
    }
    out[k] = v;
  }
  return out;
}

export default function ProfileClient({ handle, extraHandles }: ProfileClientProps) {
  const [prefs, setPrefs] = useState<Record<PrefKey, boolean>>(() => {
    const out = {} as Record<PrefKey, boolean>;
    for (const k of PREF_KEYS) out[k] = PREF_META[k].defaultOn;
    return out;
  });

  useEffect(() => {
    setPrefs(loadPrefs());
  }, []);

  function toggle(k: PrefKey) {
    setPrefs((prev) => {
      const next = { ...prev, [k]: !prev[k] };
      try { localStorage.setItem(`am_pref_${k}`, next[k] ? "on" : "off"); } catch {}
      return next;
    });
  }

  return (
    <>
      {/* TikTok handles row */}
      <section className="pf-handles-card">
        <div className="pf-handles-head">
          <h2>TikTok Handles</h2>
          <Link href="/review/accounts" className="pf-handles-cta">
            <span aria-hidden>+</span> Add TikTok account
          </Link>
        </div>
        <ul className="pf-handles-list">
          {handle && (
            <li className="pf-handle-item">
              <span className="pf-handle-mark">@</span>
              <div className="pf-handle-meta">
                <p className="pf-handle-name">@{handle}</p>
                <p className="pf-handle-sub">Primary handle</p>
              </div>
              <span className="pf-handle-pill">Primary</span>
            </li>
          )}
          {extraHandles.map((h) => (
            <li key={h} className="pf-handle-item">
              <span className="pf-handle-mark">@</span>
              <div className="pf-handle-meta">
                <p className="pf-handle-name">@{h}</p>
                <p className="pf-handle-sub">Connected via TikTok Partner Center</p>
              </div>
              <Link href="/review/accounts" className="pf-handle-link">Manage →</Link>
            </li>
          ))}
          {!handle && extraHandles.length === 0 && (
            <li className="pf-handle-empty">
              No TikTok handles linked yet.{" "}
              <Link href="/review/accounts">Add your first account →</Link>
            </li>
          )}
        </ul>
      </section>

      {/* Notification toggles */}
      <section className="pf-card">
        <h2>Notifications</h2>
        {PREF_KEYS.map((k) => (
          <div key={k} className="pf-setting">
            <div>
              <p className="pf-setting-title">{PREF_META[k].title}</p>
              <p className="pf-setting-sub">{PREF_META[k].sub}</p>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={prefs[k]}
              onClick={() => toggle(k)}
              className={`pf-switch${prefs[k] ? " on" : ""}`}
            >
              <span className="pf-switch-track" />
              <span className="pf-switch-thumb" />
              <span className="pf-switch-label">{prefs[k] ? "On" : "Off"}</span>
            </button>
          </div>
        ))}
      </section>

      <style jsx>{`
        .pf-handles-card, .pf-card {
          background: var(--bg-2);
          border: 1px solid var(--border-soft);
          border-radius: 14px;
          padding: 22px 24px;
          box-shadow: var(--shadow-card);
        }
        .pf-handles-head {
          display: flex; justify-content: space-between; align-items: center;
          margin-bottom: 14px; gap: 12px; flex-wrap: wrap;
        }
        .pf-handles-head h2 {
          margin: 0;
          font-size: 12px; font-weight: 700;
          letter-spacing: 0.16em; text-transform: uppercase;
          color: var(--gold);
        }
        .pf-handles-cta {
          display: inline-flex; align-items: center; gap: 6px;
          font-size: 12.5px; font-weight: 700;
          color: #0B0B0B;
          background: var(--gold);
          border: 1px solid var(--gold);
          padding: 8px 14px; border-radius: 8px;
          text-decoration: none;
          transition: transform 120ms ease, box-shadow 120ms ease;
        }
        .pf-handles-cta:hover {
          transform: translateY(-1px);
          box-shadow: 0 6px 18px -8px rgba(201, 168, 76, 0.6);
        }
        .pf-handles-cta span { font-size: 15px; line-height: 1; }

        .pf-handles-list { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; gap: 10px; }
        .pf-handle-item {
          display: grid; grid-template-columns: 36px 1fr auto;
          gap: 12px; align-items: center;
          padding: 12px 14px;
          background: var(--bg-deep);
          border: 1px solid var(--border-soft);
          border-radius: 10px;
        }
        .pf-handle-mark {
          width: 36px; height: 36px; border-radius: 8px;
          background: var(--bg);
          border: 1px solid var(--gold);
          color: var(--gold);
          display: inline-flex; align-items: center; justify-content: center;
          font-weight: 700; font-size: 16px;
        }
        .pf-handle-name { margin: 0; font-size: 14px; font-weight: 700; color: var(--text); }
        .pf-handle-sub { margin: 2px 0 0; font-size: 11.5px; color: var(--text-muted); }
        .pf-handle-pill {
          font-size: 10.5px; font-weight: 700;
          color: var(--gold);
          background: rgba(201, 168, 76, 0.08);
          border: 1px solid rgba(201, 168, 76, 0.28);
          padding: 5px 10px; border-radius: 999px;
          letter-spacing: 0.1em; text-transform: uppercase;
        }
        .pf-handle-link {
          font-size: 12px; font-weight: 600;
          color: var(--gold); text-decoration: none;
          border-bottom: 1px dashed rgba(201, 168, 76, 0.4);
        }
        .pf-handle-empty {
          padding: 18px 14px;
          background: var(--bg-deep);
          border: 1px dashed var(--border-soft);
          border-radius: 10px;
          color: var(--text-muted);
          font-size: 13px;
          text-align: center;
        }
        .pf-handle-empty a { color: var(--gold); text-decoration: none; margin-left: 4px; }

        .pf-card h2 {
          margin: 0 0 14px;
          font-size: 12px; font-weight: 700;
          letter-spacing: 0.16em; text-transform: uppercase;
          color: var(--gold);
        }
        .pf-setting {
          display: flex; justify-content: space-between; align-items: center;
          gap: 20px; padding: 14px 0;
          border-top: 1px solid var(--border-soft);
        }
        .pf-setting:nth-of-type(1) { border-top: none; padding-top: 0; }
        .pf-setting-title { margin: 0; font-size: 14px; font-weight: 600; color: var(--text); }
        .pf-setting-sub { margin: 3px 0 0; font-size: 12.5px; color: var(--text-muted); }

        /* Slider switch */
        .pf-switch {
          position: relative;
          display: inline-flex;
          align-items: center;
          gap: 10px;
          background: transparent;
          border: none;
          padding: 0;
          font-family: inherit;
          cursor: pointer;
          color: var(--text-muted);
          font-size: 11.5px;
          font-weight: 700;
          letter-spacing: 0.08em;
          text-transform: uppercase;
        }
        .pf-switch-track {
          display: inline-block;
          width: 44px; height: 24px;
          border-radius: 999px;
          background: var(--border);
          transition: background 160ms ease;
          position: relative;
        }
        .pf-switch-thumb {
          position: absolute;
          left: 3px;
          top: 50%;
          transform: translate(0, -50%);
          width: 18px; height: 18px;
          border-radius: 50%;
          background: var(--text);
          transition: left 160ms ease, transform 160ms ease;
          box-shadow: 0 2px 6px rgba(0,0,0,0.25);
        }
        .pf-switch.on .pf-switch-track { background: var(--green); }
        .pf-switch.on .pf-switch-thumb { left: calc(100% - 21px - 3px); background: #FFFFFF; }
        .pf-switch.on { color: var(--green); }
        .pf-switch-label { min-width: 26px; text-align: left; }
      `}</style>
    </>
  );
}
