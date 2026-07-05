import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { createDnsRecord, detectDuplicateRecords, validateDnsRecord } from "@/lib/cloudflare";
import { logActivity } from "@/lib/activity";
import { getUserId } from "@/lib/get-user-id";
import { camelCaseKeys } from "@/lib/transform";
import { getPlan } from "@/lib/plans";
import { checkPlanAccess } from "@/lib/subscription";

export async function POST(req: NextRequest) {
  const userId = await getUserId(req);
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { subdomainId, type, name, content, ttl = 1, priority, proxied = false } = await req.json();

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
    .select("id, name, domain, cloudflare_id, user_id")
    .eq("id", subdomainId)
    .eq("user_id", userId)
    .single();

  if (!subdomain) {
    return NextResponse.json({ error: "Subdomain not found" }, { status: 404 });
  }

  const { data: recUser } = await supabase
    .from("users")
    .select("plan")
    .eq("id", userId)
    .single();
  const plan = getPlan(recUser?.plan ?? "BRONZE");

  const access = await checkPlanAccess(userId, plan.id);
  if (!access.ok) {
    return NextResponse.json({ error: access.error }, { status: 403 });
  }

  const { count: recordCount } = await supabase
    .from("dns_records")
    .select("*", { count: "exact", head: true })
    .eq("subdomain_id", subdomainId);

  if ((recordCount ?? 0) >= plan.maxDnsRecords) {
    return NextResponse.json({ error: `DNS record limit (${plan.maxDnsRecords}) reached. Upgrade your plan.` }, { status: 429 });
  }

  const isDuplicate = await detectDuplicateRecords(
    type,
    name ?? subdomain.name,
    content
  );

  if (isDuplicate) {
    return NextResponse.json({ error: "This DNS record already exists" }, { status: 409 });
  }

  try {
    const cfRecord = await createDnsRecord({
      type,
      name: name ?? subdomain.name,
      content,
      proxied,
      ttl,
      ...(priority !== undefined ? { priority } : {}),
    });

    const { data: record } = await supabase
      .from("dns_records")
      .insert({
        type,
        name: name ?? subdomain.name,
        content,
        ttl,
        priority,
        proxied,
        status: "ACTIVE",
        cloudflare_id: cfRecord.result?.id ?? "",
        subdomain_id: subdomainId,
      })
      .select("*")
      .single();

    await logActivity({
      userId,
      event: "DNS_CREATED",
      metadata: { subdomainId, type, name, content },
      ip: req.headers.get("x-forwarded-for") ?? undefined,
      userAgent: req.headers.get("user-agent") ?? undefined,
    });

    return NextResponse.json({ record: camelCaseKeys(record) }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to create DNS record";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
