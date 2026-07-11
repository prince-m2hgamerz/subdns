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

  const mapped = await Promise.all(
    (subdomains ?? []).map(async ({ created_at, cloudflare_id, full_domain, user_id, ...rest }) => {
      const { count } = await supabase
        .from("dns_records")
        .select("*", { count: "exact", head: true })
        .eq("subdomain_id", rest.id);
      return {
        ...rest,
        fullDomain: full_domain,
        cloudflareId: cloudflare_id,
        userId: user_id,
        createdAt: created_at,
        _count: { dnsRecords: count ?? 0 },
      };
    })
  );

  return NextResponse.json(mapped);
}
