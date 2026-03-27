import { AuditWorkbench } from "@/components/audits/audit-workbench";
import { AppShell } from "@/components/layout/app-shell";
import { requireManager } from "@/lib/auth/guards";

export default async function AuditsPage() {
  const user = await requireManager();

  return (
    <AppShell user={user} title="Audits">
      <AuditWorkbench />
    </AppShell>
  );
}
