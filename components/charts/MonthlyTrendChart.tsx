"use client";

import { useId } from "react";
import dynamic from "next/dynamic";
import { cn } from "@/lib/utils/cn";
import { ChartTooltip } from "@/components/charts/ChartTooltip";
import { useColorMode } from "@/components/providers/ColorModeProvider";

const ResponsiveContainer = dynamic(() => import("recharts").then((m) => m.ResponsiveContainer), {
  ssr: false,
});
const AreaChart = dynamic(() => import("recharts").then((m) => m.AreaChart), { ssr: false });
const Area = dynamic(() => import("recharts").then((m) => m.Area), { ssr: false });
const XAxis = dynamic(() => import("recharts").then((m) => m.XAxis), { ssr: false });
const YAxis = dynamic(() => import("recharts").then((m) => m.YAxis), { ssr: false });
const Tooltip = dynamic(() => import("recharts").then((m) => m.Tooltip), { ssr: false });
const CartesianGrid = dynamic(() => import("recharts").then((m) => m.CartesianGrid), { ssr: false });

export interface MonthlyTrendDatum {
  month: string;
  total: number;
}

interface MonthlyTrendChartProps {
  data: MonthlyTrendDatum[];
  className?: string;
}

/**
 * Monthly trend area chart.
 */
export function MonthlyTrendChart({ data, className }: MonthlyTrendChartProps) {
  const gradId = useId();
  const { resolvedTheme } = useColorMode();
  const isDark = resolvedTheme === "dark";
  const axisColor = isDark ? "#94a3b8" : "#64748b";
  const gridColor = isDark ? "rgba(148, 163, 184, 0.2)" : "rgba(148, 163, 184, 0.35)";

  if (!data || data.length === 0) {
    return (
      <div className={cn("glass-card p-6 text-sm text-slate-600 dark:text-slate-500", className)}>
        No trend data yet.
      </div>
    );
  }

  return (
    <div className={cn("glass-card p-5", className)}>
      <div className="mb-4 flex items-center justify-between">
        <p className="text-sm text-slate-700 dark:text-slate-400">6-Month Trend</p>
        <span className="text-xs text-slate-500 dark:text-slate-500">Rolling window</span>
      </div>
      <div className="h-56">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
            <defs>
              <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#10b981" stopOpacity={0.6} />
                <stop offset="100%" stopColor="#06b6d4" stopOpacity={0.05} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
            <XAxis dataKey="month" tick={{ fill: axisColor, fontSize: 11 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: axisColor, fontSize: 11 }} axisLine={false} tickLine={false} />
            <Tooltip content={<ChartTooltip />} />
            <Area
              type="monotone"
              dataKey="total"
              stroke="#10b981"
              strokeWidth={2}
              fill={`url(#${gradId})`}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
