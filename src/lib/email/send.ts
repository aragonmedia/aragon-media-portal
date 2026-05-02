/**
 * Resend email client + branded verification-code template.
 *
 * Free-tier note: until a domain is verified at https://resend.com/domains,
 * the only working sender is `Aragon Media <onboarding@resend.dev>` and the
 * only deliverable destination is the email tied to the Resend account.
 * Once a domain is verified we'll swap MAIL_FROM to noreply@<domain>.
 *
 * IMPORTANT: this template forces DARK THEME on every email client. We use:
 *   - <meta name="color-scheme" content="dark only">
 *   - <meta name="supported-color-schemes" content="dark">
 *   - !important on every background and color rule
 *   - msoHide / mso conditional comments to keep Outlook from inverting
 * This prevents Apple Mail / Outlook / Gmail from auto-flipping our dark
 * email to light mode and washing out the gold code.
 */

import { Resend } from "resend";

const FROM = "Aragon Media <onboarding@resend.dev>";
const PORTAL = "https://aragon-media-portal.vercel.app";

let client: Resend | null = null;

function getResend(): Resend {
  const key = process.env.RESEND_API_KEY;
  if (!key) {
    throw new Error("RESEND_API_KEY not set");
  }
  client ??= new Resend(key);
  return client;
}

type CodePurpose = "signup" | "signin";

export async function sendVerificationEmail(opts: {
  to: string;
  code: string;
  purpose: CodePurpose;
  name?: string;
}) {
  const subject =
    opts.purpose === "signup"
      ? `Your Aragon Media activation code is ${opts.code}`
      : `Your Aragon Media sign-in code is ${opts.code}`;

  const heading =
    opts.purpose === "signup"
      ? "Welcome to Aragon Media"
      : "Sign in to Aragon Media";

  const greeting = opts.name ? `Hi ${opts.name},` : "Hello,";

  const html = renderEmail({
    heading,
    greeting,
    code: opts.code,
    purpose: opts.purpose,
  });

  const text = renderTextFallback({
    heading,
    greeting,
    code: opts.code,
    purpose: opts.purpose,
  });

  const result = await getResend().emails.send({
    from: FROM,
    to: [opts.to],
    subject,
    html,
    text,
  });
  // Resend returns { data, error } instead of throwing on rejected sends
  // (e.g. unverified-sender free-tier limit). Surface the error so the
  // failure shows up in Vercel logs instead of looking like a successful
  // 200 from the calling endpoint.
  if (result?.error) {
    console.error(
      "[email] sendVerificationEmail rejected:",
      result.error.name ?? "Error",
      result.error.message ?? String(result.error),
      "to:", opts.to
    );
    throw new Error(
      `Resend rejected: ${result.error.message ?? result.error.name ?? "unknown"}`
    );
  }
  return result;
}

