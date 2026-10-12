import PolicyChrome, { getBrand } from "../../_policy/PolicyChrome";
import TermsContent from "../../_policy/TermsContent";

export const metadata = {
  title: "Terms of Service · TTSUnlocked",
  description: "Enrollment terms, 7-Day Activation Guarantee, refund policy, and member obligations for the TTSUnlocked program.",
};

export default function ColtTermsPage() {
  return (
    <PolicyChrome brand={getBrand("colt")} title="Terms of Service" lastUpdated="October 12, 2026">
      <TermsContent brand={getBrand("colt")} prices={{ eduOnly: "$1,597", eduPlus: "$1,997", accountRefund: "$1,000" }} />
    </PolicyChrome>
  );
}
