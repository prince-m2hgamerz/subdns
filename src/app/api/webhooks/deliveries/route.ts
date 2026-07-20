import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { getUserId } from "@/lib/get-user-id";

export async function GET(req: NextRequest) {
  const userId = await getUserId(req);
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const webhookId = searchParams.get("webhook_id");

  const query = supabase
    .from("webhook_deliveries")
    .select("*, webhooks!inner(user_id)")
    .eq("webhooks.user_id", userId)
    .order("created_at", { ascending: false })
    .limit(50);

  if (webhookId) {
    query.eq("webhook_id", webhookId);
  }

  const { data, error } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data || []);
}
