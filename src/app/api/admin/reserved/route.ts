import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { camelCaseKeys } from "@/lib/transform";
import { requireAdmin } from "@/lib/admin-auth-guard";

export async function GET() {
  const auth = await requireAdmin();
  if (!auth.allowed) return auth.response;

  const { data: reserved } = await supabase
    .from("reserved_names")
    .select("*")
    .order("name", { ascending: true });

  return NextResponse.json(camelCaseKeys(reserved));
}

export async function POST(req: NextRequest) {
  const auth = await requireAdmin();
  if (!auth.allowed) return auth.response;

  const { name } = await req.json();

  if (!name || typeof name !== "string" || !name.trim()) {
    return NextResponse.json({ error: "Name is required" }, { status: 400 });
  }

  const { data: reserved } = await supabase
    .from("reserved_names")
    .insert({ name: name.trim().toLowerCase() })
    .select("*")
    .single();

  return NextResponse.json(reserved, { status: 201 });
}
