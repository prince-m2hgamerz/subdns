import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { PLANS, type PlanId } from "@/lib/plans";
import { requireAdmin } from "@/lib/admin-auth-guard";

const VALID_PLANS = ["BRONZE", "SILVER", "GOLD"] as const;

export async function GET() {
  const auth = await requireAdmin();
  if (!auth.allowed) return auth.response;

  const { data: rows } = await supabase
    .from("plan_configs")
    .select("*")
    .order("plan_id");

  const merged = Object.values(PLANS).map((defaultPlan) => {
    const dbRow = rows?.find((r: any) => r.plan_id === defaultPlan.id);
    return {
      ...defaultPlan,
      name: dbRow?.name ?? defaultPlan.name,
      description: dbRow?.description ?? defaultPlan.description,
      price: dbRow?.price ?? defaultPlan.price,
      priceDisplay: `₹${dbRow?.price ?? defaultPlan.price}`,
      features: dbRow?.features ?? defaultPlan.features,
      dbId: dbRow?.id ?? null,
      isActive: dbRow?.is_active ?? true,
    };
  });

  return NextResponse.json({ plans: merged });
}

export async function PUT(req: Request) {
  const auth = await requireAdmin();
  if (!auth.allowed) return auth.response;

  const body = await req.json();
  const { planId, name, description, price, features } = body;

  if (!planId) {
    return NextResponse.json({ error: "planId is required" }, { status: 400 });
  }

  const planIdUpper = (planId as string).toUpperCase();
  if (!(VALID_PLANS as readonly string[]).includes(planIdUpper)) {
    return NextResponse.json({ error: "Invalid plan" }, { status: 400 });
  }

  const numericPrice = Number(price);
  if (!Number.isFinite(numericPrice) || numericPrice < 0) {
    return NextResponse.json({ error: "Invalid price" }, { status: 400 });
  }

  const cleanFeatures = Array.isArray(features)
    ? features.filter((f: unknown) => typeof f === "string" && f.trim())
    : [];

  const { data: existing } = await supabase
    .from("plan_configs")
    .select("id")
    .eq("plan_id", planIdUpper)
    .maybeSingle();

  let result;
  if (existing) {
    result = await supabase
      .from("plan_configs")
      .update({
        name,
        description,
        price: numericPrice,
        features: cleanFeatures,
        updated_at: new Date().toISOString(),
      })
      .eq("plan_id", planIdUpper);
  } else {
    result = await supabase.from("plan_configs").insert({
      plan_id: planIdUpper,
      name,
      description,
      price: numericPrice,
      features: cleanFeatures,
    });
  }

  if (result.error) {
    return NextResponse.json({ error: result.error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
