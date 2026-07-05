import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { supabase } from "@/lib/supabase";
import { verifyPayment } from "@/lib/cashfree";

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const userId = (session?.user as { id?: string })?.id;
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const orderId = searchParams.get("order_id");
    if (!orderId) {
      return NextResponse.json({ error: "Missing order_id" }, { status: 400 });
    }

    const { data: sub } = await supabase
      .from("subscriptions")
      .select("*")
      .eq("order_id", orderId)
      .eq("user_id", userId)
      .single();

    if (!sub) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    if (sub.status === "ACTIVE") {
      return NextResponse.json({ success: true, plan: sub.plan, status: "ACTIVE" });
    }

    const payment = await verifyPayment(orderId);
    const isSuccess = payment.order_status === "SUCCESS";

    if (isSuccess) {
      await supabase
        .from("subscriptions")
        .update({
          status: "ACTIVE",
          paid_at: new Date().toISOString(),
        })
        .eq("order_id", orderId);

      await supabase
        .from("users")
        .update({ plan: sub.plan })
        .eq("id", userId);
    }

    return NextResponse.json({
      success: isSuccess,
      plan: sub.plan,
      status: isSuccess ? "ACTIVE" : "FAILED",
    });
  } catch (error: any) {
    console.error("Verify payment error:", error?.message || error);
    return NextResponse.json(
      { error: error?.message || "Verification failed" },
      { status: 500 }
    );
  }
}
