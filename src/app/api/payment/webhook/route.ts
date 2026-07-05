import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { verifyWebhookSignature } from "@/lib/cashfree";
import { logActivity } from "@/lib/activity";

export async function POST(req: Request) {
  try {
    const body = await req.text();
    const signature = req.headers.get("x-webhook-signature") || "";
    const timestamp = req.headers.get("x-webhook-timestamp") || "";

    const isValid = await verifyWebhookSignature(signature, timestamp, body);
    if (!isValid) {
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
    }

    const payload = JSON.parse(body);
    const orderId = payload?.data?.order?.order_id;
    const orderStatus = payload?.data?.order?.order_status;
    const paidAmount = payload?.data?.order?.order_amount;

    if (!orderId) {
      return NextResponse.json({ error: "Missing order_id" }, { status: 400 });
    }

    if (orderStatus === "PAID") {
      const { data: sub } = await supabase
        .from("subscriptions")
        .select("*")
        .eq("order_id", orderId)
        .single();

      if (sub && sub.status !== "ACTIVE") {
        await supabase
          .from("subscriptions")
          .update({
            status: "ACTIVE",
            paid_at: new Date().toISOString(),
            paid_amount: paidAmount ?? sub.order_amount,
          })
          .eq("order_id", orderId);

        await supabase
          .from("users")
          .update({ plan: sub.plan })
          .eq("id", sub.user_id);

        await logActivity({
          userId: sub.user_id,
          event: "SUBSCRIPTION_ACTIVATED",
          metadata: { orderId, plan: sub.plan, paidAmount: paidAmount ?? sub.order_amount },
        });
      }
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Webhook error:", error?.message || error);
    return NextResponse.json({ success: false });
  }
}
