import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { getUserId } from "@/lib/get-user-id";

const VALID_TYPES = ["terms_of_service", "privacy_policy", "aup", "dmca", "refunds", "cookies", "disclaimer"];

export async function POST(req: NextRequest) {
  const userId = await getUserId(req);
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { agreementType } = await req.json();

  if (!agreementType || !VALID_TYPES.includes(agreementType)) {
    return NextResponse.json(
      { error: `agreementType must be one of: ${VALID_TYPES.join(", ")}` },
      { status: 400 }
    );
  }

  const { data: existing } = await supabase
    .from("user_agreements")
    .select("id")
    .eq("user_id", userId)
    .eq("agreement_type", agreementType)
    .maybeSingle();

  if (existing) {
    return NextResponse.json({ error: "Agreement already accepted" }, { status: 409 });
  }

  const { data: agreement } = await supabase
    .from("user_agreements")
    .insert({
      user_id: userId,
      agreement_type: agreementType,
      ip_address: req.headers.get("x-forwarded-for") ?? undefined,
      user_agent: req.headers.get("user-agent") ?? undefined,
    })
    .select()
    .single();

  return NextResponse.json({ agreement }, { status: 201 });
}

export async function GET(req: NextRequest) {
  const userId = await getUserId(req);
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data: agreements } = await supabase
    .from("user_agreements")
    .select("*")
    .eq("user_id", userId)
    .order("accepted_at", { ascending: false });

  return NextResponse.json({ agreements });
}
