import { NextResponse } from "next/server";
import crypto from "crypto";
import { supabase } from "@/lib/supabase";
import { sendPasswordResetEmail } from "@/lib/email";

export async function POST(request: Request) {
  try {
    const { email } = await request.json();

    if (!email || typeof email !== "string") {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    const { data: user } = await supabase
      .from("users")
      .select("id, email")
      .eq("email", email.toLowerCase().trim())
      .maybeSingle();

    if (!user) {
      return NextResponse.json({ message: "If an account exists, a reset link has been sent." });
    }

    const token = crypto.randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000).toISOString();

    await supabase.from("password_reset_tokens").insert({
      token,
      user_id: user.id,
      expires_at: expiresAt,
    });

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const resetUrl = `${appUrl}/auth/reset-password?token=${token}`;

    const emailSent = await sendPasswordResetEmail(email, resetUrl);

    return NextResponse.json({
      message: "If an account exists, a reset link has been sent.",
      ...(process.env.NODE_ENV === "development" && !emailSent ? { devToken: token } : {}),
    });
  } catch (err) {
    console.error("reset-password error:", err);
    return NextResponse.json({ error: "Something went wrong. Try again later." }, { status: 500 });
  }
}
