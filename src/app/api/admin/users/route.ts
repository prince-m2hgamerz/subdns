import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { requireAdmin } from "@/lib/admin-auth-guard";

export async function GET() {
  const auth = await requireAdmin();
  if (!auth.allowed) return auth.response;

  const { data: users } = await supabase
    .from("users")
    .select("id, name, email, role, is_banned, created_at, plan")
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
        plan: u.plan,
        isBanned: u.is_banned,
        createdAt: u.created_at,
        _count: { subdomains: count ?? 0 },
      };
    })
  );

  return NextResponse.json(usersWithCount);
}
