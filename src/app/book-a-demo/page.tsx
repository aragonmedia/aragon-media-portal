import Link from "next/link";

export default function BookDemoPage() {
  return (
    <main className="placeholder-page">
      <div className="placeholder-card">
        <div className="logo">Aragon Media<span>Creator Partner Program</span></div>
        <h1 className="placeholder-title">Book a Demo</h1>
        <p className="placeholder-body">
          Walk through the portal live with the Aragon Media team. Pick a time
          that works and we&apos;ll jump on a quick 30-minute call.
        </p>
        <div className="placeholder-actions">
          <a
            href="https://calendly.com/itskevinaragon/30min"
            target="_blank"
            rel="noopener noreferrer"
            className="btn-primary"
          >
            Pick a time on Calendly
          </a>
          <Link href="/" className="btn-ghost">&larr; Back to home</Link>
        </div>
      </div>
    </main>
  );
}
