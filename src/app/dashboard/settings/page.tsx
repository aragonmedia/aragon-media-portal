import { getCurrentUser } from "@/lib/auth/session";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const user = await getCurrentUser();
  if (!user) return null;

  const fmt = (d: Date | string | null | undefined) =>
    d ? new Date(d).toLocaleString("en-US", { dateStyle: "medium", timeStyle: "short" }) : "—";

  return (
    <main className="dash-content">
      <header className="dash-page-head">
        <div>
          <p className="dash-eyebrow">Settings</p>
          <h1>Your profile</h1>
          <p className="dash-page-sub">The info Aragon Media has on file. Editing comes online once we wire the profile API in the next phase.</p>
        </div>
      </header>

      <div className="dash-card">
        <ul className="dash-summary-list">
          <li><span>Name</span><strong>{user.name}</strong></li>
          <li><span>Email</span><strong className="mono">{user.email}</strong></li>
          <li><span>Role</span><strong><span className={`role-pill role-${user.role}`}>{user.role}</span></strong></li>
          <li><span>Handle</span><strong className="mono">{user.handle ?? "—"}</strong></li>
          <li><span>Account created</span><strong className="dim">{fmt(user.createdAt)}</strong></li>
          <li><span>Email verified</span><strong className={user.verifiedAt ? "ok" : "muted"}>{user.verifiedAt ? fmt(user.verifiedAt) : "Not yet"}</strong></li>
          <li><span>Contract signed</span><strong className={user.contractSignedAt ? "ok" : "muted"}>{user.contractSignedAt ? `${fmt(user.contractSignedAt)} (${user.contractVersion ?? "v?"})` : "Pending first activation"}</strong></li>
        </ul>
      </div>
    </main>
  );
}
