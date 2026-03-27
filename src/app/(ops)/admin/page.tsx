import { AppShell } from "@/components/layout/app-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { requireAdmin } from "@/lib/auth/guards";
import { mockUsers } from "@/lib/data/mock";

export default async function AdminPage() {
  const user = await requireAdmin();

  return (
    <AppShell user={user} title="Admin">
      <div className="space-y-4">
        <Card>
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-[0.22em] text-[var(--muted)]">Owner / GM controls</p>
              <h2 className="section-title mt-2 text-3xl">Staff access management</h2>
            </div>
            <Button>Create staff member</Button>
          </div>
        </Card>

        <div className="grid gap-4">
          {mockUsers.map((staff) => (
            <Card key={staff.id}>
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="font-medium">{staff.name}</p>
                  <p className="mt-1 text-xs uppercase tracking-[0.2em] text-[var(--muted)]">
                    {staff.role} · {staff.email ?? "PIN only"}
                  </p>
                </div>
                <Badge tone={staff.active ? "success" : "danger"}>
                  {staff.active ? "active" : "inactive"}
                </Badge>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </AppShell>
  );
}
