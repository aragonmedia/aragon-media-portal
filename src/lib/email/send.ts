/**
 * Resend email client + branded verification-code template.
 *
 * Free-tier note: until a domain is verified at https://resend.com/domains,
 * the only working sender is `Aragon Media <onboarding@resend.dev>` and the
 * only deliverable destination is the email tied to the Resend account.
 * Once a domain is verified we'll swap MAIL_FROM to noreply@<domain>.
 *
 * IMPORTANT — LIGHT THEME (2026-05-02 Gmail-iOS fix):
 * Gmail's iOS app strips most <style> blocks from <head> and applies its
 * OWN light theme regardless of color-scheme metas, !important rules, or
 * @media queries. Multiple rounds of dark-lock CSS failed to defeat it,
 * so we flipped the strategy: build emails LIGHT themed in the first place
 * with inline-only colors. Same brand (gold accent + green for money),
 * just on white card / cream outer body. This renders consistently across
 * Apple Mail, Outlook, Gmail Web, AND Gmail iOS.
 *
 * Color palette (AAA contrast on white):
 *   - Outer body:    #F5F2EA  (warm cream)
 *   - Card surface:  #FFFFFF
 *   - Border:        #E8E2D2
 *   - Primary text:  #1A1A1A
 *   - Muted text:    #6B6B6B
 *   - Footer muted:  #8B8278
 *   - Gold accent:   #A8862E  (darkened from #C9A84C for white-bg contrast)
 *   - Green accent:  #0F7A3F  (darkened from #1F8B53 for white-bg contrast)
 *   - Code card bg:  #FFFBF0  (subtle warm tint)
 */

import { Resend } from "resend";

const FROM = "Aragon Media <onboarding@kevin-aragon.com>";
const PORTAL = "https://portal.kevin-aragon.com";

/**
 * Shared <head> snippet that signals LIGHT theme to all major mail clients.
 * Doesn't fight the client — works *with* its default light rendering.
 * Inline styles do all the actual color work; head is for hint metas only.
 */
