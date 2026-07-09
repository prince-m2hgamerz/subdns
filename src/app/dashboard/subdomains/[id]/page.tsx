"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Trash2, Globe, Download, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { AddRecordForm } from "@/components/dns/add-record-form";
import { DnsRecordRow } from "@/components/dns/dns-record-row";
import type { DnsRecord, Subdomain } from "@/components/dns/types";

export default function SubdomainDetailPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [subdomain, setSubdomain] = useState<Subdomain | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [bulkDeleting, setBulkDeleting] = useState(false);

  const toggleSelect = (recordId: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(recordId)) next.delete(recordId);
      else next.add(recordId);
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (!subdomain) return;
    if (selectedIds.size === subdomain.dnsRecords.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(subdomain.dnsRecords.map((r) => r.id)));
    }
  };

  const handleBulkDelete = async () => {
    if (selectedIds.size === 0) return;
    if (!confirm(`Delete ${selectedIds.size} selected DNS record${selectedIds.size > 1 ? "s" : ""}?`)) return;

    setBulkDeleting(true);
    try {
      const res = await fetch("/api/dns/bulk-delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids: Array.from(selectedIds) }),
      });
      if (!res.ok) throw new Error("Failed to delete");
      setSelectedIds(new Set());
      await fetchSubdomain();
    } catch {
      setError("Failed to delete selected records");
    } finally {
      setBulkDeleting(false);
    }
  };

  const exportZone = () => {
    if (!subdomain) return;
    const lines: string[] = [
      "; SubDNS Zone Export",
      `; Domain: ${subdomain.name}.${subdomain.domain}`,
      `; Generated: ${new Date().toISOString()}`,
      `; Records: ${subdomain.dnsRecords.length}`,
      "",
    ];
    for (const r of subdomain.dnsRecords) {
      const fqdn = r.name || `${subdomain.name}.${subdomain.domain}`;
      const ttl = r.ttl ?? 3600;
      const extras = r.priority ? `${r.priority} ` : "";
      const proxiedTag = r.proxied ? " ; proxied" : "";
      lines.push(`${fqdn}. ${ttl} IN ${r.type} ${extras}${r.content}${proxiedTag}`);
    }
    const blob = new Blob([lines.join("\n")], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${subdomain.name}.${subdomain.domain}.zone.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const fetchSubdomain = useCallback(async () => {
    try {
      const res = await fetch(`/api/subdomains/${id}`);
      if (!res.ok) throw new Error("Not found");
      const data = await res.json();
      setSubdomain(data.subdomain);
    } catch {
      setError("Failed to load subdomain");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchSubdomain();
  }, [fetchSubdomain]);

  const handleDeleteSubdomain = async () => {
    if (!confirm("Delete this subdomain and all its DNS records?")) return;
    try {
      const res = await fetch(`/api/subdomains/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete");
      router.push("/dashboard/subdomains");
      router.refresh();
    } catch {
      setError("Failed to delete subdomain");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <p className="text-sm text-muted-foreground">Loading...</p>
      </div>
    );
  }

  if (error || !subdomain) {
    return (
      <div className="space-y-4">
        <Link href="/dashboard/subdomains">
          <Button variant="ghost" className="gap-2">
            <ArrowLeft className="h-4 w-4" /> Back
          </Button>
        </Link>
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-sm text-muted-foreground">{error || "Subdomain not found"}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/dashboard/subdomains">
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold">
              {subdomain.name}.{subdomain.domain}
            </h1>
            <p className="text-sm text-muted-foreground">{subdomain.target}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant={subdomain.status === "ACTIVE" ? "default" : "outline"}>
            {subdomain.status}
          </Badge>
          {subdomain.proxied && <Badge variant="outline">Proxied</Badge>}
          <Button variant="outline" size="sm" className="gap-2" onClick={exportZone}>
            <Download className="h-4 w-4" /> Export
          </Button>
          <Button variant="destructive" size="sm" className="gap-2" onClick={handleDeleteSubdomain}>
            <Trash2 className="h-4 w-4" /> Delete
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Globe className="h-4 w-4" /> DNS Records
          </CardTitle>
          <AddRecordForm subdomainId={id} subdomainName={subdomain.name} onAdded={fetchSubdomain} />
        </CardHeader>
        <CardContent>
          {subdomain.dnsRecords.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted-foreground">
              No DNS records yet. Add your first record above.
            </p>
          ) : (
            <div className="space-y-2">
              {selectedIds.size > 0 && (
                <div className="flex items-center gap-2 pb-1">
                  <Button variant="destructive" size="sm" onClick={handleBulkDelete} disabled={bulkDeleting}>
                    {bulkDeleting ? "Deleting..." : `Delete Selected (${selectedIds.size})`}
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => setSelectedIds(new Set())}>
                    Clear Selection
                  </Button>
                </div>
              )}
              <div className="flex items-center gap-2 px-4 py-2 text-xs text-muted-foreground">
                <Checkbox
                  checked={subdomain.dnsRecords.length > 0 && selectedIds.size === subdomain.dnsRecords.length}
                  onCheckedChange={toggleSelectAll}
                />
                <span>Select all</span>
              </div>
              {subdomain.dnsRecords.map((record) => (
                <DnsRecordRow
                  key={record.id}
                  record={record}
                  subdomainName={subdomain.name}
                  domain={`${subdomain.name}.${subdomain.domain}`}
                  selected={selectedIds.has(record.id)}
                  onToggleSelect={toggleSelect}
                  onEdit={fetchSubdomain}
                  onDelete={fetchSubdomain}
                />
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
