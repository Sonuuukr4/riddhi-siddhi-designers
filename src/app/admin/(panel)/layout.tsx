import type { ReactNode } from "react";
import { AdminShell } from "@/components/admin/AdminShell";
import { requireAdminPage } from "@/lib/auth/session";

/** Every page inside (panel) requires a verified admin session. */
export default async function PanelLayout({ children }: { children: ReactNode }) {
  const session = await requireAdminPage();
  return (
    <AdminShell email={session.email} mode={session.mode}>
      {children}
    </AdminShell>
  );
}
