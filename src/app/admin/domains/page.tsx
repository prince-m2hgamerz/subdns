"use client";

import { useEffect, useState, useCallback } from "react";
import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Trash2, Server, ArrowUp, ArrowDown, Check } from "lucide-react";

type Domain = {
  id: string;
  domain: string;
  zoneId: string;
  isActive: boolean;
  isDefault: boolean;
  sortOrder: number;
  createdAt: string;
};

export default function AdminDomainsPage() {
  const { status } = useSession();
  const [domains, setDomains] = useState<Domain[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formDomain, setFormDomain] = useState("");
  const [formZoneId, setFormZoneId] = useState("");
  const [formActive, setFormActive] = useState(true);
  const [formDefault, setFormDefault] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [updating, setUpdating] = useState<string | null>(null);

  const fetchDomains = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/domains");
      if (!res.ok) throw new Error("Failed to fetch");
      setDomains(await res.json());
    } catch {
      redirect("/auth/login");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (status === "unauthenticated") redirect("/auth/login");
    if (status === "authenticated") fetchDomains();
  }, [status, fetchDomains]);

  const addDomain = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formDomain.trim()) return;
    setSaving(true);
    try {
      const res = await fetch("/api/admin/domains", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          domain: formDomain.trim(),
          cloudflareZoneId: formZoneId.trim(),
          active: formActive,
          default: formDefault,
        }),
      });
      if (!res.ok) throw new Error("Failed to create");
      const created: Domain = await res.json();
      setDomains((prev) => [...prev, created]);
      setShowForm(false);
      setFormDomain("");
      setFormZoneId("");
      setFormActive(true);
      setFormDefault(false);
    } finally {
      setSaving(false);
    }
  };

  const deleteDomain = async (id: string) => {
    if (!confirm("Delete this root domain?")) return;
    setDeleting(id);
    try {
      const res = await fetch(`/api/admin/domains/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete");
      setDomains((prev) => prev.filter((d) => d.id !== id));
    } finally {
      setDeleting(null);
    }
  };

  const updateDomain = async (id: string, updates: Record<string, unknown>) => {
    setUpdating(id);
    try {
      const res = await fetch(`/api/admin/domains/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
      });
      if (!res.ok) throw new Error("Failed to update");
      const updated: Domain = await res.json();
      setDomains((prev) => prev.map((d) => (d.id === id ? updated : d)));
    } finally {
      setUpdating(null);
    }
  };

  const moveUp = (index: number) => {
    if (index <= 0) return;
    const prev = domains[index - 1];
    const curr = domains[index];
    const prevOrder = prev.sortOrder ?? 0;
    const currOrder = curr.sortOrder ?? 0;
    updateDomain(curr.id, { sortOrder: prevOrder - 1 });
    updateDomain(prev.id, { sortOrder: currOrder + 1 });
    const updated = [...domains];
    updated[index] = prev;
    updated[index - 1] = curr;
    setDomains(updated);
  };

  const moveDown = (index: number) => {
    if (index >= domains.length - 1) return;
    const next = domains[index + 1];
    const curr = domains[index];
    const nextOrder = next.sortOrder ?? 0;
    const currOrder = curr.sortOrder ?? 0;
    updateDomain(curr.id, { sortOrder: nextOrder + 1 });
    updateDomain(next.id, { sortOrder: currOrder - 1 });
    const updated = [...domains];
    updated[index] = next;
    updated[index + 1] = curr;
    setDomains(updated);
  };

  const setAsDefault = async (id: string) => {
    const currentDefault = domains.find((d) => d.isDefault);
    const ops: Promise<void>[] = [];
    if (currentDefault && currentDefault.id !== id) {
      ops.push(updateDomain(currentDefault.id, { isDefault: false }));
    }
    ops.push(updateDomain(id, { isDefault: true }));
    await Promise.all(ops);
    setDomains((prev) =>
      prev.map((d) => ({ ...d, isDefault: d.id === id }))
    );
  };

  if (status === "loading" || loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-32 animate-pulse rounded bg-neutral-200 dark:bg-neutral-800" />
        <Card>
          <CardContent className="p-6">
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="h-20 animate-pulse rounded bg-neutral-100 dark:bg-neutral-900" />
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
          <h1 className="text-2xl font-bold">Domains</h1>
          <p className="text-sm text-neutral-500">
            Manage root domains available for subdomain registration
          </p>
        </div>
        <Button onClick={() => setShowForm(!showForm)}>
          <Plus size={16} className="mr-1" />
          Add Domain
        </Button>
      </div>

      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>New Root Domain</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={addDomain} className="space-y-4">
              <div>
                <label className="mb-1 block text-sm font-medium">Domain</label>
                <Input
                  placeholder="example.com"
                  value={formDomain}
                  onChange={(e) => setFormDomain(e.target.value)}
                  required
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium">Cloudflare Zone ID</label>
                <Input
                  placeholder="Optional zone identifier"
                  value={formZoneId}
                  onChange={(e) => setFormZoneId(e.target.value)}
                />
              </div>
              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={formActive}
                    onChange={(e) => setFormActive(e.target.checked)}
                    className="rounded"
                  />
                  Active
                </label>
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={formDefault}
                    onChange={(e) => setFormDefault(e.target.checked)}
                    className="rounded"
                  />
                  Default
                </label>
              </div>
              <div className="flex gap-2">
                <Button type="submit" disabled={saving}>
                  {saving ? "Saving..." : "Create Domain"}
                </Button>
                <Button type="button" variant="ghost" onClick={() => setShowForm(false)}>
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {domains.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Server className="mx-auto mb-2 h-8 w-8 text-neutral-300" />
            <p className="text-sm text-neutral-500">
              No root domains configured yet.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {domains.map((domain) => (
            <Card key={domain.id} className="group relative">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="flex flex-col gap-0.5">
                      <button
                        onClick={() => {
                          const idx = domains.indexOf(domain);
                          moveUp(idx);
                        }}
                        disabled={updating !== null || domains.indexOf(domain) === 0}
                        className="text-neutral-400 hover:text-neutral-600 disabled:opacity-20 disabled:cursor-not-allowed cursor-pointer leading-none"
                        title="Move up"
                      >
                        <ArrowUp size={12} />
                      </button>
                      <button
                        onClick={() => {
                          const idx = domains.indexOf(domain);
                          moveDown(idx);
                        }}
                        disabled={updating !== null || domains.indexOf(domain) === domains.length - 1}
                        className="text-neutral-400 hover:text-neutral-600 disabled:opacity-20 disabled:cursor-not-allowed cursor-pointer leading-none"
                        title="Move down"
                      >
                        <ArrowDown size={12} />
                      </button>
                    </div>
                    <CardTitle className="font-mono text-base">{domain.domain}</CardTitle>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setAsDefault(domain.id)}
                      disabled={updating !== null}
                      className="cursor-pointer"
                      title={domain.isDefault ? "Default domain" : "Set as default"}
                    >
                      {domain.isDefault ? (
                        <Badge variant="default">
                          <Check size={10} className="mr-0.5" />
                          Default
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="hover:border-neutral-400">
                          Set Default
                        </Badge>
                      )}
                    </button>
                    <Badge variant={domain.isActive ? "success" : "outline"}>
                      {domain.isActive ? "Active" : "Inactive"}
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-1.5 text-sm">
                  <p>
                    <span className="text-neutral-500">Zone ID: </span>
                    <span className="font-mono text-xs">
                      {domain.zoneId || "—"}
                    </span>
                  </p>
                  <p>
                    <span className="text-neutral-500">Added: </span>
                    {new Date(domain.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </CardContent>
              <button
                onClick={() => deleteDomain(domain.id)}
                disabled={deleting === domain.id}
                className="absolute right-3 top-3 visible md:invisible md:group-hover:visible text-neutral-400 hover:text-red-500 cursor-pointer"
                title="Delete domain"
              >
                <Trash2 size={14} />
              </button>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
