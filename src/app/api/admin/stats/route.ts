import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { camelCaseKeys } from "@/lib/transform";
import { requireAdmin } from "@/lib/admin-auth-guard";

export async function GET() {
  const auth = await requireAdmin();
  if (!auth.allowed) return auth.response;

  const [
    { count: totalUsers },
    { count: totalSubdomains },
    { count: totalRecords },
    { data: recentUsers },
    { data: recentSubdomains },
  ] = await Promise.all([
    supabase.from("users").select("*", { count: "exact", head: true }),
    supabase.from("subdomains").select("*", { count: "exact", head: true }),
    supabase.from("dns_records").select("*", { count: "exact", head: true }),
    supabase.from("users")
      .select("id, name, email, created_at")
      .order("created_at", { ascending: false })
      .limit(5),
    supabase.from("subdomains")
      .select("*, user:users(name, email)")
      .order("created_at", { ascending: false })
      .limit(5),
  ]);

  return NextResponse.json({
    stats: { totalUsers: totalUsers ?? 0, totalSubdomains: totalSubdomains ?? 0, totalRecords: totalRecords ?? 0 },
    recentUsers: camelCaseKeys(recentUsers),
    recentSubdomains: camelCaseKeys(recentSubdomains),
  });
}
