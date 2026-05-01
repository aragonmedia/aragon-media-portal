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

  return getResend().emails.send({
    from: FROM,
    to: [opts.to],
    subject,
    html,
    text,
  });
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
 * Status-change email to the creator when the AM team flips a withdrawal
 * receipt's state. Status-specific subject + headline + body. Same dark-only
 * template as the verification email.
 *
 * BCC's aragonkevin239@gmail.com so the AM team has a paper trail.
 */
type WStatus = "requested" | "approved" | "paid" | "rejected" | "late_retained";

function fmtUsd(cents: number): string {
  return `$${(cents / 100).toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

function statusCopy(status: WStatus, receiptNumber: string, netCents: number) {
  switch (status) {
    case "paid":
      return {
        subject: `${receiptNumber} · Paid · ${fmtUsd(netCents)} sent`,
        eyebrow: "Withdrawal Paid",
        headline: "Your money is on the way",
        body: `We just processed receipt <strong>${receiptNumber}</strong>. <strong>${fmtUsd(
          netCents
        )}</strong> has been sent to the payout method on file. Depending on your bank or wallet, it should land within minutes (instant rails) to a few business days (ACH/wire).`,
        accent: "#1F8B53",
      };
    case "approved":
      return {
        subject: `${receiptNumber} · Approved`,
        eyebrow: "Withdrawal Approved",
        headline: "Your receipt is approved",
        body: `Receipt <strong>${receiptNumber}</strong> for <strong>${fmtUsd(
          netCents
        )}</strong> has been approved by the AM team and is queued for payout. We process payouts Monday through Friday — you'll get a second email the moment it's sent.`,
        accent: "#C9A84C",
      };
    case "rejected":
      return {
        subject: `${receiptNumber} · Action needed`,
        eyebrow: "Withdrawal Rejected",
        headline: "Your receipt couldn't be processed",
        body: `Receipt <strong>${receiptNumber}</strong> for <strong>${fmtUsd(
          netCents
        )}</strong> was rejected. Open a chat with the AM team to find out what's missing — usually a clearer screenshot or corrected payout details.`,
        accent: "#C74F4F",
      };
    case "late_retained":
      return {
        subject: `${receiptNumber} · Late · retained per Grace Period`,
        eyebrow: "Grace Period Policy",
        headline: "This receipt was submitted late",
        body: `Receipt <strong>${receiptNumber}</strong> for <strong>${fmtUsd(
          netCents
        )}</strong> was submitted more than 48 hours after the TikTok-side withdrawal. Per the Grace Period Policy in your Operations Agreement, the Agency has retained the value of this transaction. Future on-time submissions are unaffected.`,
        accent: "#C74F4F",
      };
    default:
      return {
        subject: `${receiptNumber} · Pending review`,
        eyebrow: "Withdrawal Pending",
        headline: "Your receipt is back in the queue",
        body: `Receipt <strong>${receiptNumber}</strong> for <strong>${fmtUsd(
          netCents
        )}</strong> is now Pending review. The AM team will action it shortly.`,
        accent: "#C9A84C",
      };
  }
}

function withdrawalStatusHtml(args: {
  eyebrow: string;
  headline: string;
  body: string;
  accent: string;
  receiptNumber: string;
}) {
  return `<!DOCTYPE html><html><head>
  <meta name="color-scheme" content="dark only">
  <meta name="supported-color-schemes" content="dark">
</head>
<body style="margin:0;padding:0;background:#0F0F0F !important;color:#FAF7EE !important;font-family:system-ui,-apple-system,'Inter Tight',sans-serif;">
  <table role="presentation" width="100%" bgcolor="#0F0F0F" style="background:#0F0F0F !important;">
    <tr><td align="center" style="padding:32px 18px;">
      <table role="presentation" width="600" bgcolor="#0F0F0F" style="background:#0F0F0F !important;border:1px solid #2A2A2A;max-width:600px;width:100%;">
        <tr><td bgcolor="#0F0F0F" style="padding:30px 32px 12px;background:#0F0F0F !important;">
          <p style="margin:0 0 6px 0;font-size:11px;letter-spacing:0.18em;color:${args.accent} !important;text-transform:uppercase;font-weight:700;">${args.eyebrow}</p>
          <h1 style="margin:0;font-size:24px;line-height:1.2;color:#FAF7EE !important;letter-spacing:-0.02em;">${args.headline}</h1>
        </td></tr>
        <tr><td bgcolor="#0F0F0F" style="padding:14px 32px 22px;background:#0F0F0F !important;">
          <p style="margin:0;color:#D4CFB6 !important;font-size:14px;line-height:1.7;">${args.body}</p>
        </td></tr>
        <tr><td bgcolor="#0F0F0F" style="padding:0 32px 22px;background:#0F0F0F !important;">
          <a href="${PORTAL}/dashboard/withdrawals" style="display:inline-block;padding:12px 22px;background:${args.accent} !important;color:#0F0F0F !important;text-decoration:none !important;font-size:13px;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;border-radius:3px;">View ${args.receiptNumber} →</a>
        </td></tr>
        <tr><td bgcolor="#0F0F0F" style="padding:18px 32px;background:#0F0F0F !important;border-top:1px solid #2A2A2A;text-align:center;">
          <a href="${PORTAL}/dashboard" style="color:#C9A84C !important;text-decoration:none !important;font-size:13px;font-weight:600;padding:0 14px;">Dashboard</a>
          <span style="color:#5C5750;">·</span>
          <a href="${PORTAL}/dashboard/chat" style="color:#C9A84C !important;text-decoration:none !important;font-size:13px;font-weight:600;padding:0 14px;">Chat with AM</a>
        </td></tr>
        <tr><td bgcolor="#0F0F0F" style="padding:14px 32px 26px;background:#0F0F0F !important;border-top:1px solid #2A2A2A;color:#5C5750 !important;font-size:11px;line-height:1.6;text-align:center;">
          &copy; 2026 Aragon Media &middot; 1309 Coffeen Ave, Sheridan, WY 82801
        </td></tr>
      </table>
    </td></tr>
  </table>
</body></html>`;
}

export async function sendWithdrawalStatusEmail(opts: {
  to: string;
  creatorName: string;
  receiptNumber: string;
  status: WStatus;
  netCents: number;
  grossCents: number;
}) {
  try {
    const resend = getResend();
    const copy = statusCopy(opts.status, opts.receiptNumber, opts.netCents);
    const html = withdrawalStatusHtml({
      eyebrow: copy.eyebrow,
      headline: copy.headline,
      body: copy.body,
      accent: copy.accent,
      receiptNumber: opts.receiptNumber,
    });
    const text = [
      copy.eyebrow.toUpperCase(),
      "",
      `${opts.creatorName},`,
      "",
      copy.body.replace(/<[^>]+>/g, ""),
      "",
      `Receipt:  ${opts.receiptNumber}`,
      `Net:      ${fmtUsd(opts.netCents)}`,
      `Gross:    ${fmtUsd(opts.grossCents)}`,
      "",
      `Open the receipt: ${PORTAL}/dashboard/withdrawals`,
      `Chat with AM:     ${PORTAL}/dashboard/chat`,
      "",
      "Aragon Media · 1309 Coffeen Ave, Sheridan, WY 82801",
    ].join("\n");
    await resend.emails.send({
      from: FROM,
      to: [opts.to],
      bcc: ["aragonkevin239@gmail.com"],
      subject: copy.subject,
      text,
      html,
    });
  } catch (err) {
    console.error("[email] sendWithdrawalStatusEmail failed:", err);
  }
}
