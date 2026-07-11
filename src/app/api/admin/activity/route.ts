import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { requireAdmin } from "@/lib/admin-auth-guard";

export async function GET(req: NextRequest) {
  const auth = await requireAdmin();
  if (!auth.allowed) return auth.response;

  const { searchParams } = new URL(req.url);
  const page = parseInt(searchParams.get("page") ?? "1");
  const limit = parseInt(searchParams.get("limit") ?? "20");
  const type = searchParams.get("type") ?? "";

  let query = supabase
    .from("activities")
    .select("*, user:users(name, email)", { count: "exact" })
    .order("created_at", { ascending: false })
    .range((page - 1) * limit, page * limit - 1);

  if (type) query = query.eq("type", type);

  const { data: activities, count: total } = await query;

  const mapped = (activities ?? []).map(({ created_at, user_agent, ...rest }) => ({
    ...rest,
    createdAt: created_at,
    userAgent: user_agent,
  }));

  return NextResponse.json({
    activities: mapped,
    pagination: {
      page,
      limit,
      total: total ?? 0,
      pages: Math.ceil((total ?? 0) / limit),
    },
  });
}
