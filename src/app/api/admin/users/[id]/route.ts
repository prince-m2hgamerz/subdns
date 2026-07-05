import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { supabase } from "@/lib/supabase";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
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

  const { id } = await params;
  const body = await req.json();

  const updateData: Record<string, unknown> = {};
  if (typeof body.banned === "boolean") updateData.is_banned = body.banned;
  if (body.role === "USER" || body.role === "ADMIN") updateData.role = body.role;
  if (typeof body.plan === "string") updateData.plan = body.plan;

  if (Object.keys(updateData).length === 0) {
    return NextResponse.json({ error: "No valid fields to update" }, { status: 400 });
  }

  const { data: user } = await supabase
    .from("users")
    .update(updateData)
    .eq("id", id)
    .select("id, name, email, role, is_banned, created_at, plan")
    .single();

  const { count } = await supabase
    .from("subdomains")
    .select("*", { count: "exact", head: true })
    .eq("user_id", id);

  return NextResponse.json({
    id: user?.id,
    name: user?.name,
    email: user?.email,
    role: user?.role,
    plan: user?.plan,
    isBanned: user?.is_banned,
    createdAt: user?.created_at,
    _count: { subdomains: count ?? 0 },
  });
}
