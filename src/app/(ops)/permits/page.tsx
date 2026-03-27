import { AppShell } from "@/components/layout/app-shell";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { requireManager } from "@/lib/auth/guards";
import { mockPermits } from "@/lib/data/mock";

export default async function PermitsPage() {
  const user = await requireManager();

  return (
    <AppShell user={user} title="Permits">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {mockPermits.map((permit) => (
          <Card key={permit.id}>
            <p className="text-xs uppercase tracking-[0.22em] text-[var(--muted)]">{permit.type}</p>
            <h2 className="section-title mt-2 text-2xl">{permit.name}</h2>
            <p className="mt-3 text-sm text-[var(--muted)]">Expires {permit.expiresAt}</p>
            <div className="mt-4">
              <Badge
                tone={
                  permit.status === "green"
                    ? "success"
                    : permit.status === "yellow"
                      ? "alert"
                      : "danger"
                }
              >
                {permit.status}
              </Badge>
            </div>
            <p className="mt-4 text-sm text-[var(--muted)]">
              Reminder thresholds are configured at 90, 60, and 30 days with upload support for permits-docs.
            </p>
          </Card>
        ))}
      </div>
    </AppShell>
  );
}
