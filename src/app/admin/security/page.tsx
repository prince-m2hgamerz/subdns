"use client";

import { useEffect, useState, useCallback } from "react";
import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

type SecurityEvent = {
  id: string;
  type: string;
  description: string;
  ip: string | null;
  userAgent: string | null;
  createdAt: string;
  user: { id: string; name: string | null; email: string } | null;
};

type Pagination = {
  page: number;
  limit: number;
  total: number;
  pages: number;
};

const SECURITY_TYPES = ["ALL", "SECURITY_EVENT", "LOGIN", "API_KEY_CREATED", "API_KEY_DELETED"];

const securityBadgeVariant: Record<string, "destructive" | "warning" | "default" | "primary"> = {
  SECURITY_EVENT: "destructive",
  LOGIN: "default",
  API_KEY_CREATED: "warning",
  API_KEY_DELETED: "destructive",
};

export default function AdminSecurityPage() {
  const { data: session, status: authStatus } = useSession();
  const [events, setEvents] = useState<SecurityEvent[]>([]);
  const [pagination, setPagination] = useState<Pagination>({ page: 1, limit: 20, total: 0, pages: 0 });
  const [loading, setLoading] = useState(true);
  const [typeFilter, setTypeFilter] = useState("ALL");

  const fetchEvents = useCallback(async (page: number) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: String(page), limit: "20" });
      if (typeFilter !== "ALL") params.set("type", typeFilter);
      const res = await fetch(`/api/admin/security?${params.toString()}`);
      if (!res.ok) throw new Error("Failed to fetch");
      const data = await res.json();
      setEvents(data.events);
      setPagination(data.pagination);
    } catch {
      redirect("/auth/login");
    } finally {
      setLoading(false);
    }
  }, [typeFilter]);

  useEffect(() => {
    if (authStatus === "unauthenticated") redirect("/auth/login");
    if (authStatus === "authenticated") {
      setPagination((prev) => ({ ...prev, page: 1 }));
      fetchEvents(1);
    }
  }, [authStatus, typeFilter, fetchEvents]);

  const goToPage = (page: number) => {
    setPagination((prev) => ({ ...prev, page }));
    fetchEvents(page);
  };

  if (authStatus === "loading" || loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-48 animate-pulse rounded bg-neutral-200 dark:bg-neutral-800" />
        <Card>
          <CardContent className="p-6">
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="h-10 animate-pulse rounded bg-neutral-100 dark:bg-neutral-900" />
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
        <h1 className="text-2xl font-bold">Security Events</h1>
        <p className="text-sm text-neutral-500">
          {pagination.total} total events
        </p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-wrap items-center gap-2 justify-between">
            <CardTitle>Security Log</CardTitle>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="h-10 rounded-lg border border-neutral-200 bg-white px-3 text-sm dark:border-neutral-800 dark:bg-neutral-950"
            >
              {SECURITY_TYPES.map((t) => (
                <option key={t} value={t}>
                  {t === "ALL" ? "All Types" : t.replace(/_/g, " ")}
                </option>
              ))}
            </select>
          </div>
        </CardHeader>
        <CardContent>
          {events.length === 0 ? (
            <div className="py-12 text-center">
              <p className="text-sm text-neutral-500">No security events recorded.</p>
              <p className="mt-1 text-xs text-neutral-400">
                Security-related events will appear here when triggered.
              </p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-neutral-200 dark:border-neutral-800">
                      <th className="px-3 py-2 text-left font-medium text-neutral-500">Event Type</th>
                      <th className="px-3 py-2 text-left font-medium text-neutral-500">Description</th>
                      <th className="px-3 py-2 text-left font-medium text-neutral-500">User</th>
                      <th className="px-3 py-2 text-left font-medium text-neutral-500">IP Address</th>
                      <th className="px-3 py-2 text-left font-medium text-neutral-500">User Agent</th>
                      <th className="px-3 py-2 text-left font-medium text-neutral-500">Timestamp</th>
                    </tr>
                  </thead>
                  <tbody>
                    {events.map((e) => (
                      <tr
                        key={e.id}
                        className="border-b border-neutral-100 dark:border-neutral-900"
                      >
                        <td className="px-3 py-3">
                          <Badge variant={securityBadgeVariant[e.type] ?? "default"}>
                            {e.type.replace(/_/g, " ")}
                          </Badge>
                        </td>
                        <td className="px-3 py-3 max-w-xs truncate">{e.description}</td>
                        <td className="px-3 py-3">{e.user?.email || "—"}</td>
                        <td className="px-3 py-3 font-mono text-xs">{e.ip || "—"}</td>
                        <td className="px-3 py-3 max-w-[200px] truncate font-mono text-xs text-neutral-500">
                          {e.userAgent || "—"}
                        </td>
                        <td className="px-3 py-3 text-neutral-500">
                          {new Date(e.createdAt).toLocaleString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {pagination.pages > 1 && (
                <div className="mt-4 flex items-center justify-between">
                  <span className="text-sm text-neutral-500">
                    Page {pagination.page} of {pagination.pages}
                  </span>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={pagination.page <= 1 || loading}
                      onClick={() => goToPage(pagination.page - 1)}
                    >
                      Previous
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={pagination.page >= pagination.pages || loading}
                      onClick={() => goToPage(pagination.page + 1)}
                    >
                      Next
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
