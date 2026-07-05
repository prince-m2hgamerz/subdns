import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default async function AdminOverviewPage() {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as { id?: string })?.id;
  if (!userId) redirect("/auth/login");

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { role: true },
  });

  if (user?.role !== "ADMIN" && user?.role !== "SUPER_ADMIN") redirect("/dashboard");

  const cloudflareConfigured = !!process.env.CLOUDFLARE_API_EMAIL && !!process.env.CLOUDFLARE_API_KEY && !!process.env.CLOUDFLARE_ZONE_ID;

  const [
    totalUsers,
    totalSubdomains,
    totalRecords,
    totalDomains,
    reservedCount,
    activeSubdomains,
    suspendedSubdomains,
    pendingSubdomains,
    bannedUsers,
    apiKeysCount,
    recentUsers,
    recentSubdomains,
    recentActivity,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.subdomain.count(),
    prisma.dnsRecord.count(),
    prisma.rootDomain.count(),
    prisma.reservedName.count(),
    prisma.subdomain.count({ where: { status: "ACTIVE" } }),
    prisma.subdomain.count({ where: { status: "SUSPENDED" } }),
    prisma.subdomain.count({ where: { status: "PENDING" } }),
    prisma.user.count({ where: { isBanned: true } }),
    prisma.apiKey.count(),
    prisma.user.findMany({
      orderBy: { createdAt: "desc" },
      take: 5,
      select: { id: true, name: true, email: true, role: true, createdAt: true },
    }),
    prisma.subdomain.findMany({
      orderBy: { createdAt: "desc" },
      take: 5,
      include: { user: { select: { email: true, name: true } } },
    }),
    prisma.activity.findMany({
      orderBy: { createdAt: "desc" },
      take: 10,
      include: { user: { select: { name: true, email: true } } },
    }),
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
              {suspendedSubdomains > 0 && (
                <span className="text-red-500">{suspendedSubdomains} suspended</span>
              )}
              {pendingSubdomains > 0 && (
                <span className="text-amber-500">{pendingSubdomains} pending</span>
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
            <p className="text-3xl font-bold">{apiKeysCount}</p>
            <p className="mt-1 text-xs text-neutral-500">{reservedCount} reserved names</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            {recentActivity.length === 0 ? (
              <p className="text-sm text-neutral-500">No recent activity</p>
            ) : (
              <div className="space-y-4">
                {recentActivity.map((a: { id: string; description: string; createdAt: Date; user?: { name: string | null; email: string | null } | null }) => (
                  <div key={a.id} className="flex items-start justify-between gap-4">
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm">{a.description}</p>
                      <p className="text-xs text-neutral-500">
                        {a.user?.name || a.user?.email || "System"}
                      </p>
                    </div>
                    <span className="shrink-0 text-xs text-neutral-400">
                      {new Date(a.createdAt).toLocaleString()}
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
                <span className="text-xs text-neutral-400">{totalUsers} total</span>
              </div>
            </CardHeader>
            <CardContent>
              {recentUsers.length === 0 ? (
                <p className="text-sm text-neutral-500">No users yet</p>
              ) : (
                <div className="space-y-3">
                  {recentUsers.map((u: { id: string; name: string | null; email: string; role: string; createdAt: Date }) => (
                    <div key={u.id} className="flex items-center justify-between">
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium">{u.name || "Unnamed"}</p>
                        <p className="truncate text-xs text-neutral-500">{u.email}</p>
                      </div>
                      <span className="shrink-0 text-xs text-neutral-400">
                        {new Date(u.createdAt).toLocaleDateString()}
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
                <span className="text-xs text-neutral-400">{totalSubdomains} total</span>
              </div>
            </CardHeader>
            <CardContent>
              {recentSubdomains.length === 0 ? (
                <p className="text-sm text-neutral-500">No subdomains yet</p>
              ) : (
                <div className="space-y-3">
                  {recentSubdomains.map((s: { id: string; name: string; domain: string; createdAt: Date; user?: { name: string | null; email: string | null } | null }) => (
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
                        {new Date(s.createdAt).toLocaleDateString()}
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
