import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { supabase } from "@/lib/supabase";
import { camelCaseKeys } from "@/lib/transform";

export async function GET() {
  const session = await getServerSession(authOptions);
  const role = (session?.user as { role?: string })?.role;

  if (role !== "ADMIN" && role !== "SUPER_ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

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
