/**
 * Edge middleware — controls where each session type can go.
 *
 * Three cookie types exist in this app:
 *   - am_session : real creator (issued by /api/verify signin flow)
 *   - am_admin   : AM team member (issued by /api/admin/login)
 *   - am_review  : demo/reviewer account (issued by /api/login)
 *
 * Rules enforced here:
 *   1. am_review sessions are LOCKED to /review/**, /api/review/**, and
 *      /api/login (for logout). Any attempt to hit /dashboard, /admin,
 *      /signin, /signup, /api/withdrawals, /api/square, /api/agreement,
 *      or /api/accounts is redirected back to /review — demo users
 *      cannot trigger real side effects.
 *   2. Users hitting /review WITHOUT am_review are redirected to /login.
 *   3. Real user sessions (am_session / am_admin) are NOT touched here
 *      — their route protection stays in the individual server components
 *      that already call getCurrentUser() / isAdminSession(). Only new
 *      protection added: real users hitting /review are bounced to
 *      /dashboard so they never accidentally land in the demo shell.
 *
 * Runs on the Edge — cannot read the DB, only cookie presence + shape.
 * Deep validation happens in the API route + Server Component after redirect.
 */

import { NextRequest, NextResponse } from "next/server";

const REVIEW_COOKIE = "am_review";
const SESSION_COOKIE = "am_session";
const ADMIN_COOKIE = "am_admin";

// Paths a demo/reviewer session is allowed to reach.
const REVIEW_ALLOW_PREFIXES = [
  "/review",
  "/api/review/",
  "/api/login",   // POST + logout
  "/api/chat/",   // reused for /review Chat (guarded server-side)
  "/api/profile", // demo profile reads (guarded server-side)
  "/_next/",
  "/favicon",
  "/apple-touch",
  "/logo-am.svg",
];

// Real side-effect endpoints — reviewer sessions must NEVER hit these.
const REVIEW_BLOCK_PREFIXES = [
  "/api/withdrawals",
  "/api/square",
  "/api/agreement",
  "/api/accounts",
  "/api/signup",
  "/api/signin",
  "/api/verify",
  "/api/admin/",
  "/api/tiktok/", // real TikTok API calls (demo uses mock provider)
];

// UI routes reviewers cannot see.
const REVIEW_UI_BLOCK_PREFIXES = [
  "/dashboard",
  "/admin",
  "/signin",
  "/signup",
  "/preview",
];

function isAllowedForReviewer(pathname: string): boolean {
  if (pathname === "/") return true;
  if (pathname === "/login") return true;
  if (pathname === "/book-a-demo" || pathname === "/privacy" || pathname === "/terms") return true;
  return REVIEW_ALLOW_PREFIXES.some((p) => pathname === p || pathname.startsWith(p));
}

function isBlockedForReviewer(pathname: string): boolean {
  return (
    REVIEW_BLOCK_PREFIXES.some((p) => pathname.startsWith(p)) ||
    REVIEW_UI_BLOCK_PREFIXES.some((p) => pathname === p || pathname.startsWith(p + "/"))
  );
}

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const hasReview = req.cookies.has(REVIEW_COOKIE);
  const hasSession = req.cookies.has(SESSION_COOKIE);
  const hasAdmin = req.cookies.has(ADMIN_COOKIE);

  // 1. Reviewer trying to reach a blocked route → 403 for APIs, redirect for UI.
  if (hasReview && isBlockedForReviewer(pathname)) {
    if (pathname.startsWith("/api/")) {
      return NextResponse.json(
        { ok: false, error: "This action is not available in demo mode." },
        { status: 403 }
      );
    }
    const url = req.nextUrl.clone();
    url.pathname = "/review";
    url.search = "";
    return NextResponse.redirect(url);
  }

  // 2. Reviewer on an allowed route → let through.
  if (hasReview && isAllowedForReviewer(pathname)) {
    return NextResponse.next();
  }

  // 3. No reviewer cookie hitting /review/** → send to /login.
  if (!hasReview && (pathname === "/review" || pathname.startsWith("/review/"))) {
    // Real users shouldn't accidentally see the demo shell either.
    // (Real creators redirect to /dashboard, real admins to /admin.)
    if (hasSession) {
      const url = req.nextUrl.clone();
      url.pathname = "/dashboard";
      return NextResponse.redirect(url);
    }
    if (hasAdmin) {
      const url = req.nextUrl.clone();
      url.pathname = "/admin";
      return NextResponse.redirect(url);
    }
    const url = req.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  // 4. Reviewer already signed in and revisiting /login → jump straight in.
  if (hasReview && pathname === "/login") {
    const url = req.nextUrl.clone();
    url.pathname = "/review";
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    // Match everything except Next internals and static assets.
    "/((?!_next/static|_next/image|favicon.ico|apple-touch-icon|logo-am.svg|.*\\.(?:png|jpg|jpeg|gif|svg|ico|webp|mp4|webm|txt|xml)).*)",
  ],
};
