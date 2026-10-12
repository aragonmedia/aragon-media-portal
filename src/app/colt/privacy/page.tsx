import PolicyChrome, { getBrand } from "../../_policy/PolicyChrome";
import PrivacyContent from "../../_policy/PrivacyContent";

export const metadata = {
  title: "Privacy Policy · TTSUnlocked",
  description: "What data we collect, how we use it, and your rights under the TTSUnlocked program.",
};

export default function ColtPrivacyPage() {
  return (
    <PolicyChrome brand={getBrand("colt")} title="Privacy Policy" lastUpdated="October 12, 2026">
      <PrivacyContent brand={getBrand("colt")} />
    </PolicyChrome>
  );
}
