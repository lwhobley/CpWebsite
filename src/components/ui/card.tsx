import { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function Card({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "glass-panel rounded-[28px] border border-[var(--border)] bg-[var(--surface)]/90 p-5",
        className,
      )}
    >
      {children}
    </div>
  );
}
