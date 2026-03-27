import { DashboardOverview } from "@/components/dashboard/dashboard-overview";
import { AppShell } from "@/components/layout/app-shell";
import { OfflineSync } from "@/components/pwa/offline-sync";
import { requireUser } from "@/lib/auth/guards";

export default async function DashboardPage() {
  const user = await requireUser();

  return (
    <AppShell user={user} title="Dashboard">
      <OfflineSync />
      <DashboardOverview user={user} />
    </AppShell>
  );
}
