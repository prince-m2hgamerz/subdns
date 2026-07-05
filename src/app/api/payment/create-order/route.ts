import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { supabase } from "@/lib/supabase";
import { createOrder } from "@/lib/cashfree";
import { getSettings } from "@/lib/settings-store";
import { PLANS, type PlanId } from "@/lib/plans";

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const userId = (session?.user as { id?: string })?.id;
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { planId } = await req.json();
    const plan = PLANS[planId as PlanId];
    if (!plan || plan.price === 0) {
      return NextResponse.json({ error: "Invalid plan" }, { status: 400 });
    }

    const { data: user } = await supabase
      .from("users")
      .select("plan, email, name")
      .eq("id", userId)
      .single();

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const currentPlan = PLANS[user.plan as PlanId] ?? PLANS.BRONZE;
    if (currentPlan.priority >= plan.priority) {
      return NextResponse.json(
        { error: "You already have this plan or a higher plan" },
        { status: 400 }
      );
    }

    const orderId = `ORD-${Date.now()}-${userId.slice(0, 8)}`;

    const { error: insertErr } = await supabase.from("subscriptions").insert({
      order_id: orderId,
      user_id: userId,
      plan: planId,
      order_amount: plan.price,
      status: "PENDING",
    });

    if (insertErr) {
      console.error("Failed to insert subscription:", insertErr);
      return NextResponse.json(
        { error: "Failed to initiate subscription" },
        { status: 500 }
      );
    }

    const order = await createOrder({
      orderId,
      amount: plan.price,
      customerId: userId,
      customerEmail: user.email,
    });

    await supabase
      .from("subscriptions")
      .update({ payment_session_id: order.payment_session_id })
      .eq("order_id", orderId);

    const settings = await getSettings();
    const mode = settings.payment_mode === "test" ? "sandbox" : "production";

    return NextResponse.json({
      success: true,
      payment_session_id: order.payment_session_id,
      order_id: orderId,
      amount: plan.price,
      mode,
    });
  } catch (error: any) {
    console.error("Create order error:", error?.message || error);
    return NextResponse.json(
      { error: error?.message || "Failed to create order" },
      { status: 500 }
    );
  }
}
