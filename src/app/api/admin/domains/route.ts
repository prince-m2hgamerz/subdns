import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { requireAdmin } from "@/lib/admin-auth-guard";

export async function GET() {
  const auth = await requireAdmin();
  if (!auth.allowed) return auth.response;

  const { data: domains } = await supabase
    .from("root_domains")
    .select("*")
    .order("sort_order", { ascending: true })
    .order("domain", { ascending: true });
  return NextResponse.json(
    (domains ?? []).map((d: Record<string, unknown>) => ({
      id: d.id,
      domain: d.domain,
      zoneId: d.zone_id,
      isActive: d.is_active,
      isDefault: d.is_default,
      sortOrder: d.sort_order,
      createdAt: d.created_at,
    }))
  );
}

export async function POST(req: Request) {
  const auth = await requireAdmin();
  if (!auth.allowed) return auth.response;

  const body = await req.json();

  if (!body.domain || typeof body.domain !== "string") {
    return NextResponse.json({ error: "Domain is required" }, { status: 400 });
  }

  const maxOrder = await supabase
    .from("root_domains")
    .select("sort_order")
    .order("sort_order", { ascending: false })
    .limit(1)
    .maybeSingle();

  const insertPayload: Record<string, unknown> = {
    domain: body.domain,
    zone_id: body.cloudflareZoneId ?? "",
    is_active: body.active ?? true,
    is_default: body.default ?? false,
    sort_order: body.sortOrder ?? (maxOrder.data?.sort_order ?? 0) + 1000,
  };

  const { data: rootDomain } = await supabase
    .from("root_domains")
    .insert(insertPayload)
    .select("*")
    .single();

  return NextResponse.json(
    {
      id: rootDomain?.id,
      domain: rootDomain?.domain,
      zoneId: rootDomain?.zone_id,
      isActive: rootDomain?.is_active,
      isDefault: rootDomain?.is_default,
      sortOrder: rootDomain?.sort_order,
      createdAt: rootDomain?.created_at,
    },
    { status: 201 }
  );
}
