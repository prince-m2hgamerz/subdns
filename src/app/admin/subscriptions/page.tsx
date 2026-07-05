"use client";

import { useEffect, useState, useCallback } from "react";
import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PLANS } from "@/lib/plans";
import { Loader2, Search } from "lucide-react";
import { Input } from "@/components/ui/input";

type Subscription = {
  id: string;
  user_id: string;
  plan: string;
  order_id: string;
  order_amount: number;
  payment_session_id: string | null;
  paid_amount: number | null;
  status: "PENDING" | "ACTIVE" | "FAILED" | "CANCELLED" | "EXPIRED";
  paid_at: string | null;
  created_at: string;
  users: { email: string; name: string | null };
};

function getExpiry(paidAt: string | null): string | null {
  if (!paidAt) return null;
  const date = new Date(paidAt);
  date.setDate(date.getDate() + 30);
  return date.toISOString();
}

function isExpired(paidAt: string | null): boolean {
  if (!paidAt) return true;
  const expiry = new Date(paidAt);
  expiry.setDate(expiry.getDate() + 30);
  return new Date() > expiry;
}

const statusStyles: Record<string, "default" | "primary" | "success" | "warning" | "destructive" | "info" | "outline"> = {
  ACTIVE: "success",
  PENDING: "warning",
  FAILED: "destructive",
  CANCELLED: "outline",
  EXPIRED: "outline",
};

export default function AdminSubscriptionsPage() {
  const { status } = useSession();
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const limit = 50;

  const fetchSubscriptions = useCallback(async () => {
    try {
      const params = new URLSearchParams({ status: statusFilter, page: String(page), limit: String(limit) });
      const res = await fetch(`/api/admin/subscriptions?${params}`);
      if (!res.ok) throw new Error("Failed to fetch");
      const data = await res.json();
      setSubscriptions(data.subscriptions ?? []);
      setTotal(data.total ?? 0);
    } catch {
      redirect("/auth/login");
    } finally {
      setLoading(false);
    }
  }, [statusFilter, page]);

  useEffect(() => {
    if (status === "unauthenticated") redirect("/auth/login");
    if (status === "authenticated") fetchSubscriptions();
  }, [status, fetchSubscriptions]);

  const cancelSubscription = async (subscriptionId: string) => {
    if (!confirm("Cancel this subscription? The user will be reverted to the Bronze plan.")) return;
    setCancelling(subscriptionId);
    try {
      const res = await fetch("/api/admin/subscriptions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subscriptionId }),
      });
      if (!res.ok) throw new Error("Failed to cancel");
      await fetchSubscriptions();
    } finally {
      setCancelling(null);
    }
  };

  const filtered = subscriptions.filter((s) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      (s.users?.email ?? "").toLowerCase().includes(q) ||
      (s.users?.name ?? "").toLowerCase().includes(q) ||
      s.order_id.toLowerCase().includes(q) ||
      s.plan.toLowerCase().includes(q)
    );
  });

  const totalPages = Math.ceil(total / limit);

  if (status === "loading" || loading) {
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
        <h1 className="text-2xl font-bold">Subscriptions</h1>
        <p className="text-sm text-neutral-500">{total} total subscriptions</p>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
          <Input
            placeholder="Search by email, name, order, or plan..."
            className="max-w-xs pl-9"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <select
          className="rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm dark:border-neutral-800 dark:bg-neutral-950"
          value={statusFilter}
          onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
        >
          <option value="ALL">All Status</option>
          <option value="ACTIVE">Active</option>
          <option value="PENDING">Pending</option>
          <option value="FAILED">Failed</option>
          <option value="CANCELLED">Cancelled</option>
          <option value="EXPIRED">Expired</option>
        </select>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Subscriptions</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-neutral-200 dark:border-neutral-800">
                  <th className="px-3 py-2 text-left font-medium text-neutral-500">User</th>
                  <th className="px-3 py-2 text-left font-medium text-neutral-500">Plan</th>
                  <th className="px-3 py-2 text-left font-medium text-neutral-500">Amount</th>
                  <th className="px-3 py-2 text-left font-medium text-neutral-500">Status</th>
                  <th className="px-3 py-2 text-left font-medium text-neutral-500">Paid At</th>
                  <th className="px-3 py-2 text-left font-medium text-neutral-500">Expires</th>
                  <th className="px-3 py-2 text-left font-medium text-neutral-500">Order ID</th>
                  <th className="px-3 py-2 text-left font-medium text-neutral-500">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((s) => {
                  const planConfig = PLANS[s.plan as keyof typeof PLANS];
                  const expiry = getExpiry(s.paid_at);
                  const expired = s.status === "ACTIVE" && isExpired(s.paid_at);
                  return (
                    <tr key={s.id} className="border-b border-neutral-100 dark:border-neutral-900">
                      <td className="px-3 py-3">
                        <div className="flex flex-col">
                          <span className="font-medium">{s.users?.name || "—"}</span>
                          <span className="text-xs text-neutral-500">{s.users?.email}</span>
                        </div>
                      </td>
                      <td className="px-3 py-3">
                        <span className="font-medium">{planConfig?.name || s.plan}</span>
                      </td>
                      <td className="px-3 py-3">
                        <span className="font-mono text-xs">₹{(s.paid_amount ?? s.order_amount).toFixed(2)}</span>
                      </td>
                      <td className="px-3 py-3">
                        <Badge variant={expired ? "destructive" : (statusStyles[s.status] ?? "outline")}>
                          {expired ? "EXPIRED" : s.status}
                        </Badge>
                      </td>
                      <td className="px-3 py-3 text-xs text-neutral-500">
                        {s.paid_at ? new Date(s.paid_at).toLocaleString() : "—"}
                      </td>
                      <td className="px-3 py-3 text-xs text-neutral-500">
                        {expiry ? new Date(expiry).toLocaleString() : "—"}
                      </td>
                      <td className="max-w-[120px] truncate px-3 py-3 font-mono text-xs text-neutral-500">
                        {s.order_id}
                      </td>
                      <td className="px-3 py-3">
                        {s.status === "ACTIVE" && !expired && (
                          <Button
                            variant="destructive"
                            size="sm"
                            disabled={cancelling === s.id}
                            onClick={() => cancelSubscription(s.id)}
                          >
                            {cancelling === s.id ? <Loader2 size={14} className="animate-spin" /> : "Cancel"}
                          </Button>
                        )}
                      </td>
                    </tr>
                  );
                })}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={8} className="px-3 py-8 text-center text-sm text-neutral-500">
                      No subscriptions match your filters
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage(page - 1)}>
            Previous
          </Button>
          <span className="text-sm text-neutral-500">
            Page {page} of {totalPages}
          </span>
          <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => setPage(page + 1)}>
            Next
          </Button>
        </div>
      )}
    </div>
  );
}
