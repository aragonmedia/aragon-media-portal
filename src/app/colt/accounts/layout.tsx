import "../../accounts/accelerator.css";
import "../colt.css";
import BodyTenantMarker from "../BodyTenantMarker";

export default function ColtAccountsLayout({ children }: { children: React.ReactNode }) {
  return <div data-theme="dark" className="colt-shell"><BodyTenantMarker />{children}</div>;
}
