import Link from "next/link";

export default function SigninPage() {
  return (
    <main className="placeholder-page">
      <div className="placeholder-card">
        <div className="logo">Aragon Media<span>Creator Partner Program</span></div>
        <h1 className="placeholder-title">Welcome back</h1>
        <p className="placeholder-body">
          The sign-in portal is activating with the first batch of verified
          creators. If your account is live, we&apos;ll email you a direct login link.
        </p>
        <div className="placeholder-actions">
          <Link href="/" className="btn-primary">Back to home</Link>
        </div>
      </div>
    </main>
  );
}
