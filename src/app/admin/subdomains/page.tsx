"use client";

import { useEffect, useState, useCallback } from "react";
import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type KYCInfo = {
  fullName: string;
  phone: string;
  address: string;
  purpose: string;
  status: string;
  verifiedAt: string | null;
};

type Subdomain = {
  id: string;
  name: string;
  domain: string;
  fullDomain: string;
  status: "ACTIVE" | "SUSPENDED" | "PENDING";
  createdAt: string;
  _count: { dnsRecords: number };
  user: { id: string; name: string | null; email: string };
  kyc: KYCInfo | null;
};

type StatusCounts = { total: number; active: number; suspended: number; pending: number };

const statusVariant: Record<string, "success" | "destructive" | "warning" | "default"> = {
  ACTIVE: "success",
  SUSPENDED: "destructive",
  PENDING: "warning",
};

const statusOptions: Subdomain["status"][] = ["ACTIVE", "SUSPENDED", "PENDING"];

const kycStatusVariant: Record<string, "success" | "destructive" | "warning" | "outline"> = {
  APPROVED: "success",
  REJECTED: "destructive",
  PENDING: "warning",
};

export default function AdminSubdomainsPage() {
  const { data: session, status: authStatus } = useSession();
  const [subdomains, setSubdomains] = useState<Subdomain[]>([]);
  const [counts, setCounts] = useState<StatusCounts>({ total: 0, active: 0, suspended: 0, pending: 0 });
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [editModal, setEditModal] = useState<{ id: string; status: Subdomain["status"] } | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const fetchSubdomains = useCallback(async () => {
    try {
      const params = new URLSearchParams();
      if (search) params.set("search", search);
      if (statusFilter !== "ALL") params.set("status", statusFilter);
      const res = await fetch(`/api/admin/subdomains?${params.toString()}`);
      if (!res.ok) throw new Error("Failed to fetch");
      const data = await res.json();
      setSubdomains(data.subdomains ?? data);
      setCounts(data.counts ?? { total: data.length ?? 0, active: 0, suspended: 0, pending: 0 });
    } catch {
      redirect("/auth/login");
    } finally {
      setLoading(false);
    }
  }, [search, statusFilter]);

  useEffect(() => {
    if (authStatus === "unauthenticated") redirect("/auth/login");
    if (authStatus === "authenticated") fetchSubdomains();
  }, [authStatus, fetchSubdomains]);

  const updateStatus = async () => {
    if (!editModal) return;
    setActionLoading(editModal.id);
    try {
      const res = await fetch(`/api/admin/subdomains/${editModal.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: editModal.status }),
      });
      if (!res.ok) throw new Error("Failed to update");
      const data: Subdomain = await res.json();
      setSubdomains((prev) => prev.map((s) => (s.id === editModal.id ? data : s)));
      setEditModal(null);
    } finally {
      setActionLoading(null);
    }
  };

  const deleteSubdomain = async (id: string) => {
    setActionLoading(id);
    try {
      const res = await fetch(`/api/admin/subdomains/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete");
      setSubdomains((prev) => prev.filter((s) => s.id !== id));
      setDeleteConfirm(null);
    } finally {
      setActionLoading(null);
    }
  };

  if (authStatus === "loading" || loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-48 animate-pulse rounded bg-neutral-200 dark:bg-neutral-800" />
        <div className="flex gap-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-20 flex-1 animate-pulse rounded-xl bg-neutral-100 dark:bg-neutral-900" />
          ))}
        </div>
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
        <h1 className="text-2xl font-bold">Subdomains</h1>
        <p className="text-sm text-neutral-500">{counts.total} total subdomains</p>
      </div>

      <div className="grid grid-cols-2 xs:grid-cols-4 gap-3">
        {[
          { label: "Total", count: counts.total, variant: "default" },
          { label: "Active", count: counts.active, variant: "success" },
          { label: "Suspended", count: counts.suspended, variant: "destructive" },
          { label: "Pending", count: counts.pending, variant: "warning" },
        ].map((s) => (
          <Card key={s.label}>
            <CardContent className="flex items-center justify-between p-4">
              <span className="text-sm text-neutral-500">{s.label}</span>
              <Badge variant={s.variant as any}>{s.count}</Badge>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-wrap items-center gap-2 justify-between">
            <CardTitle>All Subdomains</CardTitle>
            <div className="flex flex-wrap items-center gap-2">
              <Input
                placeholder="Search subdomains..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full sm:w-56"
              />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="h-10 rounded-lg border border-neutral-200 bg-white px-3 text-sm dark:border-neutral-800 dark:bg-neutral-950"
              >
                <option value="ALL">All Statuses</option>
                <option value="ACTIVE">Active</option>
                <option value="SUSPENDED">Suspended</option>
                <option value="PENDING">Pending</option>
              </select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-neutral-200 dark:border-neutral-800">
                  <th className="px-3 py-2 text-left font-medium text-neutral-500">Subdomain</th>
                  <th className="px-3 py-2 text-left font-medium text-neutral-500">User</th>
                  <th className="px-3 py-2 text-left font-medium text-neutral-500">Domain</th>
                  <th className="px-3 py-2 text-left font-medium text-neutral-500">KYC</th>
                  <th className="px-3 py-2 text-left font-medium text-neutral-500">Status</th>
                  <th className="px-3 py-2 text-left font-medium text-neutral-500">DNS Records</th>
                  <th className="px-3 py-2 text-left font-medium text-neutral-500">Created</th>
                  <th className="px-3 py-2 text-left font-medium text-neutral-500">Actions</th>
                </tr>
              </thead>
              <tbody>
                {subdomains.map((s) => (
                  <tr
                    key={s.id}
                    className="border-b border-neutral-100 dark:border-neutral-900"
                  >
                    <td className="px-3 py-3 font-mono text-xs">{s.fullDomain}</td>
                    <td className="px-3 py-3">{s.user?.email || "—"}</td>
                    <td className="px-3 py-3 font-mono text-xs">{s.domain}</td>
                    <td className="px-3 py-3">
                      {s.kyc ? (
                        <Badge variant={kycStatusVariant[s.kyc.status] ?? "outline"}>
                          {s.kyc.status}
                        </Badge>
                      ) : (
                        <span className="text-xs text-neutral-400">—</span>
                      )}
                    </td>
                    <td className="px-3 py-3">
                      <Badge variant={statusVariant[s.status] ?? "default"}>{s.status}</Badge>
                    </td>
                    <td className="px-3 py-3">{s._count?.dnsRecords ?? 0}</td>
                    <td className="px-3 py-3 text-neutral-500">
                      {new Date(s.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-3 py-3">
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          disabled={actionLoading === s.id}
                          onClick={() => setEditModal({ id: s.id, status: s.status })}
                        >
                          Edit
                        </Button>
                        {deleteConfirm === s.id ? (
                          <div className="flex items-center gap-1">
                            <Button
                              variant="destructive"
                              size="sm"
                              disabled={actionLoading === s.id}
                              onClick={() => deleteSubdomain(s.id)}
                            >
                              Confirm
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setDeleteConfirm(null)}
                            >
                              Cancel
                            </Button>
                          </div>
                        ) : (
                          <Button
                            variant="destructive"
                            size="sm"
                            disabled={actionLoading === s.id}
                            onClick={() => setDeleteConfirm(s.id)}
                          >
                            Delete
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
                {subdomains.length === 0 && (
                  <tr>
                    <td colSpan={8} className="py-12 text-center text-sm text-neutral-500">
                      No subdomains found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {editModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <Card className="mx-4 w-full max-w-md max-h-[80vh] overflow-y-auto">
            <CardHeader>
              <CardTitle>Edit Subdomain Status</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {subdomains.find(s => s.id === editModal.id)?.kyc && (
                <div className="space-y-2 rounded-lg border border-neutral-200 bg-neutral-50 p-3 text-xs dark:border-neutral-800 dark:bg-neutral-900">
                  <p className="font-medium text-sm">Identity Verification</p>
                  {(() => {
                    const kyc = subdomains.find(s => s.id === editModal.id)!.kyc!;
                    return (
                      <>
                        <div className="flex justify-between"><span className="text-neutral-500">Full Name</span><span>{kyc.fullName}</span></div>
                        <div className="flex justify-between"><span className="text-neutral-500">Phone</span><span>{kyc.phone}</span></div>
                        <div className="flex justify-between"><span className="text-neutral-500">Address</span><span>{kyc.address}</span></div>
                        <div className="flex justify-between"><span className="text-neutral-500">Purpose</span><span>{kyc.purpose}</span></div>
                        <div className="flex justify-between"><span className="text-neutral-500">Status</span>
                          <Badge variant={kycStatusVariant[kyc.status] ?? "outline"}>{kyc.status}</Badge>
                        </div>
                        {kyc.verifiedAt && (
                          <div className="flex justify-between"><span className="text-neutral-500">Verified At</span><span>{new Date(kyc.verifiedAt).toLocaleDateString()}</span></div>
                        )}
                      </>
                    );
                  })()}
                </div>
              )}
              <label className="text-sm font-medium">Status</label>
              <select
                value={editModal.status}
                onChange={(e) =>
                  setEditModal({ ...editModal, status: e.target.value as Subdomain["status"] })
                }
                className="h-10 w-full rounded-lg border border-neutral-200 bg-white px-3 text-sm dark:border-neutral-800 dark:bg-neutral-950"
              >
                {statusOptions.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setEditModal(null)}>
                  Cancel
                </Button>
                <Button variant="primary" onClick={updateStatus} disabled={actionLoading === editModal.id}>
                  Save
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
