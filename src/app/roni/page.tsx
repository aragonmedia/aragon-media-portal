import { redirect } from "next/navigation";

// /roni = Roni's accelerator (ttsaccelerators.com/roni). Keeps the same
// backing code at /accelerator so both URLs work during the migration.
export default function RoniPage() {
  redirect("/accelerator");
}
