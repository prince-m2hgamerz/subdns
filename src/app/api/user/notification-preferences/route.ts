import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { getUserId } from "@/lib/get-user-id";

const defaultPrefs = {
  notify_on_subdomain_created: true,
  notify_on_dns_created: true,
  notify_on_dns_updated: true,
  notify_on_subdomain_down: true,
  notify_on_account_banned: true,
  notify_on_plan_changed: true,
  notify_on_report_status: true,
  notify_on_api_key_created: true,
};

const prefColumns = Object.keys(defaultPrefs);

export async function GET(req: NextRequest) {
  const userId = await getUserId(req);
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let { data } = await supabase
    .from("user_notification_preferences")
    .select("*")
    .eq("user_id", userId)
    .single();

  if (!data) {
    const { data: inserted } = await supabase
      .from("user_notification_preferences")
      .insert({ user_id: userId, ...defaultPrefs })
      .select()
      .single();
    data = inserted;
  }

  return NextResponse.json(data || defaultPrefs);
}

export async function PUT(req: NextRequest) {
  const userId = await getUserId(req);
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const update: Record<string, boolean | string> = {};

  for (const key of prefColumns) {
    if (typeof body[key] === "boolean") {
      update[key] = body[key];
    }
  }

  if (Object.keys(update).length === 0) {
    return NextResponse.json({ error: "No valid preferences provided" }, { status: 400 });
  }

  update.updated_at = new Date().toISOString();

  const { data, error } = await supabase
    .from("user_notification_preferences")
    .upsert({ user_id: userId, ...update }, { onConflict: "user_id" })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}
