"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type SyncRow = {
  id: string;
  source: string;
  rowsParsed: number;
  rowsUpserted: number;
  rowsRemoved: number;
  error: string | null;
  createdAt: string;
};

export default function PasteClient({
  currentCount,
  recentSyncs,
}: {
  currentCount: number;
  recentSyncs: SyncRow[];
}) {
  const router = useRouter();
  const [body, setBody] = useState("");
  const [sending, setSending] = useState(false);
  const [result, setResult] = useState<{
    ok: boolean;
    parsed?: number;
    upserted?: number;
    removed?: number;
    error?: string;
  } | null>(null);

  async function sync() {
    if (sending || !body.trim()) return;
    setSending(true);
    setResult(null);
    try {
      const res = await fetch("/api/accelerator/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ body, source: "manual" }),
      });
      const j = await res.json();
      setResult(j);
      if (j.ok) {
        router.refresh();
        setBody("");
      }
    } catch (e) {
      setResult({ ok: false, error: e instanceof Error ? e.message : "sync failed" });
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="ada-wrap">
      <header className="ada-head">
        <p className="ada-eyebrow">Accelerator</p>
        <h1>Discord Sync — Manual Paste</h1>
        <p className="ada-sub">
          Copy the daily-edited message from Roni&apos;s Discord channel,
          paste it below, and hit Sync. The parser matches lines like{" "}
          <code>[@handle](url) | USA Shop Affiliate | 120,800 followers | ~~$715~~ $665</code>{" "}
          and updates <a href="/accounts">/accounts</a> in place. Rows
          missing from the payload are removed so the list mirrors
          Discord exactly. Currently <b>{currentCount}</b> account
          {currentCount === 1 ? "" : "s"} cached.
        </p>
      </header>

      <section className="ada-card">
        <h2>Paste channel message</h2>
        <textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder={`[@comedy.king858](https://www.tiktok.com/@comedy.king858) | USA Shop Affiliate | 120,800 followers | ~~$715~~ $665\n[@another.handle](https://www.tiktok.com/@another.handle) | USA Shop Affiliate | 45,300 followers | $420\n...`}
          rows={14}
          spellCheck={false}
        />
        <div className="ada-row">
          <button
            type="button"
            className="ada-sync"
            onClick={sync}
            disabled={sending || !body.trim()}
          >
            {sending ? "Syncing…" : "Sync to /accounts →"}
          </button>
          {result && (
            <div className={`ada-result ${result.ok ? "ok" : "err"}`}>
              {result.ok
                ? `✓ Parsed ${result.parsed} · Upserted ${result.upserted} · Removed ${result.removed}`
                : `✗ ${result.error || "sync failed"}`}
            </div>
          )}
        </div>
      </section>

      <section className="ada-card">
        <h2>Recent syncs</h2>
        {recentSyncs.length === 0 ? (
          <p className="ada-empty">No syncs yet.</p>
        ) : (
          <table className="ada-table">
            <thead>
              <tr>
                <th>When</th>
                <th>Source</th>
                <th>Parsed</th>
                <th>Upserted</th>
                <th>Removed</th>
                <th>Error</th>
              </tr>
            </thead>
            <tbody>
              {recentSyncs.map((s) => (
                <tr key={s.id} className={s.error ? "err" : ""}>
                  <td>{new Date(s.createdAt).toLocaleString()}</td>
                  <td>{s.source}</td>
                  <td>{s.rowsParsed}</td>
                  <td>{s.rowsUpserted}</td>
                  <td>{s.rowsRemoved}</td>
                  <td>{s.error ?? "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>

      <style>{`
        .ada-wrap { max-width: 960px; margin: 40px auto; padding: 0 32px 80px; font-family: 'Inter Tight', system-ui, sans-serif; color: #F5F1E6; }
        .ada-head { margin-bottom: 24px; }
        .ada-eyebrow { margin: 0 0 6px; font-size: 11px; letter-spacing: 0.18em; text-transform: uppercase; color: #C9A84C; font-weight: 700; }
        .ada-head h1 { margin: 0; font-size: 28px; font-weight: 700; letter-spacing: -0.01em; }
        .ada-sub { margin: 8px 0 0; font-size: 13.5px; color: #9A9590; line-height: 1.6; }
        .ada-sub a { color: #C9A84C; }
        .ada-sub code { background: #141414; border: 1px solid #262626; padding: 1px 6px; border-radius: 4px; font-size: 11.5px; color: #C9A84C; font-family: ui-monospace, Menlo, monospace; }
        .ada-sub b { color: #F5F1E6; }
        .ada-card {
          background: #141414;
          border: 1px solid #1F1F1F;
          border-radius: 12px;
          padding: 22px 24px;
          margin-bottom: 16px;
        }
        .ada-card h2 { margin: 0 0 14px; font-size: 12px; font-weight: 700; letter-spacing: 0.16em; text-transform: uppercase; color: #C9A84C; }
        textarea {
          width: 100%;
          background: #0B0B0B;
          border: 1px solid #262626;
          border-radius: 8px;
          color: #F5F1E6;
          padding: 14px 16px;
          font-family: ui-monospace, 'JetBrains Mono', Menlo, monospace;
          font-size: 12.5px;
          line-height: 1.6;
          resize: vertical;
          min-height: 220px;
          outline: none;
          box-sizing: border-box;
        }
        textarea:focus { border-color: #C9A84C; }
        .ada-row { display: flex; align-items: center; gap: 14px; margin-top: 12px; flex-wrap: wrap; }
        .ada-sync {
          background: #C9A84C;
          color: #0B0B0B;
          font: inherit;
          font-size: 13px;
          font-weight: 700;
          padding: 10px 18px;
          border-radius: 8px;
          border: none;
          cursor: pointer;
          transition: transform 120ms ease, box-shadow 120ms ease, opacity 120ms ease;
        }
        .ada-sync:hover:not(:disabled) { transform: translateY(-1px); box-shadow: 0 6px 18px -8px rgba(201,168,76,0.6); }
        .ada-sync:disabled { opacity: 0.55; cursor: not-allowed; }
        .ada-result { font-size: 13px; font-weight: 600; }
        .ada-result.ok { color: #2BA567; }
        .ada-result.err { color: #DC4444; }
        .ada-table { width: 100%; border-collapse: collapse; font-size: 12.5px; }
        .ada-table th { text-align: left; padding: 8px 10px; border-bottom: 1px solid #262626; color: #C9A84C; font-size: 10.5px; letter-spacing: 0.14em; text-transform: uppercase; font-weight: 700; }
        .ada-table td { padding: 8px 10px; border-bottom: 1px solid #1F1F1F; color: #9A9590; }
        .ada-table tr.err td { color: #DC4444; }
        .ada-empty { color: #9A9590; font-size: 13px; margin: 0; }
      `}</style>
    </div>
  );
}
