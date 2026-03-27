import { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function Badge({
  children,
  tone = "default",
}: {
  children: ReactNode;
  tone?: "default" | "alert" | "success" | "danger";
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-3 py-1 text-xs font-medium uppercase tracking-[0.22em]",
        tone === "default" && "bg-[var(--green)]/10 text-[var(--green)]",
        tone === "alert" && "bg-[var(--alert-yellow)]/12 text-[var(--alert-yellow)]",
        tone === "success" && "bg-[var(--alert-green)]/12 text-[var(--alert-green)]",
        tone === "danger" && "bg-[var(--alert-red)]/12 text-[var(--alert-red)]",
      )}
    >
      {children}
    </span>
  );
}
