"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function RemoveAccountButton({
  id,
  handle,
}: {
  id: string;
  handle: string;
}) {
  const router = useRouter();
  const [stage, setStage] = useState<"idle" | "confirm" | "removing" | "done" | "error">("idle");
  const [error, setError] = useState<string | null>(null);

  async function confirm() {
    if (stage !== "confirm") return;
    setStage("removing");
    setError(null);
    try {
      const res = await fetch("/api/review/accounts/remove", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      const j = await res.json();
      if (!j.ok) throw new Error(j.error || "Failed to remove");
      setStage("done");
      router.refresh();
    } catch (e) {
      setStage("error");
      setError(e instanceof Error ? e.message : "Something went wrong");
      setTimeout(() => setStage("idle"), 2000);
    }
  }

  if (stage === "confirm") {
    return (
      <>
        <div className="rv-rm-confirm">
          <span className="rv-rm-confirm-text">Disconnect @{handle}?</span>
          <button
            type="button"
            className="rv-rm-confirm-btn danger"
            onClick={confirm}
          >
            Yes, disconnect
          </button>
          <button
            type="button"
            className="rv-rm-confirm-btn"
            onClick={() => setStage("idle")}
          >
            Cancel
          </button>
        </div>
        <style jsx>{`
          .rv-rm-confirm {
            display: inline-flex; align-items: center; gap: 8px;
            flex-wrap: wrap;
          }
          .rv-rm-confirm-text {
            font-size: 12.5px;
            color: var(--text);
            font-weight: 600;
          }
          .rv-rm-confirm-btn {
            background: transparent;
            border: 1px solid var(--border);
            color: var(--text-muted);
            font: inherit; font-size: 11.5px;
            font-weight: 700;
            padding: 6px 12px;
            border-radius: 6px;
            cursor: pointer;
            letter-spacing: 0.04em;
            transition: border-color 120ms ease, color 120ms ease, background 120ms ease;
          }
          .rv-rm-confirm-btn:hover { border-color: var(--gold); color: var(--gold); }
          .rv-rm-confirm-btn.danger { color: var(--red); border-color: rgba(199,79,79,0.5); }
          .rv-rm-confirm-btn.danger:hover {
            background: rgba(199,79,79,0.1);
            border-color: var(--red);
            color: var(--red);
          }
        `}</style>
      </>
    );
  }

  return (
    <>
      <button
        type="button"
        className={`rv-rm-btn${stage === "error" ? " err" : ""}`}
        onClick={() => setStage("confirm")}
        disabled={stage === "removing" || stage === "done"}
        aria-label={`Disconnect ${handle}`}
      >
        {stage === "removing" && "Disconnecting…"}
        {stage === "done" && "✓ Disconnected"}
        {stage === "error" && (error || "Failed")}
        {stage === "idle" && (
          <>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 6h18" />
              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" />
              <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
            </svg>
            <span>Disconnect</span>
          </>
        )}
      </button>
      <style jsx>{`
        .rv-rm-btn {
          display: inline-flex; align-items: center; gap: 6px;
          background: transparent;
          border: 1px solid var(--border);
          color: var(--text-muted);
          font: inherit; font-size: 11.5px;
          font-weight: 700;
          padding: 6px 12px;
          border-radius: 6px;
          cursor: pointer;
          letter-spacing: 0.04em;
          transition: border-color 120ms ease, color 120ms ease, background 120ms ease;
        }
        .rv-rm-btn:hover:not(:disabled) {
          border-color: var(--red);
          color: var(--red);
          background: rgba(199,79,79,0.06);
        }
        .rv-rm-btn.err {
          border-color: var(--red);
          color: var(--red);
        }
        .rv-rm-btn:disabled { opacity: 0.6; cursor: progress; }
      `}</style>
    </>
  );
}
