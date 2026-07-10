import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import {
  listDnsRecords,
  updateDnsRecord,
  createDnsRecord,
} from "@/lib/cloudflare";
import { logActivity } from "@/lib/activity";

function detectIp(req: NextRequest, myip?: string): string | null {
  if (myip) return myip;
  const forwarded = req.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();
  const realIp = req.headers.get("x-real-ip");
  if (realIp) return realIp;
  return null;
}

async function authenticate(
  req: NextRequest
): Promise<{ userId: string | null; error?: string }> {
  let key =
    req.headers.get("authorization")?.replace("Bearer ", "").trim() || "";

  if (!key) {
    const url = new URL(req.url);
    key = url.searchParams.get("user") || url.searchParams.get("password") || "";
  }

  if (!key) {
    return { userId: null, error: "badauth" };
  }

  const { data: apiKey } = await supabase
    .from("api_keys")
    .select("id, user_id, key")
    .eq("key", key)
    .single();

  if (!apiKey) {
    return { userId: null, error: "badauth" };
  }

  const { data: user } = await supabase
    .from("users")
    .select("is_banned")
    .eq("id", apiKey.user_id)
    .single();

  if (user?.is_banned) {
    return { userId: null, error: "abuse" };
  }

  await supabase
    .from("api_keys")
    .update({ last_used: new Date().toISOString() })
    .eq("id", apiKey.id);

  return { userId: apiKey.user_id };
}

