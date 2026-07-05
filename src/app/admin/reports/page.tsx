"use client";

import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Bug } from "lucide-react";

interface Report {
  id: string;
  type: string;
  subject: string;
  description: string;
  status: string;
  priority: string;
  createdAt: string;
  user?: { name: string | null; email: string } | null;
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

export default function AdminReportsPage() {
  const { data: session, status: authStatus } = useSession();
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("");

  useEffect(() => {
    if (authStatus === "authenticated") fetchReports();
  }, [authStatus, filter]);

  async function fetchReports() {
    setLoading(true);
    try {
      const url = filter ? `/api/report?status=${filter}` : "/api/report";
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        setReports(data.reports);
      }
    } finally {
      setLoading(false);
    }
  }

  async function updateReport(id: string, updates: Record<string, string>) {
    const res = await fetch(`/api/report/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updates),
    });
    if (res.ok) fetchReports();
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
      <div>
        <h1 className="text-2xl font-bold">Reports</h1>
        <p className="text-sm text-neutral-500">
          User-submitted bug reports and feature requests
        </p>
      </div>

      <div className="flex gap-2">
        {["", "OPEN", "IN_PROGRESS", "RESOLVED", "CLOSED"].map((s) => (
          <Button
            key={s}
            variant={filter === s ? "primary" : "outline"}
            size="sm"
            onClick={() => setFilter(s)}
          >
            {s || "All"}
          </Button>
        ))}
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
            <p className="text-sm text-neutral-500">No reports found</p>
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
                    <div className="flex items-center gap-2 text-xs text-neutral-500">
                      <span>{r.type.replace("_", " ")}</span>
                      <span>by {r.user?.name || r.user?.email || "unknown"}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`text-xs font-medium uppercase ${priorityColors[r.priority] || ""}`}>
                      {r.priority}
                    </span>
                    <span className={`text-xs font-medium uppercase ${statusColors[r.status] || ""}`}>
                      {r.status.replace("_", " ")}
                    </span>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="whitespace-pre-wrap text-sm text-neutral-600 dark:text-neutral-400">
                  {r.description}
                </p>
                <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-neutral-400">
                  <span>{new Date(r.createdAt).toLocaleString()}</span>

                  <select
                    className="ml-auto rounded border border-input bg-background px-2 py-1 text-xs"
                    value={r.status}
                    onChange={(e) => updateReport(r.id, { status: e.target.value })}
                  >
                    <option value="OPEN">Open</option>
                    <option value="IN_PROGRESS">In Progress</option>
                    <option value="RESOLVED">Resolved</option>
                    <option value="CLOSED">Closed</option>
                  </select>

                  <select
                    className="rounded border border-input bg-background px-2 py-1 text-xs"
                    value={r.priority}
                    onChange={(e) => updateReport(r.id, { priority: e.target.value })}
                  >
                    <option value="LOW">Low</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="HIGH">High</option>
                    <option value="CRITICAL">Critical</option>
                  </select>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
