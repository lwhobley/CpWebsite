"use client";

import { ButtonHTMLAttributes, forwardRef } from "react";
import { cn } from "@/lib/utils";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "outline" | "ghost" | "danger";
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", ...props }, ref) => (
    <button
      ref={ref}
      className={cn(
        "inline-flex items-center justify-center rounded-full border px-4 py-2 text-sm uppercase tracking-[0.24em] transition-transform duration-200 hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60",
        variant === "primary" &&
          "border-gold bg-gold text-green shadow-[0_10px_30px_rgba(201,168,76,0.25)]",
        variant === "outline" &&
          "border-[var(--gold)] bg-transparent text-[var(--surface)]",
        variant === "ghost" &&
          "border-transparent bg-white/70 text-[var(--green)]",
        variant === "danger" &&
          "border-[var(--alert-red)] bg-[var(--alert-red)] text-white",
        className,
      )}
      {...props}
    />
  ),
);

Button.displayName = "Button";
