"use client";

import { useEffect, useMemo, useState } from "react";
import { ComplianceRing } from "@/components/charts/compliance-ring";
import { VarianceBars } from "@/components/charts/variance-bars";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { mockAudits, mockCertifications, mockChecklistTasks, mockPosStatus } from "@/lib/data/mock";
import { AppUser, DashboardStat } from "@/lib/types";
import { formatCurrency, formatNumber, getGreeting } from "@/lib/utils";

function AnimatedValue({ value, prefix = "" }: { value: number; prefix?: string }) {
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    const start = performance.now();
    const duration = 800;
    let frame = 0;

    const tick = (time: number) => {
      const progress = Math.min((time - start) / duration, 1);
      setDisplay(Math.round(value * progress));
      if (progress < 1) frame = requestAnimationFrame(tick);
    };

    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [value]);

  return <span>{prefix}{formatNumber(display)}</span>;
}

export function DashboardOverview({ user }: { user: AppUser }) {
  const stats = useMemo<DashboardStat[]>(() => {
    if (user.role === "owner" || user.role === "gm") {
      return [
        { label: "Today's Covers", value: mockPosStatus.covers, delta: "+12% vs yesterday" },
        { label: "Check Average", value: mockPosStatus.checkAvg, delta: "Steady" },
        { label: "Open Checklist Tasks", value: mockChecklistTasks.filter((task) => !task.completed).length },
        { label: "Below Par Items", value: 2, tone: "alert" },
        { label: "Permits Expiring < 30d", value: 1, tone: "alert" },
        { label: "Certs Expiring < 30d", value: 1, tone: "alert" },
      ];
    }

    if (user.role === "manager") {
      return [
        { label: "Open Tasks", value: mockChecklistTasks.filter((task) => !task.completed).length },
        { label: "Inventory Flags", value: 2, tone: "alert" },
        { label: "Cert Alerts", value: 1, tone: "alert" },
      ];
    }

    return [
      { label: "My Open Tasks", value: mockChecklistTasks.filter((task) => task.role === user.role && !task.completed).length },
      { label: "Completed Today", value: mockChecklistTasks.filter((task) => task.role === user.role && task.completed).length, tone: "success" },
    ];
  }, [user.role]);

  return (
    <div className="space-y-6">
      <Card className="overflow-hidden">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.26em] text-[var(--muted)]">
              Good {getGreeting()}, {user.name.split(" ")[0]}
            </p>
            <h2 className="section-title mt-3 text-4xl">Operations at a glance</h2>
            <p className="mt-2 text-sm text-[var(--muted)]">
              Friday, March 27, 2026 with live status connected to your operations streams.
            </p>
          </div>
          <div className="flex items-center gap-3 rounded-full border border-[var(--border)] bg-white px-4 py-3">
            <span className="live-dot inline-flex h-3 w-3 rounded-full bg-[var(--alert-green)]" />
            <span className="text-xs uppercase tracking-[0.26em] text-[var(--muted)]">Live</span>
            <span className="font-mono text-sm text-[var(--foreground)]">5:24 PM</span>
          </div>
        </div>
      </Card>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {stats.map((stat) => (
          <Card key={stat.label}>
            <p className="text-xs uppercase tracking-[0.22em] text-[var(--muted)]">{stat.label}</p>
            <p className="mt-4 font-mono text-4xl text-[var(--foreground)]">
              {stat.label === "Check Average" ? (
                <AnimatedValue value={stat.value} prefix="$" />
              ) : (
                <AnimatedValue value={stat.value} />
              )}
            </p>
            {stat.delta ? <p className="mt-2 text-sm text-[var(--muted)]">{stat.delta}</p> : null}
          </Card>
        ))}
      </div>

      {(user.role === "owner" || user.role === "gm" || user.role === "manager") ? (
        <div className="grid gap-4 xl:grid-cols-[1.2fr_0.8fr]">
          <Card>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.22em] text-[var(--muted)]">Live Checklist Board</p>
                <h3 className="section-title mt-2 text-2xl">Shift readiness</h3>
              </div>
              <Badge tone="success">Realtime</Badge>
            </div>
            <div className="mt-5 overflow-x-auto">
              <table className="warm-table min-w-full text-left text-sm">
                <thead className="text-xs uppercase tracking-[0.2em] text-[var(--muted)]">
                  <tr>
                    <th className="pb-3">Checklist</th>
                    <th className="pb-3">Role</th>
                    <th className="pb-3">Task</th>
                    <th className="pb-3">Cutoff</th>
                    <th className="pb-3">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {mockChecklistTasks.map((task) => (
                    <tr key={task.id} className={!task.completed ? "flag-row" : undefined}>
                      <td className="py-3">{task.checklist}</td>
                      <td className="py-3 uppercase">{task.role}</td>
                      <td className="py-3">{task.task}</td>
                      <td className="py-3 font-mono">{task.cutoff}</td>
                      <td className="py-3">
                        <Badge tone={task.completed ? "success" : "alert"}>
                          {task.completed ? "done" : "open"}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>

          <div className="space-y-4">
            <Card>
              <p className="text-xs uppercase tracking-[0.22em] text-[var(--muted)]">Compliance Score</p>
              <ComplianceRing value={92} />
            </Card>
            <Card>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs uppercase tracking-[0.22em] text-[var(--muted)]">POS Sync Status</p>
                  <h3 className="section-title mt-2 text-2xl">Toast adapter</h3>
                </div>
                <Badge tone="success">{mockPosStatus.status}</Badge>
              </div>
              <p className="mt-4 text-sm text-[var(--muted)]">
                Last sync at 4:45 PM. Covers {formatNumber(mockPosStatus.covers)}. Check average{" "}
                {formatCurrency(mockPosStatus.checkAvg)}.
              </p>
            </Card>
          </div>
        </div>
      ) : (
        <Card>
          <p className="text-xs uppercase tracking-[0.22em] text-[var(--muted)]">My Shift Checklist</p>
          <div className="mt-4 space-y-3">
            {mockChecklistTasks
              .filter((task) => task.role === user.role)
              .map((task) => (
                <div key={task.id} className="rounded-[22px] border border-[var(--border)] bg-white px-4 py-4">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="font-medium">{task.task}</p>
                      <p className="mt-1 text-xs uppercase tracking-[0.2em] text-[var(--muted)]">
                        {task.checklist} · cutoff {task.cutoff}
                      </p>
                    </div>
                    <Badge tone={task.completed ? "success" : "alert"}>
                      {task.completed ? "done" : "open"}
                    </Badge>
                  </div>
                </div>
              ))}
          </div>
        </Card>
      )}

      {(user.role === "owner" || user.role === "gm") ? (
        <div className="grid gap-4 xl:grid-cols-[1fr_1fr]">
          <Card>
            <p className="text-xs uppercase tracking-[0.22em] text-[var(--muted)]">Inventory Variance</p>
            <h3 className="section-title mt-2 text-2xl">Last 7 days</h3>
            <VarianceBars />
          </Card>
          <Card>
            <p className="text-xs uppercase tracking-[0.22em] text-[var(--muted)]">Recent Audits</p>
            <div className="mt-4 space-y-3">
              {mockAudits.map((audit) => (
                <div key={audit.id} className="rounded-[22px] border border-[var(--border)] bg-white px-4 py-4">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="font-medium">{audit.title}</p>
                      <p className="mt-1 text-sm text-[var(--muted)]">{audit.aiNotes}</p>
                    </div>
                    <Badge tone={audit.score >= 90 ? "success" : "alert"}>{audit.score}%</Badge>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      ) : null}

      {(user.role === "owner" || user.role === "gm" || user.role === "manager") ? (
        <Card>
          <p className="text-xs uppercase tracking-[0.22em] text-[var(--muted)]">Certification Alerts</p>
          <div className="mt-4 grid gap-3 md:grid-cols-2">
            {mockCertifications.map((cert) => (
              <div key={cert.id} className="rounded-[22px] border border-[var(--border)] bg-white px-4 py-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">{cert.name}</p>
                    <p className="mt-1 text-sm text-[var(--muted)]">{cert.type}</p>
                  </div>
                  <Badge tone={cert.compliant ? "success" : "danger"}>
                    {cert.compliant ? "compliant" : "expiring"}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </Card>
      ) : null}
    </div>
  );
}
