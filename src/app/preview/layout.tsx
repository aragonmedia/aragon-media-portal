import "../dashboard/dashboard.css";

export default function PreviewLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Standalone shell that mirrors .dash-main's padding so /preview/* pages
  // (which render <main className="dash-content">) get the same breathing
  // room they have inside the real dashboard layout. Background uses the
  // theme tokens so dark/light mode still apply.
  return (
    <div
      style={{
        minHeight: "100vh",
        background: "var(--bg)",
        color: "var(--text)",
        fontFamily: "'Inter Tight', Helvetica, Arial, sans-serif",
      }}
    >
      <div className="dash-main">{children}</div>
    </div>
  );
}
