import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { getUserId } from "@/lib/get-user-id";
import { logActivity } from "@/lib/activity";

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const userId = await getUserId(req);
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const { name, scopes, description, expiresAt } = await req.json();

  const { data: key } = await supabase
    .from("api_keys")
    .select("id, user_id")
    .eq("id", id)
    .single();

  if (!key || key.user_id !== userId) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const update: Record<string, unknown> = {};
  if (name !== undefined) update.name = name;
  if (scopes !== undefined) update.scopes = scopes;
  if (description !== undefined) update.description = description;
  if (expiresAt !== undefined) update.expires_at = expiresAt;

  if (Object.keys(update).length > 0) {
    await supabase.from("api_keys").update(update).eq("id", id);
  }

  await logActivity({
    userId,
    event: "API_KEY_UPDATED",
    metadata: JSON.stringify({ keyId: id }),
    ip: req.headers.get("x-forwarded-for") || "",
    userAgent: req.headers.get("user-agent") || "",
  });

  return NextResponse.json({ success: true });
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const userId = await getUserId(req);
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  const { data: key } = await supabase
    .from("api_keys")
    .select("id, name, user_id")
    .eq("id", id)
    .single();

  if (!key || key.user_id !== userId) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  await supabase.from("api_keys").delete().eq("id", id);

  await logActivity({
    userId,
    event: "API_KEY_DELETED",
    metadata: JSON.stringify({ keyId: id, name: key.name }),
    ip: req.headers.get("x-forwarded-for") || "",
    userAgent: req.headers.get("user-agent") || "",
  });

  return NextResponse.json({ success: true });
}
