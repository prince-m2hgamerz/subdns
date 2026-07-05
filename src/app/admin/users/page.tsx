"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PLANS } from "@/lib/plans";
import {
  Search,
  ChevronDown,
  ChevronUp,
  CheckSquare,
  Square,
} from "lucide-react";
import Link from "next/link";

type PlanId = "BRONZE" | "SILVER" | "GOLD";

type User = {
  id: string;
  name: string | null;
  email: string;
  role: "USER" | "ADMIN" | "SUPER_ADMIN";
  plan: PlanId;
  isBanned: boolean;
  createdAt: string;
  _count: { subdomains: number };
};

const roleCycle: Record<string, "USER" | "ADMIN"> = {
  USER: "ADMIN",
  ADMIN: "USER",
};

export default function AdminUsersPage() {
  const { status } = useSession();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("ALL");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [expanded, setExpanded] = useState<string | null>(null);

  const fetchUsers = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/users");
      if (!res.ok) throw new Error("Failed to fetch");
      const data = await res.json();
      setUsers(data);
    } catch {
      redirect("/auth/login");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (status === "unauthenticated") redirect("/auth/login");
    if (status === "authenticated") fetchUsers();
  }, [status, fetchUsers]);

  const filtered = useMemo(() => {
    return users.filter((u) => {
      const q = search.toLowerCase();
      if (q && !u.email.toLowerCase().includes(q) && !(u.name || "").toLowerCase().includes(q))
        return false;
      if (roleFilter !== "ALL" && u.role !== roleFilter) return false;
      if (statusFilter === "BANNED" && !u.isBanned) return false;
      if (statusFilter === "ACTIVE" && u.isBanned) return false;
      return true;
    });
  }, [users, search, roleFilter, statusFilter]);

  const selectAll = selected.size === filtered.length && filtered.length > 0;
  const toggleSelect = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };
  const toggleSelectAll = () => {
    if (selectAll) {
      setSelected(new Set());
    } else {
      setSelected(new Set(filtered.map((u) => u.id)));
    }
  };

  const updateUser = async (id: string, body: Record<string, unknown>) => {
    setActionLoading(id);
    try {
      const res = await fetch(`/api/admin/users/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error("Failed to update");
      const data: User = await res.json();
      setUsers((prev) => prev.map((u) => (u.id === id ? data : u)));
    } finally {
      setActionLoading(null);
    }
  };

  const changePlan = async (id: string, plan: PlanId) => {
    await updateUser(id, { plan });
  };

  const batchUpdate = async (body: Record<string, unknown>) => {
    const ids = Array.from(selected);
    setActionLoading("batch");
    try {
      await Promise.all(ids.map((id) => fetch(`/api/admin/users/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      })));
      await fetchUsers();
      setSelected(new Set());
    } finally {
      setActionLoading(null);
    }
  };

  if (status === "loading" || loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-32 animate-pulse rounded bg-neutral-200 dark:bg-neutral-800" />
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
        <h1 className="text-2xl font-bold">Users</h1>
        <p className="text-sm text-neutral-500">{users.length} total users</p>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
          <Input
            placeholder="Search by name or email..."
            className="max-w-xs pl-9"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <select
          className="rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm dark:border-neutral-800 dark:bg-neutral-950"
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
        >
          <option value="ALL">All Roles</option>
          <option value="USER">User</option>
          <option value="ADMIN">Admin</option>
          <option value="SUPER_ADMIN">Super Admin</option>
        </select>
        <select
          className="rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm dark:border-neutral-800 dark:bg-neutral-950"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="ALL">All Status</option>
          <option value="ACTIVE">Active</option>
          <option value="BANNED">Banned</option>
        </select>
        {selected.size > 0 && (
          <div className="flex items-center gap-2">
            <span className="text-xs text-neutral-500">{selected.size} selected</span>
            <Button
              variant="outline"
              size="sm"
              disabled={actionLoading === "batch"}
              onClick={() => batchUpdate({ banned: true })}
            >
              Ban All
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={actionLoading === "batch"}
              onClick={() => batchUpdate({ banned: false })}
            >
              Unban All
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSelected(new Set())}
            >
              Clear
            </Button>
          </div>
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Users</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-neutral-200 dark:border-neutral-800">
                  <th className="w-10 px-3 py-2">
                    <button onClick={toggleSelectAll} className="text-neutral-500 hover:text-neutral-900">
                      {selectAll ? <CheckSquare size={16} /> : <Square size={16} />}
                    </button>
                  </th>
                  <th className="px-3 py-2 text-left font-medium text-neutral-500">Name</th>
                  <th className="px-3 py-2 text-left font-medium text-neutral-500">Email</th>
                  <th className="px-3 py-2 text-left font-medium text-neutral-500">Role</th>
                  <th className="px-3 py-2 text-left font-medium text-neutral-500">Plan</th>
                  <th className="px-3 py-2 text-left font-medium text-neutral-500">Status</th>
                  <th className="px-3 py-2 text-left font-medium text-neutral-500">Subdomains</th>
                  <th className="px-3 py-2 text-left font-medium text-neutral-500">Joined</th>
                  <th className="px-3 py-2 text-left font-medium text-neutral-500">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((u) => (
                  <tr key={u.id} className="border-b border-neutral-100 dark:border-neutral-900">
                    <td className="px-3 py-3">
                      <button
                        onClick={() => toggleSelect(u.id)}
                        className="text-neutral-500 hover:text-neutral-900"
                      >
                        {selected.has(u.id) ? <CheckSquare size={16} /> : <Square size={16} />}
                      </button>
                    </td>
                    <td className="px-3 py-3">
                      <div className="flex items-center gap-2">
                        {u.name || "—"}
                        <button
                          onClick={() => setExpanded(expanded === u.id ? null : u.id)}
                          className="text-neutral-400 hover:text-neutral-700"
                        >
                          {expanded === u.id ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                        </button>
                      </div>
                    </td>
                    <td className="max-w-[200px] truncate px-3 py-3 font-mono text-xs">
                      {u.email}
                    </td>
                    <td className="px-3 py-3">
                      <Badge variant={u.role === "ADMIN" || u.role === "SUPER_ADMIN" ? "default" : "outline"}>
                        {u.role}
                      </Badge>
                    </td>
                    <td className="px-3 py-3">
                      <select
                        className="rounded border border-neutral-200 bg-white px-2 py-1 text-xs dark:border-neutral-800 dark:bg-neutral-950"
                        value={u.plan}
                        disabled={actionLoading === u.id}
                        onChange={(e) => changePlan(u.id, e.target.value as PlanId)}
                      >
                        {Object.values(PLANS).map((p) => (
                          <option key={p.id} value={p.id}>{p.name}</option>
                        ))}
                      </select>
                    </td>
                    <td className="px-3 py-3">
                      {u.isBanned ? (
                        <Badge variant="destructive">Banned</Badge>
                      ) : (
                        <Badge variant="success">Active</Badge>
                      )}
                    </td>
                    <td className="px-3 py-3">{u._count.subdomains}</td>
                    <td className="px-3 py-3 text-neutral-500">
                      {new Date(u.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-3 py-3">
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="min-h-11 min-w-11"
                          disabled={actionLoading === u.id}
                          onClick={() =>
                            updateUser(u.id, {
                              role: roleCycle[u.role] ?? "USER",
                            })
                          }
                        >
                          {u.role === "ADMIN" || u.role === "SUPER_ADMIN" ? "Demote" : "Promote"}
                        </Button>
                        <Button
                          variant={u.isBanned ? "outline" : "destructive"}
                          size="sm"
                          className="min-h-11 min-w-11"
                          disabled={actionLoading === u.id}
                          onClick={() => updateUser(u.id, { banned: !u.isBanned })}
                        >
                          {u.isBanned ? "Unban" : "Ban"}
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
                {expanded && (() => {
                  const u = users.find((x) => x.id === expanded);
                  if (!u) return null;
                  return (
                    <tr key={`${u.id}-expanded`} className="bg-neutral-50 dark:bg-neutral-900">
                      <td colSpan={8} className="px-6 py-4">
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="text-xs font-medium text-neutral-500">User ID</span>
                            <p className="font-mono text-xs">{u.id}</p>
                          </div>
                          <div>
                            <span className="text-xs font-medium text-neutral-500">Email Verified</span>
                            <p className="text-xs">{u.createdAt ? "Yes (registered)" : "—"}</p>
                          </div>
                          <div>
                            <span className="text-xs font-medium text-neutral-500">Plan</span>
                            <p className="text-xs">{PLANS[u.plan]?.name || u.plan}</p>
                          </div>
                          <div>
                            <span className="text-xs font-medium text-neutral-500">Subdomains</span>
                            <p className="text-xs">
                              <Link href={`/admin/subdomains?userId=${u.id}`} className="text-blue-600 hover:underline dark:text-blue-400">
                                View {u._count.subdomains} subdomains &rarr;
                              </Link>
                            </p>
                          </div>
                          <div>
                            <span className="text-xs font-medium text-neutral-500">Registered</span>
                            <p className="text-xs">{new Date(u.createdAt).toLocaleString()}</p>
                          </div>
                        </div>
                      </td>
                    </tr>
                  );
                })()}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={8} className="px-3 py-8 text-center text-sm text-neutral-500">
                      No users match your filters
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
