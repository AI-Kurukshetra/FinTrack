"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Plus, Search, X } from "lucide-react";
import type { Expense } from "@/types";
import type { ExpenseInput } from "@/lib/validations/expense";
import { CATEGORIES } from "@/lib/utils/categories";
import { cn } from "@/lib/utils/cn";
import { fmt } from "@/lib/utils/formatters";
import { formatMonthLabel, parseMonthYear } from "@/lib/utils/dateFilters";
import { useExpenses } from "@/lib/hooks/useExpenses";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { ExpenseList } from "@/components/expenses/ExpenseList";
import { ExpenseModal } from "@/components/expenses/ExpenseModal";

export default function ExpensesPage() {
  const searchParams = useSearchParams();
  const { month, year } = parseMonthYear({
    m: searchParams.get("m") ?? undefined,
    y: searchParams.get("y") ?? undefined,
    month: searchParams.get("month") ?? undefined,
    year: searchParams.get("year") ?? undefined,
  });

  const { expenses, loading, error, refetch } = useExpenses({ month, year });
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [category, setCategory] = useState<string | null>(null);
  const [showAdd, setShowAdd] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [saving, setSaving] = useState(false);
  const [undoQueue, setUndoQueue] = useState<Expense[]>([]);
  const [pendingDeleteIds, setPendingDeleteIds] = useState<number[]>([]);

  const deleteTimers = useRef<Map<number, ReturnType<typeof setTimeout>>>(new Map());

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search.trim()), 300);
    return () => clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    refetch();
  }, [refetch, month, year]);

  const filteredExpenses = useMemo(() => {
    let list = [...expenses];
    if (pendingDeleteIds.length > 0) {
      list = list.filter((expense) => !pendingDeleteIds.includes(expense.id));
    }
    if (category) {
      list = list.filter((expense) => expense.category === category);
    }
    if (debouncedSearch) {
      const needle = debouncedSearch.toLowerCase();
      list = list.filter((expense) => {
        const haystack = `${expense.description ?? ""} ${expense.category}`.toLowerCase();
        return haystack.includes(needle);
      });
    }
    return list.sort((a, b) => b.date.localeCompare(a.date));
  }, [expenses, pendingDeleteIds, category, debouncedSearch]);

  const filteredTotal = useMemo(
    () => filteredExpenses.reduce((sum, expense) => sum + expense.amount, 0),
    [filteredExpenses],
  );

  const closeModal = () => {
    setShowAdd(false);
    setEditingExpense(null);
  };

  const handleSave = async (input: ExpenseInput) => {
    setSaving(true);

    if (editingExpense) {
      const response = await fetch(`/api/expenses/${editingExpense.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
      });
      if (!response.ok) {
        setSaving(false);
        return;
      }
      await response.json();
      refetch();
      setSaving(false);
      closeModal();
      return;
    }

    const response = await fetch("/api/expenses", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    });

    if (!response.ok) {
      setSaving(false);
      return;
    }

    await response.json();
    setSaving(false);
    closeModal();
    refetch();
  };

  const handleDelete = (expense: Expense) => {
    setPendingDeleteIds((prev) => [...prev, expense.id]);
    setUndoQueue((prev) => [...prev, expense]);

    const timer = setTimeout(async () => {
      setPendingDeleteIds((prev) => prev.filter((id) => id !== expense.id));
      setUndoQueue((prev) => prev.filter((item) => item.id !== expense.id));
      deleteTimers.current.delete(expense.id);
      await fetch(`/api/expenses/${expense.id}`, { method: "DELETE" });
      refetch();
    }, 4000);

    deleteTimers.current.set(expense.id, timer);
  };

  const handleUndo = (expense: Expense) => {
    const timer = deleteTimers.current.get(expense.id);
    if (timer) {
      clearTimeout(timer);
      deleteTimers.current.delete(expense.id);
    }
    setPendingDeleteIds((prev) => prev.filter((id) => id !== expense.id));
    setUndoQueue((prev) => prev.filter((item) => item.id !== expense.id));
  };

  const activeUndo = undoQueue[undoQueue.length - 1];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-xl font-semibold text-slate-900 dark:text-white">Expenses</h1>
          <p className="text-sm text-slate-600 dark:text-slate-500">
            {formatMonthLabel(year, month)} · {filteredExpenses.length} items · {fmt(filteredTotal)}
          </p>
        </div>
        <div className="hidden md:flex items-center gap-3">
          <Button onClick={() => setShowAdd(true)}>
            <Plus className="h-4 w-4" />
            Add Expense
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-[1.2fr_1fr]">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
          <Input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search expenses"
            className="pl-9"
          />
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setCategory(null)}
            className={cn(
              "rounded-full border px-3 py-1 text-xs",
              !category
                ? "bg-gradient-to-r from-emerald-500/20 to-cyan-500/10 border-emerald-500/30 text-slate-900 dark:text-white"
                : "border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white",
            )}
          >
            All
          </button>
          {CATEGORIES.map((cat) => (
            <button
              key={cat.name}
              type="button"
              onClick={() => setCategory(cat.name)}
              className={cn(
                "rounded-full border px-3 py-1 text-xs",
                category === cat.name
                  ? "bg-gradient-to-r from-emerald-500/20 to-cyan-500/10 border-emerald-500/30 text-slate-900 dark:text-white"
                  : "border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white",
              )}
            >
              {cat.name}
            </button>
          ))}
        </div>
      </div>

      {error ? (
        <div className="glass-card border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-500">
          {error}
        </div>
      ) : null}

      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, index) => (
            <div key={index} className="glass-card p-4">
              <div className="h-4 w-40 skeleton mb-2" />
              <div className="h-3 w-24 skeleton" />
            </div>
          ))}
        </div>
      ) : (
        <ExpenseList
          expenses={filteredExpenses}
          onEdit={(expense) => {
            setEditingExpense(expense);
            setShowAdd(false);
          }}
          onDelete={handleDelete}
        />
      )}

      <button
        type="button"
        className="glow-btn fixed bottom-24 right-4 flex h-12 w-12 items-center justify-center rounded-full md:hidden"
        onClick={() => setShowAdd(true)}
        aria-label="Add expense"
      >
        <Plus className="h-5 w-5" />
      </button>

      <ExpenseModal
        open={showAdd || Boolean(editingExpense)}
        onClose={closeModal}
        onSave={handleSave}
        initial={
          editingExpense
            ? {
                amount: editingExpense.amount,
                category: editingExpense.category,
                description: editingExpense.description ?? "",
                date: editingExpense.date,
              }
            : undefined
        }
        loading={saving}
      />

      {activeUndo ? (
        <div className="fixed bottom-24 left-1/2 z-50 w-[90%] max-w-md -translate-x-1/2 rounded-2xl border border-slate-200 dark:border-white/10 bg-white/80 dark:bg-ink-800/80 backdrop-blur-xl px-4 py-3 text-sm text-slate-900 dark:text-white">
          <div className="flex items-center justify-between gap-3">
            <span>Expense deleted.</span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                className="text-emerald-500 hover:text-emerald-400"
                onClick={() => handleUndo(activeUndo)}
              >
                Undo
              </button>
              <button
                type="button"
                className="text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
                aria-label="Dismiss"
                onClick={() => setUndoQueue((prev) => prev.filter((item) => item.id !== activeUndo.id))}
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
