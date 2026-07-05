import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { updateDnsRecord, deleteDnsRecord } from "@/lib/cloudflare";
import { logActivity } from "@/lib/activity";
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

  const { data: subdomain } = await supabase
    .from("subdomains")
    .select("*, dns_records(*)")
    .eq("id", id)
    .eq("user_id", userId)
    .single();

  if (!subdomain) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json({ subdomain });
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
  const { target, proxied, type } = await req.json();

  const { data: subdomain } = await supabase
    .from("subdomains")
    .select("*")
    .eq("id", id)
    .eq("user_id", userId)
    .single();

  if (!subdomain) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  try {
    if (subdomain.cloudflare_id) {
      await updateDnsRecord(subdomain.cloudflare_id, {
        type: type ?? subdomain.type,
        name: subdomain.name,
        content: target ?? subdomain.target,
        proxied: proxied ?? subdomain.proxied,
        ttl: 1,
      });
    }

    const { data: updated } = await supabase
      .from("subdomains")
      .update({
        ...(target !== undefined && { target }),
        ...(proxied !== undefined && { proxied }),
        ...(type !== undefined && { type }),
      })
      .eq("id", id)
      .select("*, dns_records(*)")
      .single();

    await logActivity({
      userId,
      event: "SUBDOMAIN_UPDATED",
      metadata: { id, name: subdomain.name, target, proxied, type },
      ip: req.headers.get("x-forwarded-for") ?? undefined,
      userAgent: req.headers.get("user-agent") ?? undefined,
    });

    return NextResponse.json({ subdomain: updated });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to update subdomain";
    return NextResponse.json({ error: message }, { status: 500 });
  }
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

  const { data: subdomain } = await supabase
    .from("subdomains")
    .select("*, dns_records(*)")
    .eq("id", id)
    .eq("user_id", userId)
    .single();

  if (!subdomain) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  try {
    if (subdomain.cloudflare_id) {
      await deleteDnsRecord(subdomain.cloudflare_id);
    }

    for (const record of subdomain.dns_records) {
      if (record.cloudflare_id) {
        await deleteDnsRecord(record.cloudflare_id);
      }
    }

    await supabase.from("dns_records").delete().eq("subdomain_id", id);
    await supabase.from("subdomains").delete().eq("id", id);

    await logActivity({
      userId,
      event: "SUBDOMAIN_DELETED",
      metadata: { id, name: subdomain.name },
      ip: req.headers.get("x-forwarded-for") ?? undefined,
      userAgent: req.headers.get("user-agent") ?? undefined,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to delete subdomain";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
