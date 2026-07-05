import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { createDnsRecord } from "@/lib/cloudflare";
import { logActivity } from "@/lib/activity";
import { isValidSubdomain, isReservedName } from "@/lib/utils";
import { getUserId } from "@/lib/get-user-id";
import { camelCaseKeys } from "@/lib/transform";
import { getPlan } from "@/lib/plans";
import { checkPlanAccess } from "@/lib/subscription";

export async function GET(req: NextRequest) {
  const userId = await getUserId(req);
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data: subdomains } = await supabase
    .from("subdomains")
    .select("*, dns_records(*)")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  return NextResponse.json({ subdomains: camelCaseKeys(subdomains) });
}

export async function POST(req: NextRequest) {
  const userId = await getUserId(req);
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { name, target, type = "CNAME", proxied = false, domain } = await req.json();

  if (!name || !target) {
    return NextResponse.json({ error: "Name and target are required" }, { status: 400 });
  }

  if (!domain) {
    return NextResponse.json({ error: "Domain selection is required" }, { status: 400 });
  }

  const { data: rootDomain } = await supabase
    .from("root_domains")
    .select("domain, zone_id, is_active")
    .eq("domain", domain)
    .maybeSingle();

  if (!rootDomain) {
    return NextResponse.json({ error: "Selected root domain not found" }, { status: 404 });
  }

  if (!rootDomain.is_active) {
    return NextResponse.json({ error: "Selected root domain is not active" }, { status: 400 });
  }

  if (!isValidSubdomain(name)) {
    return NextResponse.json(
      { error: "Invalid subdomain name. Use only lowercase letters, numbers, and hyphens." },
      { status: 400 }
    );
  }

  if (isReservedName(name)) {
    return NextResponse.json({ error: "This subdomain name is reserved." }, { status: 400 });
  }

  const { data: existing } = await supabase
    .from("subdomains")
    .select("id")
    .eq("name", name)
    .eq("domain", domain)
    .maybeSingle();

  if (existing) {
    return NextResponse.json({ error: "Subdomain already taken" }, { status: 409 });
  }

  const { count: userSubdomainCount } = await supabase
    .from("subdomains")
    .select("*", { count: "exact", head: true })
    .eq("user_id", userId);

  const { data: user } = await supabase
    .from("users")
    .select("plan")
    .eq("id", userId)
    .single();
  const plan = getPlan(user?.plan ?? "BRONZE");

  const access = await checkPlanAccess(userId, plan.id);
  if (!access.ok) {
    return NextResponse.json({ error: access.error }, { status: 403 });
  }

  const limit = plan.maxSubdomains;

  if ((userSubdomainCount ?? 0) >= limit) {
    return NextResponse.json(
      { error: `Subdomain limit (${limit}) reached. Upgrade your plan.` },
      { status: 429 }
    );
  }

  const zoneId = rootDomain.zone_id || undefined;

  try {
    const cfRecord = await createDnsRecord({
      type,
      name,
      content: target,
      proxied,
      ttl: 1,
    }, zoneId);

    const cfId = cfRecord.result?.id ?? "";

    const { data: subdomain } = await supabase
      .from("subdomains")
      .insert({
        name,
        domain,
        full_domain: `${name}.${domain}`,
        target,
        type,
        proxied,
        status: "ACTIVE",
        cloudflare_id: cfId,
        user_id: userId,
      })
      .select("id")
      .single();

    if (!subdomain) {
      return NextResponse.json({ error: "Failed to create subdomain" }, { status: 500 });
    }

    if (cfId) {
      await supabase
        .from("dns_records")
        .insert({
          type,
          name,
          content: target,
          ttl: 1,
          proxied,
          status: "ACTIVE",
          cloudflare_id: cfId,
          subdomain_id: subdomain.id,
        });
    }

    const { data: subdomainWithRecords } = await supabase
      .from("subdomains")
      .select("*, dns_records(*)")
      .eq("id", subdomain.id)
      .single();

    await logActivity({
      userId,
      event: "SUBDOMAIN_CREATED",
      metadata: { name, domain, target, type, proxied },
      ip: req.headers.get("x-forwarded-for") ?? undefined,
      userAgent: req.headers.get("user-agent") ?? undefined,
    });

    return NextResponse.json({ subdomain: camelCaseKeys(subdomainWithRecords) }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to create subdomain";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
