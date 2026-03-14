import { NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { getMonthSequence, parseMonthYear, parseMonthYearParam } from "@/lib/utils/dateFilters";

const querySchema = z.object({
  month_year: z.string().regex(/^\d{4}-\d{2}$/).optional(),
  m: z.string().regex(/^\d{1,2}$/).optional(),
  y: z.string().regex(/^\d{4}$/).optional(),
  months: z.coerce.number().min(2).max(12).optional(),
});

/**
 * GET /api/category-budgets/history - historical budgets across months.
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
  const parsedQuery = querySchema.safeParse({
    month_year: searchParams.get("month_year") ?? undefined,
    m: searchParams.get("m") ?? undefined,
    y: searchParams.get("y") ?? undefined,
    months: searchParams.get("months") ?? undefined,
  });

  if (!parsedQuery.success) {
    return NextResponse.json({ error: parsedQuery.error.flatten() }, { status: 400 });
  }

  const { month_year, m, y, months } = parsedQuery.data;
  const base = month_year
    ? parseMonthYearParam(month_year)
    : parseMonthYear({
        m,
        y,
        month: searchParams.get("month") ?? undefined,
        year: searchParams.get("year") ?? undefined,
      });
  const windowSize = months ?? 4;
  const monthSequence = getMonthSequence(base.year, base.month, windowSize);
  const monthParams = monthSequence.map((item) => item.monthParam);

  const { data, error } = await supabase
    .from("category_budgets")
    .select("category, amount, month_year")
    .eq("user_id", user.id)
    .in("month_year", monthParams);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({
    months: monthSequence,
    budgets: data ?? [],
  });
}
