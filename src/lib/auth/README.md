# Custom Email-Code Auth

Implementation lives here. Flow:

1. User POSTs email to `/api/auth/request-code` → server generates 6-digit code, bcrypt-hashes it, inserts into `verification_codes` with 15-min `expires_at`, emails the code via Resend.
2. User POSTs email + code to `/api/auth/verify-code` → server validates, marks code used, mints a signed JWT session cookie (HTTP-only, Secure, SameSite=Lax).
3. Middleware on protected routes reads the cookie, verifies the JWT signature, attaches `req.user` with `{ id, email, role }`.

Files to build:
- `session.ts` — JWT sign/verify using `jose`
- `codes.ts` — code generation, hashing, validation
- `middleware.ts` — Next.js middleware for route protection
- `rate-limit.ts` — max 5 codes/hour per email
