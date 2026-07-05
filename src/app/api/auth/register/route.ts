import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { supabase } from "@/lib/supabase";
import { getSettings } from "@/lib/settings-store";

export async function POST(req: Request) {
  try {
    const { name, email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json(
        { success: false, error: "Email and password required" },
        { status: 400 }
      );
    }

    if (password.length < 8) {
      return NextResponse.json(
        { success: false, error: "Password must be at least 8 characters" },
        { status: 400 }
      );
    }

    const settings = await getSettings();
    if (settings.registrationOpen !== "true") {
      return NextResponse.json(
        { success: false, error: "Registration is currently closed" },
        { status: 403 }
      );
    }

    const { data: existing } = await supabase
      .from("users")
      .select("id")
      .eq("email", email)
      .maybeSingle();
    if (existing) {
      return NextResponse.json(
        { success: false, error: "Email already registered" },
        { status: 409 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const { data: user, error: insertError } = await supabase
      .from("users")
      .insert({
        name: name || email.split("@")[0],
        email,
        password: hashedPassword,
      })
      .select("id, email, name")
      .single();

    if (insertError || !user) {
      console.error("Supabase insert error:", insertError);
      return NextResponse.json(
        { success: false, error: insertError?.message || "Failed to create user" },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: "Account created successfully",
        data: { id: user.id, email: user.email, name: user.name },
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Registration error:", error?.message || error, error?.stack);
    return NextResponse.json(
      { success: false, error: error?.message || "Internal server error", detail: error?.stack?.split('\n')?.[0] },
      { status: 500 }
    );
  }
}
