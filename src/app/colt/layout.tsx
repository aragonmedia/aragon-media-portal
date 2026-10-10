import "../accounts/accelerator.css";
import "./colt.css";

export default function ColtLayout({ children }: { children: React.ReactNode }) {
  return <div data-theme="dark">{children}</div>;
}
