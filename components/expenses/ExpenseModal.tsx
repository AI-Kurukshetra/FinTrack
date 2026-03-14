"use client";

import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import { CATEGORIES } from "@/lib/utils/categories";
import { todayStr } from "@/lib/utils/formatters";
import { cn } from "@/lib/utils/cn";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import type { ExpenseInput } from "@/lib/validations/expense";
import { categoryIcon } from "@/components/expenses/categoryStyles";

interface ExpenseModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (input: ExpenseInput) => void;
  initial?: Partial<ExpenseInput>;
  loading?: boolean;
}

const defaultState: ExpenseInput = {
  amount: 0,
  category: "Food & Dining",
  description: "",
  date: todayStr(),
};

/**
 * Expense creation and edit modal.
 */
export function ExpenseModal({ open, onClose, onSave, initial, loading }: ExpenseModalProps) {
  const [form, setForm] = useState<ExpenseInput>(defaultState);

  const title = useMemo(() => (initial ? "Edit Expense" : "Add Expense"), [initial]);

  useEffect(() => {
    if (open) {
      setForm({
        ...defaultState,
        ...initial,
        amount: initial?.amount ?? defaultState.amount,
        category: initial?.category ?? defaultState.category,
        description: initial?.description ?? "",
        date: initial?.date ?? defaultState.date,
      });
    }
  }, [open, initial]);

  const handleSave = () => {
    onSave({
      amount: Number(form.amount),
      category: form.category,
      description: form.description ?? "",
      date: form.date,
    });
  };

  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          className="fixed inset-0 z-50 flex items-end justify-center md:items-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <button
            type="button"
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={onClose}
            aria-label="Close expense modal"
          />
          <motion.div
            className={cn(
              "relative w-full max-w-xl",
              "glass-card grad-border p-6 md:rounded-2xl",
              "rounded-t-3xl md:rounded-2xl",
            )}
            initial={{ y: 80, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 80, opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 26 }}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-lg font-semibold text-slate-900 dark:text-white">{title}</p>
                <p className="text-xs text-slate-600 dark:text-slate-500">Track every rupee</p>
              </div>
              <button
                type="button"
                className="rounded-lg border border-slate-200 dark:border-white/10 p-1.5 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                onClick={onClose}
                aria-label="Close"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="mt-5 space-y-4">
              <div>
                <label className="text-xs text-slate-600 dark:text-slate-400">Amount</label>
                <div className="mt-2 flex items-center gap-2">
                  <span className="text-sm text-slate-500 dark:text-slate-500">₹</span>
                  <Input
                    type="number"
                    min="0"
                    step="1"
                    value={form.amount}
                    onChange={(event) =>
                      setForm((prev) => ({ ...prev, amount: Number(event.target.value) }))
                    }
                    className="text-lg font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs text-slate-600 dark:text-slate-400">Category</label>
                <div className="mt-2 grid grid-cols-4 gap-2">
                  {CATEGORIES.map((category) => {
                    const Icon = categoryIcon(category.name);
                    const active = form.category === category.name;
                    return (
                      <button
                        key={category.name}
                        type="button"
                        className={cn(
                          "flex flex-col items-center gap-1 rounded-xl border border-slate-200 dark:border-white/10 px-2 py-3 text-xs",
                          active
                            ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-500"
                            : "text-slate-600 dark:text-slate-400 hover:border-slate-300 dark:hover:border-white/20",
                        )}
                        onClick={() => setForm((prev) => ({ ...prev, category: category.name }))}
                      >
                        <Icon className="h-4 w-4" />
                        <span className="text-[10px]">{category.name.split(" ")[0]}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="text-xs text-slate-600 dark:text-slate-400">Description</label>
                <Input
                  value={form.description ?? ""}
                  onChange={(event) =>
                    setForm((prev) => ({ ...prev, description: event.target.value }))
                  }
                  placeholder="Add a note"
                  className="mt-2"
                />
              </div>

              <div>
                <label className="text-xs text-slate-600 dark:text-slate-400">Date</label>
                <Input
                  type="date"
                  value={form.date}
                  onChange={(event) =>
                    setForm((prev) => ({ ...prev, date: event.target.value }))
                  }
                  className="mt-2"
                />
              </div>
            </div>

            <div className="mt-6 flex gap-3">
              <Button
                variant="secondary"
                className="flex-1"
                onClick={onClose}
                disabled={loading}
              >
                Cancel
              </Button>
              <Button className="flex-1" onClick={handleSave} disabled={loading}>
                {loading ? "Saving..." : "Save Expense"}
              </Button>
            </div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
