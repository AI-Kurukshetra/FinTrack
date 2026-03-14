export interface Expense {
  id: number;
  user_id: string;
  amount: number;
  category: string;
  description: string | null;
  date: string;
  created_at: string;
  updated_at: string;
}

export interface Budget {
  id: number;
  user_id: string;
  amount: number;
}

export interface CategoryBudget {
  id: number;
  user_id: string;
  category: string;
  amount: number;
  month_year: string;
  created_at: string;
  updated_at: string;
}

export interface Insight {
  type: "alert" | "trend" | "pattern" | "spike" | "prediction" | "suggestion" | "savings";
  severity: "high" | "medium" | "low" | "info";
  title: string;
  description: string;
}

export interface Analytics {
  thisMonthTotal: number;
  lastMonthTotal: number;
  todayTotal: number;
  dailyAvg: number;
  predicted: number;
  topCategory: string;
  trendPct: number;
  trendDir: "up" | "down";
  budgetPct: number;
  barData: { day: number; total: number }[];
  pieData: { name: string; value: number; color: string }[];
  monthlyTrend: { month: string; total: number }[];
}
