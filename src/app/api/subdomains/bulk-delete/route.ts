import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { deleteDnsRecord } from "@/lib/cloudflare";
import { logActivity } from "@/lib/activity";
import { getUserId } from "@/lib/get-user-id";

export async function POST(req: NextRequest) {
  const userId = await getUserId(req);
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { ids } = await req.json();

  if (!Array.isArray(ids) || ids.length === 0) {
    return NextResponse.json({ error: "ids array is required" }, { status: 400 });
  }

  const { data: subdomains } = await supabase
    .from("subdomains")
    .select("*, dns_records(*)")
    .in("id", ids)
    .eq("user_id", userId);

  if (!subdomains || subdomains.length === 0) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const foundIds = new Set(subdomains.map((s) => s.id));
  const missing = ids.filter((id) => !foundIds.has(id));
  if (missing.length > 0) {
    return NextResponse.json({ error: "Some subdomains not found", missing }, { status: 404 });
  }

  try {
    for (const subdomain of subdomains) {
      if (subdomain.cloudflare_id) {
        try {
          await deleteDnsRecord(subdomain.cloudflare_id);
        } catch { }
      }

      for (const record of subdomain.dns_records) {
        if (record.cloudflare_id) {
          try {
            await deleteDnsRecord(record.cloudflare_id);
          } catch { }
        }
      }
    }

    const subIds = subdomains.map((s) => s.id);
    await supabase.from("dns_records").delete().in("subdomain_id", subIds);
    await supabase.from("subdomains").delete().in("id", subIds);

    await logActivity({
      userId,
      event: "SUBDOMAIN_BULK_DELETED",
      metadata: { ids, count: ids.length },
      ip: req.headers.get("x-forwarded-for") ?? undefined,
      userAgent: req.headers.get("user-agent") ?? undefined,
    });

    return NextResponse.json({ success: true, deleted: ids.length });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to delete subdomains";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
