import { ArrowDownRight, ArrowUpRight } from "lucide-react";
import { cn } from "@/lib/utils/cn";

interface Trend {
  value: number;
  dir: "up" | "down";
}

interface KPICardProps {
  title: string;
  value: string;
  subtitle?: string;
  trend?: Trend;
  icon?: React.ReactNode;
}

/**
 * KPI card for dashboard metrics.
 */
export function KPICard({ title, value, subtitle, trend, icon }: KPICardProps) {
  return (
    <div className="glass-card-hover p-5">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs uppercase tracking-wide text-slate-600 dark:text-slate-500">{title}</p>
          <p className="mt-2 text-2xl font-semibold text-slate-900 dark:text-white">
            <span className="grad-text font-mono">{value}</span>
          </p>
        </div>
        {icon ? <div className="text-emerald-400">{icon}</div> : null}
      </div>
      <div className="mt-3 flex items-center justify-between text-xs text-slate-600 dark:text-slate-500">
        {subtitle ? <span>{subtitle}</span> : <span />}
        {trend ? (
          <span
            className={cn(
              "inline-flex items-center gap-1 rounded-full border px-2 py-0.5",
              trend.dir === "up"
                ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-500"
                : "border-red-500/30 bg-red-500/10 text-red-500",
            )}
          >
            {trend.dir === "up" ? (
              <ArrowUpRight className="h-3 w-3" />
            ) : (
              <ArrowDownRight className="h-3 w-3" />
            )}
            {Math.abs(trend.value).toFixed(1)}%
          </span>
        ) : null}
      </div>
    </div>
  );
}
