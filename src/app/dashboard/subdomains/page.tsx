import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default async function SubdomainsPage() {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as { id?: string })?.id;
  if (!userId) redirect("/auth/login");

  const subdomains = await prisma.subdomain.findMany({
    where: { userId },
    include: { _count: { select: { dnsRecords: true } } },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Subdomains</h1>
          <p className="text-sm text-muted-foreground">
            Manage your subdomains and DNS records
          </p>
        </div>
        <Link href="/dashboard/subdomains/new">
          <Button variant="primary" className="gap-2">
            <Plus className="h-4 w-4" /> New Subdomain
          </Button>
        </Link>
      </div>

      {subdomains.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-sm text-muted-foreground">
              No subdomains yet. Create your first one.
            </p>
            <Link href="/dashboard/subdomains/new">
              <Button variant="primary" className="mt-4 gap-2">
                <Plus className="h-4 w-4" /> Create Subdomain
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {subdomains.map((sub) => (
            <Link key={sub.id} href={`/dashboard/subdomains/${sub.id}`}>
              <Card className="transition-colors hover:border-gray-300 dark:hover:border-gray-700">
                <CardContent className="flex items-center justify-between py-4">
                  <div className="min-w-0">
                    <p className="truncate font-medium">
                      {sub.name}.{sub.domain}
                    </p>
                    <p className="mt-0.5 truncate text-sm text-muted-foreground">
                      {sub.target} &middot; {sub._count.dnsRecords} records
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    {sub.proxied && (
                      <Badge variant="outline">Proxied</Badge>
                    )}
                    <Badge
                      variant={sub.status === "ACTIVE" ? "success" : "outline"}
                    >
                      {sub.status}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
