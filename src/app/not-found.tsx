import Link from "next/link";

/**
 * Branded 404 — replaces the default Next.js error page.
 *
 * Mobile-first per Aragon mobile parity rule: stacks single-column on
 * ≤680px, full-width CTAs, scaled-down headline.
 */
export default function NotFound() {
  return (
    <main className="nf-wrap">
      <div className="nf-card">
        <div className="nf-mark" aria-hidden="true">AM</div>
        <p className="nf-eyebrow">404 · Page not found</p>
        <h1 className="nf-title">This page didn&apos;t make the cycle.</h1>
        <p className="nf-body">
          The link you followed is broken, expired, or never existed.
          Head back to your portal or grab us in chat — we&apos;ll route you to the right place.
        </p>
        <div className="nf-cta-row">
          <Link href="/" className="nf-cta nf-cta-gold">
            Back to home
          </Link>
          <Link href="/signin" className="nf-cta nf-cta-ghost">
            Sign in to portal →
          </Link>
        </div>
        <div className="nf-foot">
          <Link href="/book-a-demo">Book a demo</Link>
          <span aria-hidden>·</span>
          <Link href="/privacy">Privacy</Link>
          <span aria-hidden>·</span>
          <Link href="/terms">Terms</Link>
        </div>
      </div>

      <style>{`
        .nf-wrap {
          min-height: 100vh;
          background: #0F0F0F;
          color: #F5F1E6;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 48px 20px;
          font-family: 'Inter Tight', system-ui, -apple-system, sans-serif;
        }
        .nf-card {
          width: 100%;
          max-width: 540px;
          background: #141414;
          border: 1px solid #2A2A2A;
          border-radius: 16px;
          padding: 44px 40px;
          text-align: center;
        }
        .nf-mark {
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
        .nf-eyebrow {
          margin: 0 0 10px;
          font-size: 11px;
          letter-spacing: 0.22em;
          text-transform: uppercase;
          color: #C9A84C;
          font-weight: 700;
        }
        .nf-title {
          margin: 0 0 14px;
          font-size: 28px;
          font-weight: 700;
          letter-spacing: -0.02em;
          line-height: 1.18;
          color: #F5F1E6;
        }
        .nf-body {
          margin: 0 0 28px;
          font-size: 14.5px;
          line-height: 1.62;
          color: #9A9590;
        }
        .nf-cta-row {
          display: flex;
          gap: 10px;
          justify-content: center;
          margin-bottom: 26px;
        }
        .nf-cta {
          display: inline-block;
          padding: 12px 22px;
          border-radius: 8px;
          font-size: 13px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.08em;
          text-decoration: none;
          transition: transform 80ms ease, opacity 120ms ease;
        }
        .nf-cta:active { transform: translateY(1px); }
        .nf-cta-gold {
          background: #C9A84C;
          color: #0F0F0F;
          border: 1px solid #C9A84C;
        }
        .nf-cta-ghost {
          background: transparent;
          color: #C9A84C;
          border: 1px solid #2A2A2A;
        }
        .nf-foot {
          display: flex;
          justify-content: center;
          align-items: center;
          gap: 10px;
          font-size: 12px;
          color: #5C5750;
          padding-top: 22px;
          border-top: 1px solid #1F1F1F;
        }
        .nf-foot a {
          color: #9A9590;
          text-decoration: none;
        }
        .nf-foot a:hover { color: #C9A84C; }

        @media (max-width: 680px) {
          .nf-card { padding: 32px 22px; }
          .nf-title { font-size: 22px; }
          .nf-body { font-size: 14px; }
          .nf-cta-row { flex-direction: column; }
          .nf-cta { width: 100%; }
        }
      `}</style>
    </main>
  );
}
