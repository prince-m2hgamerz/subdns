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

  const cloudflareConfigured = !!process.env.CLOUDFLARE_EMAIL && !!process.env.CLOUDFLARE_API_KEY && !!process.env.CLOUDFLARE_ZONE_ID;

  const [
    { count: totalUsers },
    { count: totalSubdomains },
    { count: totalRecords },
    { count: totalDomains },
    { count: reservedCount },
    { count: activeSubdomains },
    { count: suspendedSubdomains },
    { count: pendingSubdomains },
    { count: bannedUsers },
    { data: recentUsers },
    { data: recentSubdomains },
    { data: recentActivity },
  ] = await Promise.all([
    supabase.from("users").select("*", { count: "exact", head: true }),
    supabase.from("subdomains").select("*", { count: "exact", head: true }),
    supabase.from("dns_records").select("*", { count: "exact", head: true }),
    supabase.from("root_domains").select("*", { count: "exact", head: true }),
    supabase.from("reserved_names").select("*", { count: "exact", head: true }),
    supabase.from("subdomains").select("*", { count: "exact", head: true }).eq("status", "ACTIVE"),
    supabase.from("subdomains").select("*", { count: "exact", head: true }).eq("status", "SUSPENDED"),
    supabase.from("subdomains").select("*", { count: "exact", head: true }).eq("status", "PENDING"),
    supabase.from("users").select("*", { count: "exact", head: true }).eq("is_banned", true),
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
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Admin Overview</h1>
          <p className="text-sm text-neutral-500">Platform-wide statistics and management</p>
        </div>
        <div className="flex items-center gap-2">
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

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-neutral-500">Total Users</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{totalUsers}</p>
            <p className="mt-1 text-xs text-neutral-500">
              {bannedUsers} banned
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-neutral-500">Subdomains</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{totalSubdomains}</p>
            <div className="mt-1 flex gap-2 text-xs text-neutral-500">
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
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-neutral-500">DNS Records</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{totalRecords}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-neutral-500">Root Domains</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{totalDomains}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-neutral-500">API Keys</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">-</p>
            <p className="mt-1 text-xs text-neutral-500">{reservedCount ?? 0} reserved names</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            {(recentActivity?.length ?? 0) === 0 ? (
              <p className="text-sm text-neutral-500">No recent activity</p>
            ) : (
              <div className="space-y-4">
                {recentActivity?.map((a: { id: string; description: string; created_at: string; user?: { name: string | null; email: string | null } | null }) => (
                  <div key={a.id} className="flex items-start justify-between gap-4">
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm">{a.description}</p>
                      <p className="text-xs text-neutral-500">
                        {a.user?.name || a.user?.email || "System"}
                      </p>
                    </div>
                    <span className="shrink-0 text-xs text-neutral-400">
                      {new Date(a.created_at).toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Recent Users</CardTitle>
                <span className="text-xs text-neutral-400">{totalUsers ?? 0} total</span>
              </div>
            </CardHeader>
            <CardContent>
              {(recentUsers?.length ?? 0) === 0 ? (
                <p className="text-sm text-neutral-500">No users yet</p>
              ) : (
                <div className="space-y-3">
                  {recentUsers?.map((u: { id: string; name: string | null; email: string; role: string; created_at: string }) => (
                    <div key={u.id} className="flex items-center justify-between">
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium">{u.name || "Unnamed"}</p>
                        <p className="truncate text-xs text-neutral-500">{u.email}</p>
                      </div>
                      <span className="shrink-0 text-xs text-neutral-400">
                        {new Date(u.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Recent Subdomains</CardTitle>
                <span className="text-xs text-neutral-400">{totalSubdomains ?? 0} total</span>
              </div>
            </CardHeader>
            <CardContent>
              {(recentSubdomains?.length ?? 0) === 0 ? (
                <p className="text-sm text-neutral-500">No subdomains yet</p>
              ) : (
                <div className="space-y-3">
                  {recentSubdomains?.map((s: { id: string; name: string; domain: string; created_at: string; user?: { name: string | null; email: string | null } | null }) => (
                    <div key={s.id} className="flex items-center justify-between">
                      <div className="min-w-0 flex-1">
                        <p className="truncate font-mono text-sm">
                          {s.name}.{s.domain}
                        </p>
                        <p className="truncate text-xs text-neutral-500">
                          {s.user?.name || s.user?.email}
                        </p>
                      </div>
                      <span className="shrink-0 text-xs text-neutral-400">
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
