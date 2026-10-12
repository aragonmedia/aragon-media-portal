import PolicyChrome, { getBrand } from "../../_policy/PolicyChrome";
import TermsContent from "../../_policy/TermsContent";

export const metadata = {
  title: "Terms of Service · TikTok Affiliate Accelerator",
  description: "Enrollment terms, 7-Day Activation Guarantee, refund policy, and member obligations for the TikTok Affiliate Accelerator program.",
};

export default function RoniTermsPage() {
  return (
    <PolicyChrome brand={getBrand("roni")} title="Terms of Service" lastUpdated="October 12, 2026">
      <TermsContent brand={getBrand("roni")} prices={{ eduOnly: "$997", eduPlus: "$1,997", accountRefund: "$1,000" }} />
    </PolicyChrome>
  );
}
