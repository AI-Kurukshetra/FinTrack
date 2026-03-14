import type { Analytics, Expense } from "@/types";
import { CATEGORIES } from "@/lib/utils/categories";

const pad2 = (n: number) => String(n).padStart(2, "0");

const monthKey = (d: Date) => `${d.getFullYear()}-${pad2(d.getMonth() + 1)}`;

const sumBy = <T>(items: T[], selector: (item: T) => number) =>
  items.reduce((acc, item) => acc + selector(item), 0);

/**
 * Calculate dashboard analytics from expenses and budget.
 */
export function calculateAnalytics(
  expenses: Expense[],
  budgetAmount: number,
  referenceDate: Date = new Date(),
): Analytics {
  const todayKey = referenceDate.toISOString().split("T")[0];
  const thisMonthStart = new Date(referenceDate.getFullYear(), referenceDate.getMonth(), 1);
  const lastMonthStart = new Date(referenceDate.getFullYear(), referenceDate.getMonth() - 1, 1);

  const thisMonthKey = monthKey(thisMonthStart);
  const lastMonthKey = monthKey(lastMonthStart);

  const thisMonthExpenses = expenses.filter((e) => e.date.startsWith(thisMonthKey));
  const lastMonthExpenses = expenses.filter((e) => e.date.startsWith(lastMonthKey));

  const thisMonthTotal = sumBy(thisMonthExpenses, (e) => e.amount);
  const lastMonthTotal = sumBy(lastMonthExpenses, (e) => e.amount);
  const todayTotal = sumBy(expenses.filter((e) => e.date === todayKey), (e) => e.amount);

  const daysElapsed = Math.max(1, referenceDate.getDate());
  const dailyAvg = thisMonthTotal / daysElapsed;

  const daysInMonth = new Date(
    referenceDate.getFullYear(),
    referenceDate.getMonth() + 1,
    0,
  ).getDate();
  const predicted = dailyAvg * daysInMonth;

  const categoryTotals = new Map<string, number>();
  for (const expense of thisMonthExpenses) {
    categoryTotals.set(expense.category, (categoryTotals.get(expense.category) ?? 0) + expense.amount);
  }

  const topCategory = [...categoryTotals.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] ?? "Other";

  const trendPct = lastMonthTotal > 0 ? ((thisMonthTotal - lastMonthTotal) / lastMonthTotal) * 100 : 0;
  const trendDir = trendPct >= 0 ? "up" : "down";
  const budgetPct = budgetAmount > 0 ? (thisMonthTotal / budgetAmount) * 100 : 0;

  const dailyTotals = Array.from({ length: daysInMonth }, (_, i) => ({ day: i + 1, total: 0 }));
  for (const expense of thisMonthExpenses) {
    const dayIndex = Number(expense.date.slice(8, 10)) - 1;
    if (dayIndex >= 0 && dayIndex < dailyTotals.length) {
      dailyTotals[dayIndex].total += expense.amount;
    }
  }

  const pieData = CATEGORIES.map((category) => ({
    name: category.name,
    value: categoryTotals.get(category.name) ?? 0,
    color: category.color,
  })).filter((item) => item.value > 0);

  const monthlyTrend = Array.from({ length: 6 }, (_, i) => {
    const date = new Date(referenceDate.getFullYear(), referenceDate.getMonth() - (5 - i), 1);
    const key = monthKey(date);
    const total = sumBy(expenses.filter((e) => e.date.startsWith(key)), (e) => e.amount);
    return {
      month: date.toLocaleString("en-IN", { month: "short" }),
      total,
    };
  });

  return {
    thisMonthTotal,
    lastMonthTotal,
    todayTotal,
    dailyAvg,
    predicted,
    topCategory,
    trendPct,
    trendDir,
    budgetPct,
    barData: dailyTotals,
    pieData,
    monthlyTrend,
  };
}
