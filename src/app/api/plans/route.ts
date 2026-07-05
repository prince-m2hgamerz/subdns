import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { PLANS } from "@/lib/plans";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const { data: rows } = await supabase
      .from("plan_configs")
      .select("*")
      .order("plan_id");

    const plans = Object.values(PLANS).map((defaultPlan) => {
      const dbRow = rows?.find((r: any) => r.plan_id === defaultPlan.id);
      return {
        ...defaultPlan,
        name: dbRow?.name ?? defaultPlan.name,
        description: dbRow?.description ?? defaultPlan.description,
        price: dbRow?.price ?? defaultPlan.price,
        priceDisplay: `₹${dbRow?.price ?? defaultPlan.price}`,
        features: dbRow?.features ?? defaultPlan.features,
      };
    });

    return NextResponse.json({ plans });
  } catch {
    // Fallback: return hardcoded plans
    return NextResponse.json({
      plans: Object.values(PLANS),
    });
  }
}
