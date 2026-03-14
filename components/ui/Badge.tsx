import * as React from "react";
import { cn } from "@/lib/utils/cn";

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: "high" | "medium" | "low" | "info" | "neutral";
}

const variantClasses: Record<NonNullable<BadgeProps["variant"]>, string> = {
  high: "badge-high",
  medium: "badge-medium",
  low: "badge-low",
  info: "badge-info",
  neutral: "bg-slate-100 text-slate-600 border border-slate-200 dark:bg-white/5 dark:text-slate-300 dark:border-white/10",
};

/**
 * Badge component for status and severity labels.
 */
export const Badge = React.forwardRef<HTMLSpanElement, BadgeProps>(
  ({ className, variant = "neutral", ...props }, ref) => (
    <span
      ref={ref}
      className={cn(
        "inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-medium",
        variantClasses[variant],
        className,
      )}
      {...props}
    />
  ),
);

Badge.displayName = "Badge";