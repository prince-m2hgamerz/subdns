import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Globe, Activity as ActivityIcon, Shield, Zap } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

async function getStats(userId: string) {
  const [subdomainCount, activeCount, recordCount, recentActivity] = await Promise.all([
    prisma.subdomain.count({ where: { userId } }),
    prisma.subdomain.count({ where: { userId, status: "ACTIVE" } }),
    prisma.dnsRecord.count({
      where: { subdomain: { userId } },
    }),
    prisma.activity.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: 10,
    }),
  ]);

  return { subdomainCount, activeCount, recordCount, recentActivity };
}

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as { id?: string })?.id;

  if (!userId) {
    redirect("/auth/login");
  }

  const stats = await getStats(userId);

  const cards = [
    {
      title: "Total Subdomains",
      value: stats.subdomainCount,
      icon: Globe,
    },
    {
      title: "Active",
      value: stats.activeCount,
      icon: Shield,
    },
    {
      title: "DNS Records",
      value: stats.recordCount,
      icon: Zap,
    },
    {
      title: "Recent Events",
      value: stats.recentActivity.length,
      icon: ActivityIcon,
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Overview</h1>
        <p className="text-sm text-muted-foreground">Welcome back, {session?.user?.name ?? "User"}</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((card) => (
          <Card key={card.title}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {card.title}
              </CardTitle>
              <card.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{card.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          {stats.recentActivity.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted-foreground">
              No activity yet. Create your first subdomain to get started.
            </p>
          ) : (
            <div className="space-y-3">
              {stats.recentActivity.map((event: (typeof stats.recentActivity)[number]) => (
                <div
                  key={event.id}
                  className="flex items-center justify-between rounded-lg border border-border px-4 py-3"
                >
                  <div>
                    <p className="text-sm font-medium">{event.type}</p>
                    {event.metadata && (
                      <p className="mt-0.5 text-xs text-muted-foreground">
                        {typeof event.metadata === "string"
                          ? event.metadata
                          : JSON.stringify(event.metadata).slice(0, 100)}
                      </p>
                    )}
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {new Date(event.createdAt).toLocaleDateString()}
                  </span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
