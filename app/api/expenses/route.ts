import { NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { expenseSchema } from "@/lib/validations/expense";

const querySchema = z.object({
  month: z.string().regex(/^\d{4}-\d{2}$/).optional(),
  category: z.string().min(1).optional(),
  search: z.string().min(1).optional(),
});

const monthRange = (month: string) => {
  const parts = month.split("-").map((p) => Number(p));
  if (parts.length !== 2 || !Number.isFinite(parts[0]) || !Number.isFinite(parts[1])) {
    return null;
  }
  const [year, monthIndex] = parts;
  const start = new Date(year, monthIndex - 1, 1);
  if (Number.isNaN(start.getTime())) return null;
  const end = new Date(year, monthIndex, 1);
  const startStr = start.toISOString().split("T")[0];
  const endStr = end.toISOString().split("T")[0];
  return { startStr, endStr };
};

/**
 * GET /api/expenses - list expenses with optional filters.
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
    month: searchParams.get("month") ?? undefined,
    category: searchParams.get("category") ?? undefined,
    search: searchParams.get("search") ?? undefined,
  });

  if (!parsedQuery.success) {
    return NextResponse.json({ error: parsedQuery.error.flatten() }, { status: 400 });
  }

  const { month, category, search } = parsedQuery.data;

  let query = supabase
    .from("expenses")
    .select("*")
    .eq("user_id", user.id)
    .order("date", { ascending: false });

  if (month) {
    const range = monthRange(month);
    if (!range) {
      return NextResponse.json({ error: "Invalid month format" }, { status: 400 });
    }
    query = query.gte("date", range.startStr).lt("date", range.endStr);
  }

  if (category) {
    query = query.eq("category", category);
  }

  if (search) {
    const escaped = search.replaceAll(",", "");
    query = query.or(`description.ilike.%${escaped}%,category.ilike.%${escaped}%`);
  }

  const { data, error } = await query;
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data ?? []);
}

/**
 * POST /api/expenses - create a new expense.
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
  const parsed = expenseSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const { data, error } = await supabase
    .from("expenses")
    .insert({ ...parsed.data, user_id: user.id })
    .select("*")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data, { status: 201 });
}