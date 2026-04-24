import Link from "next/link";

export default function DashboardPlaceholder() {
  return (
    <main className="placeholder-page">
      <div className="placeholder-card">
        <div className="logo">Aragon Media<span>Creator Partner Program</span></div>
        <h1 className="placeholder-title">Dashboard &mdash; coming online</h1>
        <p className="placeholder-body">
          Your creator dashboard is being built. Once your account is verified you&apos;ll
          land here with your TikTok connection, GMV &amp; commission tracking, and
          withdrawal controls.
        </p>
        <div className="placeholder-actions">
          <Link href="/" className="btn-primary">&larr; Back to home</Link>
        </div>
      </div>
    </main>
  );
}
