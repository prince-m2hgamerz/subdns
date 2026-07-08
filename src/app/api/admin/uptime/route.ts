import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { supabase } from "@/lib/supabase";
import { supabaseService } from "@/lib/supabase";
import { getRecentChecks } from "@/lib/uptime";

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

  const { data: monitors } = await supabaseService
    .from("uptime_monitors")
    .select("*, subdomains(name), users(name, email)")
    .order("created_at", { ascending: false });

  const data = await Promise.all(
    (monitors ?? []).map(async (m) => {
      const checks = await getRecentChecks(m.id, 10);
      const mAny = m as Record<string, unknown>;
      return {
        id: m.id,
        userId: m.user_id,
        subdomainId: m.subdomain_id,
        label: m.label,
        url: m.url,
        checkInterval: m.check_interval,
        timeout: m.timeout,
        isActive: m.is_active,
        lastStatus: m.last_status,
        lastCheckedAt: m.last_checked_at,
        uptimePercentage: m.uptime_percentage,
        subdomainName: (mAny.subdomains as { name?: string } | null)?.name ?? null,
        userName: (mAny.users as { name?: string; email?: string } | null)?.name ?? null,
        userEmail: (mAny.users as { name?: string; email?: string } | null)?.email ?? null,
        recentChecks: checks.map((c) => ({
          id: c.id,
          status: c.status,
          statusCode: c.status_code,
          responseTimeMs: c.response_time_ms,
          errorMessage: c.error_message,
          checkedAt: c.checked_at,
        })),
        createdAt: m.created_at,
        updatedAt: m.updated_at,
      };
    })
  );

  return NextResponse.json({ success: true, data });
}
