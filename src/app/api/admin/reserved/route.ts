import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { supabase } from "@/lib/supabase";
import { camelCaseKeys } from "@/lib/transform";

export async function GET() {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as { id?: string })?.id;
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data: admin } = await supabase
    .from("users")
    .select("role")
    .eq("id", userId)
    .single();

  if (admin?.role !== "ADMIN" && admin?.role !== "SUPER_ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { data: reserved } = await supabase
    .from("reserved_names")
    .select("*")
    .order("name", { ascending: true });

  return NextResponse.json(camelCaseKeys(reserved));
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as { id?: string })?.id;
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data: admin } = await supabase
    .from("users")
    .select("role")
    .eq("id", userId)
    .single();

  if (admin?.role !== "ADMIN" && admin?.role !== "SUPER_ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

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
