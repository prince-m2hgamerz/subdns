import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { getUserId } from "@/lib/get-user-id";
import { PLANS, type PlanId } from "@/lib/plans";

export async function GET(req: NextRequest) {
  const userId = await getUserId(req);
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data, error } = await supabase
    .from("subscriptions")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const invoices = (data || []).map((sub) => ({
    order_id: sub.order_id,
    plan: sub.plan,
    plan_name: PLANS[sub.plan as PlanId]?.name ?? sub.plan,
    amount: sub.order_amount,
    amount_display: `Rs ${sub.order_amount}`,
    status: sub.status,
    payment_session_id: sub.payment_session_id,
    created_at: sub.created_at,
  }));

  return NextResponse.json({ invoices });
}
