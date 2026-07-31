/**
 * /login — Reviewer/demo entry point.
 *
 * This is a SEPARATE entry from /signin. Real creators use /signin
 * (email + 6-digit code). Reviewers use /login (email + password) and
 * land in the /review shell.
 *
 * Aesthetic mirrors src/app/not-found.tsx: dark card, gold accents,
 * AM mark at top, Book a demo footer.
 */

import { redirect } from "next/navigation";
import { getReviewUserId } from "@/lib/auth/review";
import LoginForm from "./LoginForm";

export const metadata = {
  title: "Sign in · Aragon Media Portal",
  description: "Access the Aragon Media creator portal.",
};

export const dynamic = "force-dynamic";

export default async function LoginPage() {
  // Already authed? Skip the form and go straight to the shell.
  const uid = await getReviewUserId();
  if (uid) redirect("/review");

  return (
    <main className="lg-wrap">
      <div className="lg-card">
        <div className="lg-mark" aria-hidden="true">AM</div>
        <p className="lg-eyebrow">Aragon Media Portal</p>
        <h1 className="lg-title">Sign in to your account</h1>
        <p className="lg-body">
          Enter the email and password provided by the Aragon Media team.
        </p>

        <LoginForm />

        <div className="lg-foot">
          <a href="mailto:hello@kevin-aragon.com?subject=Password%20help">Forgot password?</a>
          <span aria-hidden>·</span>
          <a href="/book-a-demo">Book a demo</a>
          <span aria-hidden>·</span>
          <a href="/privacy">Privacy</a>
        </div>
      </div>

      <style>{`
        .lg-wrap {
          min-height: 100vh;
          background: #0F0F0F;
          color: #F5F1E6;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 48px 20px;
          font-family: 'Inter Tight', system-ui, -apple-system, sans-serif;
        }
        .lg-card {
          width: 100%;
          max-width: 460px;
          background: #141414;
          border: 1px solid #2A2A2A;
          border-radius: 16px;
          padding: 44px 40px;
          text-align: center;
        }
        .lg-mark {
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
        .lg-eyebrow {
          margin: 0 0 10px;
          font-size: 11px;
          letter-spacing: 0.22em;
          text-transform: uppercase;
          color: #C9A84C;
          font-weight: 700;
        }
        .lg-title {
          margin: 0 0 14px;
          font-size: 26px;
          font-weight: 700;
          letter-spacing: -0.02em;
          line-height: 1.2;
          color: #F5F1E6;
        }
        .lg-body {
          margin: 0 0 28px;
          font-size: 14px;
          line-height: 1.6;
          color: #9A9590;
        }
        .lg-foot {
          display: flex;
          justify-content: center;
          align-items: center;
          gap: 10px;
          flex-wrap: wrap;
          font-size: 12px;
          color: #5C5750;
          padding-top: 22px;
          margin-top: 24px;
          border-top: 1px solid #1F1F1F;
        }
        .lg-foot a {
          color: #9A9590;
          text-decoration: none;
        }
        .lg-foot a:hover { color: #C9A84C; }

        @media (max-width: 680px) {
          .lg-card { padding: 32px 22px; }
          .lg-title { font-size: 22px; }
          .lg-body { font-size: 13.5px; }
        }
      `}</style>
    </main>
  );
}
