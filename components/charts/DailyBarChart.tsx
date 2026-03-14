"use client";

import { useId } from "react";
import dynamic from "next/dynamic";
import { cn } from "@/lib/utils/cn";
import { ChartTooltip } from "@/components/charts/ChartTooltip";
import { useColorMode } from "@/components/providers/ColorModeProvider";

const ResponsiveContainer = dynamic(() => import("recharts").then((m) => m.ResponsiveContainer), {
  ssr: false,
});
const BarChart = dynamic(() => import("recharts").then((m) => m.BarChart), { ssr: false });
const Bar = dynamic(() => import("recharts").then((m) => m.Bar), { ssr: false });
const XAxis = dynamic(() => import("recharts").then((m) => m.XAxis), { ssr: false });
const YAxis = dynamic(() => import("recharts").then((m) => m.YAxis), { ssr: false });
const Tooltip = dynamic(() => import("recharts").then((m) => m.Tooltip), { ssr: false });
const CartesianGrid = dynamic(() => import("recharts").then((m) => m.CartesianGrid), { ssr: false });

export interface DailyBarDatum {
  day: number;
  total: number;
}

interface DailyBarChartProps {
  data: DailyBarDatum[];
  className?: string;
}

/**
 * Daily spend bar chart.
 */
export function DailyBarChart({ data, className }: DailyBarChartProps) {
  const gradId = useId();
  const { resolvedTheme } = useColorMode();
  const isDark = resolvedTheme === "dark";
  const axisColor = isDark ? "#94a3b8" : "#64748b";
  const gridColor = isDark ? "rgba(148, 163, 184, 0.2)" : "rgba(148, 163, 184, 0.35)";

  if (!data || data.length === 0) {
    return (
      <div className={cn("glass-card p-6 text-sm text-slate-600 dark:text-slate-500", className)}>
        No spending data yet.
      </div>
    );
  }

  return (
    <div className={cn("glass-card p-5", className)}>
      <div className="mb-4 flex items-center justify-between">
        <p className="text-sm text-slate-700 dark:text-slate-400">Daily Spend</p>
        <span className="text-xs text-slate-500 dark:text-slate-500">Current month</span>
      </div>
      <div className="h-56">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} barSize={12} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
            <defs>
              <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#10b981" />
                <stop offset="100%" stopColor="#06b6d4" />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
            <XAxis dataKey="day" tick={{ fill: axisColor, fontSize: 11 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: axisColor, fontSize: 11 }} axisLine={false} tickLine={false} />
            <Tooltip content={<ChartTooltip />} />
            <Bar dataKey="total" fill={`url(#${gradId})`} radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
