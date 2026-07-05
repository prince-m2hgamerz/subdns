import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { logActivity } from "@/lib/activity";
import { getUserId } from "@/lib/get-user-id";

export async function POST(req: NextRequest) {
  const userId = await getUserId(req);
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { type, subject, description } = await req.json();

  if (!subject || !description) {
    return NextResponse.json({ error: "Subject and description are required" }, { status: 400 });
  }

  const ip = req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip") || undefined;
  const userAgent = req.headers.get("user-agent") || undefined;

  const { data: report } = await supabase
    .from("reports")
    .insert({ type: type || "ISSUE", subject, description, user_id: userId })
    .select("id, type")
    .single();

  if (report) {
    await logActivity({
      userId,
      type: "REPORT_SUBMITTED",
      description: `Report submitted: ${subject}`,
      ip,
      userAgent,
      metadata: { reportId: report.id, type: report.type },
    });
  }

  return NextResponse.json({ success: true, id: report!.id });
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
  const isAdmin = user && user.role !== "USER";

  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status");

  if (isAdmin) {
    let query = supabase
      .from("reports")
      .select("*, user:users(name, email)")
      .order("created_at", { ascending: false });

    if (status) query = query.eq("status", status);

    const { data: reports } = await query;
    return NextResponse.json({ reports });
  }

  let query = supabase
    .from("reports")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (status) query = query.eq("status", status);

  const { data: reports } = await query;
  return NextResponse.json({ reports });
}
