import { isAdminSession } from "@/lib/auth/admin";
import AdminLogin from "./AdminLogin";
import AdminSidebar from "./AdminSidebar";
import "./admin.css";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const authed = await isAdminSession();
  if (!authed) {
    // Render the gate by itself — no sidebar, no chrome.
    return (
      <main className="admin-shell">
        <AdminLogin />
      </main>
    );
  }
  return (
    <div className="admin-frame">
      <AdminSidebar />
      <div className="admin-main">{children}</div>
    </div>
  );
}
