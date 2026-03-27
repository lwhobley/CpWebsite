import { AppShell } from "@/components/layout/app-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { requireAdmin } from "@/lib/auth/guards";
import { mockPosStatus } from "@/lib/data/mock";

export default async function PosPage() {
  const user = await requireAdmin();

  return (
    <AppShell user={user} title="POS Sync">
      <div className="space-y-4">
        <Card>
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-[0.22em] text-[var(--muted)]">Toast primary · Square fallback</p>
              <h2 className="section-title mt-2 text-3xl">Adapter health</h2>
            </div>
            <Button>Sync now</Button>
          </div>
        </Card>
        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Current system</p>
              <p className="mt-1 text-sm text-[var(--muted)]">{mockPosStatus.system}</p>
            </div>
            <Badge tone="success">{mockPosStatus.status}</Badge>
          </div>
          <div className="mt-6 grid gap-3 md:grid-cols-3">
            <div className="rounded-[22px] border border-[var(--border)] bg-white p-4">
              <p className="text-xs uppercase tracking-[0.22em] text-[var(--muted)]">Last synced</p>
              <p className="mt-2 font-mono text-lg">{mockPosStatus.lastSynced}</p>
            </div>
            <div className="rounded-[22px] border border-[var(--border)] bg-white p-4">
              <p className="text-xs uppercase tracking-[0.22em] text-[var(--muted)]">Covers</p>
              <p className="mt-2 font-mono text-lg">{mockPosStatus.covers}</p>
            </div>
            <div className="rounded-[22px] border border-[var(--border)] bg-white p-4">
              <p className="text-xs uppercase tracking-[0.22em] text-[var(--muted)]">Check average</p>
              <p className="mt-2 font-mono text-lg">${mockPosStatus.checkAvg}</p>
            </div>
          </div>
        </Card>
      </div>
    </AppShell>
  );
}
