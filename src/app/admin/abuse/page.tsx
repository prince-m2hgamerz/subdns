"use client";

import { useEffect, useState, useCallback } from "react";
import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

type AbuseFlag = {
  id: string;
  subdomainName: string;
  targetDomain: string;
  score: number;
  signals: { name: string; points: number; description: string }[];
  verdict: string;
  reviewStatus: string;
  reviewNote: string | null;
  llmVerdict: { isAbusive: boolean; confidence: string; reason: string; categories: string[] } | null;
  createdAt: string;
  user: { id: string; name: string | null; email: string } | null;
};

type Pagination = {
  page: number;
  limit: number;
  total: number;
  pages: number;
};

const STATUS_OPTIONS = ["pending", "approved", "rejected", "all"];

const verdictBadge: Record<string, "destructive" | "warning" | "default"> = {
  block: "destructive",
  review_sync: "warning",
  review_async: "default",
};

const statusBadge: Record<string, "destructive" | "warning" | "default" | "primary"> = {
  pending: "warning",
  approved: "primary",
  rejected: "destructive",
};

export default function AdminAbusePage() {
  const { data: session, status: authStatus } = useSession();
  const [flags, setFlags] = useState<AbuseFlag[]>([]);
  const [pagination, setPagination] = useState<Pagination>({ page: 1, limit: 20, total: 0, pages: 0 });
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("pending");
  const [search, setSearch] = useState("");

  const fetchFlags = useCallback(async (page: number) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: String(page), limit: "20" });
      if (statusFilter !== "all") params.set("status", statusFilter);
      if (search.trim()) params.set("search", search.trim());
      const res = await fetch(`/api/admin/abuse?${params.toString()}`);
      if (!res.ok) throw new Error("Failed to fetch");
      const data = await res.json();
      setFlags(data.flags);
      setPagination(data.pagination);
    } catch {
      redirect("/auth/login");
    } finally {
      setLoading(false);
    }
  }, [statusFilter, search]);

  useEffect(() => {
    if (authStatus === "unauthenticated") redirect("/auth/login");
    if (authStatus === "authenticated") {
      setPagination((prev) => ({ ...prev, page: 1 }));
      fetchFlags(1);
    }
  }, [authStatus, statusFilter, fetchFlags]);

  const goToPage = (page: number) => {
    setPagination((prev) => ({ ...prev, page }));
    fetchFlags(page);
  };

  const handleReview = async (id: string, reviewStatus: string) => {
    const note = window.prompt(`Enter a note for ${reviewStatus} (optional):`);
    const res = await fetch("/api/admin/abuse", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, reviewStatus, reviewNote: note || null }),
    });
    if (res.ok) {
      fetchFlags(pagination.page);
    }
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
        <h1 className="text-2xl font-bold">Abuse Flags</h1>
        <p className="text-sm text-neutral-500">
          {pagination.total} total flags
        </p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-wrap items-center gap-2 justify-between">
            <CardTitle>Flagged Subdomains</CardTitle>
            <div className="flex items-center gap-2">
              <input
                type="text"
                placeholder="Search name or domain..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="h-10 rounded-lg border border-neutral-200 bg-white px-3 text-sm dark:border-neutral-800 dark:bg-neutral-950"
              />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="h-10 rounded-lg border border-neutral-200 bg-white px-3 text-sm dark:border-neutral-800 dark:bg-neutral-950"
              >
                {STATUS_OPTIONS.map((s) => (
                  <option key={s} value={s}>
                    {s === "all" ? "All Status" : s.charAt(0).toUpperCase() + s.slice(1)}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {flags.length === 0 ? (
            <div className="py-12 text-center">
              <p className="text-sm text-neutral-500">No abuse flags found.</p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-neutral-200 dark:border-neutral-800">
                      <th className="px-3 py-2 text-left font-medium text-neutral-500">Subdomain</th>
                      <th className="px-3 py-2 text-left font-medium text-neutral-500">Target</th>
                      <th className="px-3 py-2 text-left font-medium text-neutral-500">Score</th>
                      <th className="px-3 py-2 text-left font-medium text-neutral-500">Verdict</th>
                      <th className="px-3 py-2 text-left font-medium text-neutral-500">Status</th>
                      <th className="px-3 py-2 text-left font-medium text-neutral-500">User</th>
                      <th className="px-3 py-2 text-left font-medium text-neutral-500">Date</th>
                      <th className="px-3 py-2 text-left font-medium text-neutral-500">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {flags.map((f) => (
                      <tr
                        key={f.id}
                        className="border-b border-neutral-100 dark:border-neutral-900"
                      >
                        <td className="px-3 py-3 font-mono text-xs">{f.subdomainName}</td>
                        <td className="px-3 py-3 font-mono text-xs">{f.targetDomain}</td>
                        <td className="px-3 py-3">
                          <span className={`font-mono text-xs ${f.score >= 60 ? "text-red-500" : f.score >= 30 ? "text-amber-500" : ""}`}>
                            {f.score}
                          </span>
                        </td>
                        <td className="px-3 py-3">
                          <Badge variant={verdictBadge[f.verdict] ?? "default"}>
                            {f.verdict.replace(/_/g, " ")}
                          </Badge>
                        </td>
                        <td className="px-3 py-3">
                          <Badge variant={statusBadge[f.reviewStatus] ?? "default"}>
                            {f.reviewStatus}
                          </Badge>
                        </td>
                        <td className="px-3 py-3">{f.user?.email || "—"}</td>
                        <td className="px-3 py-3 text-neutral-500">
                          {new Date(f.createdAt).toLocaleDateString()}
                        </td>
                        <td className="px-3 py-3">
                          {f.reviewStatus === "pending" && (
                            <div className="flex gap-1">
                              <Button
                                variant="outline"
                                size="sm"
                                className="text-green-600 border-green-300"
                                onClick={() => handleReview(f.id, "approved")}
                              >
                                Approve
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                className="text-red-600 border-red-300"
                                onClick={() => handleReview(f.id, "rejected")}
                              >
                                Reject
                              </Button>
                            </div>
                          )}
                          {f.reviewStatus !== "pending" && (
                            <span className="text-xs text-neutral-400">
                              {f.reviewStatus}
                            </span>
                          )}
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
