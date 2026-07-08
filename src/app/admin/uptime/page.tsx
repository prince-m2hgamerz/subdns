"use client";

import { useEffect, useState, useCallback, Fragment } from "react";
import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Activity, ShieldAlert, CheckCircle, XCircle, ChevronDown, ChevronUp, RefreshCw } from "lucide-react";

interface RecentCheck {
  id: string;
  status: "UP" | "DOWN";
  statusCode: number | null;
  responseTimeMs: number | null;
  errorMessage: string | null;
  checkedAt: string;
}

interface AdminMonitor {
  id: string;
  label: string;
  url: string;
  isActive: boolean;
  lastStatus: "UP" | "DOWN" | "UNKNOWN" | null;
  lastCheckedAt: string | null;
  uptimePercentage: number;
  subdomainName: string | null;
  userName: string | null;
  userEmail: string | null;
  recentChecks: RecentCheck[];
}

export default function AdminUptimePage() {
  const { status } = useSession();
  const [monitors, setMonitors] = useState<AdminMonitor[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [toggling, setToggling] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/uptime");
      if (!res.ok) throw new Error("Failed to fetch");
      const json = await res.json();
      setMonitors(json.data ?? []);
      setLastUpdated(new Date());
    } catch {
      redirect("/auth/login");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (status === "unauthenticated") redirect("/auth/login");
    if (status !== "authenticated") return;
    fetchData();
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, [status, fetchData]);

  const total = monitors.length;
  const upCount = monitors.filter((m) => m.lastStatus === "UP").length;
  const downCount = monitors.filter((m) => m.lastStatus === "DOWN").length;

  const statusBadge = (s: string | null) => {
    switch (s) {
      case "UP":
        return <Badge className="bg-emerald-500 text-white">UP</Badge>;
      case "DOWN":
        return <Badge className="bg-red-500 text-white">DOWN</Badge>;
      default:
        return <Badge variant="outline">UNKNOWN</Badge>;
    }
  };

  const handleToggle = async (id: string) => {
    setToggling(id);
    try {
      await fetch(`/api/uptime/${id}/toggle`, { method: "POST" });
      await fetchData();
    } finally {
      setToggling(null);
    }
  };

  const handleRunCheck = async (id: string) => {
    setToggling(id);
    try {
      await fetch(`/api/uptime/${id}/check`, { method: "POST" });
      await fetchData();
    } finally {
      setToggling(null);
    }
  };

  if (status === "loading" || loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-48 animate-pulse rounded bg-neutral-200 dark:bg-neutral-800" />
        <div className="grid gap-4 sm:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Card key={i}><CardContent className="p-6"><div className="h-16 animate-pulse rounded bg-neutral-100 dark:bg-neutral-900" /></CardContent></Card>
          ))}
        </div>
        <Card><CardContent className="p-6"><div className="h-64 animate-pulse rounded bg-neutral-100 dark:bg-neutral-900" /></CardContent></Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Uptime Monitors</h1>
          <p className="text-sm text-neutral-500">All monitors across all users</p>
        </div>
        <div className="flex items-center gap-3">
          {lastUpdated && (
            <span className="text-xs text-neutral-400">
              Last updated: {lastUpdated.toLocaleTimeString()}
            </span>
          )}
          <span className="flex items-center gap-1.5 text-xs text-emerald-500">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-500" />
            Live
          </span>
          <Button variant="outline" size="sm" onClick={fetchData}>
            <RefreshCw size={14} className="mr-1" />
            Refresh
          </Button>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-neutral-500">Total Monitors</CardTitle>
            <Activity size={16} className="text-neutral-400" />
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{total}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-neutral-500">Healthy</CardTitle>
            <CheckCircle size={16} className="text-emerald-400" />
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-emerald-500">{upCount}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-neutral-500">Down</CardTitle>
            <XCircle size={16} className="text-red-400" />
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-red-500">{downCount}</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Monitors</CardTitle>
        </CardHeader>
        <CardContent>
          {monitors.length === 0 ? (
            <p className="py-8 text-center text-sm text-neutral-500">No monitors have been created yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-neutral-200 text-left text-xs uppercase text-neutral-500 dark:border-neutral-800">
                    <th className="pb-3 pr-4 font-medium">Monitor</th>
                    <th className="pb-3 pr-4 font-medium">User</th>
                    <th className="pb-3 pr-4 font-medium">Status</th>
                    <th className="pb-3 pr-4 font-medium">Uptime</th>
                    <th className="pb-3 pr-4 font-medium">Last Checked</th>
                    <th className="pb-3 pr-4 font-medium">Active</th>
                    <th className="pb-3 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {monitors.map((m) => (
                    <Fragment key={m.id}>
                      <tr
                        className="cursor-pointer border-b border-neutral-100 transition-colors hover:bg-neutral-50 dark:border-neutral-900 dark:hover:bg-neutral-950"
                        onClick={() => setExpandedId(expandedId === m.id ? null : m.id)}
                      >
                        <td className="py-3 pr-4">
                          <div className="font-medium">{m.label}</div>
                          <div className="truncate text-xs text-neutral-500 max-w-[200px]">{m.url}</div>
                          {m.subdomainName && (
                            <div className="text-xs text-neutral-400">{m.subdomainName}</div>
                          )}
                        </td>
                        <td className="py-3 pr-4">
                          <div className="text-sm">{m.userName || "—"}</div>
                          <div className="text-xs text-neutral-500">{m.userEmail || "—"}</div>
                        </td>
                        <td className="py-3 pr-4">{statusBadge(m.lastStatus)}</td>
                        <td className="py-3 pr-4">
                          <span className={`font-mono text-sm font-medium ${
                            m.uptimePercentage >= 99 ? "text-emerald-500" : m.uptimePercentage >= 95 ? "text-amber-500" : "text-red-500"
                          }`}>
                            {m.uptimePercentage}%
                          </span>
                        </td>
                        <td className="py-3 pr-4 text-xs text-neutral-500">
                          {m.lastCheckedAt
                            ? new Date(m.lastCheckedAt).toLocaleString()
                            : "Never"
                          }
                        </td>
                        <td className="py-3 pr-4">
                          {m.isActive ? (
                            <Badge className="bg-emerald-500 text-white">Active</Badge>
                          ) : (
                            <Badge variant="outline">Paused</Badge>
                          )}
                        </td>
                        <td className="py-3">
                          <div className="flex items-center gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              disabled={toggling === m.id}
                              onClick={(e) => { e.stopPropagation(); handleToggle(m.id); }}
                            >
                              {m.isActive ? "Pause" : "Activate"}
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              disabled={toggling === m.id}
                              onClick={(e) => { e.stopPropagation(); handleRunCheck(m.id); }}
                            >
                              Check
                            </Button>
                            <button
                              className="ml-1 text-neutral-400 hover:text-neutral-600"
                              onClick={(e) => { e.stopPropagation(); setExpandedId(expandedId === m.id ? null : m.id); }}
                            >
                              {expandedId === m.id ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                            </button>
                          </div>
                        </td>
                      </tr>
                      {expandedId === m.id && (
                        <tr>
                          <td colSpan={7} className="bg-neutral-50 p-4 dark:bg-neutral-950">
                            <div className="space-y-2">
                              <p className="text-xs font-medium uppercase text-neutral-500">Recent Checks</p>
                              {m.recentChecks.length === 0 ? (
                                <p className="text-sm text-neutral-500">No checks recorded yet.</p>
                              ) : (
                                <div className="overflow-x-auto">
                                  <table className="w-full text-xs">
                                    <thead>
                                      <tr className="border-b border-neutral-200 text-left text-[10px] uppercase text-neutral-400 dark:border-neutral-800">
                                        <th className="pb-2 pr-3 font-medium">Time</th>
                                        <th className="pb-2 pr-3 font-medium">Status</th>
                                        <th className="pb-2 pr-3 font-medium">Code</th>
                                        <th className="pb-2 pr-3 font-medium">Latency</th>
                                        <th className="pb-2 font-medium">Error</th>
                                      </tr>
                                    </thead>
                                    <tbody>
                                      {m.recentChecks.map((c) => (
                                        <tr key={c.id} className="border-b border-neutral-100 dark:border-neutral-900">
                                          <td className="py-2 pr-3 text-neutral-500">
                                            {new Date(c.checkedAt).toLocaleString()}
                                          </td>
                                          <td className="py-2 pr-3">
                                            <Badge className={c.status === "UP" ? "bg-emerald-500 text-white" : "bg-red-500 text-white"}>
                                              {c.status}
                                            </Badge>
                                          </td>
                                          <td className="py-2 pr-3 font-mono">{c.statusCode ?? "—"}</td>
                                          <td className="py-2 pr-3 font-mono">
                                            {c.responseTimeMs != null ? `${c.responseTimeMs}ms` : "—"}
                                          </td>
                                          <td className="max-w-[200px] truncate py-2 text-red-500">
                                            {c.errorMessage ?? "—"}
                                          </td>
                                        </tr>
                                      ))}
                                    </tbody>
                                  </table>
                                </div>
                              )}
                            </div>
                          </td>
                        </tr>
                      )}
                    </Fragment>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
