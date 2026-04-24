import Link from "next/link";

export default function SignupPage() {
  return (
    <main className="placeholder-page">
      <div className="placeholder-card">
        <div className="logo">Aragon Media<span>Creator Partner Program</span></div>
        <h1 className="placeholder-title">Creator signup</h1>
        <p className="placeholder-body">
          Email-code signup is coming online shortly. For early access, book a demo
          or reach the team directly.
        </p>
        <div className="placeholder-actions">
          <Link href="/book-a-demo" className="btn-primary">Book a Demo</Link>
          <Link href="/" className="btn-ghost">&larr; Back to home</Link>
        </div>
      </div>
    </main>
  );
}
