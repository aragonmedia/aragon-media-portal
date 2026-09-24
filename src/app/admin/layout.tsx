import { getAdminRole } from "@/lib/auth/admin-role";
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
  const session = await getAdminRole();
  if (!session) {
    return (
      <main className="admin-shell">
        <AdminLogin />
      </main>
    );
  }
  return (
    <div className="admin-frame">
      <AdminSidebar role={session.role} />
      <div className="admin-main">{children}</div>
    </div>
  );
}
