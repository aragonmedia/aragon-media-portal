import { getCurrentUser } from "@/lib/auth/session";
import SettingsClient from "./SettingsClient";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const user = await getCurrentUser();
  if (!user) return null;

  return (
    <SettingsClient
      initial={{
        email: user.email,
        name: user.name,
        handle: user.handle ?? "",
        role: user.role,
        verifiedAt: user.verifiedAt ? new Date(user.verifiedAt).toLocaleDateString() : null,
        createdAt: new Date(user.createdAt).toLocaleDateString(),
        contractSignedAt: user.contractSignedAt
          ? new Date(user.contractSignedAt).toLocaleDateString()
          : null,
      }}
    />
  );
}