function renderEmail({
  heading,
  greeting,
  code,
  purpose,
}: {
  heading: string;
  greeting: string;
  code: string;
  purpose: CodePurpose;
}) {
  const purposeLine =
    purpose === "signup"
      ? "Use the code below to finish creating your Aragon Media account."
      : "Use the code below to sign in to your Aragon Media portal.";

  // All colors and backgrounds use !important to defeat client dark-mode auto-invert
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <meta name="color-scheme" content="dark only" />
  <meta name="supported-color-schemes" content="dark" />
  <title>${heading}</title>
  <style type="text/css">
    /* Force dark on Gmail / Apple Mail / Outlook regardless of OS theme */
    :root { color-scheme: dark only !important; supported-color-schemes: dark only !important; }
    html, body { background:#0F0F0F !important; color:#F5F1E6 !important; }
    [data-ogsc] body, [data-ogsc] table, [data-ogsc] td { background:#0F0F0F !important; color:#F5F1E6 !important; }
    @media (prefers-color-scheme: light) {
      html, body, table, td { background:#0F0F0F !important; color:#F5F1E6 !important; }
    }
    a { color:#C9A84C !important; text-decoration:none !important; }
  </style>
</head>
<body style="margin:0 !important;padding:0 !important;background:#0F0F0F !important;font-family:'Inter Tight',Helvetica,Arial,sans-serif;color:#F5F1E6 !important;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background:#0F0F0F !important;padding:32px 16px;">
    <tr>
      <td align="center" bgcolor="#0F0F0F" style="background:#0F0F0F !important;">
        <table role="presentation" width="560" cellspacing="0" cellpadding="0" border="0" style="max-width:560px;background:#141414 !important;border:1px solid #2A2A2A;border-radius:14px;overflow:hidden;">
          <tr>
            <td bgcolor="#141414" style="padding:28px 32px 0 32px;background:#141414 !important;">
              <table role="presentation" cellspacing="0" cellpadding="0" border="0">
                <tr>
                  <td bgcolor="#0F0F0F" style="background:#0F0F0F !important;border-radius:10px;width:48px;height:48px;text-align:center;font-family:'Inter Tight',Helvetica,Arial,sans-serif;font-weight:800;color:#C9A84C !important;font-size:22px;letter-spacing:-1px;line-height:48px;">AM</td>
                  <td style="padding-left:14px;color:#F5F1E6 !important;font-size:14px;font-weight:600;letter-spacing:0.06em;text-transform:uppercase;">Aragon Media</td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td bgcolor="#141414" style="padding:28px 32px 0 32px;background:#141414 !important;">
              <h1 style="margin:0 0 6px 0;color:#F5F1E6 !important;font-family:'Inter Tight',Helvetica,Arial,sans-serif;font-weight:700;font-size:26px;letter-spacing:-0.02em;line-height:1.15;">${heading}</h1>
              <p style="margin:0 0 22px 0;color:#9A9590 !important;font-size:14px;line-height:1.55;">${greeting} ${purposeLine}</p>
            </td>
          </tr>
          <tr>
            <td bgcolor="#141414" style="padding:0 32px;background:#141414 !important;">
              <div style="background:#0F0F0F !important;border:1px solid #C9A84C;border-radius:10px;padding:22px 28px;text-align:center;">
                <div style="color:#9A9590 !important;font-size:11px;letter-spacing:0.18em;text-transform:uppercase;margin-bottom:8px;">Your 6-digit code</div>
                <div style="color:#C9A84C !important;font-family:'Inter Tight',Helvetica,Arial,sans-serif;font-weight:800;font-size:38px;letter-spacing:0.4em;">${code}</div>
                <div style="color:#9A9590 !important;font-size:12px;margin-top:10px;">Expires in 15 minutes</div>
              </div>
            </td>
          </tr>
          <tr>
            <td bgcolor="#141414" style="padding:24px 32px 18px 32px;background:#141414 !important;">
              <p style="margin:0;color:#9A9590 !important;font-size:13px;line-height:1.6;">If you didn't request this, you can safely ignore this email. Your account stays untouched.</p>
            </td>
          </tr>
          <tr>
            <td bgcolor="#0F0F0F" style="padding:18px 32px;background:#0F0F0F !important;border-top:1px solid #2A2A2A;text-align:center;">
              <a href="${PORTAL}/signin" style="color:#C9A84C !important;text-decoration:none !important;font-size:13px;font-weight:600;padding:0 14px;">Sign in</a>
              <span style="color:#5C5750;">·</span>
              <a href="${PORTAL}/signup" style="color:#C9A84C !important;text-decoration:none !important;font-size:13px;font-weight:600;padding:0 14px;">Sign up</a>
              <span style="color:#5C5750;">·</span>
              <a href="${PORTAL}/book-a-demo" style="color:#C9A84C !important;text-decoration:none !important;font-size:13px;font-weight:600;padding:0 14px;">Book a Demo</a>
              <span style="color:#5C5750;">·</span>
              <a href="${PORTAL}/privacy" style="color:#C9A84C !important;text-decoration:none !important;font-size:13px;font-weight:600;padding:0 14px;">Privacy</a>
              <span style="color:#5C5750;">·</span>
              <a href="${PORTAL}/terms" style="color:#C9A84C !important;text-decoration:none !important;font-size:13px;font-weight:600;padding:0 14px;">Terms</a>
            </td>
          </tr>
          <tr>
            <td bgcolor="#0F0F0F" style="padding:14px 32px 26px 32px;border-top:1px solid #2A2A2A;background:#0F0F0F !important;color:#5C5750 !important;font-size:11px;line-height:1.6;text-align:center;">
              &copy; 2025 Aragon Media &middot; 1309 Coffeen Ave, Sheridan, WY 82801<br />
              Activation &middot; Dashboard &middot; TikTok Partner Program
            </td>
          </tr>
        </table>
        <p style="color:#5C5750 !important;font-size:11px;margin-top:18px;">aragon-media-portal.vercel.app</p>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

function renderTextFallback({
  heading,
  greeting,
  code,
  purpose,
}: {
  heading: string;
  greeting: string;
  code: string;
  purpose: CodePurpose;
}) {
  const purposeLine =
    purpose === "signup"
      ? "Use the code below to finish creating your Aragon Media account."
      : "Use the code below to sign in to your Aragon Media portal.";

  return [
    heading,
    "",
    `${greeting} ${purposeLine}`,
    "",
    `Your 6-digit code: ${code}`,
    "Expires in 15 minutes.",
    "",
    "If you didn't request this, you can ignore this email.",
    "",
    "Quick links:",
    `  Sign in:      ${PORTAL}/signin`,
    `  Sign up:      ${PORTAL}/signup`,
    `  Book a demo:  ${PORTAL}/book-a-demo`,
    `  Privacy:      ${PORTAL}/privacy`,
    `  Terms:        ${PORTAL}/terms`,
    "",
    "Aragon Media",
    "1309 Coffeen Ave, Sheridan, WY 82801",
  ].join("\n");
}

/**
 * Internal AM-team notification when a creator signs the Operations
 * Agreement. Fire-and-forget — caller should not await this in a way
 * that blocks the user's response. Failures are logged and swallowed
 * so a Resend hiccup never breaks the sign flow.
 */
export async function sendAgreementSignedNotification(opts: {
  creatorEmail: string;
  creatorName: string;
  signature: string;
  contractVersion: string;
  signedAt: Date;
}) {
  try {
    const resend = getResend();
    const subject = `Operations Agreement signed — ${opts.creatorName}`;
    const text = [
      "A creator just signed the Operations Agreement.",
      "",
      `Creator:    ${opts.creatorName}`,
      `Email:      ${opts.creatorEmail}`,
      `Signature:  ${opts.signature}`,
      `Version:    ${opts.contractVersion}`,
      `Signed at:  ${opts.signedAt.toISOString()}`,
      "",
      "Action: their withdrawal form is now unlocked. Standby for their first submission.",
      "",
      `Portal: ${PORTAL}/dashboard`,
    ].join("\n");
    const html = `<!DOCTYPE html><html><body style="font-family:system-ui,sans-serif;background:#0F0F0F;color:#FAF7EE;padding:24px;line-height:1.6;">
      <h2 style="color:#C9A84C;margin:0 0 16px 0;">Operations Agreement signed</h2>
      <table cellpadding="6" style="font-size:14px;color:#D4CFB6;">
        <tr><td><strong>Creator:</strong></td><td>${opts.creatorName}</td></tr>
        <tr><td><strong>Email:</strong></td><td>${opts.creatorEmail}</td></tr>
        <tr><td><strong>Signature:</strong></td><td>${opts.signature}</td></tr>
        <tr><td><strong>Version:</strong></td><td>${opts.contractVersion}</td></tr>
        <tr><td><strong>Signed at:</strong></td><td>${opts.signedAt.toISOString()}</td></tr>
      </table>
      <p style="font-size:13px;color:#9A9590;margin-top:18px;">
        Their withdrawal form is now unlocked. Standby for their first submission.
      </p>
      <p style="font-size:12px;color:#5C5750;margin-top:14px;">${PORTAL}/dashboard</p>
    </body></html>`;
    await resend.emails.send({
      from: FROM,
      to: ["aragonkevin239@gmail.com"],
      subject,
      text,
      html,
    });
  } catch (err) {
    // Swallow — this notification is nice-to-have, not blocking.
    console.error("[email] sendAgreementSignedNotification failed:", err);
  }
}

/**
 * Paid email to the creator. This is the ONLY status-change email Aragon
 * sends — Approved / Rejected / Late-retained / Pending changes happen
 * silently in the admin console and are surfaced via the chat thread, not
 * via email. Per Kevin's UX preference: payment confirmation matters,
 * everything else is portal-only state.
 *
 * Headline element: the net amount, in its own framed block so the creator
 * sees the money number first. The value comes from withdrawals.net_cents
 * AFTER any admin edits in /admin/withdrawals/[id].
 *
 * BCCs aragonkevin239@gmail.com so AM has a paper trail.
 */
function fmtUsd(cents: number): string {
  return `$${(cents / 100).toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

export async function sendWithdrawalPaidEmail(opts: {
  to: string;
  creatorName: string;
  receiptNumber: string;
  netCents: number;
  grossCents: number;
}) {
  try {
    const resend = getResend();
    const subject = `${opts.receiptNumber} · Paid · ${fmtUsd(opts.netCents)}`;
    const greeting = (opts.creatorName ?? "").split(" ")[0] || "there";

    const html = `<!DOCTYPE html><html><head>
      <meta name="color-scheme" content="dark only">
      <meta name="supported-color-schemes" content="dark">
    </head>
    <body style="margin:0;padding:0;background:#0F0F0F !important;color:#FAF7EE !important;font-family:system-ui,-apple-system,'Inter Tight',sans-serif;">
      <table role="presentation" width="100%" bgcolor="#0F0F0F" style="background:#0F0F0F !important;">
        <tr><td align="center" style="padding:32px 18px;">
          <table role="presentation" width="600" bgcolor="#0F0F0F" style="background:#0F0F0F !important;border:1px solid #2A2A2A;max-width:600px;width:100%;">

            <tr><td bgcolor="#0F0F0F" style="padding:30px 32px 14px;background:#0F0F0F !important;">
              <p style="margin:0 0 6px 0;font-size:11px;letter-spacing:0.2em;color:#1F8B53 !important;text-transform:uppercase;font-weight:700;">Withdrawal Paid</p>
              <h1 style="margin:0;font-size:24px;line-height:1.2;color:#FAF7EE !important;letter-spacing:-0.02em;">Hey ${greeting} — your money is on the way.</h1>
            </td></tr>

            <tr><td bgcolor="#0F0F0F" style="padding:14px 32px 8px;background:#0F0F0F !important;">
              <p style="margin:0;color:#D4CFB6 !important;font-size:14px;line-height:1.7;">Receipt <strong style="color:#C9A84C !important;">${opts.receiptNumber}</strong> just cleared. The amount below has been sent to the payout method on file. Depending on your bank or wallet, it should land within minutes (instant rails) to a few business days (ACH/wire).</p>
            </td></tr>

            <!-- Headline amount frame -->
            <tr><td bgcolor="#0F0F0F" style="padding:18px 32px 8px;background:#0F0F0F !important;">
              <table role="presentation" width="100%" bgcolor="#0B0B0B" style="background:#0B0B0B !important;border:1px solid #1F8B53;border-radius:6px;">
                <tr><td bgcolor="#0B0B0B" style="padding:24px 28px;background:#0B0B0B !important;text-align:left;">
                  <div style="font-size:11px;letter-spacing:0.18em;color:#9A9590 !important;text-transform:uppercase;font-weight:600;margin-bottom:8px;">Sent to your bank</div>
                  <div style="font-family:'Inter Tight',sans-serif;font-size:42px;font-weight:800;color:#1F8B53 !important;letter-spacing:-0.02em;line-height:1;">${fmtUsd(opts.netCents)}</div>
                  <div style="font-size:12px;color:#5C5750 !important;margin-top:10px;letter-spacing:0.04em;">From ${fmtUsd(opts.grossCents)} gross · receipt ${opts.receiptNumber}</div>
                </td></tr>
              </table>
            </td></tr>

            <tr><td bgcolor="#0F0F0F" style="padding:18px 32px 22px;background:#0F0F0F !important;">
              <a href="${PORTAL}/dashboard/withdrawals" style="display:inline-block;padding:12px 22px;background:#1F8B53 !important;color:#FAF7EE !important;text-decoration:none !important;font-size:13px;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;border-radius:3px;">View receipt →</a>
            </td></tr>

            <tr><td bgcolor="#0F0F0F" style="padding:18px 32px;background:#0F0F0F !important;border-top:1px solid #2A2A2A;text-align:center;">
              <a href="${PORTAL}/dashboard" style="color:#C9A84C !important;text-decoration:none !important;font-size:13px;font-weight:600;padding:0 14px;">Dashboard</a>
              <span style="color:#5C5750;">·</span>
              <a href="${PORTAL}/dashboard/chat" style="color:#C9A84C !important;text-decoration:none !important;font-size:13px;font-weight:600;padding:0 14px;">Chat with AM</a>
            </td></tr>
            <tr><td bgcolor="#0F0F0F" style="padding:14px 32px 26px;background:#0F0F0F !important;border-top:1px solid #2A2A2A;color:#5C5750 !important;font-size:11px;line-height:1.6;text-align:center;">
              © 2026 Aragon Media · 1309 Coffeen Ave, Sheridan, WY 82801
            </td></tr>

          </table>
        </td></tr>
      </table>
    </body></html>`;

    const text = [
      "WITHDRAWAL PAID",
      "",
      `Hey ${greeting},`,
      "",
      `Receipt ${opts.receiptNumber} just cleared.`,
      "",
      `>>> Sent to your bank: ${fmtUsd(opts.netCents)}`,
      `    From ${fmtUsd(opts.grossCents)} gross`,
      "",
      `View receipt: ${PORTAL}/dashboard/withdrawals`,
      `Chat with AM: ${PORTAL}/dashboard/chat`,
      "",
      "Aragon Media · 1309 Coffeen Ave, Sheridan, WY 82801",
    ].join("\n");

    await resend.emails.send({
      from: FROM,
      to: [opts.to],
      bcc: ["aragonkevin239@gmail.com"],
      subject,
      text,
      html,
    });
  } catch (err) {
    console.error("[email] sendWithdrawalPaidEmail failed:", err);
  }
}

/**
 * Chat notification email — fired when a reply lands and the OTHER party
 * isn't actively typing. Throttled at the call site (5min between sends
 * per chat per sender side) so the recipient isn't hammered during a
 * live exchange.
 */
export async function sendChatNotificationEmail(opts: {
  to: string;
  fromLabel: string;     // "Aragon Media" or the creator's display name
  fromContext: string;   // "AM team" or the creator's email
  snippet: string;       // up to ~280 chars of the message body
  openUrl: string;       // direct link to the chat for the recipient
  recipientIsAdmin: boolean;
}) {
  try {
    const resend = getResend();
    const subject = opts.recipientIsAdmin
      ? `New chat from ${opts.fromLabel} — Aragon Media portal`
      : `New message from Aragon Media`;

    const html = `<!DOCTYPE html><html><head>
      <meta name="color-scheme" content="dark only">
      <meta name="supported-color-schemes" content="dark">
    </head>
    <body style="margin:0;padding:0;background:#0F0F0F !important;color:#FAF7EE !important;font-family:system-ui,-apple-system,'Inter Tight',sans-serif;">
      <table role="presentation" width="100%" bgcolor="#0F0F0F" style="background:#0F0F0F !important;">
        <tr><td align="center" style="padding:32px 18px;">
          <table role="presentation" width="600" bgcolor="#0F0F0F" style="background:#0F0F0F !important;border:1px solid #2A2A2A;max-width:600px;width:100%;">
            <tr><td bgcolor="#0F0F0F" style="padding:30px 32px 14px;background:#0F0F0F !important;">
              <p style="margin:0 0 6px 0;font-size:11px;letter-spacing:0.2em;color:#C9A84C !important;text-transform:uppercase;font-weight:700;">New chat message</p>
              <h1 style="margin:0;font-size:22px;line-height:1.25;color:#FAF7EE !important;letter-spacing:-0.01em;">${opts.fromLabel} replied</h1>
              <p style="margin:6px 0 0;font-size:12px;color:#9A9590 !important;">${opts.fromContext}</p>
            </td></tr>
            <tr><td bgcolor="#0F0F0F" style="padding:14px 32px;background:#0F0F0F !important;">
              <div style="background:#0B0B0B;border:1px solid #2A2A2A;border-left:2px solid #C9A84C;padding:14px 16px;font-size:14px;color:#D4CFB6 !important;line-height:1.65;white-space:pre-wrap;word-break:break-word;">${escapeHtml(opts.snippet)}</div>
            </td></tr>
            <tr><td bgcolor="#0F0F0F" style="padding:18px 32px 22px;background:#0F0F0F !important;">
              <a href="${opts.openUrl}" style="display:inline-block;padding:12px 22px;background:#C9A84C !important;color:#0F0F0F !important;text-decoration:none !important;font-size:13px;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;border-radius:3px;">Open chat →</a>
            </td></tr>
            <tr><td bgcolor="#0F0F0F" style="padding:14px 32px 26px;background:#0F0F0F !important;border-top:1px solid #2A2A2A;color:#5C5750 !important;font-size:11px;line-height:1.6;text-align:center;">
              © 2026 Aragon Media · 1309 Coffeen Ave, Sheridan, WY 82801
            </td></tr>
          </table>
        </td></tr>
      </table>
    </body></html>`;

    const text = [
      "NEW CHAT MESSAGE",
      "",
      `${opts.fromLabel} replied (${opts.fromContext}):`,
      "",
      opts.snippet,
      "",
      `Open chat: ${opts.openUrl}`,
    ].join("\n");

    await resend.emails.send({
      from: FROM,
      to: [opts.to],
      subject,
      text,
      html,
    });
  } catch (err) {
    console.error("[email] sendChatNotificationEmail failed:", err);
  }
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
