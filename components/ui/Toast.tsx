"use client";

import * as React from "react";
import { cn } from "@/lib/utils/cn";

export interface ToastProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "success" | "error" | "info";
}

const variantClasses: Record<NonNullable<ToastProps["variant"]>, string> = {
  success: "border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-200",
  error: "border-red-500/30 bg-red-500/10 text-red-700 dark:text-red-200",
  info: "border-cyan-500/30 bg-cyan-500/10 text-cyan-700 dark:text-cyan-200",
};

/**
 * Inline toast container for feedback messages.
 */
export const Toast = React.forwardRef<HTMLDivElement, ToastProps>(
  ({ className, variant = "info", ...props }, ref) => (
    <div
      ref={ref}
      role="status"
      className={cn(
        "glass-card flex items-center gap-2 border px-4 py-3 text-sm",
        "text-slate-900 dark:text-white",
        variantClasses[variant],
        className,
      )}
      {...props}
    />
  ),
);

Toast.displayName = "Toast";
