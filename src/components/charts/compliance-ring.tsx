"use client";

import { Pie, PieChart, ResponsiveContainer, Cell } from "recharts";

export function ComplianceRing({ value }: { value: number }) {
  const data = [
    { name: "Pass", value },
    { name: "Remaining", value: 100 - value },
  ];

  return (
    <div className="relative h-52">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            innerRadius={56}
            outerRadius={76}
            stroke="none"
            dataKey="value"
            startAngle={90}
            endAngle={-270}
          >
            <Cell fill="#C9A84C" />
            <Cell fill="#E8DFC8" />
          </Pie>
        </PieChart>
      </ResponsiveContainer>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="font-mono text-4xl text-[var(--foreground)]">{value}%</span>
        <span className="mt-1 text-xs uppercase tracking-[0.22em] text-[var(--muted)]">
          Pass Rate
        </span>
      </div>
    </div>
  );
}
