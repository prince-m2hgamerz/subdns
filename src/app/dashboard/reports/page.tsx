"use client";

import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Bug, Plus } from "lucide-react";

interface Report {
  id: string;
  type: string;
  subject: string;
  description: string;
  status: string;
  priority: string;
  createdAt: string;
}

const priorityColors: Record<string, string> = {
  LOW: "text-neutral-400",
  MEDIUM: "text-yellow-500",
  HIGH: "text-orange-500",
  CRITICAL: "text-red-500",
};

const statusColors: Record<string, string> = {
  OPEN: "text-blue-500",
  IN_PROGRESS: "text-yellow-500",
  RESOLVED: "text-green-500",
  CLOSED: "text-neutral-400",
};

export default function MyReportsPage() {
  const { data: session, status: authStatus } = useSession();
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authStatus === "authenticated") fetchReports();
  }, [authStatus]);

  async function fetchReports() {
    setLoading(true);
    try {
      const res = await fetch("/api/report");
      if (res.ok) {
        const data = await res.json();
        setReports(data.reports);
      }
    } finally {
      setLoading(false);
    }
  }

  if (authStatus === "unauthenticated") redirect("/auth/login");

  if (authStatus === "loading") {
    return (
      <div className="space-y-6">
        <div className="h-8 w-48 animate-pulse rounded bg-neutral-200 dark:bg-neutral-800" />
        <Card>
          <CardContent className="p-6">
            <div className="space-y-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="h-12 animate-pulse rounded bg-neutral-100 dark:bg-neutral-900" />
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">My Reports</h1>
          <p className="text-sm text-neutral-500">
            Track your submitted bug reports and feature requests
          </p>
        </div>
        <Link href="/dashboard/report">
          <Button variant="primary">
            <Plus className="mr-2 h-4 w-4" />
            New Report
          </Button>
        </Link>
      </div>

      {loading ? (
        <Card>
          <CardContent className="p-6">
            <div className="space-y-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="h-12 animate-pulse rounded bg-neutral-100 dark:bg-neutral-900" />
              ))}
            </div>
          </CardContent>
        </Card>
      ) : reports.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center gap-2 py-12">
            <Bug className="h-8 w-8 text-neutral-400" />
            <p className="text-sm text-neutral-500">No reports yet</p>
            <Link href="/dashboard/report">
              <Button variant="primary" size="sm" className="mt-2">
                Submit your first report
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {reports.map((r) => (
            <Card key={r.id}>
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <CardTitle className="text-base">{r.subject}</CardTitle>
                    <div className="text-xs text-neutral-500">
                      {(r.type ?? "").replace("_", " ")}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`text-xs font-medium uppercase ${priorityColors[r.priority] || ""}`}>
                      {r.priority}
                    </span>
                    <span className={`text-xs font-medium uppercase ${statusColors[r.status] || ""}`}>
                      {(r.status ?? "").replace("_", " ")}
                    </span>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="whitespace-pre-wrap text-sm text-neutral-600 dark:text-neutral-400">
                  {r.description}
                </p>
                <div className="mt-3 text-xs text-neutral-400">
                  {new Date(r.createdAt).toLocaleString()}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
