"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { Expense } from "@/types";
import { toMonthParam } from "@/lib/utils/dateFilters";

interface UseExpensesOptions {
  month?: number;
  year?: number;
  category?: string | null;
  search?: string;
}

interface UseExpensesResult {
  expenses: Expense[];
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

/**
 * Client-side expenses fetcher with optional month/year filters.
 */
export function useExpenses(options: UseExpensesOptions = {}): UseExpensesResult {
  const { month, year, category, search } = options;
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tick, setTick] = useState(0);

  const monthParam = useMemo(() => {
    if (!month || !year) return undefined;
    return toMonthParam(year, month);
  }, [month, year]);

  const query = useMemo(() => {
    const params = new URLSearchParams();
    if (monthParam) params.set("month", monthParam);
    if (category) params.set("category", category);
    if (search) params.set("search", search);
    const str = params.toString();
    return str ? `?${str}` : "";
  }, [monthParam, category, search]);

  const refetch = useCallback(() => setTick((prev) => prev + 1), []);

  useEffect(() => {
    let active = true;

    const fetchExpenses = async () => {
      setLoading(true);
      setError(null);
      const response = await fetch(`/api/expenses${query}`);
      if (!response.ok) {
        if (!active) return;
        setError("Unable to load expenses.");
        setLoading(false);
        return;
      }
      const data = (await response.json()) as Expense[];
      if (!active) return;
      setExpenses(data ?? []);
      setLoading(false);
    };

    fetchExpenses();

    return () => {
      active = false;
    };
  }, [query, tick]);

  return { expenses, loading, error, refetch };
}
