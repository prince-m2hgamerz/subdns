import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { getUserId } from "@/lib/get-user-id";

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const userId = await getUserId(req);
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  const { error } = await supabase
    .from("webhooks")
    .delete()
    .eq("id", id)
    .eq("user_id", userId);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const userId = await getUserId(req);
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const body = await req.json();
  const update: Record<string, unknown> = {};

  if (body.url) {
    if (!body.url.startsWith("https://")) {
      return NextResponse.json({ error: "URL must start with https://" }, { status: 400 });
    }
    update.url = body.url;
  }
  if (body.events !== undefined) {
    if (!Array.isArray(body.events) || body.events.length === 0) {
      return NextResponse.json({ error: "At least one event is required" }, { status: 400 });
    }
    update.events = body.events;
  }
  if (body.is_active !== undefined) {
    update.is_active = Boolean(body.is_active);
  }
  if (body.secret !== undefined) {
    update.secret = body.secret || null;
  }
  update.updated_at = new Date().toISOString();

  const { data, error } = await supabase
    .from("webhooks")
    .update(update)
    .eq("id", id)
    .eq("user_id", userId)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}
