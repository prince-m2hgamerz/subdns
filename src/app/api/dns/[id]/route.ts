import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { updateDnsRecord, deleteDnsRecord } from "@/lib/cloudflare";
import { logActivity } from "@/lib/activity";
import { getUserId } from "@/lib/get-user-id";
import { camelCaseKeys } from "@/lib/transform";
import { notify } from "@/lib/notifications";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const userId = await getUserId(req);
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const { content, ttl, priority, proxied } = await req.json();

  const { data: record } = await supabase
    .from("dns_records")
    .select("*, subdomains!inner(user_id)")
    .eq("id", id)
    .eq("subdomains.user_id", userId)
    .single();

  if (!record) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  try {
    if (record.cloudflare_id) {
      await updateDnsRecord(record.cloudflare_id, {
        type: record.type,
        name: record.name,
        content: content ?? record.content,
        proxied: proxied ?? record.proxied,
        ttl: ttl ?? record.ttl ?? 1,
        ...(priority !== undefined ? { priority } : {}),
      });
    }

    const { data: updated } = await supabase
      .from("dns_records")
      .update({
        ...(content !== undefined && { content }),
        ...(ttl !== undefined && { ttl }),
        ...(priority !== undefined && { priority }),
        ...(proxied !== undefined && { proxied }),
      })
      .eq("id", id)
      .select("*")
      .single();

    await logActivity({
      userId,
      event: "DNS_UPDATED",
      metadata: { id, content, ttl, priority, proxied },
      ip: req.headers.get("x-forwarded-for") ?? undefined,
      userAgent: req.headers.get("user-agent") ?? undefined,
    });

    try { await notify(userId, "dns_updated", { subdomain: record.name, record_type: record.type, record_content: content ?? record.content }); } catch {}

    return NextResponse.json({ record: camelCaseKeys(updated) });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to update DNS record";
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

  const { data: record } = await supabase
    .from("dns_records")
    .select("*, subdomains!inner(user_id)")
    .eq("id", id)
    .eq("subdomains.user_id", userId)
    .single();

  if (!record) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  try {
    if (record.cloudflare_id) {
      await deleteDnsRecord(record.cloudflare_id);
    }

    await supabase.from("dns_records").delete().eq("id", id);

    await logActivity({
      userId,
      event: "DNS_DELETED",
      metadata: { id, type: record.type, name: record.name },
      ip: req.headers.get("x-forwarded-for") ?? undefined,
      userAgent: req.headers.get("user-agent") ?? undefined,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to delete DNS record";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
