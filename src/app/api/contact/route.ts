import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { logActivity } from "@/lib/activity";
import { getUserId } from "@/lib/get-user-id";
import { camelCaseKeys } from "@/lib/transform";

export async function POST(req: NextRequest) {
  const { name, email, subject, message } = await req.json();

  if (!name || !email || !subject || !message) {
    return NextResponse.json({ error: "All fields are required" }, { status: 400 });
  }

  const userId = await getUserId(req);
  const ip = req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip") || undefined;
  const userAgent = req.headers.get("user-agent") || undefined;

  const { data: contact } = await supabase
    .from("contact_messages")
    .insert({ name, email, subject, message, user_id: userId })
    .select("id")
    .single();

  await logActivity({
    userId: userId || undefined,
    type: "CONTACT_SENT",
    description: `Contact form submission: ${subject}`,
    ip,
    userAgent,
    metadata: { contactId: contact!.id, name, email },
  });

  return NextResponse.json({ success: true, id: contact!.id });
}

export async function GET(req: NextRequest) {
  const userId = await getUserId(req);
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data: user } = await supabase
    .from("users")
    .select("role")
    .eq("id", userId)
    .single();
  if (!user || user.role === "USER") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status");

  let query = supabase
    .from("contact_messages")
    .select("*, users(name, email)")
    .order("created_at", { ascending: false });

  if (status) {
    query = query.eq("status", status);
  }

  const { data: messages } = await query;

  return NextResponse.json({ messages: camelCaseKeys(messages) });
}
