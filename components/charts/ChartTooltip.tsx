"use client";

import { cn } from "@/lib/utils/cn";
import { fmt } from "@/lib/utils/formatters";

interface ChartTooltipProps {
  active?: boolean;
  payload?: Array<{ name?: string; value?: number } | undefined>;
  label?: string | number;
}

/**
 * Recharts tooltip with glass styling.
 */
export function ChartTooltip({ active, payload, label }: ChartTooltipProps) {
  if (!active || !payload || payload.length === 0) return null;

  const item = payload[0];
  const value = item?.value;

  return (
    <div className={cn("glass-card border border-slate-200 dark:border-white/10 px-3 py-2 text-xs")}> 
      {label !== undefined && (
        <p className="text-slate-600 dark:text-slate-400">{label}</p>
      )}
      {value !== undefined && (
        <p className="text-sm font-semibold text-slate-900 dark:text-white">{fmt(Number(value))}</p>
      )}
    </div>
  );
}
