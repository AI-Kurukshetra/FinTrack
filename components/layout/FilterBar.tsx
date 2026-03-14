"use client";

import { useMemo } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { CalendarClock } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { formatMonthLabel, monthLabelByValue, monthOptions, parseMonthYear } from "@/lib/utils/dateFilters";

interface FilterBarProps {
  className?: string;
}

/**
 * Global month/year filter synced to query params.
 */
export function FilterBar({ className }: FilterBarProps) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const { month, year } = parseMonthYear({
    m: searchParams.get("m") ?? undefined,
    y: searchParams.get("y") ?? undefined,
    month: searchParams.get("month") ?? undefined,
    year: searchParams.get("year") ?? undefined,
  });

  const years = useMemo(() => {
    const currentYear = new Date().getFullYear();
    return Array.from({ length: 4 }, (_, index) => currentYear - index);
  }, []);

  const updateParams = (nextMonth: string, nextYear: string) => {
    const params = new URLSearchParams(searchParams.toString());
    const monthLabel = monthLabelByValue(nextMonth);
    params.set("month", monthLabel);
    params.set("year", nextYear);
    params.delete("m");
    params.delete("y");
    router.push(`${pathname}?${params.toString()}`);
  };

  return (
    <div
      className={cn(
        "glass-card flex flex-wrap items-center gap-3 px-4 py-3",
        "text-xs text-slate-600 dark:text-slate-400",
        className,
      )}
    >
      <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
        <CalendarClock className="h-4 w-4 text-emerald-400" />
        <span className="text-xs uppercase tracking-wide">Active window</span>
      </div>
      <div className="flex items-center gap-2">
        <select
          className="fin-input h-9 px-3 py-0 text-xs"
          value={String(month).padStart(2, "0")}
          onChange={(event) => updateParams(event.target.value, String(year))}
        >
          {monthOptions.map((option) => (
            <option key={option.value} value={option.value} className="bg-white dark:bg-ink-900">
              {option.label}
            </option>
          ))}
        </select>
        <select
          className="fin-input h-9 px-3 py-0 text-xs"
          value={String(year)}
          onChange={(event) => updateParams(String(month).padStart(2, "0"), event.target.value)}
        >
          {years.map((option) => (
            <option key={option} value={option} className="bg-white dark:bg-ink-900">
              {option}
            </option>
          ))}
        </select>
      </div>
      <div className="ml-auto text-xs text-slate-500 dark:text-slate-500">
        {formatMonthLabel(year, month)}
      </div>
      <div className="text-[11px] text-slate-500 dark:text-slate-600">
        {monthLabelByValue(String(month).padStart(2, "0"))} insights are filtered across the app.
      </div>
    </div>
  );
}
