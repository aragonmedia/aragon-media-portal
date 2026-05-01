/**
 * GET /api/agreement/[id]/pdf
 *
 * Generates a PDF copy of a signed Operations Agreement on demand.
 *
 * Auth:
 *   - Authed creator: can download their own signed agreement.
 *   - Authed admin (am_admin cookie): can download any agreement.
 *
 * Implementation: pdf-lib runs in Node serverless without any headless
 * browser dependency. ~150KB lib, no native deps, fits Vercel hobby.
 */

import { NextRequest } from "next/server";
import { eq } from "drizzle-orm";
import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import { db } from "@/db";
import { agreements, users } from "@/db/schema";
import { getCurrentUser } from "@/lib/auth/session";
import { isAdminSession } from "@/lib/auth/admin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type AgreementRow = {
  id: string;
  signature: string;
  contractVersion: string;
  signedAt: Date;
  userId: string;
  creatorEmail: string | null;
  creatorName: string | null;
};

async function fetchAgreement(id: string): Promise<AgreementRow | null> {
  const rows = await db
    .select({
      id: agreements.id,
      signature: agreements.signature,
      contractVersion: agreements.contractVersion,
      signedAt: agreements.signedAt,
      userId: agreements.userId,
      creatorEmail: users.email,
      creatorName: users.name,
    })
    .from(agreements)
    .leftJoin(users, eq(users.id, agreements.userId))
    .where(eq(agreements.id, id))
    .limit(1);
  return (rows[0] ?? null) as AgreementRow | null;
}

