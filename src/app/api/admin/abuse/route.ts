import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { supabase } from "@/lib/supabase";
import { logActivity } from "@/lib/activity";

export async function GET(req: NextRequest) {
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

  const { searchParams } = new URL(req.url);
  const page = parseInt(searchParams.get("page") ?? "1");
  const limit = parseInt(searchParams.get("limit") ?? "20");
  const status = searchParams.get("status") ?? "pending";
  const search = searchParams.get("search") ?? "";

  let query = supabase
    .from("abuse_flags")
    .select("*, user:users!abuse_flags_user_id_fkey(name, email)", { count: "exact" })
    .order("score", { ascending: false })
    .range((page - 1) * limit, page * limit - 1);

  if (status !== "all") {
    query = query.eq("review_status", status);
  }

  if (search) {
    query = query.or(`subdomain_name.ilike.%${search}%,target_domain.ilike.%${search}%`);
  }

  const { data: flags, count: total } = await query;

  const mapped = (flags ?? []).map(({ created_at, ...rest }) => ({
    ...rest,
    createdAt: created_at,
  }));

  return NextResponse.json({
    flags: mapped,
    pagination: {
      page,
      limit,
      total: total ?? 0,
      pages: Math.ceil((total ?? 0) / limit),
    },
  });
}

export async function PATCH(req: NextRequest) {
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

  const { id, reviewStatus, reviewNote } = await req.json();

  if (!id || !reviewStatus || !["approved", "rejected"].includes(reviewStatus)) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const { error } = await supabase
    .from("abuse_flags")
    .update({
      review_status: reviewStatus,
      reviewer_id: userId,
      review_note: reviewNote ?? null,
      reviewed_at: new Date().toISOString(),
    })
    .eq("id", id);

  if (error) {
    return NextResponse.json({ error: "Failed to update abuse flag" }, { status: 500 });
  }

  await logActivity({
    userId,
    event: "SECURITY_EVENT",
    description: `Abuse flag ${reviewStatus}: ${id}`,
    metadata: { abuseFlagId: id, reviewStatus, reviewNote },
  });

  return NextResponse.json({ ok: true });
}
