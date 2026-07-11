import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { requireAdmin } from "@/lib/admin-auth-guard";

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const auth = await requireAdmin();
  if (!auth.allowed) return auth.response;

  const { id } = await params;
  await supabase.from("reserved_names").delete().eq("id", id);

  return NextResponse.json({ success: true });
}
