"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils/cn";
import { fmt } from "@/lib/utils/formatters";

interface BudgetBarProps {
  spent: number;
  budget: number;
  className?: string;
}

/**
 * Budget progress display.
 */
export function BudgetBar({ spent, budget, className }: BudgetBarProps) {
  const pct = budget > 0 ? Math.round((spent / budget) * 100) : 0;
  const remaining = Math.max(budget - spent, 0);

  return (
    <div className={cn("glass-card p-6", className)}>
      <div className="flex items-center justify-between">
        <span className="text-sm text-slate-700 dark:text-slate-400">Monthly Budget</span>
        <span className="font-mono text-sm text-slate-900 dark:text-white">
          {fmt(spent)} / {fmt(budget || 0)}
        </span>
      </div>
      <div className="mt-3 h-3 rounded-full bg-slate-200 dark:bg-white/5 overflow-hidden">
        <motion.div
          className={cn("h-full rounded-full", {
            "bg-gradient-to-r from-emerald-500 to-cyan-500": pct < 70,
            "bg-gradient-to-r from-amber-500 to-orange-500": pct >= 70 && pct < 90,
            "bg-gradient-to-r from-red-500 to-rose-500": pct >= 90,
          })}
          initial={{ width: 0 }}
          animate={{ width: `${Math.min(pct, 100)}%` }}
          transition={{ duration: 0.9, ease: "easeOut" }}
        />
      </div>
      <p className="mt-2 text-xs text-slate-600 dark:text-slate-500">
        {pct}% used · {fmt(remaining)} remaining
      </p>
    </div>
  );
}
