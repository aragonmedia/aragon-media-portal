"use client";

import { useState } from "react";

export default function AccountSupplierClient({
  discordInvite,
  referralCode,
}: {
  discordInvite: string;
  referralCode: string;
}) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(referralCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // fallback: select-text-only
    }
  }

  return (
    <section className="dash-card supplier-hero">
      <div className="supplier-hero-grid">
        <div className="supplier-hero-left">
          <div className="supplier-hero-eyebrow">Use this code at checkout</div>
          <div className="supplier-code-row">
            <code className="supplier-code">{referralCode}</code>
            <button type="button" onClick={copy} className="supplier-copy-btn">
              {copied ? "Copied ✓" : "Copy code"}
            </button>
          </div>
          <p className="supplier-hero-note">
            Mention or paste this code so the supplier ties your purchase to
            Aragon Media. Without it, we can&apos;t guarantee priority
            servicing.
          </p>
        </div>
        <div className="supplier-hero-right">
          <a
            href={discordInvite}
            target="_blank"
            rel="noreferrer"
            className="supplier-cta"
          >
            <span className="supplier-cta-icon" aria-hidden="true">
              ↗
            </span>
            <span>
              <span className="supplier-cta-label">Open supplier Discord</span>
              <span className="supplier-cta-sub">discord.gg invitation</span>
            </span>
          </a>
        </div>
      </div>
    </section>
  );
}
