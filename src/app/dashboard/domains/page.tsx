"use client";

import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Globe, Plus, Loader2, CheckCircle, XCircle, Trash2, RefreshCw } from "lucide-react";

interface CustomDomain {
  id: string;
  domain: string;
  subdomainName: string | null;
  verificationToken: string;
  verificationStatus: "PENDING" | "VERIFIED" | "FAILED";
  sslStatus: "PENDING" | "ACTIVE" | "FAILED";
  createdAt: string;
}

interface SubdomainOption {
  id: string;
  name: string;
}

export default function CustomDomainsPage() {
  const { data: session, status: authStatus } = useSession();
  const [domains, setDomains] = useState<CustomDomain[]>([]);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [newDomain, setNewDomain] = useState("");
  const [selectedSubdomain, setSelectedSubdomain] = useState("");
  const [subdomains, setSubdomains] = useState<SubdomainOption[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [verifyingId, setVerifyingId] = useState<string | null>(null);

  useEffect(() => {
    if (authStatus === "authenticated") {
      fetchDomains();
      fetchSubdomains();
    }
  }, [authStatus]);

  async function fetchDomains() {
    setLoading(true);
    try {
      const res = await fetch("/api/custom-domains");
      if (res.ok) {
        const data = await res.json();
        setDomains(data.data || []);
      }
    } finally {
      setLoading(false);
    }
  }

  async function fetchSubdomains() {
    try {
      const res = await fetch("/api/subdomains");
      if (res.ok) {
        const data = await res.json();
        setSubdomains(
          (data.subdomains || []).map((s: any) => ({
            id: s.id,
            name: `${s.name}.${s.domain}`,
          }))
        );
      }
    } catch {}
  }

  async function handleAdd() {
    if (!newDomain.trim()) return;
    setAdding(true);
    try {
      const res = await fetch("/api/custom-domains", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          domain: newDomain.trim(),
          subdomainId: selectedSubdomain || null,
        }),
      });
      if (res.ok) {
        setNewDomain("");
        setSelectedSubdomain("");
        setShowAddForm(false);
        await fetchDomains();
      } else {
        const data = await res.json();
        alert(data.error || "Failed to add domain");
      }
    } finally {
      setAdding(false);
    }
  }

  async function handleVerify(id: string) {
    setVerifyingId(id);
    try {
      const res = await fetch(`/api/custom-domains/${id}/verify`, {
        method: "POST",
      });
      if (res.ok) {
        await fetchDomains();
      } else {
        const data = await res.json();
        alert(data.error || "Verification failed");
        await fetchDomains();
      }
    } finally {
      setVerifyingId(null);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this custom domain?")) return;
    const res = await fetch(`/api/custom-domains/${id}`, {
      method: "DELETE",
    });
    if (res.ok) {
      await fetchDomains();
    }
  }

  if (authStatus === "unauthenticated") redirect("/auth/login");

  const statusIcon = (status: string) => {
    switch (status) {
      case "VERIFIED":
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "FAILED":
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Loader2 className="h-4 w-4 text-yellow-500 animate-spin" />;
    }
  };

  if (authStatus === "loading") {
    return (
      <div className="space-y-6">
        <div className="h-8 w-48 animate-pulse rounded bg-neutral-200 dark:bg-neutral-800" />
        <Card>
          <CardContent className="p-6">
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <div
                  key={i}
                  className="h-12 animate-pulse rounded bg-neutral-100 dark:bg-neutral-900"
                />
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
          <h1 className="text-2xl font-bold">Custom Domains</h1>
          <p className="text-sm text-neutral-500">
            Bring your own domain and point it to your subDNS records
          </p>
        </div>
        <Button
          variant="primary"
          onClick={() => setShowAddForm(!showAddForm)}
        >
          <Plus className="mr-2 h-4 w-4" />
          Add Domain
        </Button>
      </div>

      {showAddForm && (
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
              <div className="flex-1">
                <label className="mb-1 block text-xs text-muted-foreground">
                  Domain
                </label>
                <Input
                  placeholder="example.com"
                  value={newDomain}
                  onChange={(e) => setNewDomain(e.target.value)}
                />
              </div>
              <div className="flex-1">
                <label className="mb-1 block text-xs text-muted-foreground">
                  Link to Subdomain (optional)
                </label>
                <select
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                  value={selectedSubdomain}
                  onChange={(e) => setSelectedSubdomain(e.target.value)}
                >
                  <option value="">None</option>
                  {subdomains.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
                </select>
              </div>
              <Button
                variant="primary"
                onClick={handleAdd}
                disabled={adding || !newDomain.trim()}
              >
                {adding ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  "Add"
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {loading ? (
        <Card>
          <CardContent className="p-6">
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <div
                  key={i}
                  className="h-12 animate-pulse rounded bg-neutral-100 dark:bg-neutral-900"
                />
              ))}
            </div>
          </CardContent>
        </Card>
      ) : domains.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center gap-2 py-12">
            <Globe className="h-8 w-8 text-neutral-400" />
            <p className="text-sm text-neutral-500">No custom domains yet</p>
            <Button
              variant="primary"
              size="sm"
              className="mt-2"
              onClick={() => setShowAddForm(true)}
            >
              Add your first domain
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {domains.map((d) => (
            <Card key={d.id}>
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <CardTitle className="text-base">{d.domain}</CardTitle>
                    {d.subdomainName && (
                      <div className="text-xs text-neutral-500">
                        Linked to: {d.subdomainName}
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    {statusIcon(d.verificationStatus)}
                    <span className="text-xs text-muted-foreground">
                      {d.verificationStatus}
                    </span>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap items-center gap-2">
                  {d.verificationStatus === "PENDING" && (
                    <>
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => handleVerify(d.id)}
                        disabled={verifyingId === d.id}
                      >
                        {verifyingId === d.id ? (
                          <Loader2 className="mr-1 h-3 w-3 animate-spin" />
                        ) : (
                          <RefreshCw className="mr-1 h-3 w-3" />
                        )}
                        Verify
                      </Button>
                      <code className="rounded bg-neutral-100 px-2 py-1 text-xs dark:bg-neutral-800">
                        TXT: {d.verificationToken}
                      </code>
                    </>
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(d.id)}
                  >
                    <Trash2 className="h-3 w-3 text-red-400" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
