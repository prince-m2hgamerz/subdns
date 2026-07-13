import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { supabase } from "@/lib/supabase";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default async function AdminOverviewPage() {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as { id?: string })?.id;
  if (!userId) redirect("/auth/login");

  const { data: user } = await supabase
    .from("users")
    .select("role")
    .eq("id", userId)
    .single();

  if (user?.role !== "ADMIN" && user?.role !== "SUPER_ADMIN") redirect("/dashboard");

  const cloudflareConfigured = !!process.env.CLOUDFLARE_API_EMAIL && !!process.env.CLOUDFLARE_API_KEY && !!process.env.CLOUDFLARE_ZONE_ID;

  const [
    { count: totalUsers },
    { count: totalSubdomains },
    { count: totalRecords },
    { count: totalDomains },
    { count: reservedCount },
    { count: totalApiKeys },
    { count: activeSubdomains },
    { count: suspendedSubdomains },
    { count: pendingSubdomains },
    { count: bannedUsers },
    { count: totalKyc },
    { count: approvedKyc },
    { data: recentUsers },
    { data: recentSubdomains },
    { data: recentActivity },
  ] = await Promise.all([
    supabase.from("users").select("*", { count: "exact", head: true }),
    supabase.from("subdomains").select("*", { count: "exact", head: true }),
    supabase.from("dns_records").select("*", { count: "exact", head: true }),
    supabase.from("root_domains").select("*", { count: "exact", head: true }),
    supabase.from("reserved_names").select("*", { count: "exact", head: true }),
    supabase.from("api_keys").select("*", { count: "exact", head: true }),
    supabase.from("subdomains").select("*", { count: "exact", head: true }).eq("status", "ACTIVE"),
    supabase.from("subdomains").select("*", { count: "exact", head: true }).eq("status", "SUSPENDED"),
    supabase.from("subdomains").select("*", { count: "exact", head: true }).eq("status", "PENDING"),
    supabase.from("users").select("*", { count: "exact", head: true }).eq("is_banned", true),
    supabase.from("kyc_verifications").select("*", { count: "exact", head: true }),
    supabase.from("kyc_verifications").select("*", { count: "exact", head: true }).eq("status", "APPROVED"),
    supabase.from("users")
      .select("id, name, email, role, created_at")
      .order("created_at", { ascending: false })
      .limit(5),
    supabase.from("subdomains")
      .select("*, user:users(name, email)")
      .order("created_at", { ascending: false })
      .limit(5),
    supabase.from("activities")
      .select("*, user:users(name, email)")
      .order("created_at", { ascending: false })
      .limit(10),
  ]);

  return (
    <div className="space-y-4 lg:space-y-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="pl-14 sm:pl-0">
          <h1 className="text-xl font-bold sm:text-2xl">Admin Overview</h1>
          <p className="text-sm text-neutral-500">Platform-wide statistics and management</p>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <span
            className={`h-2 w-2 rounded-full ${
              cloudflareConfigured ? "bg-emerald-500" : "bg-red-500"
            }`}
          />
          <span className="text-xs text-neutral-500">
            Cloudflare {cloudflareConfigured ? "Connected" : "Not Configured"}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        <Card>
          <CardHeader className="p-4 pb-2 sm:p-6 sm:pb-2">
            <CardTitle className="text-xs font-medium text-neutral-500 sm:text-sm">Total Users</CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0 sm:p-6 sm:pt-0">
            <p className="text-xl font-bold sm:text-2xl lg:text-3xl">{totalUsers}</p>
            <p className="mt-1 text-xs text-neutral-500">
              {bannedUsers} banned
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="p-4 pb-2 sm:p-6 sm:pb-2">
            <CardTitle className="text-xs font-medium text-neutral-500 sm:text-sm">Subdomains</CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0 sm:p-6 sm:pt-0">
            <p className="text-xl font-bold sm:text-2xl lg:text-3xl">{totalSubdomains}</p>
            <div className="mt-1 flex flex-wrap gap-1.5 text-xs text-neutral-500">
              <span className="text-emerald-500">{activeSubdomains} active</span>
              {(suspendedSubdomains ?? 0) > 0 && (
                <span className="text-red-500">{suspendedSubdomains ?? 0} suspended</span>
              )}
              {(pendingSubdomains ?? 0) > 0 && (
                <span className="text-amber-500">{pendingSubdomains ?? 0} pending</span>
              )}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="p-4 pb-2 sm:p-6 sm:pb-2">
            <CardTitle className="text-xs font-medium text-neutral-500 sm:text-sm">DNS Records</CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0 sm:p-6 sm:pt-0">
            <p className="text-xl font-bold sm:text-2xl lg:text-3xl">{totalRecords}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="p-4 pb-2 sm:p-6 sm:pb-2">
            <CardTitle className="text-xs font-medium text-neutral-500 sm:text-sm">Root Domains</CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0 sm:p-6 sm:pt-0">
            <p className="text-xl font-bold sm:text-2xl lg:text-3xl">{totalDomains}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="p-4 pb-2 sm:p-6 sm:pb-2">
            <CardTitle className="text-xs font-medium text-neutral-500 sm:text-sm">API Keys</CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0 sm:p-6 sm:pt-0">
            <p className="text-xl font-bold sm:text-2xl lg:text-3xl">{totalApiKeys ?? 0}</p>
            <p className="mt-1 text-xs text-neutral-500">{reservedCount ?? 0} reserved names</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="p-4 pb-2 sm:p-6 sm:pb-2">
            <CardTitle className="text-xs font-medium text-neutral-500 sm:text-sm">KYC Verifications</CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0 sm:p-6 sm:pt-0">
            <p className="text-xl font-bold sm:text-2xl lg:text-3xl">{totalKyc}</p>
            <p className="mt-1 text-xs text-emerald-500">{approvedKyc} approved</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid min-w-0 gap-4 lg:gap-6 lg:grid-cols-3">
        <Card className="overflow-hidden lg:col-span-2">
          <CardHeader className="p-4 sm:p-6">
            <CardTitle className="text-sm sm:text-base">Recent Activity</CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0 sm:p-6 sm:pt-0">
            {(recentActivity?.length ?? 0) === 0 ? (
              <p className="text-sm text-neutral-500">No recent activity</p>
            ) : (
              <div className="space-y-2 sm:space-y-3">
                {recentActivity?.map((a: { id: string; description: string; created_at: string; user?: { name: string | null; email: string | null } | null }) => (
                  <div key={a.id} className="flex flex-col gap-0.5 sm:flex-row sm:items-start sm:justify-between sm:gap-2">
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm">{a.description}</p>
                      <p className="truncate text-xs text-neutral-500">
                        {a.user?.name || a.user?.email || "System"}
                      </p>
                    </div>
                    <span className="text-xs text-neutral-400 sm:shrink-0 sm:whitespace-nowrap">
                      {new Date(a.created_at).toLocaleDateString()}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <div className="min-w-0 space-y-4 lg:space-y-6">
          <Card className="overflow-hidden">
            <CardHeader className="p-4 sm:p-6">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm sm:text-base">Recent Users</CardTitle>
                <span className="shrink-0 text-xs text-neutral-400">{totalUsers ?? 0} total</span>
              </div>
            </CardHeader>
            <CardContent className="p-4 pt-0 sm:p-6 sm:pt-0">
              {(recentUsers?.length ?? 0) === 0 ? (
                <p className="text-sm text-neutral-500">No users yet</p>
              ) : (
                <div className="space-y-2 sm:space-y-3">
                  {recentUsers?.map((u: { id: string; name: string | null; email: string; role: string; created_at: string }) => (
                    <div key={u.id} className="flex flex-col gap-0.5 sm:flex-row sm:items-center sm:justify-between">
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium">{u.name || "Unnamed"}</p>
                        <p className="truncate text-xs text-neutral-500">{u.email}</p>
                      </div>
                      <span className="text-xs text-neutral-400 sm:shrink-0">
                        {new Date(u.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="overflow-hidden">
            <CardHeader className="p-4 sm:p-6">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm sm:text-base">Recent Subdomains</CardTitle>
                <span className="shrink-0 text-xs text-neutral-400">{totalSubdomains ?? 0} total</span>
              </div>
            </CardHeader>
            <CardContent className="p-4 pt-0 sm:p-6 sm:pt-0">
              {(recentSubdomains?.length ?? 0) === 0 ? (
                <p className="text-sm text-neutral-500">No subdomains yet</p>
              ) : (
                <div className="space-y-2 sm:space-y-3">
                  {recentSubdomains?.map((s: { id: string; name: string; domain: string; created_at: string; user?: { name: string | null; email: string | null } | null }) => (
                    <div key={s.id} className="flex flex-col gap-0.5 sm:flex-row sm:items-center sm:justify-between">
                      <div className="min-w-0 flex-1">
                        <p className="truncate font-mono text-sm">
                          {s.name}.{s.domain}
                        </p>
                        <p className="truncate text-xs text-neutral-500">
                          {s.user?.name || s.user?.email}
                        </p>
                      </div>
                      <span className="text-xs text-neutral-400 sm:shrink-0">
                        {new Date(s.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
