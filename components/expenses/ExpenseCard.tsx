"use client";

import { Pencil, Trash2 } from "lucide-react";
import type { Expense } from "@/types";
import { cn } from "@/lib/utils/cn";
import { fmt, fmtDate } from "@/lib/utils/formatters";
import { categoryIcon, categoryPillClass } from "@/components/expenses/categoryStyles";

interface ExpenseCardProps {
  expense: Expense;
  onEdit?: (expense: Expense) => void;
  onDelete?: (expense: Expense) => void;
}

/**
 * Single expense row card.
 */
export function ExpenseCard({ expense, onEdit, onDelete }: ExpenseCardProps) {
  const Icon = categoryIcon(expense.category);

  return (
    <div className="glass-card-hover flex items-center justify-between gap-4 p-4">
      <div className="flex items-center gap-3">
        <div className={cn("flex h-10 w-10 items-center justify-center rounded-xl", categoryPillClass(expense.category))}>
          <Icon className="h-4 w-4" />
        </div>
        <div>
          <p className="text-sm font-semibold text-slate-900 dark:text-white">
            {expense.description || expense.category}
          </p>
          <p className="text-xs text-slate-600 dark:text-slate-500">{fmtDate(expense.date)}</p>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <span className="font-mono text-sm text-slate-900 dark:text-white">{fmt(expense.amount)}</span>
        <div className="flex items-center gap-2">
          <button
            type="button"
            aria-label="Edit expense"
            className="rounded-lg border border-slate-200 dark:border-white/10 p-1.5 text-slate-500 dark:text-slate-400 hover:border-slate-300 dark:hover:border-white/20 hover:text-slate-900 dark:hover:text-white"
            onClick={() => onEdit?.(expense)}
          >
            <Pencil className="h-4 w-4" />
          </button>
          <button
            type="button"
            aria-label="Delete expense"
            className="rounded-lg border border-slate-200 dark:border-white/10 p-1.5 text-slate-500 dark:text-slate-400 hover:border-red-500/30 hover:text-red-500"
            onClick={() => onDelete?.(expense)}
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
