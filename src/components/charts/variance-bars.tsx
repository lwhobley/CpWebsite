"use client";

import { Bar, BarChart, Cell, ResponsiveContainer, XAxis, YAxis, Tooltip } from "recharts";

const DATA = [
  { day: "Sat", variance: 6 },
  { day: "Sun", variance: 4 },
  { day: "Mon", variance: 8 },
  { day: "Tue", variance: 3 },
  { day: "Wed", variance: 7 },
  { day: "Thu", variance: 5 },
  { day: "Fri", variance: 9 },
];

export function VarianceBars() {
  return (
    <div className="h-64">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={DATA}>
          <XAxis dataKey="day" tickLine={false} axisLine={false} />
          <YAxis tickLine={false} axisLine={false} />
          <Tooltip />
          <Bar dataKey="variance" radius={[10, 10, 0, 0]}>
            {DATA.map((item) => (
              <Cell key={item.day} fill={item.variance > 7 ? "#C0392B" : "#C9A84C"} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
