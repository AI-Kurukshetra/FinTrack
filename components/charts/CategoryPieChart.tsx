"use client";

import { useId } from "react";
import dynamic from "next/dynamic";
import { cn } from "@/lib/utils/cn";
import { fmt } from "@/lib/utils/formatters";
import { ChartTooltip } from "@/components/charts/ChartTooltip";

const ResponsiveContainer = dynamic(() => import("recharts").then((m) => m.ResponsiveContainer), {
  ssr: false,
});
const PieChart = dynamic(() => import("recharts").then((m) => m.PieChart), { ssr: false });
const Pie = dynamic(() => import("recharts").then((m) => m.Pie), { ssr: false });
const Cell = dynamic(() => import("recharts").then((m) => m.Cell), { ssr: false });
const Tooltip = dynamic(() => import("recharts").then((m) => m.Tooltip), { ssr: false });

export interface CategoryPieDatum {
  name: string;
  value: number;
  color: string;
}

interface CategoryPieChartProps {
  data: CategoryPieDatum[];
  className?: string;
}

const colorClassMap: Record<string, string> = {
  "#f59e0b": "bg-amber-500",
  "#3b82f6": "bg-blue-500",
  "#ec4899": "bg-pink-500",
  "#8b5cf6": "bg-violet-500",
  "#f97316": "bg-orange-500",
  "#ef4444": "bg-red-500",
  "#6b7280": "bg-slate-500",
};

/**
 * Category breakdown donut chart.
 */
export function CategoryPieChart({ data, className }: CategoryPieChartProps) {
  const gradId = useId();

  if (!data || data.length === 0) {
    return (
      <div className={cn("glass-card p-6 text-sm text-slate-600 dark:text-slate-500", className)}>
        No category data yet.
      </div>
    );
  }

  return (
    <div className={cn("glass-card p-5", className)}>
      <div className="mb-4 flex items-center justify-between">
        <p className="text-sm text-slate-700 dark:text-slate-400">Category Breakdown</p>
        <span className="text-xs text-slate-500 dark:text-slate-500">This month</span>
      </div>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="h-52">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <defs>
                <linearGradient id={gradId} x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stopColor="#10b981" />
                  <stop offset="100%" stopColor="#06b6d4" />
                </linearGradient>
              </defs>
              <Pie
                data={data}
                dataKey="value"
                nameKey="name"
                innerRadius={60}
                outerRadius={90}
                paddingAngle={4}
              >
                {data.map((entry) => (
                  <Cell key={entry.name} fill={entry.color || `url(#${gradId})`} />
                ))}
              </Pie>
              <Tooltip content={<ChartTooltip />} />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="space-y-2">
          {data.map((entry) => (
            <div key={entry.name} className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <span
                  className={cn(
                    "h-2.5 w-2.5 rounded-full",
                    colorClassMap[entry.color] ?? "bg-emerald-400",
                  )}
                />
                <span className="text-slate-700 dark:text-slate-300">{entry.name}</span>
              </div>
              <span className="text-slate-900 dark:text-white">{fmt(entry.value)}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
