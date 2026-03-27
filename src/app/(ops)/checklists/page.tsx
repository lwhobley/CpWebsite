import { AppShell } from "@/components/layout/app-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { requireUser } from "@/lib/auth/guards";
import { mockChecklistTasks } from "@/lib/data/mock";

export default async function ChecklistsPage() {
  const user = await requireUser();
  const tasks = mockChecklistTasks.filter(
    (task) =>
      user.role === "owner" ||
      user.role === "gm" ||
      user.role === "manager" ||
      task.role === user.role,
  );

  return (
    <AppShell user={user} title="Checklists">
      <div className="space-y-4">
        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.22em] text-[var(--muted)]">Opening and closing workflows</p>
              <h2 className="section-title mt-2 text-3xl">Live checklist execution</h2>
            </div>
            <Badge tone="success">Realtime enabled</Badge>
          </div>
        </Card>

        <div className="grid gap-4">
          {tasks.map((task) => (
            <Card key={task.id}>
              <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                  <p className="text-xs uppercase tracking-[0.22em] text-[var(--muted)]">
                    {task.checklist} · {task.role}
                  </p>
                  <h3 className="mt-2 text-xl font-medium">{task.task}</h3>
                  <p className="mt-2 text-sm text-[var(--muted)]">
                    Cutoff {task.cutoff}. Optional evidence capture uses checklist-photos storage when configured.
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <Badge tone={task.completed ? "success" : "alert"}>
                    {task.completed ? "completed" : "incomplete"}
                  </Badge>
                  <Button variant="ghost">Mark complete</Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </AppShell>
  );
}
