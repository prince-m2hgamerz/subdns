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
  return NextResponse.json(domains);
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

  return NextResponse.json(rootDomain, { status: 201 });
}
