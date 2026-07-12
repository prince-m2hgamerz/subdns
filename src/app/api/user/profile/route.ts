import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { getUserId } from "@/lib/get-user-id";
import { isPlaceholderEmail } from "@/lib/sms";

export async function PATCH(req: NextRequest) {
  const userId = await getUserId(req);
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { name, email, phone } = await req.json();

  if (!name || name.trim().length === 0) {
    return NextResponse.json({ error: "Name is required" }, { status: 400 });
  }

  const updateData: Record<string, string> = { name: name.trim() };

  if (phone !== undefined) {
    const trimmed = phone.trim();
    if (trimmed && !/^\+?\d{7,15}$/.test(trimmed.replace(/[\s-]/g, ""))) {
      return NextResponse.json({ error: "Invalid phone number format" }, { status: 400 });
    }
    updateData.phone = trimmed || "";
  }

  if (email !== undefined) {
    const { data: user } = await supabase
      .from("users")
      .select("email")
      .eq("id", userId)
      .single();

    if (user && isPlaceholderEmail(user.email)) {
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        return NextResponse.json({ error: "Invalid email format" }, { status: 400 });
      }

      const { data: existing } = await supabase
        .from("users")
        .select("id")
        .eq("email", email)
        .neq("id", userId)
        .maybeSingle();

      if (existing) {
        return NextResponse.json({ error: "Email already in use" }, { status: 409 });
      }

      updateData.email = email;
    }
  }

  await supabase
    .from("users")
    .update(updateData)
    .eq("id", userId);

  return NextResponse.json({ success: true });
}
