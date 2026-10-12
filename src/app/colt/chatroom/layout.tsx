import "../../accounts/accelerator.css";
import "../colt.css";
import BodyTenantMarker from "../BodyTenantMarker";

export default function ColtChatroomLayout({ children }: { children: React.ReactNode }) {
  return <div data-theme="dark" className="colt-shell"><BodyTenantMarker />{children}</div>;
}
