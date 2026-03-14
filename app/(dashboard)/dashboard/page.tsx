import { AlertTriangle, CalendarDays, PiggyBank, Sparkles, TrendingUp } from "lucide-react";
import { BudgetBar } from "@/components/dashboard/BudgetBar";
import { BudgetModal } from "@/components/dashboard/BudgetModal";
import { KPICard } from "@/components/dashboard/KPICard";
import { CategoryPieChart } from "@/components/charts/CategoryPieChart";
import { DailyBarChart } from "@/components/charts/DailyBarChart";
import { MonthlyTrendChart } from "@/components/charts/MonthlyTrendChart";
import { createClient } from "@/lib/supabase/server";
import { calculateAnalytics } from "@/lib/utils/calculations";
import { fmt } from "@/lib/utils/formatters";
import { categoryIcon } from "@/components/expenses/categoryStyles";
import { parseMonthYear } from "@/lib/utils/dateFilters";
import { CATEGORIES } from "@/lib/utils/categories";

const kpiDelays = ["delay-0", "delay-100", "delay-200", "delay-300", "delay-400"];

interface DashboardPageProps {
  searchParams?: Promise<{ m?: string; y?: string; month?: string; year?: string }>;
}

export default async function DashboardPage({ searchParams }: DashboardPageProps) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  const resolvedParams = await searchParams;
  const { range, referenceDate, label, monthParam } = parseMonthYear({
    m: resolvedParams?.m,
    y: resolvedParams?.y,
    month: resolvedParams?.month,
    year: resolvedParams?.year,
  });

  const [expensesResult, budgetResult, categoryBudgetsResult] = await Promise.all([
    supabase
      .from("expenses")
      .select("*")
      .eq("user_id", user.id)
      .gte("date", range.startDate)
      .lt("date", range.endDate)
      .order("date", { ascending: false }),
    supabase.from("budgets").select("*").eq("user_id", user.id).maybeSingle(),
    supabase
      .from("category_budgets")
      .select("category, amount")
      .eq("user_id", user.id)
      .eq("month_year", monthParam),
  ]);

  if (expensesResult.error || budgetResult.error || categoryBudgetsResult.error) {
    return (
      <div className="glass-card p-6 text-sm text-slate-600 dark:text-slate-500">
        Unable to load dashboard data. Please try again.
      </div>
    );
  }

  const expenses = expensesResult.data ?? [];
  const budgetAmount = budgetResult.data?.amount ?? 0;
  const analytics = calculateAnalytics(expenses, budgetAmount, referenceDate);

  const TopCategoryIcon = categoryIcon(analytics.topCategory);

  const spentByCategory = new Map<string, number>();
  for (const expense of expenses) {
    spentByCategory.set(expense.category, (spentByCategory.get(expense.category) ?? 0) + expense.amount);
  }

  const budgetMap = new Map<string, number>(
    (categoryBudgetsResult.data ?? []).map((item) => [item.category, item.amount]),
  );

  const budgetedCount = CATEGORIES.filter((category) => (budgetMap.get(category.name) ?? 0) > 0).length;
  const overLimitCount = CATEGORIES.reduce((count, category) => {
    const budget = budgetMap.get(category.name) ?? 0;
    if (budget <= 0) return count;
    const spent = spentByCategory.get(category.name) ?? 0;
    return spent > budget ? count + 1 : count;
  }, 0);

  const kpis = [
    {
      title: "This Month",
      value: fmt(analytics.thisMonthTotal),
      subtitle: "vs last month",
      trend: { value: analytics.trendPct, dir: analytics.trendDir },
      icon: <TrendingUp className="h-5 w-5" />,
    },
    {
      title: "Today",
      value: fmt(analytics.todayTotal),
      subtitle: `of ${fmt(analytics.dailyAvg)} avg`,
      icon: <CalendarDays className="h-5 w-5" />,
    },
    {
      title: "Daily Average",
      value: fmt(analytics.dailyAvg),
      subtitle: "This month",
      icon: <PiggyBank className="h-5 w-5" />,
    },
    {
      title: "Top Category",
      value: analytics.topCategory,
      subtitle: "Highest spend",
      icon: <TopCategoryIcon className="h-5 w-5" />,
    },
    {
      title: "Monthly Health",
      value: `${overLimitCount}`,
      subtitle: `${budgetedCount} budgeted categories`,
      icon: <AlertTriangle className="h-5 w-5" />,
    },
  ];

  return (
    <div className="space-y-6">
      <div className="text-xs text-slate-600 dark:text-slate-500">Filtered for {label}</div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {kpis.map((kpi, index) => (
          <div key={kpi.title} className={`animate-fade-up ${kpiDelays[index] ?? ""}`}>
            <KPICard {...kpi} />
          </div>
        ))}
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
          <Sparkles className="h-4 w-4 text-emerald-400" />
          Insights updated in real-time
        </div>
        <BudgetModal initialBudget={budgetAmount} />
      </div>

      <BudgetBar spent={analytics.thisMonthTotal} budget={budgetAmount} />

      {expenses.length === 0 ? (
        <div className="glass-card p-6 text-sm text-slate-600 dark:text-slate-500">
          No expenses yet. Add your first transaction to unlock analytics.
        </div>
      ) : (
        <>
          <DailyBarChart data={analytics.barData} />
          <div className="grid gap-4 lg:grid-cols-2">
            <CategoryPieChart data={analytics.pieData} />
            <MonthlyTrendChart data={analytics.monthlyTrend} />
          </div>
        </>
      )}
    </div>
  );
}
