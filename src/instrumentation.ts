/**
 * Server + edge runtime initialization for Sentry.
 *
 * Next.js 15 calls register() once per runtime when the server boots.
 * If NEXT_PUBLIC_SENTRY_DSN is unset, this is a complete no-op so we
 * can ship the wiring now and Kevin can flip Sentry on later by
 * adding the env var in Vercel.
 *
 * To enable:
 *   1. Sign up at sentry.io (free hobby tier — 5K errors/mo)
 *   2. Create a Next.js project, copy its DSN
 *   3. Vercel → Project Settings → Environment Variables (Production)
 *      Name:  NEXT_PUBLIC_SENTRY_DSN
 *      Value: https://...@o..ingest.sentry.io/...
 *   4. Redeploy
 */

import * as Sentry from "@sentry/nextjs";

export async function register() {
  const dsn = process.env.NEXT_PUBLIC_SENTRY_DSN;
  if (!dsn) return;

  if (process.env.NEXT_RUNTIME === "nodejs") {
    Sentry.init({
      dsn,
      tracesSampleRate: 0.1,
      environment: process.env.VERCEL_ENV ?? "development",
      // Don't send errors from local dev unless explicitly opted in
      enabled: process.env.VERCEL_ENV === "production"
        || process.env.SENTRY_FORCE_DEV === "1",
    });
  }

  if (process.env.NEXT_RUNTIME === "edge") {
    Sentry.init({
      dsn,
      tracesSampleRate: 0.1,
      environment: process.env.VERCEL_ENV ?? "development",
      enabled: process.env.VERCEL_ENV === "production"
        || process.env.SENTRY_FORCE_DEV === "1",
    });
  }
}

// Required by @sentry/nextjs ≥ 8 for nested-route error capture.
export const onRequestError = Sentry.captureRequestError;
