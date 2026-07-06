import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { supabase } from "@/lib/supabase";

export async function POST(request: Request) {
  try {
    const { token, password } = await request.json();

    if (!token || !password) {
      return NextResponse.json({ error: "Token and password are required" }, { status: 400 });
    }

    if (password.length < 8) {
      return NextResponse.json({ error: "Password must be at least 8 characters" }, { status: 400 });
    }

    const { data: resetToken } = await supabase
      .from("password_reset_tokens")
      .select("*, users!inner(id, email)")
      .eq("token", token)
      .maybeSingle();

    if (!resetToken) {
      return NextResponse.json({ error: "Invalid or expired reset token" }, { status: 400 });
    }

    if (resetToken.used) {
      return NextResponse.json({ error: "This reset link has already been used" }, { status: 400 });
    }

    if (new Date(resetToken.expires_at) < new Date()) {
      return NextResponse.json({ error: "This reset link has expired" }, { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    await supabase.from("users").update({ password: hashedPassword }).eq("id", resetToken.user_id);

    await supabase.from("password_reset_tokens").update({ used: true }).eq("token", token);

    return NextResponse.json({ message: "Password reset successfully" });
  } catch (err) {
    console.error("confirm-reset error:", err);
    return NextResponse.json({ error: "Something went wrong. Try again later." }, { status: 500 });
  }
}
