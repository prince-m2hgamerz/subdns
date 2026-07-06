import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { getUserId } from "@/lib/get-user-id";
import { logActivity } from "@/lib/activity";

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