const EMAIL_HEAD = `<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <meta name="color-scheme" content="light only" />
  <meta name="supported-color-schemes" content="light" />
  <meta http-equiv="X-UA-Compatible" content="IE=edge" />
  <style type="text/css">
    :root { color-scheme: light only; supported-color-schemes: light; }
    body { margin:0; padding:0; }
    a { color:#A8862E; text-decoration:none; }
  </style>
</head>`;


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

  // LIGHT theme — every color is inline so Gmail iOS can't strip it.
  return `<!doctype html>
<html lang="en">${EMAIL_HEAD}
<body bgcolor="#F5F2EA" style="margin:0;padding:0;background-color:#F5F2EA;font-family:'Inter Tight',Helvetica,Arial,sans-serif;color:#1A1A1A;-webkit-text-size-adjust:none;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" bgcolor="#F5F2EA" style="background:#F5F2EA;padding:32px 16px;">
    <tr>
      <td align="center" bgcolor="#F5F2EA" style="background:#F5F2EA;">
        <table role="presentation" width="560" cellspacing="0" cellpadding="0" border="0" bgcolor="#FFFFFF" style="max-width:560px;background-color:#FFFFFF;border:1px solid #E8E2D2;border-radius:14px;overflow:hidden;">
          <tr>
            <td bgcolor="#FFFFFF" style="padding:28px 32px 0 32px;background-color:#FFFFFF;">
              <table role="presentation" cellspacing="0" cellpadding="0" border="0">
                <tr>
                  <td bgcolor="#FFFBF0" style="background:#FFFBF0;border:1px solid #E8E2D2;border-radius:10px;width:48px;height:48px;text-align:center;font-family:'Inter Tight',Helvetica,Arial,sans-serif;font-weight:800;color:#A8862E;font-size:22px;letter-spacing:-1px;line-height:48px;">AM</td>
                  <td style="padding-left:14px;color:#1A1A1A;font-size:14px;font-weight:600;letter-spacing:0.06em;text-transform:uppercase;">Aragon Media</td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td bgcolor="#FFFFFF" style="padding:28px 32px 0 32px;background-color:#FFFFFF;">
              <h1 style="margin:0 0 6px 0;color:#1A1A1A;font-family:'Inter Tight',Helvetica,Arial,sans-serif;font-weight:700;font-size:26px;letter-spacing:-0.02em;line-height:1.15;">${heading}</h1>
              <p style="margin:0 0 22px 0;color:#6B6B6B;font-size:14px;line-height:1.55;">${greeting} ${purposeLine}</p>
            </td>
          </tr>
          <tr>
            <td bgcolor="#FFFFFF" style="padding:0 32px;background-color:#FFFFFF;">
              <div style="background:#FFFBF0;border:1px solid #A8862E;border-radius:10px;padding:22px 28px;text-align:center;">
                <div style="color:#6B6B6B;font-size:11px;letter-spacing:0.18em;text-transform:uppercase;margin-bottom:8px;">Your 6-digit code</div>
                <div style="color:#A8862E;font-family:'Inter Tight',Helvetica,Arial,sans-serif;font-weight:800;font-size:38px;letter-spacing:0.4em;">${code}</div>
                <div style="color:#6B6B6B;font-size:12px;margin-top:10px;">Expires in 15 minutes</div>
              </div>
            </td>
          </tr>
          <tr>
            <td bgcolor="#FFFFFF" style="padding:24px 32px 18px 32px;background-color:#FFFFFF;">
              <p style="margin:0;color:#6B6B6B;font-size:13px;line-height:1.6;">If you didn't request this, you can safely ignore this email. Your account stays untouched.</p>
            </td>
          </tr>
          <tr>
            <td bgcolor="#FFFFFF" style="padding:18px 32px;background:#FFFFFF;border-top:1px solid #E8E2D2;text-align:center;">
              <a href="${PORTAL}/signin" style="color:#A8862E;text-decoration:none;font-size:13px;font-weight:600;padding:0 14px;">Sign in</a>
              <span style="color:#C8C0AC;">·</span>
              <a href="${PORTAL}/signup" style="color:#A8862E;text-decoration:none;font-size:13px;font-weight:600;padding:0 14px;">Sign up</a>
              <span style="color:#C8C0AC;">·</span>
              <a href="${PORTAL}/book-a-demo" style="color:#A8862E;text-decoration:none;font-size:13px;font-weight:600;padding:0 14px;">Book a Demo</a>
              <span style="color:#C8C0AC;">·</span>
              <a href="${PORTAL}/privacy" style="color:#A8862E;text-decoration:none;font-size:13px;font-weight:600;padding:0 14px;">Privacy</a>
              <span style="color:#C8C0AC;">·</span>
              <a href="${PORTAL}/terms" style="color:#A8862E;text-decoration:none;font-size:13px;font-weight:600;padding:0 14px;">Terms</a>
            </td>
          </tr>
          <tr>
            <td bgcolor="#FFFFFF" style="padding:14px 32px 26px 32px;border-top:1px solid #E8E2D2;background:#FFFFFF;color:#8B8278;font-size:11px;line-height:1.6;text-align:center;">
              &copy; 2026 Aragon Media &middot; 1309 Coffeen Ave, Sheridan, WY 82801<br />
              Activation &middot; Dashboard &middot; TikTok Partner Program
            </td>
          </tr>
        </table>
        <p style="color:#8B8278;font-size:11px;margin-top:18px;">portal.kevin-aragon.com</p>
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
  agreementId?: string;   // when present, embed PDF download + admin view links
}) {
  try {
    const resend = getResend();
    const subject = `Operations Agreement signed — ${opts.creatorName}`;

    // Build authenticated portal URLs only if we have an agreement id.
    // Both endpoints require Kevin to be signed into the admin portal —
    // clicking from email kicks him to /admin/login first if needed.
    const pdfUrl = opts.agreementId
      ? `${PORTAL}/api/agreement/${opts.agreementId}/pdf`
      : null;
    const adminUrl = opts.agreementId
      ? `${PORTAL}/admin/agreements/${opts.agreementId}`
      : null;

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
      ...(pdfUrl
        ? [
            `Download signed PDF: ${pdfUrl}`,
            `View in admin:       ${adminUrl}`,
            "",
          ]
        : []),
      `Portal: ${PORTAL}/dashboard`,
    ].join("\n");

    const html = `<!DOCTYPE html><html>${EMAIL_HEAD}<body bgcolor="#F5F2EA" style="font-family:system-ui,sans-serif;background:#F5F2EA;color:#1A1A1A;padding:24px;line-height:1.6;margin:0;">
      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" bgcolor="#F5F2EA" style="background:#F5F2EA;">
        <tr><td align="center">
          <table role="presentation" width="560" cellspacing="0" cellpadding="0" border="0" bgcolor="#FFFFFF" style="max-width:560px;background:#FFFFFF;border:1px solid #E8E2D2;border-radius:12px;padding:24px 28px;">
            <tr><td bgcolor="#FFFFFF" style="background:#FFFFFF;">
              <h2 style="color:#A8862E;margin:0 0 16px 0;">Operations Agreement signed</h2>
              <table cellpadding="6" style="font-size:14px;color:#1A1A1A;">
                <tr><td><strong>Creator:</strong></td><td>${opts.creatorName}</td></tr>
                <tr><td><strong>Email:</strong></td><td>${opts.creatorEmail}</td></tr>
                <tr><td><strong>Signature:</strong></td><td>${opts.signature}</td></tr>
                <tr><td><strong>Version:</strong></td><td>${opts.contractVersion}</td></tr>
                <tr><td><strong>Signed at:</strong></td><td>${opts.signedAt.toISOString()}</td></tr>
              </table>
              <p style="font-size:13px;color:#6B6B6B;margin-top:18px;margin-bottom:18px;">
                Their withdrawal form is now unlocked. Standby for their first submission.
              </p>
              ${
                pdfUrl
                  ? `<table cellpadding="0" cellspacing="0" border="0" style="margin:6px 0 14px 0;">
                <tr>
                  <td style="padding-right:8px;">
                    <a href="${pdfUrl}" style="display:inline-block;padding:11px 18px;background:#A8862E;color:#FFFFFF;text-decoration:none;font-size:13px;font-weight:700;letter-spacing:0.06em;text-transform:uppercase;border-radius:6px;">Download PDF</a>
                  </td>
                  <td>
                    <a href="${adminUrl}" style="display:inline-block;padding:11px 18px;background:transparent;color:#A8862E;text-decoration:none;font-size:13px;font-weight:700;letter-spacing:0.06em;text-transform:uppercase;border:1px solid #A8862E;border-radius:6px;">View in admin →</a>
                  </td>
                </tr>
              </table>
              <p style="font-size:11px;color:#8B8278;margin:0 0 4px 0;">Both links require admin sign-in.</p>`
                  : ""
              }
              <p style="font-size:12px;color:#8B8278;margin-top:14px;">${PORTAL}/dashboard</p>
            </td></tr>
          </table>
        </td></tr>
      </table>
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

    const html = `<!DOCTYPE html><html>${EMAIL_HEAD}
    <body bgcolor="#F5F2EA" style="margin:0;padding:0;background:#F5F2EA;color:#1A1A1A;font-family:system-ui,-apple-system,'Inter Tight',sans-serif;">
      <table role="presentation" width="100%" bgcolor="#F5F2EA" style="background:#F5F2EA;">
        <tr><td align="center" style="padding:32px 18px;">
          <table role="presentation" width="600" bgcolor="#FFFFFF" style="background:#FFFFFF;border:1px solid #E8E2D2;border-radius:12px;max-width:600px;width:100%;">

            <tr><td bgcolor="#FFFFFF" style="padding:30px 32px 14px;background:#FFFFFF;">
              <p style="margin:0 0 6px 0;font-size:11px;letter-spacing:0.2em;color:#0F7A3F;text-transform:uppercase;font-weight:700;">Withdrawal Paid</p>
              <h1 style="margin:0;font-size:24px;line-height:1.2;color:#1A1A1A;letter-spacing:-0.02em;">Hey ${greeting} — your money is on the way.</h1>
            </td></tr>

            <tr><td bgcolor="#FFFFFF" style="padding:14px 32px 8px;background:#FFFFFF;">
              <p style="margin:0;color:#3A3A3A;font-size:14px;line-height:1.7;">Receipt <strong style="color:#A8862E;">${opts.receiptNumber}</strong> just cleared. The amount below has been sent to the payout method on file. Depending on your bank or wallet, it should land within minutes (instant rails) to a few business days (ACH/wire).</p>
            </td></tr>

            <!-- Headline amount frame -->
            <tr><td bgcolor="#FFFFFF" style="padding:18px 32px 8px;background:#FFFFFF;">
              <table role="presentation" width="100%" bgcolor="#F1FBF4" style="background:#F1FBF4;border:1px solid #0F7A3F;border-radius:8px;">
                <tr><td bgcolor="#F1FBF4" style="padding:24px 28px;background:#F1FBF4;text-align:left;">
                  <div style="font-size:11px;letter-spacing:0.18em;color:#0F7A3F;text-transform:uppercase;font-weight:700;margin-bottom:8px;">Sent to your bank</div>
                  <div style="font-family:'Inter Tight',sans-serif;font-size:42px;font-weight:800;color:#0F7A3F;letter-spacing:-0.02em;line-height:1;">${fmtUsd(opts.netCents)}</div>
                  <div style="font-size:12px;color:#6B6B6B;margin-top:10px;letter-spacing:0.04em;">Receipt ${opts.receiptNumber}</div>
                </td></tr>
              </table>
            </td></tr>

            <tr><td bgcolor="#FFFFFF" style="padding:18px 32px 22px;background:#FFFFFF;">
              <a href="${PORTAL}/dashboard/withdrawals" style="display:inline-block;padding:12px 22px;background:#0F7A3F;color:#FFFFFF;text-decoration:none;font-size:13px;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;border-radius:4px;">View receipt →</a>
            </td></tr>

            <tr><td bgcolor="#FFFFFF" style="padding:18px 32px;background:#FFFFFF;border-top:1px solid #E8E2D2;text-align:center;">
              <a href="${PORTAL}/dashboard" style="color:#A8862E;text-decoration:none;font-size:13px;font-weight:600;padding:0 14px;">Dashboard</a>
              <span style="color:#C8C0AC;">·</span>
              <a href="${PORTAL}/dashboard/chat" style="color:#A8862E;text-decoration:none;font-size:13px;font-weight:600;padding:0 14px;">Chat with AM</a>
            </td></tr>
            <tr><td bgcolor="#FFFFFF" style="padding:14px 32px 26px;background:#FFFFFF;border-top:1px solid #E8E2D2;color:#8B8278;font-size:11px;line-height:1.6;text-align:center;">
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
      "",
      `View receipt: ${PORTAL}/dashboard/withdrawals`,
      `Chat with AM: ${PORTAL}/dashboard/chat`,
      "",
      "Aragon Media · 1309 Coffeen Ave, Sheridan, WY 82801",
    ].join("\n");

    const result = await resend.emails.send({
      from: FROM,
      to: [opts.to],
      bcc: ["aragonkevin239@gmail.com"],
      subject,
      text,
      html,
    });
    // Resend returns { data, error } rather than throwing — surface
    // a rejection (rate limit, deliverability, sender domain, etc.) so
    // it shows up in Vercel logs and the route can mark emailSent: false
    // instead of falsely reporting success to the admin.
    if (result?.error) {
      console.error(
        "[email] sendWithdrawalPaidEmail Resend rejected:",
        result.error.name ?? "Error",
        result.error.message ?? String(result.error),
        "to:", opts.to
      );
      throw new Error(
        `Resend rejected: ${result.error.message ?? result.error.name ?? "unknown"}`
      );
    }
  } catch (err) {
    console.error("[email] sendWithdrawalPaidEmail failed:", err);
    throw err;  // re-throw so the route's try/catch sets emailSent=false
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

    const html = `<!DOCTYPE html><html>${EMAIL_HEAD}
    <body bgcolor="#F5F2EA" style="margin:0;padding:0;background:#F5F2EA;color:#1A1A1A;font-family:system-ui,-apple-system,'Inter Tight',sans-serif;">
      <table role="presentation" width="100%" bgcolor="#F5F2EA" style="background:#F5F2EA;">
        <tr><td align="center" style="padding:32px 18px;">
          <table role="presentation" width="600" bgcolor="#FFFFFF" style="background:#FFFFFF;border:1px solid #E8E2D2;border-radius:12px;max-width:600px;width:100%;">
            <tr><td bgcolor="#FFFFFF" style="padding:30px 32px 14px;background:#FFFFFF;">
              <p style="margin:0 0 6px 0;font-size:11px;letter-spacing:0.2em;color:#A8862E;text-transform:uppercase;font-weight:700;">New chat message</p>
              <h1 style="margin:0;font-size:22px;line-height:1.25;color:#1A1A1A;letter-spacing:-0.01em;">${opts.fromLabel} replied</h1>
              <p style="margin:6px 0 0;font-size:12px;color:#6B6B6B;">${opts.fromContext}</p>
            </td></tr>
            <tr><td bgcolor="#FFFFFF" style="padding:14px 32px;background:#FFFFFF;">
              <div style="background:#FFFBF0;border:1px solid #E8E2D2;border-left:3px solid #A8862E;padding:14px 16px;font-size:14px;color:#1A1A1A;line-height:1.65;white-space:pre-wrap;word-break:break-word;border-radius:4px;">${escapeHtml(opts.snippet)}</div>
            </td></tr>
            <tr><td bgcolor="#FFFFFF" style="padding:18px 32px 22px;background:#FFFFFF;">
              <a href="${opts.openUrl}" style="display:inline-block;padding:12px 22px;background:#A8862E;color:#FFFFFF;text-decoration:none;font-size:13px;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;border-radius:4px;">Open chat →</a>
            </td></tr>
            <tr><td bgcolor="#FFFFFF" style="padding:14px 32px 26px;background:#FFFFFF;border-top:1px solid #E8E2D2;color:#8B8278;font-size:11px;line-height:1.6;text-align:center;">
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
