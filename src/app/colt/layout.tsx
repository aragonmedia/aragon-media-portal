import "../accounts/accelerator.css";
import "./colt.css";
import BodyTenantMarker from "./BodyTenantMarker";

export default function ColtLayout({ children }: { children: React.ReactNode }) {
  return <div data-theme="dark"><BodyTenantMarker />{children}</div>;
}
