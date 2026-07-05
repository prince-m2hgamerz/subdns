import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { supabase } from "@/lib/supabase";

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

  const { data: users } = await supabase
    .from("users")
    .select("id, name, email, role, is_banned, created_at")
    .order("created_at", { ascending: false });

  const usersWithCount = await Promise.all(
    (users ?? []).map(async (u) => {
      const { count } = await supabase
        .from("subdomains")
        .select("*", { count: "exact", head: true })
        .eq("user_id", u.id);
      return {
        id: u.id,
        name: u.name,
        email: u.email,
        role: u.role,
        isBanned: u.is_banned,
        createdAt: u.created_at,
        _count: { subdomains: count ?? 0 },
      };
    })
  );

  return NextResponse.json(usersWithCount);
}
