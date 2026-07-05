import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { supabase } from "@/lib/supabase";

const SECURITY_TYPES = ["SECURITY_EVENT", "LOGIN", "API_KEY_CREATED", "API_KEY_DELETED"];

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as { id?: string })?.id;
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data: admin } = await supabase
    .from("users")
    .select("role")
    .eq("id", userId)
    .single();

  if (admin?.role !== "ADMIN" && admin?.role !== "SUPER_ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

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

  return NextResponse.json({
    events,
    pagination: {
      page,
      limit,
      total: total ?? 0,
      pages: Math.ceil((total ?? 0) / limit),
    },
  });
}
