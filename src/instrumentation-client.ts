/**
 * Client-side Sentry init. Same DSN-optional pattern — if the
 * NEXT_PUBLIC_SENTRY_DSN env var is unset at build time, this file
 * does nothing and the bundle stays small.
 */

import * as Sentry from "@sentry/nextjs";

const dsn = process.env.NEXT_PUBLIC_SENTRY_DSN;

if (dsn) {
  Sentry.init({
    dsn,
    tracesSampleRate: 0.1,
    // Session replay disabled by default to stay on free tier
    replaysSessionSampleRate: 0,
    replaysOnErrorSampleRate: 1.0,
    environment: process.env.NEXT_PUBLIC_VERCEL_ENV ?? "development",
    enabled: process.env.NEXT_PUBLIC_VERCEL_ENV === "production"
      || process.env.NEXT_PUBLIC_SENTRY_FORCE_DEV === "1",
  });
}

// Required for navigation tracing in Next.js App Router.
export const onRouterTransitionStart = Sentry.captureRouterTransitionStart;
