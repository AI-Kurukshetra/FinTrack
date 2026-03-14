"use client";

import type { Expense } from "@/types";
import { cn } from "@/lib/utils/cn";
import { ExpenseCard } from "@/components/expenses/ExpenseCard";

interface ExpenseListProps {
  expenses: Expense[];
  onEdit?: (expense: Expense) => void;
  onDelete?: (expense: Expense) => void;
  className?: string;
}

/**
 * Expense list wrapper.
 */
export function ExpenseList({ expenses, onEdit, onDelete, className }: ExpenseListProps) {
  if (!expenses || expenses.length === 0) {
    return (
      <div className={cn("glass-card p-6 text-sm text-slate-600 dark:text-slate-500", className)}>
        No expenses yet. Add your first one to get started.
      </div>
    );
  }

  return (
    <div className={cn("space-y-3", className)}>
      {expenses.map((expense) => (
        <ExpenseCard
          key={expense.id}
          expense={expense}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
}
