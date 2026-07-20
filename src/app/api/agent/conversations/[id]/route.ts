import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { getUserId } from "@/lib/get-user-id";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const userId = await getUserId(req);
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  const { data: conversation, error: convError } = await supabase
    .from("conversations")
    .select("*")
    .eq("id", id)
    .eq("user_id", userId)
    .single();

  if (convError || !conversation) {
    return NextResponse.json({ error: "Conversation not found" }, { status: 404 });
  }

  const { data: messages, error: msgError } = await supabase
    .from("messages")
    .select("*")
    .eq("conversation_id", id)
    .order("created_at", { ascending: true });

  if (msgError) {
    return NextResponse.json({ error: msgError.message }, { status: 500 });
  }

  return NextResponse.json({ conversation, messages });
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const userId = await getUserId(req);
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const body = await req.json().catch(() => ({}));
  const title = body.title?.trim()?.slice(0, 100);

  if (!title) {
    return NextResponse.json({ error: "title is required" }, { status: 400 });
  }

  const { data, error } = await supabase
    .from("conversations")
    .update({ title, updated_at: new Date().toISOString() })
    .eq("id", id)
    .eq("user_id", userId)
    .select()
    .single();

  if (error || !data) {
    return NextResponse.json({ error: "Conversation not found" }, { status: 404 });
  }

  return NextResponse.json({ conversation: data });
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const userId = await getUserId(req);
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  const { error } = await supabase
    .from("conversations")
    .delete()
    .eq("id", id)
    .eq("user_id", userId);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
