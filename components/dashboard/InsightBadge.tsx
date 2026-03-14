import { cn } from "@/lib/utils/cn";

interface InsightBadgeProps {
  label: string;
  variant?: "high" | "medium" | "low" | "info";
  className?: string;
}

/**
 * Compact badge for insight severity.
 */
export function InsightBadge({ label, variant = "info", className }: InsightBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-medium",
        variant === "high" && "badge-high",
        variant === "medium" && "badge-medium",
        variant === "low" && "badge-low",
        variant === "info" && "badge-info",
        className,
      )}
    >
      {label}
    </span>
  );
}