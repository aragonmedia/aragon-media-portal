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
    "",
    "Aragon Media",
    "1309 Coffeen Ave, Sheridan, WY 82801",
  ].join("\n");
}
