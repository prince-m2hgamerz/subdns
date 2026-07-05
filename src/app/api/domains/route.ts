import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET() {
  const { data: domains, error } = await supabase
    .from("root_domains")
    .select("domain")
    .eq("is_active", true)
    .order("domain");

  if (error) {
    return NextResponse.json({ error: "Failed to fetch domains" }, { status: 500 });
  }

  return NextResponse.json({ domains: domains.map((d) => d.domain) });
}
