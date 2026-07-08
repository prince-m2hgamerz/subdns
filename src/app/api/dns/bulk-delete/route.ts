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

  const { data: records } = await supabase
    .from("dns_records")
    .select("*, subdomains!inner(user_id)")
    .in("id", ids)
    .eq("subdomains.user_id", userId);

  if (!records || records.length === 0) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const foundIds = new Set(records.map((r) => r.id));
  const missing = ids.filter((id) => !foundIds.has(id));
  if (missing.length > 0) {
    return NextResponse.json({ error: "Some records not found", missing }, { status: 404 });
  }

  try {
    for (const record of records) {
      if (record.cloudflare_id) {
        try {
          await deleteDnsRecord(record.cloudflare_id);
        } catch { }
      }
    }

    await supabase.from("dns_records").delete().in("id", ids);

    await logActivity({
      userId,
      event: "DNS_BULK_DELETED",
      metadata: { ids, count: ids.length },
      ip: req.headers.get("x-forwarded-for") ?? undefined,
      userAgent: req.headers.get("user-agent") ?? undefined,
    });

    return NextResponse.json({ success: true, deleted: ids.length });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to delete DNS records";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
