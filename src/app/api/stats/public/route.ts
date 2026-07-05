import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export const dynamic = "force-dynamic";

export async function GET() {
  const [
    { count: totalUsers },
    { count: totalSubdomains },
    { count: totalRecords },
  ] = await Promise.all([
    supabase.from("users").select("*", { count: "exact", head: true }),
    supabase.from("subdomains").select("*", { count: "exact", head: true }),
    supabase.from("dns_records").select("*", { count: "exact", head: true }),
  ]);

  return NextResponse.json({
    subdomains: totalSubdomains ?? 0,
    dnsRecords: totalRecords ?? 0,
    users: totalUsers ?? 0,
    uptime: 99.9,
  });
}