// Plain-text contract body. Match the on-screen v2.0.0 wording so the PDF
// is the same document the creator agreed to. (When CONTRACT_VERSION
// bumps, also update the matching block here.)
function contractBody(creatorName: string, version: string) {
  return [
    `Aragon Media Operations Agreement · ${version}`,
    `Effective from the date of signature below`,
    "",
    `This Operations Agreement (the "Agreement") is made between ${creatorName},`,
    `hereinafter referred to as "Content Creator", and Aragon Media,`,
    `hereinafter referred to as "Agency".`,
    "",
    "PURPOSE OF AGREEMENT",
    "",
    "1. The Agency agrees to provide the service of verifying the Content",
    "   Creator's TikTok Account. This Agreement is limited to verification",
    "   services only and does not establish any further obligations related",
    "   to brand partnerships or campaign management.",
    "",
    "2. This Agreement constitutes a single-service operational relationship",
    "   and is independent from any brand, affiliate, or creative campaign",
    "   arrangement.",
    "",
    "3. Enforceability of Rules: These terms are non-negotiable and enforced",
    "   uniformly. The Agency is not responsible for payment delays caused by",
    "   non-compliance.",
    "",
    "OPERATIONS TERMS AND SERVICE SCOPE",
    "",
    "4. The Agency will assist in the verification of the Content Creator's",
    "   TikTok Page using the necessary operational processes.",
    "",
    "5. Independent Contractor Status: The Content Creator acknowledges they",
    "   are engaging in this Agreement as an independent contractor, not as",
    "   an employee or representative of the Agency. Before completion of the",
    "   required verification process, a per-account verification fee is",
    "   collected — base rate of $100 per account · starting rate, subject to",
    "   change based on the Content Creator's selected tier and any active",
    "   promotional pricing at the time of purchase.",
    "",
    "6. Transaction Fee Deduction: The Agency will deduct a 20% fee from each",
    '   transaction originating from "TikTok" as compensation for operations',
    "   and banking services. This 20% fee shall be deemed all-inclusive,",
    "   meaning it incorporates and fully covers all applicable U.S. taxes,",
    "   regulatory obligations, and operational expenses related to such",
    "   transactions. The Content Creator shall not be subject to any",
    "   additional fees, deductions, or charges beyond the stated 20%",
    "   transaction fee.",
    "",
    "7. Proof of Fund Submission: The Content Creator must complete and",
    "   submit the designated Withdrawal Form inside the Aragon Media portal",
    "   within 48 hours of each TikTok withdrawal as proof of compliance and",
    "   fund verification.",
    "",
    "8. Grace Period Policy: If the required form is not submitted within 48",
    "   hours, the Agency reserves the right to retain the full value of the",
    "   associated transaction. This does not affect future withdrawals",
    "   assuming compliance continues.",
    "",
    "9. Service Re-Invite and Hold Policy: For the first sixty (60) days",
    "   after your account is verified, our team will send you a new TikTok",
    "   invitation to keep your service active. If the invitation is not",
    "   accepted, your operations and payouts will be placed on a temporary",
    "   service hold until you accept. This same re-invite process will",
    "   repeat once per year every (365) days to maintain compliance and",
    "   continued access to services.",
    "",
    "MUTUAL OPERATIONS ESTABLISHMENT",
    "",
    "10. This Agreement shall be governed by and construed in accordance",
    "    with the laws of the State of Wyoming, United States of America.",
    "",
    "11. Opt-Out Clause: The Content Creator may opt out of operational",
    "    services with written notice. Upon opting out, the Creator may use",
    "    their own credentials for verification. The Agency service fees",
    "    will cease to apply, but prior obligations remain agreed upon",
    "    between both parties.",
    "",
    "12. By signing this Agreement, the Content Creator acknowledges and",
    "    agrees to all the terms and conditions stated by the Agency herein,",
    "    ensuring full compliance with security, operational, and anti-fraud",
    "    measures. The Agreement is a mutual operating understanding that",
    "    establishes good business between both parties.",
    "",
    "IN WITNESS WHEREOF, the Content Creator acknowledges that they have",
    "read, understood, and agree to operate under the terms and conditions",
    "of this Operations Agreement.",
  ];
}

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const agreement = await fetchAgreement(id);
  if (!agreement) {
    return Response.json({ ok: false, error: "not_found" }, { status: 404 });
  }

  // Authorize: admin OR creator who owns the agreement.
  const adminAuthed = await isAdminSession();
  if (!adminAuthed) {
    const me = await getCurrentUser();
    if (!me || me.id !== agreement.userId) {
      return Response.json({ ok: false, error: "unauthorized" }, { status: 401 });
    }
  }

  const creatorName = agreement.creatorName ?? "the undersigned creator";

  // Build the PDF
  const pdf = await PDFDocument.create();
  const helv = await pdf.embedFont(StandardFonts.Helvetica);
  const helvBold = await pdf.embedFont(StandardFonts.HelveticaBold);
  const helvOblique = await pdf.embedFont(StandardFonts.HelveticaOblique);

  let page = pdf.addPage([612, 792]); // Letter
  const margin = 56;
  let y = 792 - margin;

  // Header brand
  page.drawText("ARAGON MEDIA", {
    x: margin,
    y,
    size: 12,
    font: helvBold,
    color: rgb(0.79, 0.66, 0.30),
  });
  y -= 14;
  page.drawText("Creator Partner Program", {
    x: margin,
    y,
    size: 8,
    font: helv,
    color: rgb(0.36, 0.35, 0.31),
  });
  y -= 28;

  // Title
  page.drawText("OPERATIONS AGREEMENT", {
    x: margin,
    y,
    size: 18,
    font: helvBold,
    color: rgb(0.06, 0.06, 0.06),
  });
  y -= 22;
  page.drawText(`Version ${agreement.contractVersion}`, {
    x: margin,
    y,
    size: 9,
    font: helv,
    color: rgb(0.36, 0.35, 0.31),
  });
  y -= 24;

  // Body
  const lines = contractBody(creatorName, agreement.contractVersion);
  for (const ln of lines) {
    if (y < margin + 120) {
      page = pdf.addPage([612, 792]);
      y = 792 - margin;
    }
    const isHeader =
      ln.startsWith("PURPOSE") ||
      ln.startsWith("OPERATIONS TERMS") ||
      ln.startsWith("MUTUAL OPERATIONS") ||
      ln.startsWith("IN WITNESS");
    page.drawText(ln, {
      x: margin,
      y,
      size: isHeader ? 10 : 9.5,
      font: isHeader ? helvBold : helv,
      color: rgb(0.13, 0.13, 0.13),
    });
    y -= isHeader ? 14 : 12;
  }

  // Signature block at the bottom of the LAST page
  if (y < margin + 110) {
    page = pdf.addPage([612, 792]);
    y = 792 - margin;
  }
  y -= 10;
  page.drawLine({
    start: { x: margin, y },
    end: { x: 612 - margin, y },
    thickness: 0.5,
    color: rgb(0.7, 0.7, 0.7),
  });
  y -= 24;

  // Two-column signature
  const colW = (612 - margin * 2 - 20) / 2;
  // Creator
  page.drawText("CONTENT CREATOR", {
    x: margin,
    y,
    size: 8,
    font: helvBold,
    color: rgb(0.36, 0.35, 0.31),
  });
  page.drawText(agreement.signature, {
    x: margin,
    y: y - 22,
    size: 16,
    font: helvOblique,
    color: rgb(0.06, 0.06, 0.06),
  });
  page.drawLine({
    start: { x: margin, y: y - 28 },
    end: { x: margin + colW, y: y - 28 },
    thickness: 0.5,
    color: rgb(0.4, 0.4, 0.4),
  });
  page.drawText(`${creatorName}`, {
    x: margin,
    y: y - 42,
    size: 8,
    font: helv,
    color: rgb(0.36, 0.35, 0.31),
  });
  page.drawText(
    `Signed ${new Date(agreement.signedAt).toLocaleString("en-US", {
      dateStyle: "long",
      timeStyle: "short",
    })}`,
    {
      x: margin,
      y: y - 54,
      size: 8,
      font: helv,
      color: rgb(0.36, 0.35, 0.31),
    }
  );

  // Agency
  const colX = margin + colW + 20;
  page.drawText("AGENCY · ARAGON MEDIA", {
    x: colX,
    y,
    size: 8,
    font: helvBold,
    color: rgb(0.36, 0.35, 0.31),
  });
  page.drawText("Kevin Aragon", {
    x: colX,
    y: y - 22,
    size: 16,
    font: helvOblique,
    color: rgb(0.79, 0.66, 0.30),
  });
  page.drawLine({
    start: { x: colX, y: y - 28 },
    end: { x: colX + colW, y: y - 28 },
    thickness: 0.5,
    color: rgb(0.4, 0.4, 0.4),
  });
  page.drawText("Aragon Media · Founder", {
    x: colX,
    y: y - 42,
    size: 8,
    font: helv,
    color: rgb(0.36, 0.35, 0.31),
  });
  page.drawText("1309 Coffeen Ave, Sheridan, WY 82801", {
    x: colX,
    y: y - 54,
    size: 8,
    font: helv,
    color: rgb(0.36, 0.35, 0.31),
  });

  // Footer audit line on every page
  const pages = pdf.getPages();
  pages.forEach((p, i) => {
    p.drawText(
      `Aragon Media Operations Agreement · ${agreement.contractVersion} · Agreement ID ${agreement.id} · Page ${i + 1} of ${pages.length}`,
      {
        x: margin,
        y: margin / 2,
        size: 7,
        font: helv,
        color: rgb(0.55, 0.55, 0.55),
      }
    );
  });

  const bytes = await pdf.save();
  const filename = `aragon-media-agreement-${(agreement.creatorName ?? "creator").replace(/\s+/g, "-").toLowerCase()}-${agreement.contractVersion}.pdf`;

  // Convert Uint8Array to a fresh ArrayBuffer to satisfy BodyInit typing.
  const ab = new ArrayBuffer(bytes.byteLength);
  new Uint8Array(ab).set(bytes);
  return new Response(ab, {
    status: 200,
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Cache-Control": "no-store",
    },
  });
}
