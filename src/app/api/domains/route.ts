import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET() {
  const { data: domains, error } = await supabase
    .from("root_domains")
    .select("domain, is_default")
    .eq("is_active", true)
    .order("sort_order", { ascending: true })
    .order("domain", { ascending: true });

  if (error) {
    return NextResponse.json({ error: "Failed to fetch domains" }, { status: 500 });
  }

  return NextResponse.json({
    domains: domains.map((d) => d.domain),
    defaultDomain: domains.find((d) => d.is_default)?.domain ?? domains[0]?.domain ?? null,
  });
}
