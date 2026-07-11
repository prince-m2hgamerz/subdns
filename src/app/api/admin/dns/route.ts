import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { createDnsRecord as cfCreate, detectDuplicateRecords, validateDnsRecord } from "@/lib/cloudflare";
import { logActivity } from "@/lib/activity";
import { requireAdmin } from "@/lib/admin-auth-guard";

export async function GET() {
  const auth = await requireAdmin();
  if (!auth.allowed) return auth.response;

  const { data: records, error } = await supabase
    .from("dns_records")
    .select("*, subdomain:subdomains(name, domain, user_id)")
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(records);
}

export async function POST(req: NextRequest) {
  const auth = await requireAdmin();
  if (!auth.allowed) return auth.response;

  const { subdomainId, type, name, content, ttl = 1, priority, proxied = false, service, protocol, weight, port, tag, flags } = await req.json();

  if (!subdomainId || !type || !content) {
    return NextResponse.json(
      { error: "subdomainId, type, and content are required" },
      { status: 400 }
    );
  }

  const validation = await validateDnsRecord(type, content);
  if (!validation.valid) {
    return NextResponse.json(
      { error: validation.error || `Invalid ${type} record value` },
      { status: 400 }
    );
  }

  const { data: subdomain } = await supabase
    .from("subdomains")
    .select("id, name, domain, cloudflare_id")
    .eq("id", subdomainId)
    .single();

  if (!subdomain) {
    return NextResponse.json({ error: "Subdomain not found" }, { status: 404 });
  }

  const isDuplicate = await detectDuplicateRecords(
    type,
    name ?? subdomain.name,
    content
  );

  if (isDuplicate) {
    return NextResponse.json({ error: "This DNS record already exists" }, { status: 409 });
  }

  const cfPayload: Record<string, unknown> = {
    type,
    name: name ?? subdomain.name,
    content,
    proxied,
    ttl,
  };
  if (priority !== undefined && priority !== null) cfPayload.priority = priority;

  try {
    const cfRecord = await cfCreate(cfPayload as Parameters<typeof cfCreate>[0]);

    const insertPayload: Record<string, unknown> = {
      type,
      name: name ?? subdomain.name,
      content,
      ttl,
      proxied,
      status: "ACTIVE",
      cloudflare_id: cfRecord.result?.id ?? "",
      subdomain_id: subdomainId,
    };
    if (priority !== undefined && priority !== null) insertPayload.priority = priority;

    const { data: record, error: insertError } = await supabase
      .from("dns_records")
      .insert(insertPayload)
      .select("*")
      .single();

    if (insertError) {
      return NextResponse.json({ error: insertError.message }, { status: 500 });
    }

    await logActivity({
      userId: auth.userId,
      event: "ADMIN_DNS_CREATED",
      metadata: { subdomainId, type, name, content },
      ip: req.headers.get("x-forwarded-for") ?? undefined,
      userAgent: req.headers.get("user-agent") ?? undefined,
    });

    return NextResponse.json({ record }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to create DNS record";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
