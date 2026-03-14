import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export const runtime = "edge";

const DAILY_LIMIT = 10;

type UsageStore = Map<string, number>;

type Insight = {
  type: "alert" | "trend" | "pattern" | "spike" | "prediction" | "suggestion" | "savings";
  severity: "high" | "medium" | "low" | "info";
  title: string;
  description: string;
};

type ExpenseSummary = {
  total: number;
  count: number;
  byCategory: Record<string, number>;
  byMonth: Record<string, number>;
  topCategories: Array<{ name: string; amount: number }>;
  maxExpense: number;
  minDate?: string;
  maxDate?: string;
  daysSpan: number;
};

const getUsageStore = () => {
  const globalWithStore = globalThis as typeof globalThis & { __insightsUsage?: UsageStore };
  if (!globalWithStore.__insightsUsage) {
    globalWithStore.__insightsUsage = new Map();
  }
  return globalWithStore.__insightsUsage;
};

const buildExpenseSummary = (expenses: Array<{ amount: number; category: string; date: string }>): ExpenseSummary => {
  const byCategory: Record<string, number> = {};
  const byMonth: Record<string, number> = {};
  let total = 0;
  let maxExpense = 0;
  let minDate: string | undefined;
  let maxDate: string | undefined;

  for (const expense of expenses) {
    total += expense.amount;
    maxExpense = Math.max(maxExpense, expense.amount);
    byCategory[expense.category] = (byCategory[expense.category] ?? 0) + expense.amount;
    const month = expense.date.slice(0, 7);
    byMonth[month] = (byMonth[month] ?? 0) + expense.amount;
    if (!minDate || expense.date < minDate) minDate = expense.date;
    if (!maxDate || expense.date > maxDate) maxDate = expense.date;
  }

  const topCategories = Object.entries(byCategory)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([name, amount]) => ({ name, amount }));

  const daysSpan = minDate && maxDate
    ? Math.max(1, Math.floor((Date.parse(maxDate) - Date.parse(minDate)) / 86400000) + 1)
    : 1;

  return {
    total,
    count: expenses.length,
    byCategory,
    byMonth,
    topCategories,
    maxExpense,
    minDate,
    maxDate,
    daysSpan,
  };
};

const buildMockInsights = (summary: ExpenseSummary): Insight[] => {
  const insights: Insight[] = [];
  const avg = summary.count > 0 ? summary.total / summary.count : 0;
  const dailyAvg = summary.total / Math.max(1, summary.daysSpan);
  const top = summary.topCategories[0];
  const months = Object.keys(summary.byMonth).sort();
  const lastMonth = months[months.length - 1];
  const prevMonth = months[months.length - 2];
  const lastMonthTotal = lastMonth ? summary.byMonth[lastMonth] ?? 0 : 0;
  const prevMonthTotal = prevMonth ? summary.byMonth[prevMonth] ?? 0 : 0;
  const monthDeltaPct = prevMonthTotal > 0 ? ((lastMonthTotal - prevMonthTotal) / prevMonthTotal) * 100 : 0;

  if (summary.count === 0) {
    return [
      {
        type: "suggestion",
        severity: "info",
        title: "Start with a baseline",
        description: "Log your first few expenses to unlock trends and category insights.",
      },
      {
        type: "savings",
        severity: "low",
        title: "Set a starter budget",
        description: "Create a simple monthly budget for key categories to get alerts sooner.",
      },
      {
        type: "pattern",
        severity: "info",
        title: "Track daily spending",
        description: "Add small purchases too. They add up faster than expected.",
      },
      {
        type: "suggestion",
        severity: "low",
        title: "Choose top categories",
        description: "Focus on 3 categories you care about most for quick wins.",
      },
      {
        type: "trend",
        severity: "info",
        title: "Monthly rhythm",
        description: "Once you add data, we will highlight month-over-month changes automatically.",
      },
      {
        type: "savings",
        severity: "info",
        title: "Small savings plan",
        description: "Aim to save 5-10% of monthly spend as a starting target.",
      },
    ];
  }

  insights.push({
    type: "trend",
    severity: "info",
    title: "Spending snapshot",
    description: `You logged ${summary.count} expenses totaling INR ${summary.total.toFixed(0)} in the last 90 days. Avg ticket INR ${avg.toFixed(0)}.`,
  });

  if (top) {
    const share = summary.total > 0 ? (top.amount / summary.total) * 100 : 0;
    insights.push({
      type: "pattern",
      severity: share > 35 ? "medium" : "low",
      title: `Category focus: ${top.name}`,
      description: `${top.name} accounts for ${share.toFixed(0)}% of total spend (INR ${top.amount.toFixed(0)}).`,
    });
  }

  if (prevMonth) {
    insights.push({
      type: "trend",
      severity: Math.abs(monthDeltaPct) > 20 ? "medium" : "low",
      title: "Month-over-month change",
      description: `${lastMonth} is ${monthDeltaPct >= 0 ? "up" : "down"} ${Math.abs(monthDeltaPct).toFixed(1)}% vs ${prevMonth}.`,
    });
  }

  insights.push({
    type: "pattern",
    severity: dailyAvg > 0 ? "low" : "info",
    title: "Daily pace",
    description: `Average daily spend is around INR ${dailyAvg.toFixed(0)} based on your recent activity.`,
  });

  if (summary.maxExpense > 0) {
    insights.push({
      type: "spike",
      severity: summary.maxExpense > avg * 3 ? "medium" : "low",
      title: "Largest purchase",
      description: `Your biggest single expense was INR ${summary.maxExpense.toFixed(0)}. Review if it was planned.`,
    });
  }

  insights.push({
    type: "savings",
    severity: "low",
    title: "Quick savings idea",
    description: "Reducing your top category by 10% next month could unlock easy savings.",
  });

  insights.push({
    type: "suggestion",
    severity: "info",
    title: "Set category caps",
    description: "Add category budgets so the app can trigger alerts when you cross 60%, 90%, and 100%.",
  });

  return insights.slice(0, 8);
};

/**
 * GET /api/insights - stream mock insights.
 */
export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const today = new Date().toISOString().slice(0, 10);
  const usageKey = `${user.id}:${today}`;
  const usageStore = getUsageStore();
  const current = usageStore.get(usageKey) ?? 0;

  if (current >= DAILY_LIMIT) {
    return NextResponse.json({ error: "Rate limit exceeded" }, { status: 429 });
  }

  usageStore.set(usageKey, current + 1);

  const since = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000)
    .toISOString()
    .split("T")[0];

  const { data: expenses, error } = await supabase
    .from("expenses")
    .select("amount, category, date, description")
    .eq("user_id", user.id)
    .gte("date", since);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const summary = buildExpenseSummary(expenses ?? []);
  const insights = buildMockInsights(summary);
  const encoder = new TextEncoder();

  const readable = new ReadableStream({
    async start(controller) {
      const emit = (payload: unknown) => {
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(payload)}

`));
      };

      for (const insight of insights) {
        emit(insight);
        await new Promise((resolve) => setTimeout(resolve, 80));
      }

      controller.enqueue(encoder.encode("data: [DONE]\n\n"));
      controller.close();
    },
  });

  return new Response(readable, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
    },
  });
}
