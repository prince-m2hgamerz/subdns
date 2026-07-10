import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { getUserId } from "@/lib/get-user-id";
import { getPlan } from "@/lib/plans";
import type { InvoiceData } from "@/types/invoice";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ orderId: string }> }
) {
  const userId = await getUserId(req);
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { orderId } = await params;

  const { data: sub, error } = await supabase
    .from("subscriptions")
    .select("*")
    .eq("order_id", orderId)
    .eq("user_id", userId)
    .single();

  if (error || !sub) {
    return NextResponse.json({ error: "Invoice not found" }, { status: 404 });
  }

  const { data: user } = await supabase
    .from("users")
    .select("name, email")
    .eq("id", userId)
    .single();

  const plan = getPlan(sub.plan);
  const gstRate = 18;
  const subtotal = sub.order_amount;
  const gstAmount = Math.round(subtotal * gstRate) / 100;
  const total = subtotal + gstAmount;
  const amount = subtotal;

  const createdAt = new Date(sub.created_at).toLocaleDateString("en-IN", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const dueDate = new Date(
    new Date(sub.created_at).getTime() + 15 * 24 * 60 * 60 * 1000
  ).toLocaleDateString("en-IN", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const paidDate = sub.paid_at
    ? new Date(sub.paid_at).toLocaleDateString("en-IN", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : null;

  const startOfPeriod = new Date(sub.created_at).toLocaleDateString("en-IN", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const endOfPeriod = new Date(
    new Date(sub.created_at).getFullYear(),
    new Date(sub.created_at).getMonth() + 1,
    new Date(sub.created_at).getDate()
  ).toLocaleDateString("en-IN", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const nextRenewal =
    sub.status === "ACTIVE"
      ? new Date(
          new Date(sub.created_at).getFullYear(),
          new Date(sub.created_at).getMonth() + 1,
          new Date(sub.created_at).getDate()
        ).toLocaleDateString("en-IN", {
          year: "numeric",
          month: "long",
          day: "numeric",
        })
      : null;

  const invoice: InvoiceData = {
    orderId: sub.order_id,
    orderRef: `INV-${sub.order_id.substring(0, 8).toUpperCase()}`,
    status: sub.status,
    planName: plan.name,
    planId: sub.plan,
    amount,
    gstRate,
    gstAmount,
    total,
    issueDate: createdAt,
    dueDate,
    paidAt: paidDate,
    nextRenewal,
    paymentMethod: "Razorpay",
    transactionId: sub.payment_session_id,
    billingPeriod: { start: startOfPeriod, end: endOfPeriod },
    items: [
      {
        service: `${plan.name} Plan`,
        description: `Subdomain DNS management — up to ${plan.maxSubdomains} subdomains, ${plan.maxDnsRecords} DNS records`,
        period: `${startOfPeriod} – ${endOfPeriod}`,
        quantity: 1,
        unitPrice: subtotal,
        subtotal,
      },
    ],
    customer: {
      name: user?.name ?? "User",
      email: user?.email ?? "",
    },
    createdAt: sub.created_at,
  };

  return NextResponse.json({ invoice });
}
