import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { getUserId } from "@/lib/get-user-id";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const userId = await getUserId(req);
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const { searchParams } = new URL(req.url);
  const limit = Math.min(Number(searchParams.get("limit")) || 20, 100);

  const { data } = await supabase
    .from("webhook_deliveries")
    .select("*, webhooks!inner(user_id)")
    .eq("webhooks.user_id", userId)
    .eq("webhook_deliveries.webhook_id", id)
    .order("created_at", { ascending: false })
    .limit(limit);

  return NextResponse.json(data ?? []);
}
