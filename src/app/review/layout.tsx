/**
 * /review shell layout — sidebar + demo badge + logout, all rendered
 * inside a hard auth gate. If getCurrentReviewer() is null (missing or
 * tampered cookie), we redirect to /login. The middleware already blocks
 * non-reviewers from getting here, so this is defense in depth.
 */

import { redirect } from "next/navigation";
import Link from "next/link";
import { getCurrentReviewer } from "@/lib/auth/review-session";
import ReviewSidebar from "./ReviewSidebar";
import LogoutButton from "./LogoutButton";

export const dynamic = "force-dynamic";

export default async function ReviewLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentReviewer();
  if (!user) redirect("/login");

  return (
    <div className="rv-shell">
      <aside className="rv-side">
        <Link href="/review" className="rv-brand">
          <span className="rv-mark">AM</span>
          <span className="rv-brand-text">
            Aragon Media
            <small>Creator Portal</small>
          </span>
        </Link>

        <ReviewSidebar />

        <div className="rv-badge">Demo mode</div>
      </aside>

      <div className="rv-main">
        <header className="rv-topbar">
          <div className="rv-topbar-left">
            <p className="rv-hello">Signed in as</p>
            <p className="rv-hello-name">{user.name || user.email}</p>
          </div>
          <div className="rv-topbar-right">
            <span className="rv-topbar-email">{user.email}</span>
            <LogoutButton />
          </div>
        </header>

        <main className="rv-content">{children}</main>
      </div>

      <style>{`
        .rv-shell {
          min-height: 100vh;
          display: grid;
          grid-template-columns: 248px 1fr;
          background: #0F0F0F;
          color: #F5F1E6;
          font-family: 'Inter Tight', system-ui, -apple-system, sans-serif;
        }
        .rv-side {
          background: #141414;
          border-right: 1px solid #1F1F1F;
          padding: 22px 18px 22px;
          display: flex;
          flex-direction: column;
          gap: 22px;
          position: sticky;
          top: 0;
          height: 100vh;
        }
        .rv-brand {
          display: flex;
          align-items: center;
          gap: 12px;
          text-decoration: none;
          color: inherit;
          padding: 4px 6px 12px;
          border-bottom: 1px solid #1F1F1F;
        }
        .rv-mark {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 38px;
          height: 38px;
          background: #0B0B0B;
          border: 1px solid #C9A84C;
          border-radius: 9px;
          color: #C9A84C;
          font-weight: 800;
          font-size: 15px;
          letter-spacing: -0.5px;
        }
        .rv-brand-text {
          display: flex;
          flex-direction: column;
          font-size: 14px;
          font-weight: 700;
          letter-spacing: -0.01em;
        }
        .rv-brand-text small {
          font-size: 10.5px;
          color: #9A9590;
          font-weight: 500;
          letter-spacing: 0.1em;
          text-transform: uppercase;
        }
        .rv-badge {
          margin-top: auto;
          font-size: 10.5px;
          letter-spacing: 0.18em;
          text-transform: uppercase;
          color: #C9A84C;
          background: rgba(201, 168, 76, 0.08);
          border: 1px solid rgba(201, 168, 76, 0.28);
          padding: 8px 12px;
          border-radius: 8px;
          text-align: center;
          font-weight: 700;
        }
        .rv-main {
          min-width: 0;
          display: flex;
          flex-direction: column;
        }
        .rv-topbar {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 18px 30px;
          border-bottom: 1px solid #1F1F1F;
          background: #0F0F0F;
        }
        .rv-topbar-left { display: flex; flex-direction: column; }
        .rv-hello {
          margin: 0;
          font-size: 10.5px;
          text-transform: uppercase;
          letter-spacing: 0.18em;
          color: #6B6660;
          font-weight: 600;
        }
        .rv-hello-name {
          margin: 2px 0 0;
          font-size: 14px;
          font-weight: 600;
          color: #F5F1E6;
        }
        .rv-topbar-right {
          display: flex;
          align-items: center;
          gap: 14px;
        }
        .rv-topbar-email {
          font-size: 12.5px;
          color: #9A9590;
        }
        .rv-content {
          padding: 30px;
          flex: 1;
          overflow-x: hidden;
        }

        @media (max-width: 900px) {
          .rv-shell {
            grid-template-columns: 1fr;
          }
          .rv-side {
            position: static;
            height: auto;
            border-right: none;
            border-bottom: 1px solid #1F1F1F;
            flex-direction: row;
            align-items: center;
            padding: 14px 16px;
            gap: 14px;
            overflow-x: auto;
          }
          .rv-brand { border-bottom: none; padding: 0; }
          .rv-badge {
            margin-top: 0;
            padding: 5px 10px;
            font-size: 10px;
          }
          .rv-topbar { padding: 12px 18px; }
          .rv-topbar-email { display: none; }
          .rv-content { padding: 20px 18px; }
        }
      `}</style>
    </div>
  );
}
