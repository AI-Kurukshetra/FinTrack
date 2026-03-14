import { NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { CATEGORIES } from "@/lib/utils/categories";
import { parseMonthYear, parseMonthYearParam } from "@/lib/utils/dateFilters";

const categorySet = new Set<string>(CATEGORIES.map((cat) => cat.name));

const itemSchema = z.object({
  category: z
    .string()
    .min(1)
    .refine((value) => categorySet.has(value), { message: "Invalid category" }),
  amount: z.number().min(0),
});

const payloadSchema = z.object({
  month_year: z.string().regex(/^\d{4}-\d{2}$/).optional(),
  items: z.array(itemSchema).min(1),
});

/**
 * GET /api/category-budgets - list category budgets for the user by month.
 */
export async function GET(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const monthYearParam = searchParams.get("month_year");
  const parsed = monthYearParam
    ? parseMonthYearParam(monthYearParam)
    : parseMonthYear({
        m: searchParams.get("m") ?? undefined,
        y: searchParams.get("y") ?? undefined,
      });
  const monthYear = monthYearParam ?? parsed.monthParam;

  const { data, error } = await supabase
    .from("category_budgets")
    .select("*")
    .eq("user_id", user.id)
    .eq("month_year", monthYear)
    .order("category", { ascending: true });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const { data: expenses, error: expenseError } = await supabase
    .from("expenses")
    .select("amount, category, date")
    .eq("user_id", user.id)
    .gte("date", parsed.range.startDate)
    .lt("date", parsed.range.endDate);

  if (expenseError) {
    return NextResponse.json({ error: expenseError.message }, { status: 500 });
  }

  const spentByCategory: Record<string, number> = {};
  for (const expense of expenses ?? []) {
    spentByCategory[expense.category] = (spentByCategory[expense.category] ?? 0) + expense.amount;
  }

  return NextResponse.json({
    month_year: monthYear,
    budgets: data ?? [],
    spentByCategory,
  });
}

/**
 * POST /api/category-budgets - upsert category budgets.
 */
export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const parsed = payloadSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const monthYear = parsed.data.month_year ?? parseMonthYear().monthParam;

  const payload = parsed.data.items.map((item) => ({
    user_id: user.id,
    category: item.category,
    amount: item.amount,
    month_year: monthYear,
  }));

  const { data, error } = await supabase
    .from("category_budgets")
    .upsert(payload, { onConflict: "user_id,category,month_year" })
    .select("*");

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ month_year: monthYear, budgets: data ?? [] });
}
