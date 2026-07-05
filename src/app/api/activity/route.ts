import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { getUserId } from "@/lib/get-user-id";
import { camelCaseKeys } from "@/lib/transform";

export async function GET(req: NextRequest) {
  const userId = await getUserId(req);
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const page = parseInt(searchParams.get("page") ?? "1");
  const limit = parseInt(searchParams.get("limit") ?? "20");
  const offset = (page - 1) * limit;

  const { data: activities, count: total } = await supabase
    .from("activities")
    .select("*", { count: "exact" })
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1);

  return NextResponse.json({
    activities: camelCaseKeys(activities),
    pagination: {
      page,
      limit,
      total: total ?? 0,
      pages: Math.ceil((total ?? 0) / limit),
    },
  });
}
