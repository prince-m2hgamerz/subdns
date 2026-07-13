import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { getUserId } from "@/lib/get-user-id";

export async function POST(req: NextRequest) {
  const userId = await getUserId(req);
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { fullName, dateOfBirth, address, phone, purpose } = await req.json();

  if (!fullName || !dateOfBirth || !address || !phone || !purpose) {
    return NextResponse.json({ error: "fullName, dateOfBirth, address, phone, and purpose are required" }, { status: 400 });
  }

  const { data: existing } = await supabase
    .from("kyc_verifications")
    .select("id, verification_status")
    .eq("user_id", userId)
    .maybeSingle();

  if (existing && existing.verification_status === "verified") {
    return NextResponse.json({ error: "KYC has already been verified" }, { status: 409 });
  }

  const payload: Record<string, unknown> = {
    full_name: fullName,
    date_of_birth: dateOfBirth,
    address,
    phone,
    purpose,
    updated_at: new Date().toISOString(),
  };

  if (existing) {
    payload.verification_status = "pending";
    payload.rejection_reason = null;

    const { data: verification } = await supabase
      .from("kyc_verifications")
      .update(payload)
      .eq("id", existing.id)
      .select()
      .single();

    return NextResponse.json({ verification }, { status: 200 });
  }

  payload.user_id = userId;
  payload.verification_status = "pending";

  const { data: verification } = await supabase
    .from("kyc_verifications")
    .insert(payload)
    .select()
    .single();

  return NextResponse.json({ verification }, { status: 201 });
}

export async function GET(req: NextRequest) {
  const userId = await getUserId(req);
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data: verification } = await supabase
    .from("kyc_verifications")
    .select("*")
    .eq("user_id", userId)
    .maybeSingle();

  return NextResponse.json({ verification: verification ?? null });
}
