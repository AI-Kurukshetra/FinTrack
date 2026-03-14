import { NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";

const exportParamsSchema = z.object({
  from: z.string().optional(),
  to: z.string().optional(),
});

const csvEscape = (value: string | number | null) => {
  if (value === null || value === undefined) return "";
  const str = String(value);
  if (/[",\n]/.test(str)) {
    return `"${str.replaceAll('"', '""')}"`;
  }
  return str;
};

/**
 * GET /api/export - download expenses CSV.
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
  const params = exportParamsSchema.safeParse({
    from: searchParams.get("from") ?? undefined,
    to: searchParams.get("to") ?? undefined,
  });

  if (!params.success) {
    return NextResponse.json({ error: params.error.flatten() }, { status: 400 });
  }

  let query = supabase
    .from("expenses")
    .select("id,amount,category,description,date,created_at")
    .eq("user_id", user.id)
    .order("date", { ascending: false });

  if (params.data.from) {
    query = query.gte("date", params.data.from);
  }

  if (params.data.to) {
    query = query.lte("date", params.data.to);
  }

  const { data, error } = await query;
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const header = ["id", "amount", "category", "description", "date", "created_at"];
  const lines = [header.join(",")];

  for (const row of data ?? []) {
    const line = [
      csvEscape(row.id),
      csvEscape(row.amount),
      csvEscape(row.category),
      csvEscape(row.description ?? ""),
      csvEscape(row.date),
      csvEscape(row.created_at),
    ].join(",");
    lines.push(line);
  }

  const csv = lines.join("\n");

  return new Response(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": "attachment; filename=fintrack-expenses.csv",
    },
  });
}