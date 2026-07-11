import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { logActivity } from "@/lib/activity";
import { notify } from "@/lib/notifications";
import { requireAdmin } from "@/lib/admin-auth-guard";

export async function GET(req: NextRequest) {
  const auth = await requireAdmin();
  if (!auth.allowed) return auth.response;

  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status") || "ALL";
  const page = parseInt(searchParams.get("page") || "1");
  const limit = Math.min(parseInt(searchParams.get("limit") || "50"), 100);
  const offset = (page - 1) * limit;

  let countQuery = supabase
    .from("subscriptions")
    .select("*", { count: "exact", head: true });

  let dataQuery = supabase
    .from("subscriptions")
    .select("*, users!inner(email, name)")
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1);

  if (status !== "ALL") {
    countQuery = countQuery.eq("status", status);
    dataQuery = dataQuery.eq("status", status);
  }

  const [{ count }, { data: subscriptions }] = await Promise.all([
    countQuery,
    dataQuery,
  ]);

  return NextResponse.json({ subscriptions, total: count ?? 0, page, limit });
}

export async function POST(req: NextRequest) {
  const auth = await requireAdmin();
  if (!auth.allowed) return auth.response;

  const { subscriptionId } = await req.json();
  if (!subscriptionId) {
    return NextResponse.json({ error: "subscriptionId is required" }, { status: 400 });
  }

  const { data: sub } = await supabase
    .from("subscriptions")
    .select("*")
    .eq("id", subscriptionId)
    .single();

  if (!sub) {
    return NextResponse.json({ error: "Subscription not found" }, { status: 404 });
  }

  if (sub.status !== "ACTIVE") {
    return NextResponse.json({ error: "Only active subscriptions can be cancelled" }, { status: 400 });
  }

  await supabase
    .from("subscriptions")
    .update({ status: "CANCELLED" })
    .eq("id", subscriptionId);

  await supabase
    .from("users")
    .update({ plan: "BRONZE" })
    .eq("id", sub.user_id);

  await logActivity({
    userId: sub.user_id,
    event: "SUBSCRIPTION_CANCELLED",
    metadata: { subscriptionId, plan: sub.plan, cancelledBy: "admin" },
  });

  try { await notify(sub.user_id, "plan_changed", { plan: "BRONZE" }); } catch {}

  return NextResponse.json({ success: true });
}