function isValidHostname(hostname: string): boolean {
  return /^[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(\.[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/.test(
    hostname
  );
}

function ddnsResponse(text: string, status: number) {
  return new NextResponse(text + "\n", {
    status,
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "no-store",
    },
  });
}

export async function GET(req: NextRequest) {
  const { userId, error } = await authenticate(req);
  if (!userId) {
    return ddnsResponse(error || "badauth", 401);
  }

  const url = new URL(req.url);
  const hostname = url.searchParams.get("hostname") || "";
  const myip = url.searchParams.get("myip") || undefined;
  const type = (url.searchParams.get("type") || "A").toUpperCase();

  if (!hostname) {
    return ddnsResponse("notfqdn", 400);
  }

  if (!isValidHostname(hostname)) {
    return ddnsResponse("notfqdn", 400);
  }

  if (type !== "A" && type !== "AAAA") {
    return ddnsResponse("notfqdn", 400);
  }

  const { data: subdomain } = await supabase
    .from("subdomains")
    .select("id, name, domain, full_domain, user_id, cloudflare_id")
    .eq("full_domain", hostname)
    .single();

  if (!subdomain) {
    return ddnsResponse("nohost", 404);
  }

  if (subdomain.user_id !== userId) {
    return ddnsResponse("nohost", 404);
  }

  const { data: rootDomain } = await supabase
    .from("root_domains")
    .select("zone_id")
    .eq("domain", subdomain.domain)
    .maybeSingle();

  const zoneId = rootDomain?.zone_id || undefined;

  const ip = detectIp(req, myip);
  if (!ip) {
    return ddnsResponse("911", 500);
  }

  try {
    const existing = await listDnsRecords(
      { type, name: subdomain.name },
      zoneId
    );

    const record = existing.result?.find(
      (r) => r.name === hostname || r.name === subdomain.name
    );

    if (record) {
      if (record.content === ip) {
        await logActivity({
          userId,
          subdomainId: subdomain.id,
          event: "DNS_UPDATED",
          description: `DDNS no-change for ${hostname} -> ${ip}`,
          metadata: { type, ip, hostname, changed: false },
          ip: req.headers.get("x-forwarded-for") ?? undefined,
          userAgent: req.headers.get("user-agent") ?? undefined,
        });

        return ddnsResponse(`nochg ${ip}`, 200);
      }

      await updateDnsRecord(record.id, { type, content: ip }, zoneId);

      await supabase
        .from("dns_records")
        .update({ content: ip, status: "ACTIVE" })
        .eq("cloudflare_id", record.id);
    } else {
      const cfRecord = await createDnsRecord(
        { type, name: subdomain.name, content: ip, ttl: 1 },
        zoneId
      );

      if (cfRecord.result?.id) {
        await supabase.from("dns_records").insert({
          type,
          name: subdomain.name,
          content: ip,
          ttl: 1,
          proxied: false,
          status: "ACTIVE",
          cloudflare_id: cfRecord.result.id,
          subdomain_id: subdomain.id,
        });
      }
    }

    await logActivity({
      userId,
      subdomainId: subdomain.id,
      event: "DNS_UPDATED",
      description: `DDNS update for ${hostname} -> ${ip}`,
      metadata: { type, ip, hostname, changed: true },
      ip: req.headers.get("x-forwarded-for") ?? undefined,
      userAgent: req.headers.get("user-agent") ?? undefined,
    });

    return ddnsResponse(`good ${ip}`, 200);
  } catch (err) {
    console.error("DDNS update error:", err);
    return ddnsResponse("911", 500);
  }
}

export async function POST(req: NextRequest) {
  const { userId, error } = await authenticate(req);
  if (!userId) {
    return NextResponse.json({ error: error || "badauth" }, { status: 401 });
  }

  let body: { hostname?: string; myip?: string; type?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid body" }, { status: 400 });
  }

  const hostname = body.hostname || "";
  const myip = body.myip;
  const type = (body.type || "A").toUpperCase();

  if (!hostname) {
    return NextResponse.json({ error: "hostname required" }, { status: 400 });
  }

  if (!isValidHostname(hostname)) {
    return NextResponse.json({ error: "invalid hostname" }, { status: 400 });
  }

  if (type !== "A" && type !== "AAAA") {
    return NextResponse.json(
      { error: "type must be A or AAAA" },
      { status: 400 }
    );
  }

  const { data: subdomain } = await supabase
    .from("subdomains")
    .select("id, name, domain, full_domain, user_id, cloudflare_id")
    .eq("full_domain", hostname)
    .single();

  if (!subdomain || subdomain.user_id !== userId) {
    return NextResponse.json({ error: "nohost" }, { status: 404 });
  }

  const { data: rootDomain } = await supabase
    .from("root_domains")
    .select("zone_id")
    .eq("domain", subdomain.domain)
    .maybeSingle();

  const zoneId = rootDomain?.zone_id || undefined;

  const ip = detectIp(req, myip);
  if (!ip) {
    return NextResponse.json({ error: "could not detect IP" }, { status: 400 });
  }

  try {
    const existing = await listDnsRecords(
      { type, name: subdomain.name },
      zoneId
    );
    const record = existing.result?.find(
      (r) => r.name === hostname || r.name === subdomain.name
    );

    let changed = true;

    if (record) {
      if (record.content === ip) {
        changed = false;
      } else {
        await updateDnsRecord(record.id, { type, content: ip }, zoneId);
        await supabase
          .from("dns_records")
          .update({ content: ip, status: "ACTIVE" })
          .eq("cloudflare_id", record.id);
      }
    } else {
      const cfRecord = await createDnsRecord(
        { type, name: subdomain.name, content: ip, ttl: 1 },
        zoneId
      );
      if (cfRecord.result?.id) {
        await supabase.from("dns_records").insert({
          type,
          name: subdomain.name,
          content: ip,
          ttl: 1,
          proxied: false,
          status: "ACTIVE",
          cloudflare_id: cfRecord.result.id,
          subdomain_id: subdomain.id,
        });
      }
    }

    await logActivity({
      userId,
      subdomainId: subdomain.id,
      event: "DNS_UPDATED",
      description: `DDNS update for ${hostname} -> ${ip}`,
      metadata: { type, ip, hostname, changed },
      ip: req.headers.get("x-forwarded-for") ?? undefined,
      userAgent: req.headers.get("user-agent") ?? undefined,
    });

    return NextResponse.json({ status: changed ? "good" : "nochg", ip, hostname, type });
  } catch (err) {
    console.error("DDNS update error:", err);
    return NextResponse.json({ error: "911" }, { status: 500 });
  }
}
