import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { requireAdmin } from "@/lib/admin-auth-guard";

async function getParams(params: Promise<{ id: string }>) {
  const { id } = await params;
  return id;
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const auth = await requireAdmin();
  if (!auth.allowed) return auth.response;

  const id = await getParams(params);
  await supabase.from("root_domains").delete().eq("id", id);
  return NextResponse.json({ success: true });
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const auth = await requireAdmin();
  if (!auth.allowed) return auth.response;

  const id = await getParams(params);
  const body = await req.json();

  const updates: Record<string, unknown> = {};

  if (typeof body.isDefault === "boolean") {
    updates.is_default = body.isDefault;
  }

  if (typeof body.isActive === "boolean") {
    updates.is_active = body.isActive;
  }

  if (typeof body.sortOrder === "number") {
    updates.sort_order = body.sortOrder;
  }

  const { data: updated } = await supabase
    .from("root_domains")
    .update(updates)
    .eq("id", id)
    .select("*")
    .single();

  return NextResponse.json({
    id: updated?.id,
    domain: updated?.domain,
    zoneId: updated?.zone_id,
    isActive: updated?.is_active,
    isDefault: updated?.is_default,
    sortOrder: updated?.sort_order,
    createdAt: updated?.created_at,
  });
}
