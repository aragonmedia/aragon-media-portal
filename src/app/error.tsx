"use client";

import { useEffect } from "react";
import Link from "next/link";

/**
 * Branded 500 / runtime-error boundary.
 *
 * Next.js fires this whenever a server or client error escapes a route.
 * Must be a Client Component (uses useEffect to log + offers a reset()).
 * Mobile-first per Aragon parity rule.
 */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log to the browser console — Vercel will capture server errors
    // separately in its function logs via the digest.
    console.error("[error-boundary]", error);
  }, [error]);

  return (
    <main className="er-wrap">
      <div className="er-card">
        <div className="er-mark" aria-hidden="true">AM</div>
        <p className="er-eyebrow">500 · Something broke</p>
        <h1 className="er-title">We hit an unexpected error.</h1>
        <p className="er-body">
          The page didn&apos;t load the way it was supposed to. Your account and any
          in-flight withdrawal are unaffected — try again in a second, or
          reach Aragon Media in chat if it sticks around.
        </p>

        {error?.digest && (
          <p className="er-digest">
            Error ID: <code>{error.digest}</code>
          </p>
        )}

        <div className="er-cta-row">
          <button onClick={reset} className="er-cta er-cta-gold">
            Try again
          </button>
          <Link href="/" className="er-cta er-cta-ghost">
            Back to home →
          </Link>
        </div>
        <div className="er-foot">
          <Link href="/dashboard/chat">Chat with AM</Link>
          <span aria-hidden>·</span>
          <Link href="/signin">Sign in</Link>
          <span aria-hidden>·</span>
          <Link href="/book-a-demo">Book a demo</Link>
        </div>
      </div>

      <style>{`
        .er-wrap {
          min-height: 100vh;
          background: #0F0F0F;
          color: #F5F1E6;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 48px 20px;
          font-family: 'Inter Tight', system-ui, -apple-system, sans-serif;
        }
        .er-card {
          width: 100%;
          max-width: 540px;
          background: #141414;
          border: 1px solid #2A2A2A;
          border-radius: 16px;
          padding: 44px 40px;
          text-align: center;
        }
        .er-mark {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 56px;
          height: 56px;
          margin: 0 auto 22px;
          background: #0B0B0B;
          border: 1px solid #C9A84C;
          border-radius: 12px;
          color: #C9A84C;
          font-weight: 800;
          font-size: 22px;
          letter-spacing: -1px;
        }
        .er-eyebrow {
          margin: 0 0 10px;
          font-size: 11px;
          letter-spacing: 0.22em;
          text-transform: uppercase;
          color: #C9A84C;
          font-weight: 700;
        }
        .er-title {
          margin: 0 0 14px;
          font-size: 28px;
          font-weight: 700;
          letter-spacing: -0.02em;
          line-height: 1.18;
          color: #F5F1E6;
        }
        .er-body {
          margin: 0 0 18px;
          font-size: 14.5px;
          line-height: 1.62;
          color: #9A9590;
        }
        .er-digest {
          margin: 0 0 24px;
          font-size: 11px;
          color: #5C5750;
          letter-spacing: 0.04em;
        }
        .er-digest code {
          background: #0B0B0B;
          border: 1px solid #2A2A2A;
          padding: 2px 8px;
          border-radius: 4px;
          color: #9A9590;
          font-family: 'JetBrains Mono', ui-monospace, monospace;
        }
        .er-cta-row {
          display: flex;
          gap: 10px;
          justify-content: center;
          margin-bottom: 26px;
        }
        .er-cta {
          display: inline-block;
          padding: 12px 22px;
          border-radius: 8px;
          font-size: 13px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.08em;
          text-decoration: none;
          font-family: inherit;
          cursor: pointer;
          transition: transform 80ms ease, opacity 120ms ease;
        }
        .er-cta:active { transform: translateY(1px); }
        .er-cta-gold {
          background: #C9A84C;
          color: #0F0F0F;
          border: 1px solid #C9A84C;
        }
        .er-cta-ghost {
          background: transparent;
          color: #C9A84C;
          border: 1px solid #2A2A2A;
        }
        .er-foot {
          display: flex;
          justify-content: center;
          align-items: center;
          gap: 10px;
          font-size: 12px;
          color: #5C5750;
          padding-top: 22px;
          border-top: 1px solid #1F1F1F;
        }
        .er-foot a {
          color: #9A9590;
          text-decoration: none;
        }
        .er-foot a:hover { color: #C9A84C; }

        @media (max-width: 680px) {
          .er-card { padding: 32px 22px; }
          .er-title { font-size: 22px; }
          .er-body { font-size: 14px; }
          .er-cta-row { flex-direction: column; }
          .er-cta { width: 100%; }
        }
      `}</style>
    </main>
  );
}
