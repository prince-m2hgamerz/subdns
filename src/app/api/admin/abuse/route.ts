import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { logActivity } from "@/lib/activity";
import { requireAdmin } from "@/lib/admin-auth-guard";

export async function GET(req: NextRequest) {
  const auth = await requireAdmin();
  if (!auth.allowed) return auth.response;

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
  const auth = await requireAdmin();
  if (!auth.allowed) return auth.response;

  const { id, reviewStatus, reviewNote } = await req.json();

  if (!id || !reviewStatus || !["approved", "rejected"].includes(reviewStatus)) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const { error } = await supabase
    .from("abuse_flags")
    .update({
      review_status: reviewStatus,
      reviewer_id: auth.userId,
      review_note: reviewNote ?? null,
      reviewed_at: new Date().toISOString(),
    })
    .eq("id", id);

  if (error) {
    return NextResponse.json({ error: "Failed to update abuse flag" }, { status: 500 });
  }

  await logActivity({
    userId: auth.userId,
    event: "SECURITY_EVENT",
    description: `Abuse flag ${reviewStatus}: ${id}`,
    metadata: { abuseFlagId: id, reviewStatus, reviewNote },
  });

  return NextResponse.json({ ok: true });
}
