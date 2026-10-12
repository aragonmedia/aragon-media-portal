import PolicyChrome, { getBrand } from "../../_policy/PolicyChrome";
import PrivacyContent from "../../_policy/PrivacyContent";

export const metadata = {
  title: "Privacy Policy · TikTok Affiliate Accelerator",
  description: "What data we collect, how we use it, and your rights under the TikTok Affiliate Accelerator program.",
};

export default function RoniPrivacyPage() {
  return (
    <PolicyChrome brand={getBrand("roni")} title="Privacy Policy" lastUpdated="October 12, 2026">
      <PrivacyContent brand={getBrand("roni")} />
    </PolicyChrome>
  );
}
