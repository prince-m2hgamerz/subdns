import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { supabase } from "@/lib/supabase";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
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

  const { id } = await params;
  const body = await req.json();
  if (typeof body !== "object" || Array.isArray(body)) {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const VALID_STATUSES = ["ACTIVE", "SUSPENDED", "PENDING"];
  const updateData: Record<string, unknown> = {};
  if (body.status) {
    if (!VALID_STATUSES.includes(body.status)) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 });
    }
    if (typeof body.status !== "string" || body.status.length > 20) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 });
    }
    updateData.status = body.status;
  }
  if (body.domain) {
    if (typeof body.domain !== "string" || body.domain.length < 1 || body.domain.length > 253) {
      return NextResponse.json({ error: "Invalid domain" }, { status: 400 });
    }
    if (!/^[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(body.domain)) {
      return NextResponse.json({ error: "Invalid domain format" }, { status: 400 });
    }
    updateData.domain = body.domain;
  }

  if (Object.keys(updateData).length === 0) {
    return NextResponse.json({ error: "No valid fields to update" }, { status: 400 });
  }

  const { data: subdomain } = await supabase
    .from("subdomains")
    .update(updateData)
    .eq("id", id)
    .select("*, user:users(email, name)")
    .single();

  if (!subdomain) {
    return NextResponse.json({ error: "Subdomain not found" }, { status: 404 });
  }

  const { created_at, cloudflare_id, full_domain, user_id, ...rest } = subdomain;

  return NextResponse.json({
    ...rest,
    fullDomain: full_domain,
    cloudflareId: cloudflare_id,
    userId: user_id,
    createdAt: created_at,
  });
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
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

  const { id } = await params;

  await supabase.from("dns_records").delete().eq("subdomain_id", id);
  await supabase.from("subdomains").delete().eq("id", id);

  return NextResponse.json({ success: true });
}
