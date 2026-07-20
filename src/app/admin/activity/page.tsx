"use client";

import { useEffect, useState, useCallback } from "react";
import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

type Activity = {
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

const ACTIVITY_TYPES = [
  "ALL",
  "DNS_CREATED",
  "DNS_DELETED",
  "DNS_UPDATED",
  "SUBDOMAIN_CREATED",
  "SUBDOMAIN_DELETED",
  "SUBDOMAIN_UPDATED",
  "LOGIN",
  "LOGOUT",
  "REGISTER",
  "API_REQUEST",
  "API_KEY_CREATED",
  "API_KEY_UPDATED",
  "API_KEY_DELETED",
  "SECURITY_EVENT",
  "PROXY_ENABLED",
  "PROXY_DISABLED",
];

const typeBadgeVariant: Record<string, "primary" | "success" | "destructive" | "warning" | "default"> = {
  DNS_CREATED: "success",
  DNS_DELETED: "destructive",
  DNS_UPDATED: "primary",
  SUBDOMAIN_CREATED: "success",
  SUBDOMAIN_DELETED: "destructive",
  SUBDOMAIN_UPDATED: "primary",
  LOGIN: "default",
  LOGOUT: "default",
  REGISTER: "primary",
  API_REQUEST: "default",
  API_KEY_CREATED: "warning",
  API_KEY_UPDATED: "warning",
  API_KEY_DELETED: "destructive",
  SECURITY_EVENT: "destructive",
  PROXY_ENABLED: "success",
  PROXY_DISABLED: "warning",
};

export default function AdminActivityPage() {
  const { data: session, status: authStatus } = useSession();
  const [activities, setActivities] = useState<Activity[]>([]);
  const [pagination, setPagination] = useState<Pagination>({ page: 1, limit: 20, total: 0, pages: 0 });
  const [loading, setLoading] = useState(true);
  const [typeFilter, setTypeFilter] = useState("ALL");

  const fetchActivities = useCallback(async (page: number) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: String(page), limit: "20" });
      if (typeFilter !== "ALL") params.set("type", typeFilter);
      const res = await fetch(`/api/admin/activity?${params.toString()}`);
      if (!res.ok) throw new Error("Failed to fetch");
      const data = await res.json();
      setActivities(data.activities);
      setPagination(data.pagination);
    } catch {
      redirect("/auth/login");
    } finally {
      setLoading(false);
    }
  }, [typeFilter]);

  useEffect(() => {
    if (authStatus === "unauthenticated") redirect("/auth/login");
    if (authStatus === "authenticated") fetchActivities(1);
  }, [authStatus, typeFilter, fetchActivities]);

  useEffect(() => {
    if (authStatus === "authenticated") {
      setPagination((prev) => ({ ...prev, page: 1 }));
      fetchActivities(1);
    }
  }, [typeFilter, authStatus, fetchActivities]);

  const goToPage = (page: number) => {
    setPagination((prev) => ({ ...prev, page }));
    fetchActivities(page);
  };

  if (authStatus === "loading") {
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
        <h1 className="text-2xl font-bold">Activity Log</h1>
        <p className="text-sm text-neutral-500">
          {pagination.total} total events
        </p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-wrap items-center gap-2 justify-between">
            <CardTitle>Events</CardTitle>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="h-10 rounded-lg border border-neutral-200 bg-white px-3 text-sm dark:border-neutral-800 dark:bg-neutral-950"
            >
              {ACTIVITY_TYPES.map((t) => (
                <option key={t} value={t}>
                  {t === "ALL" ? "All Types" : t.replace(/_/g, " ")}
                </option>
              ))}
            </select>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-neutral-200 dark:border-neutral-800">
                  <th className="px-3 py-2 text-left font-medium text-neutral-500">Type</th>
                  <th className="px-3 py-2 text-left font-medium text-neutral-500">Description</th>
                  <th className="px-3 py-2 text-left font-medium text-neutral-500">User</th>
                  <th className="px-3 py-2 text-left font-medium text-neutral-500">IP Address</th>
                  <th className="px-3 py-2 text-left font-medium text-neutral-500">Timestamp</th>
                </tr>
              </thead>
              <tbody>
                {activities.map((a) => (
                  <tr
                    key={a.id}
                    className="border-b border-neutral-100 dark:border-neutral-900"
                  >
                    <td className="px-3 py-3">
                      <Badge variant={typeBadgeVariant[a.type] ?? "default"}>
                        {a.type.replace(/_/g, " ")}
                      </Badge>
                    </td>
                    <td className="px-3 py-3 max-w-xs truncate">{a.description}</td>
                    <td className="px-3 py-3">{a.user?.email || "—"}</td>
                    <td className="px-3 py-3 font-mono text-xs">{a.ip || "—"}</td>
                    <td className="px-3 py-3 text-neutral-500">
                      {new Date(a.createdAt).toLocaleString()}
                    </td>
                  </tr>
                ))}
                {activities.length === 0 && (
                  <tr>
                    <td colSpan={5} className="py-12 text-center text-sm text-neutral-500">
                      No activity found.
                    </td>
                  </tr>
                )}
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
        </CardContent>
      </Card>
    </div>
  );
}
