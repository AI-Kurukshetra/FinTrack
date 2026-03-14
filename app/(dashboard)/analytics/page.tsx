import { createClient } from "@/lib/supabase/server";
import { calculateAnalytics } from "@/lib/utils/calculations";
import { fmt } from "@/lib/utils/formatters";
import { CategoryPieChart } from "@/components/charts/CategoryPieChart";
import { DailyBarChart } from "@/components/charts/DailyBarChart";
import { MonthlyTrendChart } from "@/components/charts/MonthlyTrendChart";
import { CATEGORIES } from "@/lib/utils/categories";
import { parseMonthYear } from "@/lib/utils/dateFilters";

const daysOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const progressWidths = [
  "w-0",
  "w-[5%]",
  "w-[10%]",
  "w-[15%]",
  "w-[20%]",
  "w-[25%]",
  "w-[30%]",
  "w-[35%]",
  "w-[40%]",
  "w-[45%]",
  "w-[50%]",
  "w-[55%]",
  "w-[60%]",
  "w-[65%]",
  "w-[70%]",
  "w-[75%]",
  "w-[80%]",
  "w-[85%]",
  "w-[90%]",
  "w-[95%]",
  "w-[100%]",
];
const heatmapClasses = [
  "bg-emerald-500/10",
  "bg-emerald-500/20",
  "bg-emerald-500/30",
  "bg-emerald-500/40",
  "bg-emerald-500/50",
];

interface AnalyticsPageProps {
  searchParams?: Promise<{ m?: string; y?: string; month?: string; year?: string }>;
}

export default async function AnalyticsPage({ searchParams }: AnalyticsPageProps) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  const resolvedParams = await searchParams;
  const { range, referenceDate, label } = parseMonthYear({
    m: resolvedParams?.m,
    y: resolvedParams?.y,
    month: resolvedParams?.month,
    year: resolvedParams?.year,
  });

  const [expensesResult, budgetResult] = await Promise.all([
    supabase
      .from("expenses")
      .select("*")
      .eq("user_id", user.id)
      .gte("date", range.startDate)
      .lt("date", range.endDate)
      .order("date", { ascending: false }),
    supabase.from("budgets").select("*").eq("user_id", user.id).maybeSingle(),
  ]);

  if (expensesResult.error || budgetResult.error) {
    return (
      <div className="glass-card p-6 text-sm text-slate-600 dark:text-slate-500">
        Unable to load analytics right now.
      </div>
    );
  }

  const expenses = expensesResult.data ?? [];
  const budgetAmount = budgetResult.data?.amount ?? 0;
  const analytics = calculateAnalytics(expenses, budgetAmount, referenceDate);

  const summaryTiles = [
    { label: "This Month", value: fmt(analytics.thisMonthTotal) },
    { label: "Last Month", value: fmt(analytics.lastMonthTotal) },
    { label: "Prediction", value: fmt(analytics.predicted) },
    { label: "Daily Avg", value: fmt(analytics.dailyAvg) },
  ];

  const categoryTotals = CATEGORIES.map((category) => {
    const total = expenses
      .filter((expense) => expense.category === category.name)
      .reduce((sum, expense) => sum + expense.amount, 0);
    return {
      ...category,
      total,
    };
  });

  const grandTotal = categoryTotals.reduce((sum, cat) => sum + cat.total, 0);

  const weekdayTotals = Array.from({ length: 7 }, () => 0);
  const weekdayCounts = Array.from({ length: 7 }, () => 0);

  for (const expense of expenses) {
    const date = new Date(expense.date);
    const day = date.getDay();
    weekdayTotals[day] += expense.amount;
    weekdayCounts[day] += 1;
  }

  const weekdayAverages = weekdayTotals.map((total, idx) =>
    weekdayCounts[idx] > 0 ? total / weekdayCounts[idx] : 0,
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-slate-900 dark:text-white">Analytics</h1>
        <p className="text-sm text-slate-600 dark:text-slate-500">
          Deep-dive into {label} spending habits.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {summaryTiles.map((tile) => (
          <div key={tile.label} className="glass-card p-5">
            <p className="text-xs text-slate-600 dark:text-slate-500">{tile.label}</p>
            <p className="mt-2 text-lg font-semibold text-slate-900 dark:text-white font-mono">
              {tile.value}
            </p>
          </div>
        ))}
      </div>

      <DailyBarChart data={analytics.barData} />

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="glass-card p-5">
          <div className="mb-4 flex items-center justify-between">
            <p className="text-sm text-slate-600 dark:text-slate-400">Category Breakdown</p>
            <span className="text-xs text-slate-500 dark:text-slate-500">{label}</span>
          </div>
          <div className="space-y-3">
            {categoryTotals.map((cat) => {
              const pct = grandTotal > 0 ? (cat.total / grandTotal) * 100 : 0;
              const widthIndex = Math.min(progressWidths.length - 1, Math.round(pct / 5));
              const widthClass = progressWidths[widthIndex];
              return (
                <div key={cat.name} className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-700 dark:text-slate-300">{cat.name}</span>
                    <span className="text-slate-900 dark:text-white">{fmt(cat.total)}</span>
                  </div>
                  <div className="h-2 rounded-full bg-slate-200 dark:bg-white/5 overflow-hidden">
                    <div
                      className={`h-full rounded-full bg-gradient-to-r from-emerald-500 to-cyan-500 ${widthClass}`}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <MonthlyTrendChart data={analytics.monthlyTrend} />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <CategoryPieChart data={analytics.pieData} />
        <div className="glass-card p-5">
          <div className="mb-4 flex items-center justify-between">
            <p className="text-sm text-slate-600 dark:text-slate-400">Day of Week Heatmap</p>
            <span className="text-xs text-slate-500 dark:text-slate-500">Avg per day</span>
          </div>
          <div className="grid grid-cols-7 gap-2">
            {weekdayAverages.map((value, index) => {
              const intensity = Math.min(1, value / (analytics.dailyAvg || 1));
              const heatmapIndex = Math.min(
                heatmapClasses.length - 1,
                Math.round(intensity * (heatmapClasses.length - 1)),
              );
              const heatmapClass = heatmapClasses[heatmapIndex];
              return (
                <div key={daysOfWeek[index]} className="text-center">
                  <div className={`rounded-lg px-2 py-3 text-xs ${heatmapClass}`}>
                    <span className="text-slate-900 dark:text-white">{fmt(value)}</span>
                  </div>
                  <p className="mt-1 text-[10px] text-slate-500 dark:text-slate-500">
                    {daysOfWeek[index]}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
