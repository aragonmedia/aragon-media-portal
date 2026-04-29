"use client";

export default function AdminLogout() {
  async function logout() {
    await fetch("/api/admin/logout", { method: "POST" });
    window.location.reload();
  }
  return (
    <button onClick={logout} className="admin-logout">
      Sign out
    </button>
  );
}
