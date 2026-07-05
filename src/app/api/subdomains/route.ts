import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { createDnsRecord } from "@/lib/cloudflare";
import { logActivity } from "@/lib/activity";
import { isValidSubdomain, isReservedName } from "@/lib/utils";
import { getUserId } from "@/lib/get-user-id";

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

  return NextResponse.json({ subdomains });
}

export async function POST(req: NextRequest) {
  const userId = await getUserId(req);
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { name, target, type = "CNAME", proxied = false } = await req.json();

  if (!name || !target) {
    return NextResponse.json({ error: "Name and target are required" }, { status: 400 });
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
    .eq("domain", "m2hio.in")
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
    .select("max_subdomains")
    .eq("id", userId)
    .single();
  const limit = user?.max_subdomains ?? 10;

  if ((userSubdomainCount ?? 0) >= limit) {
    return NextResponse.json(
      { error: `Subdomain limit (${limit}) reached` },
      { status: 429 }
    );
  }

  try {
    const cfRecord = await createDnsRecord({
      type,
      name,
      content: target,
      proxied,
      ttl: 1,
    });

    const { data: subdomain } = await supabase
      .from("subdomains")
      .insert({
        name,
        domain: "m2hio.in",
        full_domain: `${name}.m2hio.in`,
        target,
        type,
        proxied,
        status: "ACTIVE",
        cloudflare_id: cfRecord.result?.id ?? "",
        user_id: userId,
      })
      .select("*, dns_records(*)")
      .single();

    await logActivity({
      userId,
      event: "SUBDOMAIN_CREATED",
      metadata: { name, domain: "m2hio.in", target, type, proxied },
      ip: req.headers.get("x-forwarded-for") ?? undefined,
      userAgent: req.headers.get("user-agent") ?? undefined,
    });

    return NextResponse.json({ subdomain }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to create subdomain";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
