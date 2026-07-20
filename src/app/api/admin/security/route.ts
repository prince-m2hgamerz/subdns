import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { requireAdmin } from "@/lib/admin-auth-guard";

const SECURITY_TYPES = ["SECURITY_EVENT", "LOGIN", "API_KEY_CREATED", "API_KEY_UPDATED", "API_KEY_DELETED"];

export async function GET(req: NextRequest) {
  const auth = await requireAdmin();
  if (!auth.allowed) return auth.response;

  const { searchParams } = new URL(req.url);
  const page = parseInt(searchParams.get("page") ?? "1");
  const limit = parseInt(searchParams.get("limit") ?? "20");
  const search = searchParams.get("search") ?? "";

  let query = supabase
    .from("activities")
    .select("*, user:users(name, email)", { count: "exact" })
    .in("type", SECURITY_TYPES)
    .order("created_at", { ascending: false })
    .range((page - 1) * limit, page * limit - 1);

  if (search) {
    query = query.ilike("description", `%${search}%`);
  }

  const { data: events, count: total } = await query;

  const mapped = (events ?? []).map(({ created_at, user_agent, ...rest }) => ({
    ...rest,
    createdAt: created_at,
    userAgent: user_agent,
  }));

  return NextResponse.json({
    events: mapped,
    pagination: {
      page,
      limit,
      total: total ?? 0,
      pages: Math.ceil((total ?? 0) / limit),
    },
  });
}
