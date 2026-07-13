import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { updateDnsRecord, deleteDnsRecord, createDnsRecord } from "@/lib/cloudflare";
import { logActivity } from "@/lib/activity";
import { getUserId } from "@/lib/get-user-id";
import { camelCaseKeys } from "@/lib/transform";
import { validateNameservers } from "@/lib/validate-nameservers";

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

  const nameservers = typeof subdomain.nameservers === "string"
    ? JSON.parse(subdomain.nameservers)
    : subdomain.nameservers;

  return NextResponse.json({ subdomain: { ...camelCaseKeys(subdomain), nameservers } });
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
  const { target, proxied, type, dnsMode: newDnsMode, nameservers: rawNameservers } = await req.json();
  let nameservers = rawNameservers;

  const { data: subdomain } = await supabase
    .from("subdomains")
    .select("*, dns_records(*)")
    .eq("id", id)
    .eq("user_id", userId)
    .single();

  if (!subdomain) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const { data: rootDomain } = await supabase
    .from("root_domains")
    .select("zone_id")
    .eq("domain", subdomain.domain)
    .maybeSingle();

  const zoneId = rootDomain?.zone_id || undefined;

  try {
    const isStandard = newDnsMode !== "DELEGATED" && subdomain.dns_mode !== "DELEGATED";
    const switchingToDelegated = newDnsMode === "DELEGATED" && subdomain.dns_mode !== "DELEGATED";
    const switchingToStandard = newDnsMode !== "DELEGATED" && subdomain.dns_mode === "DELEGATED";

    if (switchingToDelegated) {
      const nsResult = validateNameservers(nameservers);
      if (!nsResult.ok) {
        return NextResponse.json({ error: nsResult.error }, { status: 400 });
      }
      nameservers = nsResult.nameservers;

      if (subdomain.cloudflare_id) {
        await deleteDnsRecord(subdomain.cloudflare_id);
      }
      for (const record of subdomain.dns_records || []) {
        if (record.cloudflare_id) {
          await deleteDnsRecord(record.cloudflare_id as string);
        }
      }
      await supabase.from("dns_records").delete().eq("subdomain_id", id);

      for (const ns of nameservers) {
        const cfRecord = await createDnsRecord({
          type: "NS",
          name: subdomain.name,
          content: ns,
          ttl: 3600,
        }, zoneId);
        if (cfRecord.result?.id) {
          await supabase.from("dns_records").insert({
            type: "NS",
            name: subdomain.name,
            content: ns,
            ttl: 3600,
            proxied: false,
            status: "ACTIVE",
            cloudflare_id: cfRecord.result.id,
            subdomain_id: id,
          });
        }
      }
    } else if (switchingToStandard) {
      for (const record of subdomain.dns_records || []) {
        if (record.cloudflare_id) {
          await deleteDnsRecord(record.cloudflare_id as string);
        }
      }
      await supabase.from("dns_records").delete().eq("subdomain_id", id);

      const newTarget = target ?? subdomain.target;
      const newType = type ?? subdomain.type;
      const newProxied = proxied ?? subdomain.proxied;

      if (newTarget) {
        const cfRecord = await createDnsRecord({
          type: newType,
          name: subdomain.name,
          content: newTarget,
          proxied: newProxied,
          ttl: 1,
        }, zoneId);

        const cfId = cfRecord.result?.id ?? "";

        await supabase.from("subdomains").update({ cloudflare_id: cfId }).eq("id", id);

        if (cfId) {
          await supabase.from("dns_records").insert({
            type: newType,
            name: subdomain.name,
            content: newTarget,
            ttl: 1,
            proxied: newProxied,
            status: "ACTIVE",
            cloudflare_id: cfId,
            subdomain_id: id,
          });
        }
      }
    } else if (isStandard && subdomain.cloudflare_id) {
      await updateDnsRecord(subdomain.cloudflare_id, {
        type: type ?? subdomain.type,
        name: subdomain.name,
        content: target ?? subdomain.target,
        proxied: proxied ?? subdomain.proxied,
        ttl: 1,
      });
    }

    const updates: Record<string, unknown> = {};
    if (target !== undefined) updates.target = target;
    if (proxied !== undefined) updates.proxied = proxied;
    if (type !== undefined) updates.type = type;
    if (newDnsMode !== undefined) updates.dns_mode = newDnsMode;
    if (nameservers !== undefined) updates.nameservers = JSON.stringify(nameservers);

    const { data: updated } = await supabase
      .from("subdomains")
      .update(updates)
      .eq("id", id)
      .select("*, dns_records(*)")
      .single();

    await logActivity({
      userId,
      event: "SUBDOMAIN_UPDATED",
      metadata: { id, name: subdomain.name, target, proxied, type, dnsMode: newDnsMode },
      ip: req.headers.get("x-forwarded-for") ?? undefined,
      userAgent: req.headers.get("user-agent") ?? undefined,
    });

    return NextResponse.json({ subdomain: camelCaseKeys(updated) });
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
