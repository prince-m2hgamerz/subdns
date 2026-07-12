import { NextResponse } from "next/server";
import { setCache } from "@/lib/redis";
import { sendSms } from "@/lib/sms";

function validatePhone(phone: string): boolean {
  return /^\+[1-9]\d{6,14}$/.test(phone);
}

function generateOtp(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export async function POST(request: Request) {
  try {
    const { phone } = await request.json();

    if (!phone || !validatePhone(phone)) {
      return NextResponse.json(
        { error: "Invalid phone number. Use E.164 format (e.g., +919999999999)" },
        { status: 400 }
      );
    }

    const otp = generateOtp();
    console.log(`[send-otp] phone=${phone} otp=${otp} cacheKey=otp:${phone}`);
    await setCache(`otp:${phone}`, otp, 300);

    const sent = await sendSms(
      phone,
      `Your SubDNS verification code is: ${otp}. This code will expire in 5 minutes.`
    );

    if (!sent) {
      return NextResponse.json(
        { error: "Failed to send SMS. Please try again." },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
