"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AddAccountButton({
  className = "",
  label = "+ Add another account",
}: {
  className?: string;
  label?: string;
}) {
  const router = useRouter();
  const [stage, setStage] = useState<"idle" | "redirecting" | "authorizing" | "done">("idle");
  const [error, setError] = useState<string | null>(null);

  async function connect() {
    if (stage !== "idle") return;
    setError(null);
    setStage("redirecting");
    // Simulate a TikTok Partner Center OAuth redirect. In production
    // this is a real 302 to partner.tiktokshop.com; here we mock it.
    await new Promise((r) => setTimeout(r, 900));
    setStage("authorizing");
    await new Promise((r) => setTimeout(r, 900));
    try {
      const res = await fetch("/api/review/accounts/add", { method: "POST" });
      const j = await res.json();
      if (!j.ok) throw new Error(j.error || "Failed to add account");
      setStage("done");
      router.refresh();
      setTimeout(() => setStage("idle"), 600);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong");
      setStage("idle");
    }
  }

  const busy = stage !== "idle" && stage !== "done";

  return (
    <>
      <button
        type="button"
        className={`rv-add-btn ${className}`}
        onClick={connect}
        disabled={busy}
        aria-busy={busy}
      >
        {stage === "idle" && label}
        {stage === "redirecting" && "Redirecting to TikTok Partner Center…"}
        {stage === "authorizing" && "Authorizing account…"}
        {stage === "done" && "✓ Account added"}
      </button>
      {error && <p className="rv-add-err">{error}</p>}

      <style jsx>{`
        .rv-add-btn {
          background: var(--gold);
          border: 1px solid var(--gold);
          color: #0B0B0B;
          font: inherit; font-size: 13px; font-weight: 700;
          padding: 10px 18px; border-radius: 10px;
          cursor: pointer;
          transition: transform 120ms ease, box-shadow 120ms ease, opacity 120ms ease;
        }
        .rv-add-btn:hover:not(:disabled) {
          transform: translateY(-1px);
          box-shadow: 0 6px 18px -8px rgba(201, 168, 76, 0.6);
        }
        .rv-add-btn:disabled { opacity: 0.75; cursor: progress; }
        .rv-add-err {
          margin: 8px 0 0;
          color: var(--red);
          font-size: 12.5px;
        }
      `}</style>
    </>
  );
}
