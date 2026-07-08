"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Trash2, Globe, Plus, Copy, Check, Pencil, CheckCircle, Download, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";

interface DnsRecord {
  id: string;
  type: string;
  name: string;
  content: string;
  ttl: number | null;
  priority: number | null;
  proxied: boolean;
  status: string;
  cloudflareId: string | null;
  createdAt: string;
}

interface Subdomain {
  id: string;
  name: string;
  domain: string;
  target: string;
  type: string;
  proxied: boolean;
  status: string;
  dnsRecords: DnsRecord[];
}

const DNS_PRESETS = [
  { label: "Vercel", type: "A", content: "76.76.21.21", ttl: 1, priority: null, proxied: true },
  { label: "Netlify", type: "CNAME", content: "{subdomain}.netlify.app", ttl: 1, priority: null, proxied: true },
  { label: "GitHub Pages", type: "A", content: "185.199.108.153", ttl: 1, priority: null, proxied: true },
  { label: "Railway", type: "CNAME", content: "railway.app", ttl: 1, priority: null, proxied: true },
  { label: "Fly.io", type: "CNAME", content: "fly.io", ttl: 1, priority: null, proxied: false },
  { label: "Render", type: "CNAME", content: "onrender.com", ttl: 1, priority: null, proxied: true },
  { label: "Cloudflare Workers", type: "CNAME", content: "*.workers.dev", ttl: 1, priority: null, proxied: true },
  { label: "Bunny CDN", type: "CNAME", content: "{subdomain}.bunnycdn.com", ttl: 1, priority: null, proxied: false },
  { label: "Shopify", type: "CNAME", content: "shops.myshopify.com", ttl: 1, priority: null, proxied: true },
  { label: "Squarespace", type: "CNAME", content: "ext-cust.squarespace.com", ttl: 1, priority: null, proxied: true },
  { label: "Google Sites", type: "CNAME", content: "ghs.googlehosted.com", ttl: 1, priority: null, proxied: true },
  { label: "Google Workspace", type: "MX", content: "ASPMX.L.GOOGLE.COM", ttl: 3600, priority: 1, proxied: false },
  { label: "Zoho Mail", type: "MX", content: "mx.zohomail.com", ttl: 3600, priority: 10, proxied: false },
  { label: "Cloudflare Email", type: "MX", content: "route1.mx.cloudflare.net", ttl: 3600, priority: 10, proxied: false },
] as const;

export default function SubdomainDetailPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [subdomain, setSubdomain] = useState<Subdomain | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [bulkDeleting, setBulkDeleting] = useState(false);

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
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

  const handleDelete = async () => {
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

  const copyToClipboard = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
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
          <Button
            variant="destructive"
            size="sm"
            className="gap-2"
            onClick={handleDelete}
          >
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
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={handleBulkDelete}
                    disabled={bulkDeleting}
                  >
                    {bulkDeleting ? "Deleting..." : `Delete Selected (${selectedIds.size})`}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSelectedIds(new Set())}
                  >
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
              {subdomain.dnsRecords.map((record, i) => (
                <DnsRecordRow
                  key={record.id}
                  record={record}
                  onDelete={fetchSubdomain}
                  onEdit={fetchSubdomain}
                  copied={copiedIndex === i}
                  onCopy={() => copyToClipboard(record.content, i)}
                  subdomainName={subdomain.name}
                  subdomainDomain={subdomain.domain}
                  selected={selectedIds.has(record.id)}
                  onToggleSelect={toggleSelect}
                />
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function DnsRecordRow({
  record,
  onDelete,
  onEdit,
  copied,
  onCopy,
  subdomainName,
  subdomainDomain,
  selected,
  onToggleSelect,
}: {
  record: DnsRecord;
  onDelete: () => void;
  onEdit: () => void;
  copied: boolean;
  onCopy: () => void;
  subdomainName: string;
  subdomainDomain: string;
  selected: boolean;
  onToggleSelect: (id: string) => void;
}) {
  const [deleting, setDeleting] = useState(false);
  const [editing, setEditing] = useState(false);
  const [checking, setChecking] = useState(false);
  const [propagation, setPropagation] = useState<{ resolved: boolean; ips: string[]; cloudflare: boolean } | null>(null);

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await fetch(`/api/dns/${record.id}`, { method: "DELETE" });
      onDelete();
    } catch {
      setDeleting(false);
    }
  };

  const handleCheckPropagation = async () => {
    setChecking(true);
    setPropagation(null);
    const fqdn = `${subdomainName}.${subdomainDomain}`;
    try {
      const res = await fetch(`/api/dns/${record.id}/propagation?domain=${encodeURIComponent(fqdn)}`);
      if (res.ok) {
        const data = await res.json();
        setPropagation(data);
      }
    } catch {
      // ignore
    } finally {
      setChecking(false);
    }
  };

  return (
    <>
      <div className="flex items-center justify-between rounded-lg border border-border px-4 py-3">
        <div className="flex items-center gap-3">
          <Checkbox
            checked={selected}
            onCheckedChange={() => onToggleSelect(record.id)}
          />
          <Badge variant="outline" className="w-16 justify-center font-mono text-xs">
            {record.type}
          </Badge>
          <div>
            <p className="font-mono text-sm">{record.content}</p>
            <p className="text-xs text-muted-foreground">
              TTL: {record.ttl ?? "Auto"}
              {record.priority ? ` | Priority: ${record.priority}` : ""}
              {record.proxied ? " | Proxied" : ""}
              {propagation && (
                <span className={propagation.resolved ? "text-green-500" : "text-amber-500"}>
                  {" | "}
                  {propagation.resolved ? `Resolved (${propagation.ips.join(", ")})` : "Unresolved"}
                  {propagation.cloudflare ? " via Cloudflare" : ""}
                </span>
              )}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => setEditing(true)}
          >
            <Pencil className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className={`h-8 w-8 ${checking ? "animate-pulse" : ""}`}
            onClick={handleCheckPropagation}
            disabled={checking}
            title="Check DNS propagation"
          >
            <CheckCircle className={`h-4 w-4 ${propagation?.resolved ? (propagation.cloudflare ? "text-blue-500" : "text-green-500") : ""}`} />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={onCopy}
          >
            {copied ? (
              <Check className="h-4 w-4 text-green-500" />
            ) : (
              <Copy className="h-4 w-4" />
            )}
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-red-500"
            onClick={handleDelete}
            disabled={deleting}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>
      {editing && (
        <EditRecordForm
          record={record}
          subdomainName={subdomainName}
          onClose={() => setEditing(false)}
          onUpdated={() => {
            setEditing(false);
            onEdit();
          }}
        />
      )}
    </>
  );
}

