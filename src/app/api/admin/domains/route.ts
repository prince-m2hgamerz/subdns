import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { supabase } from "@/lib/supabase";

async function checkAdmin() {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as { id?: string })?.id;
  if (!userId) return null;
  const { data: admin } = await supabase
    .from("users")
    .select("role")
    .eq("id", userId)
    .single();
  if (admin?.role !== "ADMIN" && admin?.role !== "SUPER_ADMIN") return null;
  return userId;
}

export async function GET() {
  const userId = await checkAdmin();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data: domains } = await supabase
    .from("root_domains")
    .select("*")
    .order("created_at", { ascending: false });
  return NextResponse.json(
    (domains ?? []).map((d: Record<string, unknown>) => ({
      id: d.id,
      domain: d.domain,
      zoneId: d.zone_id,
      isActive: d.is_active,
      isDefault: d.is_default,
      createdAt: d.created_at,
    }))
  );
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as { id?: string })?.id;
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data: admin } = await supabase
    .from("users")
    .select("role")
    .eq("id", userId)
    .single();

  if (admin?.role !== "ADMIN" && admin?.role !== "SUPER_ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await req.json();

  if (!body.domain || typeof body.domain !== "string") {
    return NextResponse.json({ error: "Domain is required" }, { status: 400 });
  }

  const { data: rootDomain } = await supabase
    .from("root_domains")
    .insert({
      domain: body.domain,
      zone_id: body.cloudflareZoneId ?? "",
      is_active: body.active ?? true,
      is_default: body.default ?? false,
    })
    .select("*")
    .single();

  return NextResponse.json(
    {
      id: rootDomain?.id,
      domain: rootDomain?.domain,
      zoneId: rootDomain?.zone_id,
      isActive: rootDomain?.is_active,
      isDefault: rootDomain?.is_default,
      createdAt: rootDomain?.created_at,
    },
    { status: 201 }
  );
}
