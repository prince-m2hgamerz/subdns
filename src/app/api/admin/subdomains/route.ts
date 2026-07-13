import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { requireAdmin } from "@/lib/admin-auth-guard";

export async function GET(req: NextRequest) {
  const auth = await requireAdmin();
  if (!auth.allowed) return auth.response;

  const { searchParams } = new URL(req.url);
  const search = searchParams.get("search") ?? "";
  const status = searchParams.get("status") ?? "";

  let query = supabase
    .from("subdomains")
    .select("*, user:users(email, name)")
    .order("created_at", { ascending: false });

  if (status) {
    query = query.eq("status", status);
  }

  if (search) {
    query = query.or(
      `name.ilike.%${search}%,domain.ilike.%${search}%`
    );
  }

  const { data: subdomains } = await query;

  const userIds = [...new Set((subdomains ?? []).map(s => s.user_id).filter(Boolean))];

  let kycMap: Record<string, {
    full_name: string;
    phone: string;
    address: string;
    purpose: string;
    status: string;
    verified_at: string | null;
  }> = {};

  if (userIds.length > 0) {
    const { data: kycRecords } = await supabase
      .from("kyc_verifications")
      .select("*")
      .in("user_id", userIds)
      .order("created_at", { ascending: false });

    for (const k of kycRecords ?? []) {
      if (!kycMap[k.user_id]) {
        kycMap[k.user_id] = k;
      }
    }
  }

  const mapped = await Promise.all(
    (subdomains ?? []).map(async ({ created_at, cloudflare_id, full_domain, user_id, nameservers: rawNameservers, ...rest }) => {
      const { count } = await supabase
        .from("dns_records")
        .select("*", { count: "exact", head: true })
        .eq("subdomain_id", rest.id);
      const kycRaw = user_id ? kycMap[user_id] : undefined;
      return {
        ...rest,
        nameservers:
          typeof rawNameservers === "string"
            ? JSON.parse(rawNameservers)
            : rawNameservers,
        fullDomain: full_domain,
        cloudflareId: cloudflare_id,
        userId: user_id,
        createdAt: created_at,
        _count: { dnsRecords: count ?? 0 },
        kyc: kycRaw ? {
          fullName: kycRaw.full_name,
          phone: kycRaw.phone,
          address: kycRaw.address,
          purpose: kycRaw.purpose,
          status: kycRaw.status,
          verifiedAt: kycRaw.verified_at,
        } : null,
      };
    })
  );

  const { count: totalCount } = await supabase
    .from("subdomains")
    .select("*", { count: "exact", head: true });

  const { count: activeCount } = await supabase
    .from("subdomains")
    .select("*", { count: "exact", head: true })
    .eq("status", "ACTIVE");

  const { count: suspendedCount } = await supabase
    .from("subdomains")
    .select("*", { count: "exact", head: true })
    .eq("status", "SUSPENDED");

  const { count: pendingCount } = await supabase
    .from("subdomains")
    .select("*", { count: "exact", head: true })
    .eq("status", "PENDING");

  return NextResponse.json({
    subdomains: mapped,
    counts: {
      total: totalCount ?? 0,
      active: activeCount ?? 0,
      suspended: suspendedCount ?? 0,
      pending: pendingCount ?? 0,
    },
  });
}