function EditRecordForm({
  record,
  onClose,
  onUpdated,
  subdomainName,
}: {
  record: DnsRecord;
  onClose: () => void;
  onUpdated: () => void;
  subdomainName: string;
}) {
  const [type, setType] = useState(record.type);
  const [content, setContent] = useState(record.content);
  const [ttl, setTtl] = useState(String(record.ttl ?? "1"));
  const [priority, setPriority] = useState(String(record.priority ?? ""));
  const [proxied, setProxied] = useState(record.proxied);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const [srvService, setSrvService] = useState("");
  const [srvProtocol, setSrvProtocol] = useState("_tcp");
  const [srvWeight, setSrvWeight] = useState("1");
  const [srvPort, setSrvPort] = useState("");

  const isSrv = type === "SRV";
  const showPriority = type === "MX" || isSrv;
  const showProxied = type === "A" || type === "AAAA" || type === "CNAME";

  useEffect(() => {
    if (isSrv && record.type === "SRV") {
      const parts = record.content.split(/\s+/);
      if (parts.length === 4) {
        setPriority(parts[0]);
        setSrvWeight(parts[1]);
        setSrvPort(parts[2]);
        setContent(parts[3]);
      }
    }
  }, []);

  const getContent = () => {
    if (isSrv) {
      return `${priority || "10"} ${srvWeight} ${srvPort} ${content}`;
    }
    return content;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!content) {
      setError("Content is required");
      return;
    }

    if (isSrv) {
      if (!srvPort) {
        setError("Port is required for SRV records");
        return;
      }
    }

    setLoading(true);

    try {
      const res = await fetch(`/api/dns/${record.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content: getContent(),
          ttl: parseInt(ttl) || 1,
          ...(showPriority && priority ? { priority: parseInt(priority) } : {}),
          proxied: showProxied ? proxied : false,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "Failed to update record");
        return;
      }

      onUpdated();
    } catch {
      setError("Failed to update record");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Edit DNS Record</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600 dark:bg-red-950 dark:text-red-400">
                {error}
              </div>
            )}

            <PresetSelector
              subdomainName={subdomainName}
              onSelect={(p) => {
                setContent(p.content);
                setTtl(String(p.ttl ?? "1"));
                setPriority(p.priority != null ? String(p.priority) : "");
                setProxied(p.proxied);
              }}
            />
            <div className="space-y-2">
              <label className="text-sm font-medium">Type</label>
              <select
                value={type}
                disabled
                className="flex h-10 w-full rounded-lg border border-border bg-muted px-3 py-2 text-sm text-muted-foreground"
              >
                <option value="A">A</option>
                <option value="AAAA">AAAA</option>
                <option value="CNAME">CNAME</option>
                <option value="TXT">TXT</option>
                <option value="MX">MX</option>
                <option value="SRV">SRV</option>
                <option value="CAA">CAA</option>
              </select>
            </div>

            {isSrv && (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Service</label>
                    <Input
                      placeholder="_sip"
                      value={srvService}
                      onChange={(e) => setSrvService(e.target.value)}
                      disabled
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Protocol</label>
                    <select
                      value={srvProtocol}
                      disabled
                      className="flex h-10 w-full rounded-lg border border-border bg-muted px-3 py-2 text-sm text-muted-foreground"
                    >
                      <option value="_tcp">TCP</option>
                      <option value="_udp">UDP</option>
                      <option value="_tls">TLS</option>
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Port</label>
                    <Input
                      placeholder="5060"
                      value={srvPort}
                      onChange={(e) => setSrvPort(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Weight</label>
                    <Input
                      placeholder="10"
                      value={srvWeight}
                      onChange={(e) => setSrvWeight(e.target.value)}
                    />
                  </div>
                </div>
              </>
            )}

            {!isSrv && (
              <div className="space-y-2">
                <label className="text-sm font-medium">Value</label>
                <Input
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  className="font-mono"
                  required
                />
              </div>
            )}

            {isSrv && (
              <div className="space-y-2">
                <label className="text-sm font-medium">Target</label>
                <Input
                  placeholder="sip.example.com"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  className="font-mono"
                  required
                />
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">TTL (seconds)</label>
                <select
                  value={ttl}
                  onChange={(e) => setTtl(e.target.value)}
                  className="flex h-10 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
                >
                  <option value="1">Auto</option>
                  <option value="60">1 minute</option>
                  <option value="300">5 minutes</option>
                  <option value="3600">1 hour</option>
                  <option value="86400">1 day</option>
                </select>
              </div>
              {showPriority && (
                <div className="space-y-2">
                  <label className="text-sm font-medium">Priority</label>
                  <Input
                    placeholder="10"
                    value={priority}
                    onChange={(e) => setPriority(e.target.value)}
                  />
                </div>
              )}
            </div>

            {showProxied && (
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={proxied}
                  onChange={(e) => setProxied(e.target.checked)}
                  className="h-4 w-4 rounded border-border"
                />
                <span className="text-sm">Proxy through Cloudflare</span>
              </label>
            )}

            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                className="flex-1"
                onClick={onClose}
              >
                Cancel
              </Button>
              <Button type="submit" variant="primary" className="flex-1" disabled={loading}>
                {loading ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

function AddRecordForm({
  subdomainId,
  subdomainName,
  onAdded,
}: {
  subdomainId: string;
  subdomainName: string;
  onAdded: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [type, setType] = useState("A");
  const [content, setContent] = useState("");
  const [ttl, setTtl] = useState("1");
  const [priority, setPriority] = useState("");
  const [proxied, setProxied] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const [srvService, setSrvService] = useState("");
  const [srvProtocol, setSrvProtocol] = useState("_tcp");
  const [srvWeight, setSrvWeight] = useState("1");
  const [srvPort, setSrvPort] = useState("");

  const showPriority = type === "MX" || type === "SRV";
  const showProxied = type === "A" || type === "AAAA" || type === "CNAME";

  const getContent = () => {
    if (type === "SRV") {
      return `${priority || "10"} ${srvWeight} ${srvPort} ${content}`;
    }
    return content;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!content) {
      setError("Content is required");
      return;
    }

    if (type === "SRV") {
      if (!srvPort) {
        setError("Port is required for SRV records");
        return;
      }
      if (!srvService.startsWith("_")) {
        setError("Service must start with _ (e.g. _sip, _xmpp)");
        return;
      }
    }

    setLoading(true);

    try {
      const res = await fetch("/api/dns", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subdomainId,
          type,
          name: type === "SRV" ? `${srvService}.${srvProtocol}.${subdomainName}` : undefined,
          content: getContent(),
          ttl: parseInt(ttl) || 1,
          ...(showPriority && priority ? { priority: parseInt(priority) } : {}),
          proxied: showProxied ? proxied : false,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "Failed to add record");
        return;
      }

      setContent("");
      setType("A");
      setPriority("");
      setProxied(false);
      setSrvService("");
      setSrvProtocol("_tcp");
      setSrvWeight("1");
      setSrvPort("");
      setOpen(false);
      onAdded();
    } catch {
      setError("Failed to add record");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <Button
        variant="outline"
        size="sm"
        className="gap-2"
        onClick={() => setOpen(!open)}
      >
        <Plus className="h-4 w-4" /> Add Record
      </Button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle>Add DNS Record</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                {error && (
                  <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600 dark:bg-red-950 dark:text-red-400">
                    {error}
                  </div>
                )}

                <PresetSelector
                  subdomainName={subdomainName}
                  onSelect={(p) => {
                    setType(p.type);
                    setContent(p.content);
                    setTtl(String(p.ttl ?? "1"));
                    setPriority(p.priority != null ? String(p.priority) : "");
                    setProxied(p.proxied);
                  }}
                />
                <div className="space-y-2">
                  <label className="text-sm font-medium">Type</label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value)}
                    className="flex h-10 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
                  >
                    <option value="A">A</option>
                    <option value="AAAA">AAAA</option>
                    <option value="CNAME">CNAME</option>
                    <option value="TXT">TXT</option>
                    <option value="MX">MX</option>
                    <option value="SRV">SRV</option>
                    <option value="CAA">CAA</option>
                  </select>
                </div>

                {type === "SRV" && (
                  <>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Service</label>
                        <Input
                          placeholder="_sip"
                          value={srvService}
                          onChange={(e) => setSrvService(e.target.value)}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Protocol</label>
                        <select
                          value={srvProtocol}
                          onChange={(e) => setSrvProtocol(e.target.value)}
                          className="flex h-10 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
                        >
                          <option value="_tcp">TCP</option>
                          <option value="_udp">UDP</option>
                          <option value="_tls">TLS</option>
                        </select>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Port</label>
                        <Input
                          placeholder="5060"
                          value={srvPort}
                          onChange={(e) => setSrvPort(e.target.value)}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Weight</label>
                        <Input
                          placeholder="10"
                          value={srvWeight}
                          onChange={(e) => setSrvWeight(e.target.value)}
                        />
                      </div>
                    </div>
                  </>
                )}

                {type !== "SRV" && (
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Value</label>
                    <Input
                      placeholder={
                        type === "A"
                          ? "192.168.1.1"
                          : type === "AAAA"
                            ? "2001:db8::1"
                            : type === "CNAME"
                              ? "target.example.com"
                              : type === "MX"
                                ? "mail.example.com"
                                : type === "TXT"
                                  ? "v=spf1 include:_spf.example.com ~all"
                                  : type === "CAA"
                                    ? '0 issue "letsencrypt.org"'
                                    : "value"
                      }
                      value={content}
                      onChange={(e) => setContent(e.target.value)}
                      className="font-mono"
                      required
                    />
                  </div>
                )}

                {type === "SRV" && (
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Target</label>
                    <Input
                      placeholder="sip.example.com"
                      value={content}
                      onChange={(e) => setContent(e.target.value)}
                      className="font-mono"
                      required
                    />
                    <p className="text-xs text-muted-foreground">
                      Format: priority weight port target → {priority || "10"} {srvWeight} {srvPort || "0"} {content || "target"}
                    </p>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">TTL (seconds)</label>
                    <select
                      value={ttl}
                      onChange={(e) => setTtl(e.target.value)}
                      className="flex h-10 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
                    >
                      <option value="1">Auto</option>
                      <option value="60">1 minute</option>
                      <option value="300">5 minutes</option>
                      <option value="3600">1 hour</option>
                      <option value="86400">1 day</option>
                    </select>
                  </div>
                  {showPriority && (
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Priority</label>
                      <Input
                        placeholder="10"
                        value={priority}
                        onChange={(e) => setPriority(e.target.value)}
                      />
                    </div>
                  )}
                </div>

                {showProxied && (
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={proxied}
                      onChange={(e) => setProxied(e.target.checked)}
                      className="h-4 w-4 rounded border-border"
                    />
                    <span className="text-sm">Proxy through Cloudflare</span>
                  </label>
                )}

                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    className="flex-1"
                    onClick={() => setOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" variant="primary" className="flex-1" disabled={loading}>
                    {loading ? "Adding..." : "Add Record"}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}

function PresetSelector({
  subdomainName,
  onSelect,
}: {
  subdomainName: string;
  onSelect: (preset: { type: string; content: string; ttl: number | null; priority: number | null; proxied: boolean }) => void;
}) {
  const [selected, setSelected] = useState("");

  const handleChange = (value: string) => {
    setSelected(value);
    if (!value) return;
    const preset = DNS_PRESETS.find((p) => p.label === value);
    if (!preset) return;
    onSelect({
      type: preset.type,
      content: preset.content.replace("{subdomain}", subdomainName),
      ttl: preset.ttl ?? 1,
      priority: preset.priority != null ? preset.priority : null,
      proxied: preset.proxied,
    });
  };

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium">Quick Preset</label>
      <select
        value={selected}
        onChange={(e) => handleChange(e.target.value)}
        className="flex h-10 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
      >
        <option value="">Select a platform...</option>
        {DNS_PRESETS.map((p) => (
          <option key={p.label} value={p.label}>
            {p.label}
          </option>
        ))}
      </select>
    </div>
  );
}
