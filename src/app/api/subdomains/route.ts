import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { createDnsRecord, deleteDnsRecord } from "@/lib/cloudflare";
import { logActivity } from "@/lib/activity";
import { isValidSubdomain, isReservedName } from "@/lib/utils";
import { getUserId } from "@/lib/get-user-id";
import { camelCaseKeys } from "@/lib/transform";
import { getPlan } from "@/lib/plans";
import { checkPlanAccess } from "@/lib/subscription";
import {
  scoreSubdomainName,
  checkAbuseVelocity,
  scoreTargetDomain,
  computeVerdict,
} from "@/lib/abuse-detection";
import { getSettings } from "@/lib/settings-store";
import { classifyAbuse } from "@/lib/abuse-llm";
import { notify } from "@/lib/notifications";
import { validateNameservers } from "@/lib/validate-nameservers";

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

  return NextResponse.json({
    subdomains: (subdomains ?? []).map((s) => ({
      ...camelCaseKeys(s),
      nameservers:
        typeof s.nameservers === "string"
          ? JSON.parse(s.nameservers)
          : s.nameservers,
    })),
  });
}

export async function POST(req: NextRequest) {
  const userId = await getUserId(req);
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { name, target, type = "CNAME", proxied = false, domain, dnsMode = "STANDARD", nameservers: rawNameservers } = await req.json();
  let nameservers = rawNameservers;

  if (!name) {
    return NextResponse.json({ error: "Name is required" }, { status: 400 });
  }

  if (dnsMode === "DELEGATED") {
    const nsResult = validateNameservers(nameservers);
    if (!nsResult.ok) {
      return NextResponse.json({ error: nsResult.error }, { status: 400 });
    }
    nameservers = nsResult.nameservers;
  } else if (!target) {
    return NextResponse.json({ error: "Target is required" }, { status: 400 });
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

  const subSettings = await getSettings();
  const maxLen = parseInt(subSettings.maxSubdomainLength ?? "63");
  if (name.length > maxLen) {
    return NextResponse.json(
      { error: `Subdomain name must be at most ${maxLen} characters` },
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

  const kycRequired = subSettings.requireKyc === "true";
  if (kycRequired) {
    const { data: kyc } = await supabase
      .from("kyc_verifications")
      .select("verification_status")
      .eq("user_id", userId)
      .maybeSingle();

    if (!kyc || kyc.verification_status === "rejected") {
      return NextResponse.json(
        { error: "KYC verification is required before creating subdomains. Please complete verification in your account settings." },
        { status: 403 }
      );
    }
  }

  const limit = user?.plan === "BRONZE" || !user?.plan
    ? parseInt(subSettings.defaultSubdomainLimit ?? String(plan.maxSubdomains))
    : plan.maxSubdomains;

  if ((userSubdomainCount ?? 0) >= limit) {
    return NextResponse.json(
      { error: `Subdomain limit (${limit}) reached. Upgrade your plan.` },
      { status: 429 }
    );
  }

  const zoneId = rootDomain.zone_id || undefined;

  const nameSignals = scoreSubdomainName(name, domain, null);
  const velocitySignals = await checkAbuseVelocity(userId);
  const targetSignals = scoreTargetDomain(domain);
  const allSignals = [...nameSignals, ...velocitySignals, ...targetSignals];
  const totalScore = allSignals.reduce((sum, s) => sum + s.points, 0);
  const verdict = computeVerdict(totalScore);

  if (verdict === "block") {
    try {
      await supabase.from("abuse_flags").insert({
        subdomain_name: name,
        target_domain: domain,
        user_id: userId,
        score: totalScore,
        signals: allSignals,
        verdict,
        review_status: "pending",
      });

      await logActivity({
        userId,
        event: "SECURITY_EVENT",
        description: `Abuse block: "${name}.${domain}" (score: ${totalScore})`,
        metadata: { name, domain, score: totalScore, signals: allSignals },
        ip: req.headers.get("x-forwarded-for") ?? undefined,
        userAgent: req.headers.get("user-agent") ?? undefined,
      });
    } catch { }

    return NextResponse.json(
      { error: "This subdomain name was flagged by our security system and cannot be created." },
      { status: 403 }
    );
  }

  let abuseFlagId: string | null = null;

  if (verdict === "review_sync") {
    const userData = await supabase
      .from("users")
      .select("created_at")
      .eq("id", userId)
      .single();

    const accountAgeDays = userData.data?.created_at
      ? (Date.now() - new Date(userData.data.created_at).getTime()) / (1000 * 60 * 60 * 24)
      : 999;

    const llmResult = await classifyAbuse({
      subdomain: name,
      targetDomain: domain,
      accountAgeDays,
      heuristicSignals: allSignals.map(s => `${s.name}(+${s.points})`).join(", "),
    });

    if (llmResult?.isAbusive && llmResult.confidence !== "low") {
      try {
        await supabase.from("abuse_flags").insert({
          subdomain_name: name,
          target_domain: domain,
          user_id: userId,
          score: totalScore,
          signals: allSignals,
          verdict: "block",
          review_status: "pending",
          llm_verdict: llmResult,
        });

        await logActivity({
          userId,
          event: "SECURITY_EVENT",
          description: `Abuse block (LLM confirmed): "${name}.${domain}" (score: ${totalScore})`,
          metadata: { name, domain, score: totalScore, signals: allSignals, llm: llmResult },
          ip: req.headers.get("x-forwarded-for") ?? undefined,
          userAgent: req.headers.get("user-agent") ?? undefined,
        });
      } catch { }

      return NextResponse.json(
        { error: "This subdomain name was flagged by our security system and cannot be created." },
        { status: 403 }
      );
    }

    const { data: flag } = await supabase.from("abuse_flags").insert({
      subdomain_name: name,
      target_domain: domain,
      user_id: userId,
      score: totalScore,
      signals: allSignals,
      verdict: "review_sync",
      llm_verdict: llmResult,
    }).select("id").maybeSingle();

    abuseFlagId = flag?.id ?? null;
  }

  if (verdict === "review_async") {
    const { data: flag } = await supabase.from("abuse_flags").insert({
      subdomain_name: name,
      target_domain: domain,
      user_id: userId,
      score: totalScore,
      signals: allSignals,
      verdict: "review_async",
    }).select("id").maybeSingle();

    abuseFlagId = flag?.id ?? null;
  }

  try {
    const isDelegated = dnsMode === "DELEGATED";

    let cfId = "";
    let nsCloudflareIds: string[] = [];

    if (isDelegated) {
      for (const ns of nameservers) {
        const cfRecord = await createDnsRecord({
          type: "NS",
          name,
          content: ns,
          ttl: 3600,
        }, zoneId);
        if (cfRecord.result?.id) {
          nsCloudflareIds.push(cfRecord.result.id);
        }
      }
    } else {
      const cfRecord = await createDnsRecord({
        type,
        name,
        content: target,
        proxied,
        ttl: 1,
      }, zoneId);
      cfId = cfRecord.result?.id ?? "";
    }

    const { data: subdomain } = await supabase
      .from("subdomains")
      .insert({
        name,
        domain,
        full_domain: `${name}.${domain}`,
        target: isDelegated ? null : target,
        type: isDelegated ? "NS" : type,
        proxied: isDelegated ? false : proxied,
        dns_mode: dnsMode,
        nameservers: isDelegated ? JSON.stringify(nameservers) : null,
        status: "ACTIVE",
        cloudflare_id: cfId,
        user_id: userId,
      })
      .select("id")
      .single();

    if (!subdomain) {
      return NextResponse.json({ error: "Failed to create subdomain" }, { status: 500 });
    }

    if (isDelegated) {
      for (const nsId of nsCloudflareIds) {
        await supabase
          .from("dns_records")
          .insert({
            type: "NS",
            name,
            content: nameservers[nsCloudflareIds.indexOf(nsId)],
            ttl: 3600,
            proxied: false,
            status: "ACTIVE",
            cloudflare_id: nsId,
            subdomain_id: subdomain.id,
          });
      }
    } else if (cfId) {
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
      metadata: { name, domain, target, type, proxied, dnsMode, abuseFlagId: abuseFlagId ?? undefined },
      ip: req.headers.get("x-forwarded-for") ?? undefined,
      userAgent: req.headers.get("user-agent") ?? undefined,
    });

    try { await notify(userId, "subdomain_created", { name, domain, target, dnsMode }); } catch {}

    return NextResponse.json({ subdomain: camelCaseKeys(subdomainWithRecords) }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to create subdomain";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
