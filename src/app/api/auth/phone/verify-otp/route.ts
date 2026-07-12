import { NextResponse } from "next/server";
import { getCached, invalidateCache, setCache } from "@/lib/redis";
import { supabase } from "@/lib/supabase";

export async function POST(request: Request) {
  try {
    const { phone, otp } = await request.json();

    if (!phone || !otp) {
      return NextResponse.json(
        { error: "Phone and OTP are required" },
        { status: 400 }
      );
    }

    const storedOtp = await getCached<string>(`otp:${phone}`);
    console.log(`[verify-otp] phone=${phone} otp=${otp} storedOtp=${storedOtp} storedOtp===otp=${storedOtp === otp}`);
    if (!storedOtp || storedOtp !== otp) {
      return NextResponse.json(
        { error: "Invalid or expired OTP" },
        { status: 400 }
      );
    }

    await invalidateCache(`otp:${phone}`);

    const { data: existingUser } = await supabase
      .from("users")
      .select("id, email, name, image, role, is_banned")
      .eq("phone", phone)
      .maybeSingle();

    let userId: string;
    let userRole: string | undefined;

    if (existingUser) {
      if (existingUser.is_banned) {
        return NextResponse.json(
          { error: "Account suspended" },
          { status: 403 }
        );
      }
      userId = existingUser.id;
      userRole = existingUser.role;
    } else {
      const placeholderEmail = `phone_${phone.replace(/[^0-9]/g, "")}@subdns.m2hio.in`;
      const { data: newUser, error: createError } = await supabase
        .from("users")
        .insert({ phone, email: placeholderEmail, name: phone, password: "" })
        .select("id, role")
        .single();

      if (createError || !newUser) {
        console.error("Phone user insert error:", createError);
        return NextResponse.json(
          { error: "Failed to create user" },
          { status: 500 }
        );
      }
      userId = newUser.id;
      userRole = newUser.role;
    }

    await setCache(`verified_phone:${phone}`, { userId, role: userRole }, 60);

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
