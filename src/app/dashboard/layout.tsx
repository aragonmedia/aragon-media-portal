import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/session";
import Sidebar from "./Sidebar";
import "./dashboard.css";

export const dynamic = "force-dynamic";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();
  if (!user) redirect("/signin");

  return (
    <div className="dash-shell">
      <Sidebar
        userName={user.name}
        userEmail={user.email}
        userRole={user.role}
        isAdmin={user.isAdmin}
      />
      <div className="dash-main">{children}</div>
    </div>
  );
}
