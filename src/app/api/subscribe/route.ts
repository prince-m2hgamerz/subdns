import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { logActivity } from "@/lib/activity";

export async function POST(req: NextRequest) {
  const { email } = await req.json();

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: "Valid email is required" }, { status: 400 });
  }

  const ip = req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip") || undefined;
  const userAgent = req.headers.get("user-agent") || undefined;

  const { error } = await supabase
    .from("contact_messages")
    .insert({
      name: email,
      email,
      subject: "Newsletter Subscription",
      message: "Newsletter subscription via email capture form",
    });

  if (error) {
    return NextResponse.json({ error: "Failed to subscribe" }, { status: 500 });
  }

  await logActivity({
    type: "CONTACT_SENT",
    description: `Newsletter subscription: ${email}`,
    ip,
    userAgent,
    metadata: { email },
  });

  return NextResponse.json({ success: true });
}
