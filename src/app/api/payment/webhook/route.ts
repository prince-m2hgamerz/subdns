import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { verifyWebhookSignature } from "@/lib/cashfree";
import { logActivity } from "@/lib/activity";
import { notify } from "@/lib/notifications";

const WEBHOOK_BODY_LIMIT = 1024 * 100;

const processedIds = new Set<string>();

setInterval(() => processedIds.clear(), 300_000);

const allowedIps = (process.env.CASHFREE_WEBHOOK_IPS || "")
  .split(",")
  .map((s) => s.trim())
  .filter(Boolean);

function isAllowedIp(req: Request): boolean {
  if (allowedIps.length === 0) return true;
  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    req.headers.get("x-real-ip") ||
    "";
  return allowedIps.includes(ip);
}

export async function POST(req: Request) {
  try {
    if (!isAllowedIp(req)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const eventId = req.headers.get("x-webhook-id") || "";

    const body = await req.text();
    if (body.length > WEBHOOK_BODY_LIMIT) {
      return NextResponse.json({ error: "Payload too large" }, { status: 413 });
    }

    const signature = req.headers.get("x-webhook-signature") || "";
    const timestamp = req.headers.get("x-webhook-timestamp") || "";

    const isValid = await verifyWebhookSignature(signature, timestamp, body);
    if (!isValid) {
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
    }

    if (eventId) {
      if (processedIds.has(eventId)) {
        return NextResponse.json({ success: true });
      }
      processedIds.add(eventId);
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

        try { await notify(sub.user_id, "plan_changed", { plan: sub.plan }); } catch {}
      }
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Webhook error:", error?.message || error);
    return NextResponse.json({ success: false });
  }
}
